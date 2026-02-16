'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, Home, CheckSquare, LogOut, UserCog, Target, ChevronsLeft, ChevronsRight, Database } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { useI18n } from '@/lib/i18n'
import supabase from '@/lib/supabase'
import { CurrencySelector } from './CurrencySelector'
import { UnitSelector } from './UnitSelector'
import { LanguageSelector } from './LanguageSelector'

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useI18n()
  const [logoUrl, setLogoUrl] = useState<string | undefined>()
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('anclora-sidebar-collapsed', String(next))
      return next
    })
  }

  useEffect(() => {
    const saved = localStorage.getItem('anclora-sidebar-collapsed')
    if (saved === 'true') {
      requestAnimationFrame(() => setIsCollapsed(true))
    }

    const fetchOrgLogo = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Fetch user profile to get org_id
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('org_id')
          .eq('id', user.id)
          .single()

        if (profile) {
          const { data: org } = await supabase
            .from('organizations')
            .select('logo_url')
            .eq('id', profile.org_id)
            .single()
            
          if (org?.logo_url) {
            setLogoUrl(org.logo_url)
          }
        }
      }
    }
    fetchOrgLogo()

    // Realtime subscription for logo changes
    const channel = supabase
      .channel('org-logo-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'organizations' },
        (payload) => {
          if (payload.new && payload.new.logo_url) {
            setLogoUrl(payload.new.logo_url)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const links = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('leads'), href: '/leads', icon: Users },
    { name: t('properties'), href: '/properties', icon: Home },
    { name: t('tasks'), href: '/tasks', icon: CheckSquare },
    { name: t('team'), href: '/team', icon: UserCog },
    { name: t('prospection'), href: '/prospection', icon: Target },
    { name: t('intelligence'), href: '/intelligence', icon: LayoutDashboard },
    { name: t('ingestion'), href: '/ingestion', icon: Database },
  ]

  return (
    <aside className={`${isCollapsed ? 'w-24' : 'w-64'} border-r border-soft-subtle bg-navy-darker/50 backdrop-blur-xl flex flex-col pt-5 transition-all duration-300 overflow-visible`}>
      <div className={`${isCollapsed ? 'px-3' : 'px-8'} mb-8`}>
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
            title={isCollapsed ? 'Expandir' : 'Contraer'}
            className="h-9 w-9 rounded-lg border border-soft-subtle/70 bg-navy-surface/40 hover:border-gold/50 hover:text-gold text-soft-muted transition-all flex items-center justify-center"
          >
            {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex flex-col items-center overflow-visible pt-2">
          <div className={`${isCollapsed ? 'mb-0 mt-1' : 'mb-4'} animate-float`}>
            <BrandLogo size={isCollapsed ? 52 : 64} src={logoUrl} />
          </div>
          <h1
            className={`font-display text-xl text-soft-white whitespace-nowrap transition-all duration-300 ${
              isCollapsed ? 'opacity-0 -translate-y-1 max-h-0 pointer-events-none' : 'opacity-100 translate-y-0 max-h-10'
            }`}
          >
            Anclora Nexus
          </h1>
          <p
            className={`text-[10px] uppercase tracking-[0.2em] text-gold/60 mt-1 whitespace-nowrap transition-all duration-300 ${
              isCollapsed ? 'opacity-0 -translate-y-1 max-h-0 pointer-events-none' : 'opacity-100 translate-y-0 max-h-6'
            }`}
          >
            Intelligence Layer
          </p>
        </div>
      </div>

      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} space-y-1`}>
        {links.map((link) => {
          const Active = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              title={isCollapsed ? link.name : undefined}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                Active 
                  ? 'bg-gold/10 text-gold shadow-sm' 
                  : 'text-soft-muted hover:text-soft-white hover:bg-white/[0.03]'
              }`}
            >
              <link.icon className={`w-5 h-5 ${Active ? 'text-gold' : 'text-soft-muted group-hover:text-soft-white'}`} />
              {!isCollapsed && (
                <span className="whitespace-nowrap overflow-hidden transition-all duration-300 max-w-[140px] opacity-100 translate-x-0">
                  {link.name}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-soft-subtle mt-auto space-y-2`}>
        {!isCollapsed && (
          <div className="flex items-center justify-between gap-2 mb-2">
            <LanguageSelector menuPlacement="top" menuAlign="left" />
            <CurrencySelector menuPlacement="top" menuAlign="center" />
            <UnitSelector menuPlacement="top" menuAlign="right" />
          </div>
        )}
        <button
          title={isCollapsed ? t('logout') : undefined}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl text-sm font-medium text-soft-muted hover:text-red-400 hover:bg-red-400/5 transition-all w-full`}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && (
            <span className="whitespace-nowrap overflow-hidden transition-all duration-300 max-w-[120px] opacity-100 translate-x-0">
              {t('logout')}
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
