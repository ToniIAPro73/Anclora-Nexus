'use client'

import React from 'react'
import Link from 'next/link'
import TeamManagement from '@/components/TeamManagement'
import { RoleBasedUIShell } from '@/components/RoleBasedUIShell'
import { motion } from 'framer-motion'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function TeamPage() {
  const { t } = useI18n()
  return (
    <div className="h-full flex flex-col p-8 overflow-hidden">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2 rounded-lg bg-navy-surface/40 border border-soft-subtle hover:border-gold/50 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 text-soft-white group-hover:text-gold transition-colors" />
            </Link>

            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-extrabold text-soft-white tracking-tight"
            >
              {t('teamControl').split('Nexus').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && <span className="text-gold">Nexus</span>}
                </React.Fragment>
              ))}
            </motion.h1>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-soft-muted mt-1 ml-14 max-w-xl"
          >
            {t('teamDescription')}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4 bg-navy-surface/50 border border-gold/20 px-5 py-3 rounded-2xl backdrop-blur-xl shrink-0"
        >
          <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs font-medium text-soft-white whitespace-nowrap">
            {t('enterpriseSecurity')} <span className="text-emerald-400 font-bold ml-1">{t('active')}</span>
          </p>
        </motion.div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
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
    </div>
  )
}
