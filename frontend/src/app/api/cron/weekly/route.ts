/**
 * Vercel Cron Job — Weekly Prospection Trigger
 *
 * Schedule: Every Monday at 08:00 UTC (defined in vercel.json)
 * Security: CRON_SECRET env var must match the Authorization header
 *           that Vercel sends automatically.
 *
 * What it does:
 *   1. Calls FastAPI POST /skills/run with skill=prospection_weekly
 *   2. Returns a brief summary for Vercel Cron logs
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: NextRequest) {
  // Verify Vercel cron token (set automatically via Authorization: Bearer <CRON_SECRET>)
  const authHeader = req.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = new Date().toISOString()

  try {
    const res = await fetch(`${BACKEND_URL}/skills/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skill: 'prospection_weekly',
        data: { priority_min: 3 },
      }),
      // Allow up to 55s (Vercel function timeout is 60s)
      signal: AbortSignal.timeout(55_000),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error(`[cron/weekly] Backend error ${res.status}: ${detail}`)
      return NextResponse.json(
        { ok: false, status: res.status, detail, started_at: startedAt },
        { status: 502 }
      )
    }

    const result = await res.json()
    console.log(`[cron/weekly] prospection_weekly completed:`, JSON.stringify(result).slice(0, 300))

    return NextResponse.json({
      ok: true,
      skill: 'prospection_weekly',
      leads_processed: result?.leads_processed ?? 0,
      matches_found: result?.matches_found ?? 0,
      sellers_detected: result?.sellers_detected ?? 0,
      started_at: startedAt,
      finished_at: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[cron/weekly] Unexpected error: ${message}`)
    return NextResponse.json(
      { ok: false, error: message, started_at: startedAt },
      { status: 500 }
    )
  }
}
