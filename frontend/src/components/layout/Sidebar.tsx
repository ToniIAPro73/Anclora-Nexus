'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, Home, CheckSquare, UserCog, Target, ChevronsLeft, ChevronsRight, Database, ShieldCheck, ChevronDown, ChevronRight, UploadCloud, Bot } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { useI18n } from '@/lib/i18n'
import supabase from '@/lib/supabase'

function getSectionFromPath(pathname: string): 'core' | 'intelligence' | 'operations' {
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/leads') ||
    pathname.startsWith('/properties') ||
    pathname.startsWith('/tasks') ||
    pathname.startsWith('/team')
  ) {
    return 'core'
  }
  if (pathname.startsWith('/prospection') || pathname.startsWith('/intelligence')) {
    return 'intelligence'
  }
  return 'operations'
}

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useI18n()
  const [logoUrl, setLogoUrl] = useState<string | undefined>()
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
  const [openSection, setOpenSection] = useState<'core' | 'intelligence' | 'operations' | null>(null)

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

  const autoSection = getSectionFromPath(pathname)
  const visibleSection = openSection ?? autoSection

  const sections: Array<{
    id: 'core' | 'intelligence' | 'operations'
    title: string
    icon: typeof LayoutDashboard
    links: Array<{ name: string; href: string; icon: typeof LayoutDashboard }>
  }> = [
    {
      id: 'core',
      title: t('sidebarSectionCore'),
      icon: LayoutDashboard,
      links: [
        { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
        { name: t('leads'), href: '/leads', icon: Users },
        { name: t('properties'), href: '/properties', icon: Home },
        { name: t('tasks'), href: '/tasks', icon: CheckSquare },
        { name: t('team'), href: '/team', icon: UserCog },
      ],
    },
    {
      id: 'intelligence',
      title: t('sidebarSectionIntelligence'),
      icon: Target,
      links: [
        { name: `${t('prospection')} studio`, href: '/prospection', icon: Target },
        { name: `${t('prospection')} operativa`, href: '/prospection-unified', icon: Target },
        { name: t('opportunityRankingMenu'), href: '/opportunity-ranking', icon: Target },
        { name: t('intelligence'), href: '/intelligence', icon: LayoutDashboard },
      ],
    },
    {
      id: 'operations',
      title: t('sidebarSectionOperations'),
      icon: Database,
      links: [
        { name: t('ingestion'), href: '/ingestion', icon: Database },
        { name: t('dataQuality'), href: '/data-quality', icon: ShieldCheck },
        { name: t('feedOrchestratorMenu'), href: '/feed-orchestrator', icon: UploadCloud },
        { name: t('automationMenu'), href: '/automation-alerting', icon: Bot },
      ],
    },
  ]

  return (
    <aside className={`${isCollapsed ? 'w-24' : 'w-64'} border-r border-soft-subtle bg-navy-darker/50 backdrop-blur-xl flex flex-col pt-4 transition-all duration-300 overflow-hidden`}>
      <div className={`${isCollapsed ? 'px-3' : 'px-6'} mb-5 shrink-0`}>
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
            title={isCollapsed ? t('expand') : t('collapse')}
            className="h-9 w-9 rounded-lg border border-soft-subtle/70 bg-navy-surface/40 hover:border-gold/50 hover:text-gold text-soft-muted transition-all flex items-center justify-center"
          >
            {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex flex-col items-center overflow-visible pt-1">
          <div className={`${isCollapsed ? 'mb-0 mt-1' : 'mb-3'} animate-float`}>
            <BrandLogo size={isCollapsed ? 50 : 60} src={logoUrl} />
          </div>
          <h1
            className={`font-display text-xl text-soft-white whitespace-nowrap transition-all duration-300 ${
              isCollapsed ? 'opacity-0 -translate-y-1 max-h-0 pointer-events-none' : 'opacity-100 translate-y-0 max-h-10'
            }`}
          >
            {t('appName')}
          </h1>
          <p
            className={`text-[10px] uppercase tracking-[0.2em] text-gold/60 mt-1 whitespace-nowrap transition-all duration-300 ${
              isCollapsed ? 'opacity-0 -translate-y-1 max-h-0 pointer-events-none' : 'opacity-100 translate-y-0 max-h-6'
            }`}
          >
            {t('intelligenceLayer')}
          </p>
        </div>
      </div>

      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-3'} pb-3 overflow-y-auto custom-scrollbar`}>
        <div className="space-y-2">
          {sections.map((section) => (
            <div key={section.id} className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  // Accordion estricto: una sola sección activa.
                  setOpenSection(section.id)
                  // En modo colapsado, abrir sección implica expandir sidebar.
                  if (isCollapsed) {
                    setIsCollapsed(false)
                    localStorage.setItem('anclora-sidebar-collapsed', 'false')
                  }
                }}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl border transition-all ${
                  visibleSection === section.id
                    ? 'bg-navy-surface/60 border-gold/20 text-gold'
                    : 'bg-navy-surface/30 border-soft-subtle text-soft-muted hover:text-soft-white hover:border-blue-light/30'
                }`}
                title={isCollapsed ? section.title : undefined}
              >
                <section.icon className={`w-4 h-4 ${visibleSection === section.id ? 'text-gold' : 'text-soft-muted'}`} />
                {!isCollapsed && (
                  <>
                    <span className="text-[11px] uppercase tracking-[0.14em] font-semibold truncate">{section.title}</span>
                    {visibleSection === section.id ? (
                      <ChevronDown className="w-4 h-4 ml-auto" />
                    ) : (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </>
                )}
              </button>

              {!isCollapsed && visibleSection === section.id && (
                <div className="pl-2 space-y-1">
                  {section.links.map((link) => {
                    const Active = pathname === link.href
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                          Active
                            ? 'bg-gold/10 text-gold shadow-sm'
                            : 'text-soft-muted hover:text-soft-white hover:bg-white/[0.03]'
                        }`}
                      >
                        <link.icon className={`w-5 h-5 ${Active ? 'text-gold' : 'text-soft-muted group-hover:text-soft-white'}`} />
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[190px]" title={link.name}>
                          {link.name}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      <div className={`${isCollapsed ? 'p-2' : 'p-3'} border-t border-soft-subtle mt-auto shrink-0`} />
    </aside>
  )
}
