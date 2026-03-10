/**
 * Vercel Cron Job — Territorial Pipeline
 *
 * What it does:
 *   1. Loads seller signal snapshot and ingests it into nexus_sellers
 *   2. Loads territorial NotebookLM sync pack and syncs it into notebooklm_insights
 *   3. Generates dossier/email drafts for high-priority sellers
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const CRON_SECRET = process.env.CRON_SECRET
const PIPELINE_STATUS_PATH = path.join(process.cwd(), 'ops', 'territorial-pipeline-status.json')

async function postSkill(skill: string, data: Record<string, unknown>) {
  const res = await fetch(`${BACKEND_URL}/api/skills/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-cron-secret': CRON_SECRET || '',
    },
    body: JSON.stringify({ skill, data }),
    signal: AbortSignal.timeout(55_000),
  })

  const text = await res.text()
  let parsed: unknown = text
  try {
    parsed = JSON.parse(text)
  } catch {
    // Keep raw text
  }

  if (!res.ok) {
    throw new Error(`${skill} failed (${res.status}): ${typeof parsed === 'string' ? parsed : JSON.stringify(parsed)}`)
  }

  return parsed
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = new Date().toISOString()

  async function persistPipelineStatus(payload: Record<string, unknown>) {
    try {
      await writeFile(PIPELINE_STATUS_PATH, JSON.stringify(payload, null, 2), 'utf8')
    } catch (error) {
      console.error('[cron/territorial-pipeline] failed to persist pipeline status:', error)
    }
  }

  await persistPipelineStatus({
    feature_id: 'ANCLORA-TSCP-001.pipeline.v1',
    status: 'running',
    message: 'Territorial pipeline started.',
    started_at: startedAt,
    finished_at: null,
    last_success_at: null,
    last_error_at: null,
    stats: {
      sellers_created: 0,
      signals_received: 0,
      queries_synced: 0,
      outreach_processed: 0,
    },
  })

  try {
    const snapshotPath = path.join(process.cwd(), 'public', 'data', 'seller-signals.snapshot.json')
    const notebookSyncPath = path.join(process.cwd(), 'public', 'data', 'notebooklm-territorial.sync.json')
    const notebookSyncStatusPath = path.join(process.cwd(), 'ops', 'notebooklm-territorial-sync-status.json')
    const territorialPath = path.join(process.cwd(), 'public', 'docs', 'vulnerabilidades.md')

    const [signalsRaw, notebookSyncRaw, notebookSyncStatusRaw, territorialRaw] = await Promise.all([
      readFile(snapshotPath, 'utf8'),
      readFile(notebookSyncPath, 'utf8'),
      readFile(notebookSyncStatusPath, 'utf8').catch(() => ''),
      readFile(territorialPath, 'utf8'),
    ])

    const signals = JSON.parse(signalsRaw)
    const notebookSyncPack = JSON.parse(notebookSyncRaw) as {
      notebook_id?: string
      notebook_name?: string
      generated_at?: string
      source_mode?: string
      queries?: Array<{
        query: string
        insight_type?: string
        zona?: string
        response: string
      }>
    }
    const notebookSyncStatus = notebookSyncStatusRaw
      ? JSON.parse(notebookSyncStatusRaw) as { status?: string; errors?: string[]; warnings?: string[] }
      : null

    if (notebookSyncStatus?.status === 'error') {
      throw new Error(
        `territorial sync status is error: ${(notebookSyncStatus.errors || []).join(' | ')}`
      )
    }

    const ingestion = await postSkill('seller_signal_ingest', {
      snapshot_id: 'public/data/seller-signals.snapshot.json',
      signals,
    })

    const notebookQueries = notebookSyncPack.queries || []
    const notebookSync = notebookQueries.length > 0
      ? await Promise.all(
          notebookQueries.map((entry) =>
            postSkill('notebooklm_sync', {
              query: entry.query,
              insight_type: entry.insight_type || 'territorial',
              zona: entry.zona || 'general',
              notebooklm_response: entry.response,
              source_mode: notebookSyncPack.source_mode || 'live_notebook_sync_pack',
              source_ref: notebookSyncPack.notebook_id || 'public/data/notebooklm-territorial.sync.json',
            })
          )
        )
      : [
          await postSkill('notebooklm_sync', {
            query: '¿Cuáles son las 5 vulnerabilidades u oportunidades territoriales más críticas para el suroeste de Mallorca en 2026?',
            insight_type: 'territorial',
            zona: 'general',
            notebooklm_response: territorialRaw,
            source_mode: 'fallback_markdown_snapshot',
            source_ref: 'public/docs/vulnerabilidades.md',
          }),
        ]

    const outreach = await postSkill('seller_outreach_batch', {
      prioridad_min: 4,
      limit: 3,
    })

    const finishedAt = new Date().toISOString()
    const successPayload = {
      feature_id: 'ANCLORA-TSCP-001.pipeline.v1',
      status: 'success',
      message: 'Territorial pipeline completed successfully.',
      started_at: startedAt,
      finished_at: finishedAt,
      last_success_at: finishedAt,
      last_error_at: null,
      notebook_source: notebookQueries.length > 0
        ? {
            mode: notebookSyncPack.source_mode || 'live_notebook_sync_pack',
            notebook_id: notebookSyncPack.notebook_id,
            notebook_name: notebookSyncPack.notebook_name,
            generated_at: notebookSyncPack.generated_at,
            queries_synced: notebookQueries.length,
            validation_status: notebookSyncStatus?.status || 'unknown',
          }
        : {
            mode: 'fallback_markdown_snapshot',
            source_ref: 'public/docs/vulnerabilidades.md',
            queries_synced: 1,
          },
      stats: {
        sellers_created: Number((ingestion as { sellers_created?: number })?.sellers_created || 0),
        signals_received: Number((ingestion as { signals_received?: number })?.signals_received || 0),
        queries_synced: notebookQueries.length > 0 ? notebookQueries.length : 1,
        outreach_processed: Number((outreach as { processed_count?: number })?.processed_count || 0),
      },
      ingestion,
      notebook_sync: notebookSync,
      outreach,
    }

    await persistPipelineStatus(successPayload)

    return NextResponse.json({
      ok: true,
      started_at: startedAt,
      finished_at: finishedAt,
      notebook_source: successPayload.notebook_source,
      ingestion,
      notebook_sync: notebookSync,
      outreach,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const finishedAt = new Date().toISOString()
    await persistPipelineStatus({
      feature_id: 'ANCLORA-TSCP-001.pipeline.v1',
      status: 'error',
      message,
      started_at: startedAt,
      finished_at: finishedAt,
      last_success_at: null,
      last_error_at: finishedAt,
      stats: {
        sellers_created: 0,
        signals_received: 0,
        queries_synced: 0,
        outreach_processed: 0,
      },
    })
    return NextResponse.json(
      { ok: false, error: message, started_at: startedAt, finished_at: finishedAt },
      { status: 500 }
    )
  }
}
