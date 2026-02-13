'use client'

import { useState } from 'react'
import supabase from '@/lib/supabase'
import { useOrgMembership } from './useOrgMembership'
import { OrgRole, MembershipStatus } from '../contexts/OrgContext'

export function useTeamManagement() {
  const { org_id, canManageTeam } = useOrgMembership()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inviteMember = async (email: string, role: OrgRole) => {
    if (!canManageTeam) throw new Error('Unauthorized')
    setLoading(true)
    setError(null)
    try {
      // In v1, we use direct API or Supabase insert
      // For this implementation, we assume we have an endpoint or we insert into organization_members
      // The spec mentions endpoints, so we'll use a fetch call to the backend
      const response = await fetch(`/api/organizations/${org_id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to invite member')
      }

      return await response.json()
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const changeMemberRole = async (memberId: string, role: OrgRole) => {
    if (!canManageTeam) throw new Error('Unauthorized')
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/organizations/${org_id}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to update role')
      }

      return await response.json()
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const removeMember = async (memberId: string) => {
    if (!canManageTeam) throw new Error('Unauthorized')
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/organizations/${org_id}/members/${memberId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to remove member')
      }

      return true
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    if (!org_id) return []
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/organizations/${org_id}/members`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to fetch members')
      }
      const data = await response.json()
      return data.members
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    inviteMember,
    changeMemberRole,
    removeMember,
    fetchMembers
  }
}
