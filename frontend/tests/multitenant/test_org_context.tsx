import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { render, screen, waitFor } from '@testing-library/react'
import { OrgProvider, useOrg } from '@/lib/contexts/OrgContext'
import { useOrgMembership } from '@/lib/hooks/useOrgMembership'
import supabase from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  default: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }
}))

const TestComponent = () => {
  const { membership, loading } = useOrg()
  if (loading) return <div>Loading...</div>
  return <div>{membership ? `Role: ${membership.role}` : 'No membership'}</div>
}

describe('OrgContext & useOrgMembership', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides membership data when user has an active membership', async () => {
    ;(supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-123' } } })
    ;(supabase.from as any)().single.mockResolvedValue({
      data: { id: 'm1', role: 'owner', status: 'active' },
      error: null
    })

    render(
      <OrgProvider>
        <TestComponent />
      </OrgProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Role: owner')).toBeInTheDocument()
    })
  })

  it('sets membership to null if no organization found', async () => {
    ;(supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-123' } } })
    ;(supabase.from as any)().single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' }
    })

    render(
      <OrgProvider>
        <TestComponent />
      </OrgProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('No membership')).toBeInTheDocument()
    })
  })

  it('useOrgMembership returns correct permission flags', async () => {
    // We mock useOrg to test useOrgMembership in isolation more easily
    // but here we can just wrap it in the provider
    ;(supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-123' } } })
    ;(supabase.from as any)().single.mockResolvedValue({
      data: { id: 'm1', role: 'owner', status: 'active' },
      error: null
    })

    let permissions: any
    const PermissionTester = () => {
      permissions = useOrgMembership()
      return null
    }

    render(
      <OrgProvider>
        <PermissionTester />
      </OrgProvider>
    )

    await waitFor(() => {
      expect(permissions.isOwner).toBe(true)
      expect(permissions.canManageTeam).toBe(true)
      expect(permissions.roleLabel).toBe('Owner')
    })
  })

  it('useOrgMembership returns restricted flags for Agent', async () => {
    ;(supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user-123' } } })
    ;(supabase.from as any)().single.mockResolvedValue({
      data: { id: 'm1', role: 'agent', status: 'active' },
      error: null
    })

    let permissions: any
    const PermissionTester = () => {
      permissions = useOrgMembership()
      return null
    }

    render(
      <OrgProvider>
        <PermissionTester />
      </OrgProvider>
    )

    await waitFor(() => {
      expect(permissions.isOwner).toBe(false)
      expect(permissions.isAgent).toBe(true)
      expect(permissions.canManageTeam).toBe(false)
      expect(permissions.canAssignAgent).toBe(false)
    })
  })
})
