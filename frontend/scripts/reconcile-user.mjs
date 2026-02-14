#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const out = {}
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx <= 0) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    out[key] = value
  }
  return out
}

function getEnv() {
  const root = path.resolve(process.cwd(), '..')
  const rootEnv = parseEnvFile(path.join(root, '.env'))
  const feEnv = parseEnvFile(path.join(process.cwd(), '.env.local'))
  return {
    ...rootEnv,
    ...feEnv,
    ...process.env,
  }
}

function getArg(name, fallback = null) {
  const flag = `--${name}`
  const idx = process.argv.indexOf(flag)
  if (idx === -1) return fallback
  return process.argv[idx + 1] ?? fallback
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`)
}

async function main() {
  const env = getEnv()
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRole) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const emailRaw = getArg('email')
  const password = getArg('password')
  const role = (getArg('role', 'manager') || 'manager').toLowerCase()
  const fullName = getArg('full-name', null)
  const orgIdArg = getArg('org-id', null)
  const forceSingleOwner = hasFlag('force-single-owner')

  if (!emailRaw || !password) {
    throw new Error('Usage: cd frontend; node scripts/reconcile-user.mjs --email <email> --password <password> [--role owner|manager|agent] [--org-id <uuid>] [--full-name <name>] [--force-single-owner]')
  }
  if (!['owner', 'manager', 'agent'].includes(role)) {
    throw new Error(`Invalid role: ${role}`)
  }

  const email = emailRaw.trim().toLowerCase()
  const admin = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: listed, error: listErr } = await admin.auth.admin.listUsers()
  if (listErr) throw listErr
  const users = listed?.users || []
  let user = users.find((u) => (u.email || '').toLowerCase() === email)

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: fullName ? { full_name: fullName } : undefined,
    })
    if (error) throw error
    user = data.user
    console.log(`Created auth user: ${email} (${user.id})`)
  } else {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: fullName ? { ...(user.user_metadata || {}), full_name: fullName } : user.user_metadata,
    })
    if (error) throw error
    console.log(`Updated auth user password/confirmation: ${email} (${user.id})`)
  }

  let orgId = orgIdArg
  if (!orgId) {
    const { data: orgs, error: orgErr } = await admin
      .from('organizations')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
    if (orgErr) throw orgErr
    if (!orgs || !orgs[0]?.id) throw new Error('No organization found')
    orgId = orgs[0].id
  }

  const desiredFullName = fullName || email.split('@')[0]

  const { error: upsertProfileErr } = await admin.from('user_profiles').upsert(
    {
      id: user.id,
      email,
      full_name: desiredFullName,
      org_id: orgId,
      role,
    },
    { onConflict: 'id' }
  )
  if (upsertProfileErr) throw upsertProfileErr

  const { data: existingMemberRows, error: existingMemberErr } = await admin
    .from('organization_members')
    .select('id,org_id,user_id,role,status')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .limit(1)
  if (existingMemberErr) throw existingMemberErr

  const nowIso = new Date().toISOString()
  if (existingMemberRows && existingMemberRows.length > 0) {
    const member = existingMemberRows[0]
    const { error } = await admin
      .from('organization_members')
      .update({ role, status: 'active', updated_at: nowIso })
      .eq('id', member.id)
      .eq('org_id', orgId)
    if (error) throw error
  } else {
    const { error } = await admin.from('organization_members').insert({
      org_id: orgId,
      user_id: user.id,
      role,
      status: 'active',
      joined_at: nowIso,
      created_at: nowIso,
      updated_at: nowIso,
    })
    if (error) throw error
  }

  if (forceSingleOwner && role === 'owner') {
    const { data: owners, error: ownersErr } = await admin
      .from('organization_members')
      .select('id,user_id')
      .eq('org_id', orgId)
      .eq('role', 'owner')
      .eq('status', 'active')
      .neq('user_id', user.id)
    if (ownersErr) throw ownersErr
    if (owners && owners.length > 0) {
      const ids = owners.map((o) => o.id)
      const { error: demoteErr } = await admin
        .from('organization_members')
        .update({ role: 'manager', updated_at: nowIso })
        .in('id', ids)
      if (demoteErr) throw demoteErr
    }
  }

  console.log('Reconciliation completed successfully.')
  console.log(`user_id=${user.id}`)
  console.log(`org_id=${orgId}`)
  console.log(`role=${role}`)
}

main().catch((err) => {
  console.error(err?.message || err)
  process.exit(1)
})

