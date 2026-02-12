'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import supabase from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { BrandLogo } from '@/components/brand/BrandLogo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [particles, setParticles] = useState<any[]>([])

  useEffect(() => {
    // Generate particles only on the client to avoid hydration mismatch
    const newParticles = [...Array(12)].map((_, i) => ({
      id: i,
      x: Math.random() * 1000,
      y: Math.random() * 1000,
      offsetY: Math.random() * -100,
      duration: 5 + Math.random() * 5,
    }))
    setParticles(newParticles)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('¡Check your email for the login link!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy-darker relative overflow-hidden">
      {/* Abstract Background Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-blue-light/10 rounded-full"
          initial={{ 
            x: p.x, 
            y: p.y,
            opacity: 0.1 
          }}
          animate={{
            y: [null, p.y + p.offsetY],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="widget-card max-w-md w-full p-8 border-soft-subtle/20 bg-navy-surface backdrop-blur-xl">
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-4"
            >
              <BrandLogo size={80} />
            </motion.div>
            <h1 className="font-display text-3xl text-soft-white mb-1">Anclora Nexus</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-soft-muted">Private Estate Intelligence</p>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent mt-4" />
          </div>


          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-soft-muted ml-1">
                Email Profesional
              </label>
              <Input
                id="email"
                type="email"
                placeholder="toni@anclora.es"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-navy-darker/50 border-soft-subtle/20 focus:border-gold focus:ring-1 focus:ring-gold/30 text-soft-white h-12"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gold hover:bg-gold-muted text-navy-deep font-bold rounded-xl transition-all shadow-gold-glow hover:shadow-gold-glow/40"
            >
              {loading ? 'Enviando...' : 'Acceder'}
            </Button>

            {message && (
              <p className={`text-center text-sm ${message.includes('Check') ? 'text-emerald-400' : 'text-danger'}`}>
                {message}
              </p>
            )}
          </form>

          <p className="text-center text-[10px] text-soft-muted mt-8 uppercase tracking-widest">
            Powered by OpenClaw
          </p>
        </Card>
      </motion.div>
    </div>
  )
}
