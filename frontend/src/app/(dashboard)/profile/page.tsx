'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Shield, Calendar, MapPin, Building, 
  Briefcase, Trophy, Edit2, Camera, X, Check, Loader2,
  Globe, UserCircle, ExternalLink, Image as ImageIcon, AlertCircle
} from 'lucide-react'
import supabase from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BrandLogo } from '@/components/brand/BrandLogo'

export default function ProfilePage() {
  const { t } = useI18n()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [org, setOrg] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [errorStatus, setErrorStatus] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    location: '',
    bio: '',
    specialization: [] as string[],
    achievements: [] as string[]
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        setUser(authUser)
        
        // 1. Fetch User Profile
        let { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle()

        // 2. If no profile, create it using any available organization
        if (!profileData) {
          const { data: orgs } = await supabase.from('organizations').select('id').limit(1)
          const orgId = orgs?.[0]?.id || '00000000-0000-0000-0000-000000000000'
          
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .upsert({
              id: authUser.id,
              org_id: orgId,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
              job_title: 'Luxury Estate Consultant',
              location: 'Mallorca, ES'
            })
            .select('*')
            .single()
          
          if (newProfile) profileData = newProfile
        }

        if (profileData) {
          // 3. Fetch Organization
          const { data: orgData } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', profileData.org_id)
            .maybeSingle()
            
          setProfile(profileData)
          setOrg(orgData)
          setFormData({
            full_name: profileData.full_name || '',
            job_title: profileData.job_title || 'Luxury Estate Consultant',
            location: profileData.location || 'Mallorca, ES',
            bio: profileData.bio || '',
            specialization: profileData.specialization || [],
            achievements: profileData.achievements || []
          })
        }
      }
    } catch (error: any) {
      console.error('Fetch error:', error)
      setErrorStatus(`Error loading profile: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          job_title: formData.job_title,
          location: formData.location,
          bio: formData.bio,
          specialization: formData.specialization,
          achievements: formData.achievements
        })
        .eq('id', user.id)

      if (error) throw error
      await fetchProfile()
      setIsEditModalOpen(false)
    } catch (error: any) {
      alert(`Update failed: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpload = async (file: File, bucket: string, field: string) => {
    if (!user || !file) return
    const isLogo = bucket === 'logos'
    if (isLogo) setIsUploadingLogo(true); else setIsUploading(true)
    setErrorStatus(null)
    
    try {
      // 1. Ensure bucket exists (Supabase specific error handling)
      const fileName = `${Date.now()}-${file.name}`
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (uploadError) {
        // If bucket is not found or other storage error
        if (uploadError.message.includes('not found')) {
          setErrorStatus(`Bucket "${bucket}" is not ready. Please check Supabase Storage settings.`)
          throw uploadError
        }
        throw uploadError
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      // 3. Update Database
      if (isLogo && org) {
        await supabase.from('organizations').update({ logo_url: publicUrl }).eq('id', org.id)
      } else {
        await supabase.from('user_profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
        await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
      }

      await fetchProfile()
    } catch (error: any) {
      console.error('Upload process error:', error)
      setErrorStatus(`Upload failed: ${error.message}`)
    } finally {
      setIsUploadingLogo(false)
      setIsUploading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
    </div>
  )

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const userNameString = formData.full_name || user?.email?.split('@')[0] || 'Toni'

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {errorStatus && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{errorStatus}</p>
          <button onClick={() => setErrorStatus(null)} className="ml-auto text-red-400/50 hover:text-red-400"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header Profile Section */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/50 via-blue-light/50 to-gold/50 rounded-[2rem] blur opacity-20 transition duration-1000 group-hover:opacity-40"></div>
        <div className="relative bg-navy-surface border border-soft-subtle/30 rounded-[2rem] p-8 md:p-12 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-gold/30 p-1 bg-navy-deep/50 shadow-2xl overflow-hidden">
                <div className="w-full h-full rounded-full bg-gold/10 flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-gold animate-spin" />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl md:text-6xl font-black text-gold opacity-80">{userNameString.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 p-2.5 bg-gold rounded-full text-navy-deep hover:scale-110 shadow-lg z-10">
                <Camera className="w-4 h-4" />
              </button>
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'avatars', 'avatar_url')} className="hidden" accept="image/*" />
            </div>

            {/* Brand Logo Section */}
            <div className="hidden md:block absolute top-8 right-8 text-right">
              <div className="relative inline-block group/logo">
                <BrandLogo size={48} src={org?.logo_url} />
                <button onClick={() => logoInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-1.5 bg-navy-deep border border-gold/40 rounded-lg text-gold opacity-0 group-hover/logo:opacity-100 transition-opacity hover:bg-gold hover:text-navy-deep">
                  {isUploadingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                </button>
                <input type="file" ref={logoInputRef} onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'logos', 'logo_url')} className="hidden" accept="image/*" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-gold/60 mt-2 font-bold">{org?.name || 'Anclora'}</p>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-bold text-soft-white tracking-tight">{userNameString}</h1>
                <p className="text-lg text-soft-muted font-medium flex items-center justify-center md:justify-start gap-2">
                  <Briefcase className="w-4 h-4 text-blue-light/60" />
                  {profile?.job_title || t('luxuryEstateConsultant')} @ {org?.name || 'Anclora Private Estates'}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-soft-muted">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold/60" /> {user?.email}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gold/60" /> {profile?.location}</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gold/60" /> {t('memberSince')} {new Date(user?.created_at).toLocaleDateString()}</div>
              </div>

              <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                <Button onClick={() => setIsEditModalOpen(true)} className="bg-gold hover:bg-gold-muted text-navy-deep font-bold px-8 rounded-xl shadow-lg">
                  <Edit2 className="w-4 h-4 mr-2" />{t('editProfile')}
                </Button>
                <Button variant="outline" onClick={() => window.open(`/public/${user?.id}`, '_blank')} className="border-soft-subtle/50 text-soft-white px-8 rounded-xl">
                  <ExternalLink className="w-4 h-4 mr-2" />{t('viewPublicProfile')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="bg-navy-surface border-soft-subtle/30 p-8 space-y-6">
            <h3 className="text-xl font-bold text-soft-white flex items-center gap-3">
              <Shield className="w-5 h-5 text-gold" /> {t('professionalSummary')}
            </h3>
            <p className="text-soft-muted leading-relaxed">
              {profile?.bio || t('professionalBio')}
            </p>
          </Card>
        </div>
        <div className="space-y-8">
          <Card className="bg-navy-surface border-soft-subtle/30 p-8 space-y-8 relative overflow-hidden">
            <h3 className="text-xl font-bold text-soft-white">{t('accountInfo')}</h3>
            <div className="space-y-6">
              <div><p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">{t('organization')}</p><p className="text-soft-white font-medium">{org?.name}</p></div>
              <div><p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">{t('role')}</p><p className="text-soft-white font-medium">{profile?.role}</p></div>
              <div><p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Nexus ID</p><p className="text-[10px] font-mono text-blue-light">{user?.id}</p></div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal (simplified for fix) */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-navy-deep/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-navy-surface border border-soft-subtle/30 rounded-[2rem] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-soft-white flex items-center gap-3"><Edit2 className="w-6 h-6 text-gold" /> {t('editProfile')}</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-soft-muted"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gold uppercase">Full Name</label>
                    <input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full bg-navy-deep border border-soft-subtle/30 rounded-xl px-4 py-3 text-soft-white focus:border-gold/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gold uppercase">Job Title</label>
                    <input type="text" value={formData.job_title} onChange={(e) => setFormData({...formData, job_title: e.target.value})} className="w-full bg-navy-deep border border-soft-subtle/30 rounded-xl px-4 py-3 text-soft-white focus:border-gold/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gold uppercase">Biography</label>
                  <textarea rows={4} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-navy-deep border border-soft-subtle/30 rounded-xl px-4 py-3 text-soft-white resize-none" />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-soft-muted">Cancel</Button>
                  <Button type="submit" disabled={isSaving} className="bg-gold hover:bg-gold-muted text-navy-deep font-bold px-8 rounded-xl shadow-lg">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : t('saveChanges')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
