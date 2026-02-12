'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Calendar, MapPin, Building, Briefcase, Trophy, Edit2, Camera } from 'lucide-react'
import supabase from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ProfilePage() {
  const { t } = useI18n()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    fetchUser()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
    </div>
  )

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Toni'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Profile Section */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/50 via-blue-light/50 to-gold/50 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-navy-surface border border-soft-subtle/30 rounded-[2rem] p-8 md:p-12 overflow-hidden">
          {/* Animated Background Orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-light/5 rounded-full blur-[80px] -ml-32 -mb-32" />
          
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-gold/30 p-1 bg-navy-deep/50 backdrop-blur-sm">
                <div className="w-full h-full rounded-full bg-gold/10 flex items-center justify-center overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl md:text-6xl font-black text-gold tracking-tighter opacity-80">{userInitial}</span>
                  )}
                </div>
              </div>
              <button className="absolute bottom-1 right-1 p-2.5 bg-gold rounded-full text-navy-deep hover:scale-110 transition-transform shadow-lg shadow-gold/20">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl md:text-5xl font-bold text-soft-white tracking-tight leading-tight">{userName}</h1>
                  <span className="px-3 py-1 bg-gold/20 text-gold text-xs font-bold rounded-full border border-gold/20 uppercase tracking-widest">
                    Pro Agent
                  </span>
                </div>
                <p className="text-lg text-soft-muted font-medium flex items-center justify-center md:justify-start gap-2">
                  <Briefcase className="w-4 h-4 text-blue-light/60" />
                  Luxury Estate Consultant @ Anclora Private Estates
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-soft-muted">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold/60" />
                  {user?.email}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold/60" />
                  Mallorca, ES (SW Region)
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold/60" />
                  Member since {new Date(user?.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                <Button className="bg-gold hover:bg-gold-muted text-navy-deep font-bold px-8 rounded-xl flex items-center gap-2 h-11 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gold/10">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="border-soft-subtle/50 text-soft-white hover:bg-white/5 px-8 rounded-xl h-11">
                  View Public Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-8">
          <Card className="bg-navy-surface border-soft-subtle/30 overflow-hidden">
            <div className="p-6 border-b border-soft-subtle/30 bg-white/5">
              <h3 className="text-xl font-bold text-soft-white flex items-center gap-3">
                <Shield className="w-5 h-5 text-gold" />
                Professional Summary
              </h3>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-soft-muted leading-relaxed">
                Specialized in high-end real estate in the Southwest of Mallorca (Andratx, Calvià, Son Ferrer). 
                Leveraging AI-driven insights to provide premium service and predictive market analysis for luxury properties.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                  <h4 className="text-soft-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-light" />
                    Specialization
                  </h4>
                  <ul className="space-y-2 text-soft-muted text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-gold" />
                      Luxury Villas & Estates
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-gold" />
                      Off-market Properties
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-gold" />
                      Investment Portfolios
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                  <h4 className="text-soft-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-blue-light" />
                    Achievements
                  </h4>
                  <ul className="space-y-2 text-soft-muted text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-gold" />
                      Top Producer Q3 2025
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-gold" />
                      Certified IA Agent
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-gold" />
                      Anclora Pilot Member
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Stats/Quick Info */}
        <div className="space-y-8">
          <Card className="bg-navy-surface border-soft-subtle/30 overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold via-blue-light to-gold opacity-50" />
            <div className="p-8 space-y-8">
              <h3 className="text-xl font-bold text-soft-white">Account Info</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Organization</p>
                  <p className="text-soft-white font-medium">Anclora Private Estates</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Role</p>
                  <p className="text-soft-white font-medium">Regional Manager</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Nexus ID</p>
                  <p className="text-[10px] font-mono text-blue-light break-all opacity-70 cursor-help" title={user?.id}>
                    {user?.id?.slice(0, 18)}...
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-soft-subtle/30">
                <p className="text-xs text-soft-muted text-center italic">
                  Your profile is fully synchronized with Anclora Cognitive Cloud.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 p-6 rounded-2xl">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center text-gold border border-gold/20">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-soft-white font-bold mb-1 tracking-tight">Governance Tier: Platinum</h4>
                <p className="text-xs text-soft-muted">Audit signature verification active</p>
              </div>
              <div className="w-full bg-navy-deep/50 rounded-full h-1.5 overflow-hidden">
                <div className="w-full h-full bg-gold rounded-full" />
              </div>
              <p className="text-[10px] text-gold font-bold uppercase tracking-[0.2em]">Validated Agent</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
