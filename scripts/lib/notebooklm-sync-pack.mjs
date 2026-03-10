import crypto from 'node:crypto'

export const FEATURE_ID = 'ANCLORA-TSCP-001.v1'

export function normalize(text) {
  return String(text || '').trim()
}

export function countWords(text) {
  const normalized = normalize(text)
  if (!normalized) return 0
  return normalized.split(/\s+/).length
}

export function hashText(text) {
  return crypto.createHash('sha256').update(normalize(text), 'utf8').digest('hex').slice(0, 16)
}

export function parseIsoDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function computeAgeHours(isoDate, now = new Date()) {
  const parsed = parseIsoDate(isoDate)
  if (!parsed) return null
  const diffMs = now.getTime() - parsed.getTime()
  return Math.round((diffMs / 3_600_000) * 10) / 10
}

export function computeNextRefreshDueAt(isoDate, freshnessHours) {
  const parsed = parseIsoDate(isoDate)
  if (!parsed) return null
  const due = new Date(parsed.getTime() + Number(freshnessHours || 0) * 3_600_000)
  return due.toISOString()
}

export function computeFreshnessState(ageHours, freshnessHours) {
  if (ageHours === null || Number.isNaN(ageHours)) return 'unknown'
  const threshold = Number(freshnessHours || 0)
  if (threshold <= 0) return 'unknown'
  if (ageHours > threshold) return 'stale'
  if (ageHours >= threshold * 0.75) return 'expiring'
  return 'fresh'
}

export function buildSyncPack(manifest, raw) {
  const entriesByQuery = new Map(
    (raw.entries || []).map((entry) => [normalize(entry.query), entry])
  )

  const queries = (manifest.queries || []).map((expected) => {
    const responseEntry = entriesByQuery.get(normalize(expected.query)) || {}
    const response = normalize(responseEntry.response)
    return {
      query: expected.query,
      insight_type: expected.insight_type || 'territorial',
      zona: expected.zona || 'general',
      response,
      response_word_count: countWords(response),
      response_hash: hashText(response),
    }
  })

  const zones = [...new Set(queries.map((entry) => entry.zona).filter(Boolean))].sort()
  const insightTypes = [...new Set(queries.map((entry) => entry.insight_type).filter(Boolean))].sort()
  const totalWordCount = queries.reduce((sum, entry) => sum + entry.response_word_count, 0)

  return {
    feature_id: FEATURE_ID,
    notebook_id: manifest.notebook_id,
    notebook_name: manifest.notebook_name,
    generated_at: raw.generated_at || new Date().toISOString(),
    source_mode: manifest.source_mode || 'live_notebook_sync_pack',
    freshness_hours: manifest.freshness_hours || 96,
    source_refs: manifest.source_refs || [],
    operational_contract: manifest.operational_contract || {},
    control_plane: {
      manifest_path: 'ops/notebooklm-territorial-sync-manifest.json',
      raw_path: 'ops/notebooklm-territorial-sync-raw.json',
      output_path: 'public/data/notebooklm-territorial.sync.json',
      status_path: 'ops/notebooklm-territorial-sync-status.json',
    },
    coverage: {
      query_count: queries.length,
      zones,
      insight_types: insightTypes,
      total_word_count: totalWordCount,
    },
    queries,
  }
}

