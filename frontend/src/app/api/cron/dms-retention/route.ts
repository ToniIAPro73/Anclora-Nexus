/**
 * Vercel Cron — DMS Retention Sweep
 *
 * Schedule: Daily at 03:00 UTC (defined in vercel.json)
 * Calls the internal backend endpoint that enforces retention policies
 * across all active orgs (archive documents past their deadline).
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const CRON_SECRET = process.env.CRON_SECRET
const INTERNAL_API_KEY = process.env.NEXUS_INTERNAL_API_KEY

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = new Date().toISOString()

  if (!INTERNAL_API_KEY) {
    console.error('[cron/dms-retention] NEXUS_INTERNAL_API_KEY is not set')
    return NextResponse.json({ ok: false, error: 'Internal API key not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/internal/webhooks/dms-retention-sweep`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${INTERNAL_API_KEY}`,
      },
      signal: AbortSignal.timeout(55_000),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error(`[cron/dms-retention] Backend error ${res.status}: ${detail}`)
      return NextResponse.json({ ok: false, status: res.status, detail, started_at: startedAt }, { status: 502 })
    }

    const result = await res.json()
    console.log(`[cron/dms-retention] sweep completed:`, JSON.stringify(result).slice(0, 400))

    return NextResponse.json({
      ok: true,
      orgs_processed: result?.orgs_processed ?? 0,
      errors: result?.errors ?? [],
      started_at: startedAt,
      finished_at: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[cron/dms-retention] Unexpected error: ${message}`)
    return NextResponse.json({ ok: false, error: message, started_at: startedAt }, { status: 500 })
  }
}
