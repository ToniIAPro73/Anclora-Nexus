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

const syncPack = buildSyncPack(manifest, raw)
const status = validateSyncPack({ manifest, raw, pack: syncPack })

await fs.writeFile(outputPath, JSON.stringify(syncPack, null, 2) + '\n', 'utf8')
await fs.writeFile(statusPath, JSON.stringify(status, null, 2) + '\n', 'utf8')

console.log(`Wrote ${outputPath}`)
console.log(`Wrote ${statusPath}`)
