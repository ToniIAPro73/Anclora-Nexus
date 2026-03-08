/**
 * Vercel Cron Job — Territorial Pipeline
 *
 * What it does:
 *   1. Loads seller signal snapshot and ingests it into nexus_sellers
 *   2. Loads territorial markdown snapshot and syncs it into notebooklm_insights
 *   3. Generates dossier/email drafts for high-priority sellers
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const CRON_SECRET = process.env.CRON_SECRET

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

  try {
    const snapshotPath = path.join(process.cwd(), 'public', 'data', 'seller-signals.snapshot.json')
    const territorialPath = path.join(process.cwd(), 'public', 'docs', 'vulnerabilidades.md')

    const [signalsRaw, territorialRaw] = await Promise.all([
      readFile(snapshotPath, 'utf8'),
      readFile(territorialPath, 'utf8'),
    ])

    const signals = JSON.parse(signalsRaw)

    const ingestion = await postSkill('seller_signal_ingest', {
      snapshot_id: 'public/data/seller-signals.snapshot.json',
      signals,
    })

    const notebookSync = await postSkill('notebooklm_sync', {
      query: '¿Cuáles son las 5 vulnerabilidades u oportunidades territoriales más críticas para el suroeste de Mallorca en 2026?',
      insight_type: 'territorial',
      zona: 'general',
      notebooklm_response: territorialRaw,
    })

    const outreach = await postSkill('seller_outreach_batch', {
      prioridad_min: 4,
      limit: 3,
    })

    return NextResponse.json({
      ok: true,
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      ingestion,
      notebook_sync: notebookSync,
      outreach,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { ok: false, error: message, started_at: startedAt, finished_at: new Date().toISOString() },
      { status: 500 }
    )
  }
}
