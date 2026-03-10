import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const statusPath = path.join(root, 'ops', 'notebooklm-territorial-sync-status.json')

const status = JSON.parse(await fs.readFile(statusPath, 'utf8'))
const schedule = status.operational_contract?.schedule || {}
const fallback = status.operational_contract?.fallback_policy || {}

function print(label, value) {
  console.log(`${label}: ${value ?? '-'}`)
}

print('Status', status.status)
print('Notebook', status.notebook_name)
print('Generated', status.generated_at)
print('Age (hours)', status.age_hours)
print('Freshness state', status.freshness_state)
print('Next refresh due', status.next_refresh_due_at)
print('Owner', status.operational_contract?.owner_display)
print(
  'Schedule',
  schedule.cadence
    ? `${schedule.cadence} / ${String(schedule.recommended_days || []).replaceAll(',', ', ')} / ${schedule.timezone || '-'}`
    : '-'
)
print('Primary source', fallback.primary_source)
print('Fallback source', fallback.fallback_source)
print('Activation rule', fallback.activation_rule)
print('Runbooks', (status.operational_contract?.runbook_refs || []).join(' | '))
print('Warnings', (status.warnings || []).join(' | ') || 'none')
print('Errors', (status.errors || []).join(' | ') || 'none')
