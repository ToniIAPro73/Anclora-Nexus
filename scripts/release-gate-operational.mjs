#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const reportPath = path.join(root, 'ops', 'release-gate-latest.json')
const pytestBin = process.env.PYTEST_BIN || path.join(root, '.venv', 'bin', 'pytest')

const automatedChecks = [
  {
    key: 'notebooklm_validate',
    label: 'NotebookLM sync pack validate',
    cmd: ['npm', 'run', 'ops:notebooklm:validate-sync-pack'],
  },
  {
    key: 'backend_gate_suite',
    label: 'Backend release gate suite',
    cmd: [
      pytestBin,
      '-q',
      'backend/tests/test_territorial_sync_routes.py',
      'backend/tests/test_sellers_routes.py',
      'backend/tests/test_seller_signal_source_service.py',
      'backend/tests/test_source_observatory_service.py',
      'backend/tests/test_source_observatory_routes.py',
      'backend/tests/test_automation_service.py',
      'backend/tests/test_automation_routes.py',
      'backend/tests/test_command_center_service.py',
      'backend/tests/test_command_center_routes.py',
      'backend/tests/test_org_context_service.py',
      'backend/tests/test_ai_runtime_service.py',
      'backend/tests/test_ai_runtime_routes.py',
    ],
    env: { PYTHONPATH: root },
  },
  {
    key: 'frontend_lint',
    label: 'Frontend lint',
    cmd: ['npm', 'run', 'frontend:lint'],
  },
  {
    key: 'frontend_build',
    label: 'Frontend build',
    cmd: ['npm', 'run', 'frontend:build'],
  },
]

const manualSmokeAvailable = Boolean(process.env.JWT && process.env.ORG_ID)
if (manualSmokeAvailable) {
  automatedChecks.push({
    key: 'seller_signal_smoke',
    label: 'Seller signal smoke',
    cmd: ['bash', 'scripts/smoke-test-seller-signal.sh'],
    env: {
      JWT: process.env.JWT,
      ORG_ID: process.env.ORG_ID,
      BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
      TRACE_ID: process.env.TRACE_ID || `release-gate-${new Date().toISOString()}`,
      SNAPSHOT_ID: process.env.SNAPSHOT_ID || 'release-gate',
    },
  })
}

function runCheck(check) {
  const startedAt = new Date().toISOString()
  const start = Date.now()
  const result = spawnSync(check.cmd[0], check.cmd.slice(1), {
    cwd: root,
    env: { ...process.env, ...(check.env || {}) },
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * 10,
  })
  const durationMs = Date.now() - start
  const status = result.status === 0 ? 'PASS' : 'FAIL'
  return {
    key: check.key,
    label: check.label,
    status,
    started_at: startedAt,
    duration_ms: durationMs,
    command: check.cmd.join(' '),
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  }
}

const checks = automatedChecks.map(runCheck)
const failCount = checks.filter((item) => item.status === 'FAIL').length
const decision = failCount === 0 ? 'PASS' : 'FAIL'

const report = {
  feature_id: 'ANCLORA-RGQ-001.v1',
  generated_at: new Date().toISOString(),
  decision,
  automated_checks_total: checks.length,
  automated_checks_failed: failCount,
  manual_smoke_included: manualSmokeAvailable,
  checks,
}

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

console.log(`Release gate: ${decision}`)
for (const check of checks) {
  console.log(`- [${check.status}] ${check.label} (${check.duration_ms} ms)`)
}
console.log(`Report: ${path.relative(root, reportPath)}`)

if (failCount > 0) {
  process.exit(1)
}
