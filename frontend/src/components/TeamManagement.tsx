'use client'

import React, { useState, useEffect } from 'react'
import { useOrgMembership } from '@/lib/hooks/useOrgMembership'
import { useTeamManagement } from '@/lib/hooks/useTeamManagement'
import { useI18n } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserPlus, 
  Trash2, 
  UserCog, 
  Mail, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OrgRole, OrgMembership } from '@/lib/contexts/OrgContext'

export default function TeamManagement() {
  const { t } = useI18n()
  const { canManageTeam, org_id } = useOrgMembership()
  const { 
    inviteMember, 
    changeMemberRole, 
    removeMember, 
    fetchMembers, 
    loading: actionLoading 
  } = useTeamManagement()

  const [members, setMembers] = useState<OrgMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<OrgRole>('agent')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadMembers = async () => {
    setLoading(true)
    const data = await fetchMembers()
    setMembers(data)
    setLoading(false)
  }

  useEffect(() => {
    if (org_id) {
      loadMembers()
    }
  }, [org_id])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      await inviteMember(inviteEmail, inviteRole)
      setSuccessMessage(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      loadMembers()
    } catch (err: any) {
      setErrorMessage(err.message)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: OrgRole) => {
    try {
      await changeMemberRole(memberId, newRole)
      setSuccessMessage('Role updated successfully')
      loadMembers()
    } catch (err: any) {
      setErrorMessage(err.message)
    }
  }

  const handleRemove = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return
    try {
      await removeMember(memberId)
      setSuccessMessage('Member removed')
      loadMembers()
    } catch (err: any) {
      setErrorMessage(err.message)
    }
  }

  if (!canManageTeam) {
    return (
      <div className="p-8 text-center text-soft-muted">
        Access Restricted. Only Owners can manage the team.
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-6">
      {/* Header section with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-navy-surface/30 border border-soft-subtle/20 rounded-3xl p-6 backdrop-blur-xl">
          <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Total Team</p>
          <h3 className="text-3xl font-bold text-soft-white">{members.length} Members</h3>
        </div>
        <div className="bg-navy-surface/30 border border-soft-subtle/20 rounded-3xl p-6 backdrop-blur-xl col-span-2">
           <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                <Input 
                  type="email" 
                  placeholder="agent@anclora.es" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-navy-deep/50 border-gold/20 pl-10 h-12 rounded-xl focus:border-gold/50 transition-all text-soft-white"
                  required
                />
              </div>
              <select 
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as OrgRole)}
                className="bg-navy-deep/50 border border-gold/20 rounded-xl px-4 h-12 text-sm text-soft-white focus:outline-none focus:border-gold/50 transition-all"
              >
                <option value="agent">Agent</option>
                <option value="manager">Manager</option>
                <option value="owner">Owner</option>
              </select>
              <Button 
                type="submit" 
                disabled={actionLoading}
                className="bg-gold hover:bg-gold-muted text-navy-deep font-bold px-6 h-12 rounded-xl transition-all flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </Button>
           </form>
        </div>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            {successMessage}
            <button onClick={() => setSuccessMessage(null)} className="ml-auto opacity-50 hover:opacity-100">✕</button>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm"
          >
            <AlertCircle className="w-5 h-5" />
            {errorMessage}
            <button onClick={() => setErrorMessage(null)} className="ml-auto opacity-50 hover:opacity-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-navy-surface/30 border border-soft-subtle/20 rounded-3xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-soft-subtle/10 bg-navy-deep/40">
              <th className="px-6 py-4 text-xs font-bold text-gold uppercase tracking-widest">Member</th>
              <th className="px-6 py-4 text-xs font-bold text-gold uppercase tracking-widest whitespace-nowrap">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gold uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gold uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-soft-subtle/5">
                  <td className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-32" /></td>
                  <td className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-20" /></td>
                  <td className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-16" /></td>
                  <td className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-10 ml-auto" /></td>
                </tr>
              ))
            ) : members.map((member) => (
              <motion.tr 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={member.id} 
                className="group border-b border-soft-subtle/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold">
                      {member.user_id ? 'U' : 'P'}
                    </div>
                    <div>
                      <p className="text-soft-white font-medium text-sm">Agent Name</p>
                      <p className="text-soft-muted text-xs opacity-60">member_id: {member.id.substring(0,8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <select 
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as OrgRole)}
                    className="bg-navy-deep/80 border border-soft-subtle/10 rounded-lg px-3 py-1.5 text-xs text-soft-white focus:outline-none focus:border-gold/30 transition-all cursor-pointer hover:bg-navy-surface"
                  >
                    <option value="agent">Agent</option>
                    <option value="manager">Manager</option>
                    <option value="owner">Owner</option>
                  </select>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    member.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    member.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-soft-muted hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleRemove(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-soft-muted hover:text-gold hover:bg-gold/10">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {!loading && members.length === 0 && (
          <div className="p-12 text-center text-soft-muted">
            <UserCog className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">No team members found yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
