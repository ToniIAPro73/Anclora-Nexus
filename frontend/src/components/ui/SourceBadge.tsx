'use client'

import React from 'react'
import { useI18n } from '@/lib/i18n'
import { Globe, Linkedin, Instagram, Facebook, Mail, Phone, User, HelpCircle } from 'lucide-react'
import { Lead } from '@/lib/store'

interface SourceBadgeProps {
  lead: Lead
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ lead }) => {
  const { t } = useI18n()
  
  const getIcon = () => {
    switch (lead.source_channel) {
      case 'website': return <Globe className="w-3 h-3" />
      case 'linkedin': return <Linkedin className="w-3 h-3" />
      case 'instagram': return <Instagram className="w-3 h-3" />
      case 'facebook': return <Facebook className="w-3 h-3" />
      case 'email': return <Mail className="w-3 h-3" />
      case 'phone': return <Phone className="w-3 h-3" />
      default: return lead.source_system === 'manual' ? <User className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />
    }
  }

  const getSystemLabel = () => {
    switch (lead.source_system) {
      case 'manual': return t('sourceManual')
      case 'cta_web': return t('sourceCtaWeb')
      case 'import': return t('sourceImport')
      case 'referral': return t('sourceReferral')
      case 'partner': return t('sourcePartner')
      case 'social': return t('sourceSocial')
      default: return lead.source || t('sourceOther')
    }
  }

  const getChannelLabel = () => {
    if (!lead.source_channel) return null
    switch (lead.source_channel) {
      case 'website': return t('sourceWebsite')
      case 'linkedin': return t('sourceLinkedin')
      case 'instagram': return t('sourceInstagram')
      case 'facebook': return t('sourceFacebook')
      case 'email': return t('sourceEmail')
      case 'phone': return t('sourcePhone')
      default: return t('sourceOther')
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-light/10 border border-blue-light/20 text-[10px] font-bold uppercase tracking-wider text-blue-light shadow-[0_0_10px_rgba(175,210,250,0.05)]">
        {getIcon()}
        <span>{getSystemLabel()}</span>
      </div>
      {lead.source_channel && (
        <span className="text-[9px] text-soft-muted font-medium ml-1">
          {getChannelLabel()} {lead.source_detail ? `• ${lead.source_detail}` : ''}
        </span>
      )}
    </div>
  )
}

export default SourceBadge
