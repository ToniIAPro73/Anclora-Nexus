'use client'

import { useOrg } from '../contexts/OrgContext'

export function useOrgMembership() {
  const { membership, loading, error } = useOrg()

  return {
    ...membership,
    loading,
    error,
    isOwner: membership?.role === 'owner',
    isManager: membership?.role === 'manager',
    isAgent: membership?.role === 'agent',
    
    // Computed permissions
    canManageTeam: membership?.role === 'owner',
    canViewAll: membership?.role === 'owner' || membership?.role === 'manager',
    canCreateLead: membership?.role === 'owner' || membership?.role === 'manager',
    canAssignAgent: membership?.role === 'owner',
    canEditOwn: true, // All roles can edit their own stuff
    
    // UI Helpers
    roleLabel: membership?.role ? membership.role.charAt(0).toUpperCase() + membership.role.slice(1) : 'No Role',
    statusLabel: membership?.status ? membership.status.charAt(0).toUpperCase() + membership.status.slice(1) : 'Inactive'
  }
}
