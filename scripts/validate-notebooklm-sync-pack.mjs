import fs from 'node:fs/promises'
import path from 'node:path'

import { buildSyncPack, validateSyncPack } from './lib/notebooklm-sync-pack.mjs'

const root = process.cwd()
const manifestPath = path.join(root, 'ops', 'notebooklm-territorial-sync-manifest.json')
const rawPath = path.join(root, 'ops', 'notebooklm-territorial-sync-raw.json')
const outputPath = path.join(root, 'public', 'data', 'notebooklm-territorial.sync.json')
const statusPath = path.join(root, 'ops', 'notebooklm-territorial-sync-status.json')

const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
const raw = JSON.parse(await fs.readFile(rawPath, 'utf8'))
const existingPack = JSON.parse(await fs.readFile(outputPath, 'utf8'))

const rebuiltPack = buildSyncPack(manifest, raw)
const status = validateSyncPack({ manifest, raw, pack: existingPack })
const packMatchesInputs = JSON.stringify(existingPack) === JSON.stringify(rebuiltPack)

status.checks.push({
  id: 'pack_matches_inputs',
  ok: packMatchesInputs,
  detail: packMatchesInputs
    ? 'El pack publicado coincide con manifiesto + raw.'
    : 'El pack publicado no coincide con el build derivado de manifiesto + raw.',
})

if (!packMatchesInputs) {
  status.errors.push('El sync pack publicado no coincide con el resultado esperado del build.')
  status.status = 'error'
}

await fs.writeFile(statusPath, JSON.stringify(status, null, 2) + '\n', 'utf8')
console.log(`Validated ${outputPath}`)
console.log(`Wrote ${statusPath}`)

if (status.status === 'error') {
  process.exitCode = 1
}
