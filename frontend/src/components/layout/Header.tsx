'use client'
import { Bell, Search, User } from 'lucide-react'
import { LanguageSelector } from './LanguageSelector'

export function Header() {
  return (
    <header className="h-20 border-b border-soft-subtle flex items-center justify-between px-8 bg-navy-darker/30 backdrop-blur-md sticky top-0 z-50">
      <div>
        <h2 className="text-soft-white font-medium">Project Dashboard</h2>
        <p className="text-xs text-soft-muted">Welcome back, Toni. Agent status: <span className="text-emerald-400 font-bold">OPTIMAL</span></p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft-muted group-focus-within:text-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Search nexus..." 
            className="bg-navy-surface border border-soft-subtle rounded-full py-2 pl-10 pr-4 text-sm text-soft-white placeholder:text-soft-muted focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all w-64"
          />
        </div>
        
        <button className="p-2.5 rounded-full bg-white/[0.03] border border-soft-subtle text-soft-muted hover:text-soft-white hover:border-soft-muted transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full border-2 border-navy-deep" />
        </button>

        <LanguageSelector />

        <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center text-gold cursor-pointer hover:bg-gold/20 transition-all">
          <User className="w-6 h-6" />
        </div>
      </div>
    </header>
  )
}
