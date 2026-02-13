'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, Home, CheckSquare, Settings, LogOut, UserCog } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { useI18n } from '@/lib/i18n'
import supabase from '@/lib/supabase'

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useI18n()
  const [logoUrl, setLogoUrl] = useState<string | undefined>()

  useEffect(() => {
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
    { name: t('intelligence'), href: '/intelligence', icon: LayoutDashboard },
  ]

  return (
    <aside className="w-64 border-r border-soft-subtle bg-navy-darker/50 backdrop-blur-xl flex flex-col pt-8">
      <div className="px-8 mb-10 flex flex-col items-center">
        <div className="mb-4 animate-float">
          <BrandLogo size={64} src={logoUrl} />
        </div>
        <h1 className="font-display text-xl text-soft-white">Anclora Nexus</h1>

        <p className="text-[10px] uppercase tracking-[0.2em] text-gold/60 mt-1">Intelligence Layer</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => {
          const Active = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                Active 
                  ? 'bg-gold/10 text-gold shadow-sm' 
                  : 'text-soft-muted hover:text-soft-white hover:bg-white/[0.03]'
              }`}
            >
              <link.icon className={`w-5 h-5 ${Active ? 'text-gold' : 'text-soft-muted group-hover:text-soft-white'}`} />
              {link.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-soft-subtle mt-auto">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-soft-muted hover:text-red-400 hover:bg-red-400/5 transition-all w-full">
          <LogOut className="w-5 h-5" />
          {t('logout')}
        </button>
      </div>
    </aside>
  )
}