export function validateSyncPack({ manifest, raw, pack, now = new Date() }) {
  const errors = []
  const warnings = []

  const manifestQueries = (manifest.queries || []).map((entry) => normalize(entry.query))
  const rawEntries = raw.entries || []
  const packQueries = pack.queries || []

  const querySetMatches =
    manifestQueries.length === packQueries.length &&
    manifestQueries.every((query, index) => query === normalize(packQueries[index]?.query))

  const responsesNonEmpty = packQueries.every((entry) => normalize(entry.response).length > 0)
  const wordCountsPresent = packQueries.every((entry) => Number(entry.response_word_count || 0) > 0)
  const generatedAtValid = Boolean(parseIsoDate(pack.generated_at))
  const ageHours = computeAgeHours(pack.generated_at, now)
  const freshnessHours = Number(pack.freshness_hours || manifest.freshness_hours || 96)
  const freshnessState = computeFreshnessState(ageHours, freshnessHours)
  const nextRefreshDueAt = computeNextRefreshDueAt(pack.generated_at, freshnessHours)
  const freshnessOk = ageHours === null ? false : ageHours <= freshnessHours
  const sourceRefsPresent = Array.isArray(pack.source_refs) && pack.source_refs.length > 0
  const rawCoverageMatches = rawEntries.length === manifestQueries.length
  const operationalContract = pack.operational_contract || manifest.operational_contract || {}
  const ownerDefined = normalize(operationalContract.owner_display).length > 0
  const scheduleDefined =
    operationalContract.schedule &&
    normalize(operationalContract.schedule.cadence).length > 0 &&
    normalize(operationalContract.schedule.timezone).length > 0
  const fallbackPolicyDefined =
    operationalContract.fallback_policy &&
    normalize(operationalContract.fallback_policy.primary_source).length > 0 &&
    normalize(operationalContract.fallback_policy.fallback_source).length > 0
  const runbookRefsDefined =
    Array.isArray(operationalContract.runbook_refs) && operationalContract.runbook_refs.length > 0

  const checks = [
    {
      id: 'manifest_queries_present',
      ok: manifestQueries.length > 0,
      detail: `${manifestQueries.length} queries declaradas en manifiesto.`,
    },
    {
      id: 'raw_entries_present',
      ok: rawEntries.length > 0,
      detail: `${rawEntries.length} respuestas capturadas en raw.`,
    },
    {
      id: 'raw_coverage_matches_manifest',
      ok: rawCoverageMatches,
      detail: `raw=${rawEntries.length} / manifest=${manifestQueries.length}`,
    },
    {
      id: 'pack_queries_match_manifest',
      ok: querySetMatches,
      detail: 'El pack construido mantiene el orden y contenido de queries del manifiesto.',
    },
    {
      id: 'responses_non_empty',
      ok: responsesNonEmpty,
      detail: 'Todas las respuestas del pack contienen texto útil.',
    },
    {
      id: 'response_word_counts_present',
      ok: wordCountsPresent,
      detail: 'Todas las respuestas derivadas exponen word count > 0.',
    },
    {
      id: 'generated_at_valid',
      ok: generatedAtValid,
      detail: `generated_at=${pack.generated_at}`,
    },
    {
      id: 'freshness_window',
      ok: freshnessOk,
      detail: ageHours === null
        ? 'No se pudo calcular la edad del pack.'
        : `${ageHours}h <= ${freshnessHours}h`,
    },
    {
      id: 'source_refs_present',
      ok: sourceRefsPresent,
      detail: `${Array.isArray(pack.source_refs) ? pack.source_refs.length : 0} referencias trazables.`,
    },
    {
      id: 'owner_defined',
      ok: ownerDefined,
      detail: ownerDefined
        ? `Owner operativo: ${operationalContract.owner_display}`
        : 'Falta owner operativo explícito.',
    },
    {
      id: 'schedule_defined',
      ok: scheduleDefined,
      detail: scheduleDefined
        ? `Cadencia=${operationalContract.schedule.cadence} / tz=${operationalContract.schedule.timezone}`
        : 'Falta schedule operativo explícito.',
    },
    {
      id: 'fallback_policy_defined',
      ok: fallbackPolicyDefined,
      detail: fallbackPolicyDefined
        ? `Fallback=${operationalContract.fallback_policy.fallback_source}`
        : 'Falta política de fallback explícita.',
    },
    {
      id: 'runbook_refs_defined',
      ok: runbookRefsDefined,
      detail: runbookRefsDefined
        ? `${operationalContract.runbook_refs.length} runbooks operativos declarados.`
        : 'Faltan runbooks operativos declarados.',
    },
  ]

  for (const check of checks) {
    if (!check.ok) {
      if (check.id === 'freshness_window') warnings.push(check.detail)
      else errors.push(check.detail)
    }
  }

  if (freshnessState === 'expiring') {
    warnings.push(`El sync pack entra en ventana de refresco recomendada. Próximo vencimiento: ${nextRefreshDueAt}`)
  }

  const status = errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'ready'

  return {
    feature_id: FEATURE_ID,
    status,
    checked_at: now.toISOString(),
    generated_at: pack.generated_at,
    notebook_id: pack.notebook_id,
    notebook_name: pack.notebook_name,
    source_mode: pack.source_mode,
    freshness_hours: freshnessHours,
    age_hours: ageHours,
    freshness_state: freshnessState,
    next_refresh_due_at: nextRefreshDueAt,
    coverage: pack.coverage,
    source_refs: pack.source_refs,
    operational_contract: operationalContract,
    control_plane: pack.control_plane,
    checks,
    warnings,
    errors,
    summary: {
      primary_source_locked: status !== 'error',
      pack_query_count: pack.coverage?.query_count || 0,
      zones_covered: pack.coverage?.zones || [],
    },
  }
}
