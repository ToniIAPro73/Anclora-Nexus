'use client'
import { useState, useEffect, useRef } from 'react'
import { useStore, IntelligenceResponse } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { Send, Sparkles, Brain, Clock, Zap, History } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatConsoleProps {}

export function ChatConsole({}: ChatConsoleProps) {
  const { t } = useI18n()
  const { intelligence, sendIntelligenceQuery, clearIntelligenceHistory } = useStore()
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'fast' | 'deep'>('fast')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [intelligence.queryHistory, intelligence.isProcessing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || intelligence.isProcessing) return
    const msg = input
    setInput('')
    try {
      await sendIntelligenceQuery(msg, mode)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-navy-surface/30 backdrop-blur-xl border border-blue-light/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* HEADER / MODE SELECTOR */}
      <div className="px-6 py-4 border-b border-soft-subtle flex items-center justify-between bg-navy-darker/20">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-gold" />
          <h2 className="font-display font-bold text-soft-white uppercase tracking-wider">{t('intelligence')}</h2>
        </div>
        
        <div className="flex bg-navy-surface p-1 rounded-xl border border-soft-subtle">
          <button 
            onClick={() => setMode('fast')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${mode === 'fast' ? 'bg-gold/20 text-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'text-soft-muted hover:text-soft-white'}`}
          >
            <Zap className="w-3 h-3" />
            {t('fastMode')}
          </button>
          <button 
            onClick={() => setMode('deep')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${mode === 'deep' ? 'bg-blue-light/20 text-blue-light shadow-[0_0_10px_rgba(175,210,250,0.2)]' : 'text-soft-muted hover:text-soft-white'}`}
          >
            <Clock className="w-3 h-3" />
            {t('deepMode')}
          </button>
        </div>

        <button 
          onClick={clearIntelligenceHistory}
          className="text-soft-muted hover:text-red-400 p-2 transition-colors"
          title="Clear History"
        >
          <History className="w-4 h-4" />
        </button>
      </div>

      {/* MESSAGES AREA */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
      >
        <AnimatePresence initial={false}>
          {intelligence.queryHistory.length === 0 && !intelligence.isProcessing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40"
            >
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-gold/30 flex items-center justify-center mb-6 animate-pulse">
                 <Sparkles className="w-10 h-10 text-gold" />
              </div>
              <h3 className="text-xl font-display text-soft-white mb-2">{t('intelligenceControlCenter')}</h3>
              <p className="text-sm max-w-xs">{t('intelligenceSubtitle')}</p>
            </motion.div>
          )}

          {intelligence.queryHistory.map((item, idx) => (
            <div key={idx} className="space-y-4">
              {/* User Message */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-end"
              >
                <div className="bg-gold/10 border border-gold/20 rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%]">
                  <p className="text-soft-white text-sm">{item.message}</p>
                </div>
              </motion.div>

              {/* AI Response - Just the text summary part */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-start"
              >
                <div className="bg-navy-surface border border-blue-light/10 rounded-2xl rounded-tl-none px-5 py-4 max-w-[90%] shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-light animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-light">Nexus Intelligence Unit</span>
                  </div>
                  <div className="text-soft-white text-sm leading-relaxed whitespace-pre-wrap font-display">
                    {item.response.response}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}

          {intelligence.isProcessing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-navy-surface/50 border border-gold/10 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-3">
                <div className="flex gap-1">
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-1.5 h-1.5 bg-gold rounded-full"
                  />
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-1.5 h-1.5 bg-gold rounded-full"
                  />
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-1.5 h-1.5 bg-gold rounded-full"
                  />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-gold/80 italic animate-pulse">
                  {t('processing')}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-navy-darker/40 border-t border-soft-subtle">
        <form onSubmit={handleSubmit} className="relative group">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={intelligence.isProcessing}
            placeholder={t('placeholderIntelligence')}
            className="w-full bg-navy-surface border border-white/10 rounded-2xl py-4 pl-4 pr-16 text-sm text-soft-white placeholder:text-soft-muted focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/10 transition-all resize-none h-24 scrollbar-none disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <button 
            type="submit"
            disabled={intelligence.isProcessing || !input.trim()}
            className="absolute right-3 bottom-3 p-3 bg-gold text-navy-deep rounded-xl hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between text-[10px] text-soft-muted px-2 uppercase tracking-tighter">
          <span>Shift+Enter for newline</span>
          <span>Strategic Mode v1.0.4-Luxe</span>
        </div>
      </div>
    </div>
  )
}
