'use client'

import React from 'react'
import TeamManagement from '@/components/TeamManagement'
import { RoleBasedUIShell } from '@/components/RoleBasedUIShell'
import { motion } from 'framer-motion'
import { Users, ShieldCheck } from 'lucide-react'

export default function TeamPage() {
  return (
    <div className="p-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center border border-gold/20">
              <Users className="w-5 h-5 text-gold" />
            </div>
            <span className="text-xs font-bold text-gold uppercase tracking-[0.3em]">Management</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold text-soft-white tracking-tight"
          >
            Team <span className="text-gold">Nexus</span> Control
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-soft-muted mt-2 max-w-xl"
          >
            Manage your organization's members, assign roles, and control team access from one central command center.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4 bg-navy-surface/50 border border-gold/20 px-5 py-3 rounded-2xl backdrop-blur-xl"
        >
          <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs font-medium text-soft-white whitespace-nowrap">
            Enterprise Security <span className="text-emerald-400 font-bold ml-1">Active</span>
          </p>
        </motion.div>
      </div>

      <RoleBasedUIShell requiredRole={['owner']}>
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
        >
          <TeamManagement />
        </motion.div>
      </RoleBasedUIShell>
    </div>
  )
}
