import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const manifestPath = path.join(root, 'ops', 'notebooklm-territorial-sync-manifest.json')
const rawPath = path.join(root, 'ops', 'notebooklm-territorial-sync-raw.json')
const outputPath = path.join(root, 'public', 'data', 'notebooklm-territorial.sync.json')

function normalize(text) {
  return String(text || '').trim()
}

const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
const raw = JSON.parse(await fs.readFile(rawPath, 'utf8'))

if (!Array.isArray(manifest.queries) || manifest.queries.length === 0) {
  throw new Error('Manifest has no queries.')
}

if (!Array.isArray(raw.entries) || raw.entries.length === 0) {
  throw new Error('Raw sync source has no entries.')
}

const entriesByQuery = new Map(
  raw.entries.map((entry) => [normalize(entry.query), entry])
)

const queries = manifest.queries.map((expected) => {
  const hit = entriesByQuery.get(normalize(expected.query))
  if (!hit) {
    throw new Error(`Missing raw entry for query: ${expected.query}`)
  }
  if (!normalize(hit.response)) {
    throw new Error(`Empty response for query: ${expected.query}`)
  }
  return {
    query: expected.query,
    insight_type: expected.insight_type || 'territorial',
    zona: expected.zona || 'general',
    response: normalize(hit.response),
  }
})

const syncPack = {
  notebook_id: manifest.notebook_id,
  notebook_name: manifest.notebook_name,
  generated_at: raw.generated_at || new Date().toISOString(),
  source_mode: manifest.source_mode || 'live_notebook_sync_pack',
  queries,
}

await fs.writeFile(outputPath, JSON.stringify(syncPack, null, 2) + '\n', 'utf8')
console.log(`Wrote ${outputPath}`)
