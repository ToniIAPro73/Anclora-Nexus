'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { InvitationAccept } from '@/components/InvitationAccept'
import { motion } from 'framer-motion'

export default function InvitePage() {
  const params = useParams()
  const code = params.code as string

  return (
    <div className="min-h-screen bg-navy-darker flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-light/5 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12 text-center z-10"
      >
        <div className="relative w-24 h-24 mx-auto mb-6 transform hover:scale-110 transition-transform duration-500">
          <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full animate-pulse"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/logo-anclora-nexus.png" 
            alt="Anclora Nexus" 
            className="w-full h-full object-contain relative z-10"
          />
        </div>
        <h1 className="text-2xl font-black text-soft-white uppercase tracking-[0.4em]">
          Anclora <span className="text-gold">Nexus</span>
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mt-4"></div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-lg z-10"
      >
        <InvitationAccept code={code} />
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-xs font-medium text-gold/40 uppercase tracking-[0.2em] z-10"
      >
        Anclora Private Estates — SW Mallorca Luxury
      </motion.p>
    </div>
  )
}
