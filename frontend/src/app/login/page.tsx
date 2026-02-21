'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { BrandLogo } from '@/components/brand/BrandLogo'

export default function LoginPage() {
  const router = useRouter()
  type Particle = {
    id: number
    x: number
    y: number
    offsetY: number
    duration: number
  }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [confirmPassword, setConfirmPassword] = useState('')
  const particles: Particle[] = [...Array(12)].map((_, i) => ({
    id: i,
    x: (i * 97) % 1000,
    y: (i * 173) % 1000,
    offsetY: -40 - (i % 7) * 10,
    duration: 5 + (i % 5),
  }))

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const modeParam = params.get('mode')

    if (code) {
      const next = encodeURIComponent('/login?mode=reset')
      router.replace(`/auth/callback?code=${encodeURIComponent(code)}&next=${next}`)
      return
    }

    if (modeParam === 'reset') {
      setMode('reset')
    }
  }, [router])

  useEffect(() => {
    const rawHash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : ''
    if (!rawHash) return
    const hashParams = new URLSearchParams(rawHash)
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const type = hashParams.get('type')

    if (type === 'recovery') {
      setMode('reset')
      if (accessToken && refreshToken) {
        void supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      }
      const base = `${window.location.pathname}?mode=reset`
      window.history.replaceState({}, '', base)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'reset') {
      if (!password || !confirmPassword) {
        setMessage('Introduce y confirma la nueva contraseña.')
        setIsError(true)
        return
      }
      if (password.length < 8) {
        setMessage('La contraseña debe tener al menos 8 caracteres.')
        setIsError(true)
        return
      }
      if (password !== confirmPassword) {
        setMessage('Las contraseñas no coinciden.')
        setIsError(true)
        return
      }
      setLoading(true)
      setMessage('')
      setIsError(false)
      const response = await fetch('/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setMessage(payload?.message || 'No se pudo actualizar la contraseña.')
        setIsError(true)
      } else {
        setMessage('Contraseña actualizada correctamente. Ya puedes iniciar sesión.')
        setIsError(false)
        setMode('login')
        setPassword('')
        setConfirmPassword('')
        router.replace('/login')
      }
      setLoading(false)
      return
    }

    setLoading(true)
    setMessage('')
    setIsError(false)

    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          })

    if (error) {
      const raw = (error.message || '').toLowerCase()
      if (raw.includes('invalid login credentials')) {
        setMessage('Email o contraseña incorrectos.')
      } else if (raw.includes('email not confirmed')) {
        setMessage('Debes confirmar tu email antes de iniciar sesión.')
      } else if (raw.includes('invitation_required')) {
        setMessage('Solo puedes crear cuenta si has sido invitado por tu organización.')
      } else {
        setMessage(error.message)
      }
      setIsError(true)
    } else {
      setMessage(mode === 'login' ? 'Acceso correcto' : 'Cuenta creada. Si tu invitación era válida, ya puedes iniciar sesión.')
      setIsError(false)
      if (mode === 'login') {
        router.replace('/dashboard')
        router.refresh()
      } else {
        setMode('login')
      }
    }
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage('Introduce primero tu email.')
      setIsError(true)
      return
    }
    setLoading(true)
    setMessage('')
    setIsError(false)
    const configuredAppUrl = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '')
    const appUrl = configuredAppUrl || window.location.origin
    const resetNext = encodeURIComponent('/login?mode=reset')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/callback?next=${resetNext}`,
    })
    if (error) {
      setMessage(error.message)
      setIsError(true)
    } else {
      setMessage('Te hemos enviado un email para restablecer la contraseña.')
      setIsError(false)
    }
    setLoading(false)
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(true)
    setMessage('')
    setIsError(false)
    const configuredAppUrl = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '')
    const appUrl = configuredAppUrl || window.location.origin
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${appUrl}/auth/callback`,
      },
    })
    if (error) {
      setMessage(error.message)
      setIsError(true)
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center p-3 bg-navy-darker relative overflow-hidden">
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
        className="w-full max-w-md"
      >
        <Card className="widget-card w-full px-6 py-5 border-soft-subtle/20 bg-navy-surface backdrop-blur-xl">
          <div className="flex flex-col items-center mb-4">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-2"
            >
              <BrandLogo size={64} />
            </motion.div>
            <h1 className="font-display text-2xl text-soft-white mb-1">Anclora Nexus</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-soft-muted">Private Estate Intelligence</p>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent mt-3" />
          </div>


          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-navy-darker/40 rounded-lg border border-soft-subtle/20">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`h-8 rounded-md text-xs font-semibold transition ${
                  mode === 'login'
                    ? 'bg-gold text-navy-deep'
                    : 'text-soft-muted hover:text-soft-white'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`h-8 rounded-md text-xs font-semibold transition ${
                  mode === 'signup'
                    ? 'bg-gold text-navy-deep'
                    : 'text-soft-muted hover:text-soft-white'
                }`}
              >
                Crear cuenta
              </button>
            </div>

            {mode === 'reset' && (
              <p className="text-xs text-soft-muted text-center">
                Introduce tu nueva contraseña para completar la recuperación.
              </p>
            )}

            <div className="space-y-1">
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
                className="bg-navy-darker/50 border-soft-subtle/20 focus:border-gold focus:ring-1 focus:ring-gold/30 text-soft-white h-11"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-soft-muted ml-1">
                {mode === 'reset' ? 'Nueva contraseña' : 'Contraseña'}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-navy-darker/50 border-soft-subtle/20 focus:border-gold focus:ring-1 focus:ring-gold/30 text-soft-white h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md bg-navy-deep/10 text-navy-deep/60 hover:bg-navy-deep/20 hover:text-navy-deep transition-colors flex items-center justify-center"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'reset' && (
              <div className="space-y-1">
                <label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-wider text-soft-muted ml-1">
                  Confirmar contraseña
                </label>
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-navy-darker/50 border-soft-subtle/20 focus:border-gold focus:ring-1 focus:ring-gold/30 text-soft-white h-11"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gold hover:bg-gold-muted text-navy-deep font-bold rounded-xl transition-all shadow-gold-glow hover:shadow-gold-glow/40"
            >
              {loading ? 'Procesando...' : mode === 'login' ? 'Acceder' : mode === 'signup' ? 'Crear cuenta' : 'Actualizar contraseña'}
            </Button>

            {mode !== 'reset' && (
              <Button
                type="button"
                variant="ghost"
                disabled={loading}
                onClick={handleForgotPassword}
                className="w-full h-9 text-soft-muted hover:text-soft-white"
              >
                Olvidé mi contraseña
              </Button>
            )}

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-soft-subtle/20" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-[10px] uppercase tracking-widest text-soft-muted bg-navy-surface">
                  o continúa con
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => handleOAuth('google')}
                className="h-10 border-soft-subtle/30 text-soft-white hover:bg-white/5"
              >
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => handleOAuth('github')}
                className="h-10 border-soft-subtle/30 text-soft-white hover:bg-white/5"
              >
                GitHub
              </Button>
            </div>

            {message && (
              <p className={`text-center text-sm ${isError ? 'text-danger' : 'text-emerald-400'}`}>
                {message}
              </p>
            )}
          </form>

          <p className="text-center text-[10px] text-soft-muted mt-4 uppercase tracking-widest">
            Powered by OpenClaw
          </p>
        </Card>
      </motion.div>
    </div>
  )
}
