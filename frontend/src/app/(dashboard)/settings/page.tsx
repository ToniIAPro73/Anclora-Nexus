'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Bell, 
  Lock, 
  Palette, 
  Database, 
  Globe, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Save, 
  RotateCcw,
  Check,
  ChevronRight,
  Wallet
} from 'lucide-react'
import { CostGovernanceTab } from '@/components/finops/CostGovernanceTab'
import { useI18n } from '@/lib/i18n'
import { LanguageSelector } from '@/components/layout/LanguageSelector'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

export default function SettingsPage() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }, 1500)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'intelligence', label: t('intelligence'), icon: Cpu },
    { id: 'finops', label: t('finops'), icon: Wallet },
    { id: 'security', label: 'Security & Privacy', icon: ShieldCheck },
    { id: 'data', label: 'Data & Sync', icon: Database },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-soft-subtle/30">
        <div>
          <h1 className="text-4xl font-bold text-soft-white tracking-tight flex items-center gap-4">
            <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20">
              <Settings className="w-8 h-8 text-gold" />
            </div>
            {t('settings')}
          </h1>
          <p className="text-soft-muted mt-2 max-w-lg font-medium">
            {t('settingsSubtitle')}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="border-soft-subtle/50 text-soft-white hover:bg-white/5 rounded-xl px-6 h-11 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {t('resetDefaults')}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className={`rounded-xl px-8 h-11 font-bold text-navy-deep shadow-lg transition-all flex items-center gap-2 ${
              saveSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gold hover:bg-gold-muted'
            }`}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-navy-deep/20 border-t-navy-deep rounded-full animate-spin" />
            ) : saveSuccess ? (
              <>
                <Check className="w-5 h-5" />
                {t('saved')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t('saveChanges')}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all group ${
                  activeTab === tab.id 
                    ? 'bg-gold/10 text-gold border border-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.05)]' 
                    : 'text-soft-muted hover:text-soft-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-gold' : 'text-soft-muted/60'}`} />
                {tab.label}
              </button>
            )
          })}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'general' && (
                <div className="space-y-8">
                  <Card className="bg-navy-surface border-soft-subtle/30 overflow-hidden">
                    <div className="p-6 border-b border-soft-subtle/30 bg-white/5">
                      <h3 className="text-lg font-bold text-soft-white">{t('interfaceLanguage')}</h3>
                    </div>
                    <div className="p-8 space-y-10">
                      <div className="flex flex-col md:flex-row gap-8 md:items-center justify-between">
                        <div>
                          <p className="text-soft-white font-bold mb-1">{t('systemLanguage')}</p>
                          <p className="text-sm text-soft-muted">{t('languageDescription')}</p>
                        </div>
                        <div className="bg-navy-deep/50 p-1.5 rounded-2xl border border-soft-subtle/20 w-full md:w-auto flex justify-center">
                          <LanguageSelector />
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-8 md:items-center justify-between pt-8 border-t border-soft-subtle/10">
                        <div>
                          <p className="text-soft-white font-bold mb-1">{t('timezoneSettings')}</p>
                          <p className="text-sm text-soft-muted">{t('timezoneDescription')}</p>
                        </div>
                        <select className="bg-navy-deep border border-soft-subtle/30 rounded-xl px-4 py-2.5 text-sm text-soft-white focus:outline-none focus:border-gold/50 min-w-[200px]">
                          <option>Europe/Madrid (GMT+1)</option>
                          <option>Europe/London (GMT+0)</option>
                          <option>America/New_York (GMT-5)</option>
                        </select>
                      </div>

                      <div className="flex flex-col md:flex-row gap-8 md:items-center justify-between pt-8 border-t border-soft-subtle/10">
                        <div>
                          <p className="text-soft-white font-bold mb-1">{t('dashboardRefresh')}</p>
                          <p className="text-sm text-soft-muted">{t('refreshDescription')}</p>
                        </div>
                        <div className="flex bg-navy-deep p-1 rounded-xl border border-soft-subtle/20 self-start md:self-auto">
                          {['5m', '15m', '30m', 'Auto'].map((val) => (
                            <button key={val} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${val === 'Auto' ? 'bg-gold text-navy-deep' : 'text-soft-muted hover:text-soft-white'}`}>
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-navy-surface border-soft-subtle/30 overflow-hidden">
                    <div className="p-6 border-b border-soft-subtle/30 bg-white/5">
                      <h3 className="text-lg font-bold text-soft-white">{t('visualExperience')}</h3>
                    </div>
                    <div className="p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <Checkbox checked className="mt-1" />
                          <div>
                            <p className="text-soft-white font-bold text-sm">{t('motionAnimations')}</p>
                            <p className="text-xs text-soft-muted mt-1 leading-relaxed">{t('motionDescription')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <Checkbox checked className="mt-1" />
                          <div>
                            <p className="text-soft-white font-bold text-sm">{t('glassmorphismDepth')}</p>
                            <p className="text-xs text-soft-muted mt-1 leading-relaxed">{t('glassmorphismDescription')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <Checkbox checked className="mt-1" />
                          <div>
                            <p className="text-soft-white font-bold text-sm">{t('typewriterEffects')}</p>
                            <p className="text-xs text-soft-muted mt-1 leading-relaxed">{t('typewriterDescription')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 opacity-50">
                          <Checkbox disabled className="mt-1" />
                          <div>
                            <p className="text-soft-white font-bold text-sm">{t('lightModeLegacy')}</p>
                            <p className="text-xs text-red-400 font-bold mt-1 uppercase tracking-tighter">{t('disabledBranding')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'intelligence' && (
                <div className="space-y-8">
                  <Card className="bg-navy-surface border-soft-subtle/30 border-l-4 border-l-gold">
                    <div className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-gold/10 rounded-xl">
                          <Cpu className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                          <h3 className="text-soft-white font-bold text-xl">{t('operationalCore')}</h3>
                          <p className="text-sm text-soft-muted font-medium">{t('intelligenceDescription')}</p>
                        </div>
                        <div className="ml-auto">
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 tracking-widest uppercase">
                            {t('operational')}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-8 pt-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-soft-white uppercase tracking-widest">{t('primaryModelChain')}</label>
                            <span className="text-[10px] text-soft-muted font-mono px-2 py-0.5 border border-soft-subtle/20 rounded">V1.0.4-LUXE</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button className="p-4 rounded-xl border-2 border-gold/50 bg-gold/10 text-left transition-all">
                              <p className="text-gold font-bold text-sm flex items-center justify-between">
                                {t('strategicLuxe')}
                                <Zap className="w-3 h-3 fill-gold" />
                              </p>
                              <p className="text-[10px] text-gold/60 mt-1 uppercase font-bold tracking-tighter">{t('recommended')}</p>
                            </button>
                            <button className="p-4 rounded-xl border border-soft-subtle/30 bg-navy-deep hover:border-blue-light/50 text-left transition-all group">
                              <p className="text-soft-white font-bold text-sm group-hover:text-blue-light">{t('fastResponse')}</p>
                              <p className="text-[10px] text-soft-muted mt-1 uppercase font-bold tracking-tighter">{t('efficiencyFocus')}</p>
                            </button>
                            <button className="p-4 rounded-xl border border-soft-subtle/30 bg-navy-deep hover:border-blue-light/50 text-left transition-all group">
                              <p className="text-soft-white font-bold text-sm group-hover:text-blue-light">{t('deepAnalysis')}</p>
                              <p className="text-[10px] text-soft-muted mt-1 uppercase font-bold tracking-tighter">{t('maxTokensContext')}</p>
                            </button>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-soft-subtle/20 space-y-4">
                          <p className="text-sm font-bold text-soft-white uppercase tracking-widest">{t('autonomousBoundaries')}</p>
                          <div className="space-y-4">
                            {[
                              { label: t('autoCategorizeLeads'), desc: t('autoCategorizeDesc'), active: true },
                              { label: t('generateFollowUpDrafts'), desc: t('generateFollowUpDesc'), active: true },
                              { label: t('proactivePropertySearch'), desc: t('proactiveSearchDesc'), active: false },
                            ].map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div>
                                  <p className="text-soft-white font-bold text-sm">{item.label}</p>
                                  <p className="text-xs text-soft-muted mt-0.5">{item.desc}</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${item.active ? 'bg-gold' : 'bg-navy-darker'}`}>
                                  <div className={`w-4 h-4 rounded-full bg-navy-deep transition-transform ${item.active ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'finops' && (
                <div className="space-y-8">
                  <CostGovernanceTab />
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-blue-light/5 flex items-center justify-center text-blue-light/40 border border-blue-light/10">
                    <Bell className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-soft-white font-bold">{t('comingSoon')}</h3>
                    <p className="text-sm text-soft-muted mt-1">{t('notificationsConfig')}</p>
                  </div>
                  <Button variant="outline" className="mt-4 border-gold/30 text-gold hover:bg-gold/10">
                    {t('managePermissions')}
                  </Button>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-gold/5 flex items-center justify-center text-gold/40 border border-gold/10">
                    <Lock className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-soft-white font-bold">{t('secureAccess')}</h3>
                    <p className="text-sm text-soft-muted mt-1">{t('securityManagedBy')}</p>
                  </div>
                  <Button variant="outline" className="mt-4 border-soft-subtle/50 text-soft-white">
                    {t('viewLogs')}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

