'use client'

import React from 'react'
import { useOrgMembership } from '@/lib/hooks/useOrgMembership'
import { motion } from 'framer-motion'
import { ShieldAlert, Loader2 } from 'lucide-react'

interface RoleBasedUIShellProps {
  children: React.ReactNode
  requiredRole?: ('owner' | 'manager' | 'agent')[]
  fallback?: React.ReactNode
}

export function RoleBasedUIShell({ 
  children, 
  requiredRole, 
  fallback 
}: RoleBasedUIShellProps) {
  const { role, loading, status } = useOrgMembership()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full"
          />
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-gold animate-pulse" />
        </div>
        <p className="text-sm font-medium text-soft-muted animate-pulse tracking-widest uppercase">
          Verifying Access...
        </p>
      </div>
    )
  }

  if (status !== 'active') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-navy-surface/50 border border-danger/20 rounded-3xl backdrop-blur-xl">
        <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-danger" />
        </div>
        <h3 className="text-xl font-bold text-soft-white mb-2">Account Inactive</h3>
        <p className="text-soft-muted max-w-md mx-auto">
          Your membership in this organization is currently {status}. Please contact your administrator for access.
        </p>
      </div>
    )
  }

  if (requiredRole && role && !requiredRole.includes(role)) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-navy-surface/50 border border-gold/20 rounded-3xl backdrop-blur-xl">
        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-gold" />
        </div>
        <h3 className="text-xl font-bold text-soft-white mb-2">Access Restricted</h3>
        <p className="text-soft-muted max-w-md mx-auto">
          This area is reserved for {requiredRole.join(' or ')} level access. Your current role is {role}.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
