'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, Mail, Shield, Calendar, MapPin, Building, 
  Briefcase, Trophy, Globe, UserCircle, Check
} from 'lucide-react'
import supabase from '@/lib/supabase'
import { Card } from '@/components/ui/card'

export default function PublicProfilePage() {
  const params = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error || !data) {
          setNotFound(true)
        } else {
          setProfile(data)
        }
      } catch (err) {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchProfile()
  }, [params.id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-navy-deep">
      <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-navy-deep text-center p-4">
      <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
        <UserCircle className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-bold text-soft-white mb-2">Profile Not Found</h1>
      <p className="text-soft-muted max-w-md">The agent profile you are looking for does not exist or is not public at this time.</p>
    </div>
  )

  const userName = profile?.full_name || 'Anclora Agent'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-navy-deep py-20 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Public Header */}
        <div className="text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block relative"
          >
            <div className="absolute inset-0 bg-gold/20 blur-[50px] rounded-full" />
            <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-gold/30 p-2 bg-navy-surface shadow-2xl">
              <div className="w-full h-full rounded-full bg-gold/10 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl md:text-8xl font-black text-gold opacity-80">{userInitial}</span>
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gold rounded-2xl flex items-center justify-center border-4 border-navy-deep shadow-xl">
              <Shield className="w-6 h-6 text-navy-deep" />
            </div>
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-soft-white tracking-tighter leading-none">
              {userName}
            </h1>
            <p className="text-xl md:text-2xl text-gold font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gold/40" />
              {profile?.job_title || 'Luxury Estate Consultant'}
              <div className="h-px w-8 bg-gold/40" />
            </p>
            <div className="flex items-center justify-center gap-6 text-soft-muted">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-light" />
                {profile?.location || 'Mallorca, Spain'}
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-light" />
                Anclora Nexus Verified
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <Card className="bg-navy-surface border-soft-subtle/30 p-8 space-y-6">
            <h3 className="text-xl font-bold text-soft-white flex items-center gap-3">
              <div className="w-1.5 h-6 bg-gold rounded-full" />
              Professional Biography
            </h3>
            <p className="text-soft-muted leading-relaxed text-lg">
              {profile?.bio || 'No public biography provided.'}
            </p>
          </Card>

          <div className="space-y-8">
            <Card className="bg-navy-surface border-soft-subtle/30 p-8 space-y-6">
              <h3 className="text-xl font-bold text-soft-white flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-light rounded-full" />
                Specialization
              </h3>
              <div className="flex flex-wrap gap-3">
                {profile?.specialization?.map((spec: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-soft-white text-sm font-medium">
                    {spec}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="bg-navy-surface border-soft-subtle/30 p-8 space-y-6">
              <h3 className="text-xl font-bold text-soft-white flex items-center gap-3">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                Verified Achievements
              </h3>
              <div className="space-y-3">
                {profile?.achievements?.map((ach: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-soft-muted">
                    <Check className="w-5 h-5 text-gold" />
                    {ach}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-20 text-center space-y-6 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-20 bg-soft-subtle/30" />
            <img src="/logo-anclora-nexus.png" err-src="" alt="Anclora" className="h-8 grayscale brightness-200" />
            <div className="h-px w-20 bg-soft-subtle/30" />
          </div>
          <p className="text-xs text-soft-muted tracking-widest uppercase font-bold">
            Powered by Anclora Nexus Intelligence
          </p>
        </div>
      </div>
    </div>
  )
}
