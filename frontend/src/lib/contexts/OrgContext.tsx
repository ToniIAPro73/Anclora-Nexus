'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import supabase from '@/lib/supabase'

export type OrgRole = 'owner' | 'manager' | 'agent'
export type MembershipStatus = 'active' | 'pending' | 'suspended' | 'removed'

export interface OrgMembership {
  id: string
  org_id: string
  user_id?: string | null
  role: OrgRole
  status: MembershipStatus
  joined_at: string
}

interface OrgContextType {
  membership: OrgMembership | null
  loading: boolean
  error: string | null
  refreshMembership: () => Promise<void>
}

export const OrgContext = createContext<OrgContextType | undefined>(undefined)

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [membership, setMembership] = useState<OrgMembership | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembership = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setMembership(null)
        setLoading(false)
        return
      }

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('org_id')
        .eq('id', user.id)
        .maybeSingle()

      const preferredOrgId = profileData?.org_id || null

      const { data, error: fetchError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        setMembership(null)
      } else {
        const rows = Array.isArray(data) ? (data as OrgMembership[]) : []
        if (!rows.length) {
          setMembership(null)
        } else if (preferredOrgId) {
          const preferred = rows.find((row) => row.org_id === preferredOrgId)
          setMembership(preferred || rows[0])
        } else {
          setMembership(rows[0])
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembership()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchMembership()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <OrgContext.Provider 
      value={{ 
        membership, 
        loading, 
        error, 
        refreshMembership: fetchMembership 
      }}
    >
      {children}
    </OrgContext.Provider>
  )
}

export function useOrg() {
  const context = useContext(OrgContext)
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider')
  }
  return context
}
