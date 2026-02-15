'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Home, Euro, Target, RefreshCw, ChevronLeft, ChevronRight, Users, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import {
  listProperties,
  listBuyers,
  listMatches,
  recomputeMatches,
  type ProspectedProperty,
  type BuyerProfile,
  type PropertyBuyerMatch,
} from '@/lib/prospection-api'

type Tab = 'properties' | 'buyers' | 'matches'

export default function ProspectionPage() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<Tab>('properties')
  const [loading, setLoading] = useState(true)
  const [recomputing, setRecomputing] = useState(false)

  // Properties state
  const [properties, setProperties] = useState<ProspectedProperty[]>([])
  const [propTotal, setPropTotal] = useState(0)
  const [propPage, setPropPage] = useState(0)

  // Buyers state
  const [buyers, setBuyers] = useState<BuyerProfile[]>([])
  const [buyerTotal, setBuyerTotal] = useState(0)
  const [buyerPage, setBuyerPage] = useState(0)

  // Matches state
  const [matches, setMatches] = useState<PropertyBuyerMatch[]>([])
  const [matchTotal, setMatchTotal] = useState(0)
  const [matchPage, setMatchPage] = useState(0)

  const ITEMS = 12

  const loadProperties = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const res = await listProperties({ limit: ITEMS, offset: page * ITEMS })
      setProperties(res.items)
      setPropTotal(res.total)
    } catch { /* silently handle */ }
    setLoading(false)
  }, [])

  const loadBuyers = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const res = await listBuyers({ limit: ITEMS, offset: page * ITEMS })
      setBuyers(res.items)
      setBuyerTotal(res.total)
    } catch { /* silently handle */ }
    setLoading(false)
  }, [])

  const loadMatches = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const res = await listMatches({ limit: ITEMS, offset: page * ITEMS })
      setMatches(res.items)
      setMatchTotal(res.total)
    } catch { /* silently handle */ }
    setLoading(false)
  }, [])

  const loadAllTabs = useCallback(async () => {
    setLoading(true)
    try {
      const [propsRes, buyersRes, matchesRes] = await Promise.allSettled([
        listProperties({ limit: ITEMS, offset: propPage * ITEMS }),
        listBuyers({ limit: ITEMS, offset: buyerPage * ITEMS }),
        // Load a wider window for property-match synchronization cards
        listMatches({ limit: 200, offset: 0 }),
      ])

      if (propsRes.status === 'fulfilled') {
        setProperties(propsRes.value.items)
        setPropTotal(propsRes.value.total)
      }

      if (buyersRes.status === 'fulfilled') {
        setBuyers(buyersRes.value.items)
        setBuyerTotal(buyersRes.value.total)
      }

      if (matchesRes.status === 'fulfilled') {
        setMatches(matchesRes.value.items)
        setMatchTotal(matchesRes.value.total)
      }
    } catch {
      // silently handle
    }
    setLoading(false)
  }, [ITEMS, propPage, buyerPage])

  const propertyMatchInfo = useMemo(() => {
    const map = new Map<string, { count: number; bestCommission: number | null; bestScore: number }>()
    for (const m of matches) {
      const current = map.get(m.property_id) ?? { count: 0, bestCommission: null, bestScore: 0 }
      const nextCount = current.count + 1
      const nextBestScore = Math.max(current.bestScore, m.match_score ?? 0)
      const nextBestCommission =
        m.commission_estimate != null
          ? Math.max(current.bestCommission ?? 0, m.commission_estimate)
          : current.bestCommission

      map.set(m.property_id, {
        count: nextCount,
        bestCommission: nextBestCommission,
        bestScore: nextBestScore,
      })
    }
    return map
  }, [matches])

  useEffect(() => {
    // Auto-refresh all three datasets on page entry
    // (matches must be preloaded even if tab is not active)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAllTabs()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMatches(0)
  }, [loadAllTabs, loadMatches])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (activeTab === 'properties') loadProperties(propPage)
    else if (activeTab === 'buyers') loadBuyers(buyerPage)
    else loadMatches(matchPage)
  }, [activeTab, propPage, buyerPage, matchPage, loadProperties, loadBuyers, loadMatches])

  const handleRecompute = async () => {
    setRecomputing(true)
    try {
      await recomputeMatches()
      await loadAllTabs()
      setMatchPage(0)
    } catch { /* silently handle */ }
    setRecomputing(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-gold'
    if (score >= 60) return 'text-emerald-400'
    if (score >= 40) return 'text-blue-light'
    return 'text-soft-muted'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-gold/15 border-gold/30'
    if (score >= 60) return 'bg-emerald-500/10 border-emerald-500/20'
    if (score >= 40) return 'bg-blue-500/10 border-blue-500/20'
    return 'bg-white/5 border-soft-subtle'
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      candidate: t('candidate'),
      contacted: t('leadStatusContacted'),
      viewing_scheduled: t('viewingScheduled'),
      offer_made: t('offerMade'),
      closed_won: t('closedWon'),
      closed_lost: t('closedLost'),
      viewing: t('viewingScheduled'),
      offer: t('offerMade'),
      closed: t('closedWon'),
      discarded: t('propertyStatusRejected'),
    }
    return map[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      candidate: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      contacted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      viewing_scheduled: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      offer_made: 'bg-gold/10 text-gold border-gold/20',
      closed_won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      closed_lost: 'bg-red-500/10 text-red-400 border-red-500/20',
      viewing: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      offer: 'bg-gold/10 text-gold border-gold/20',
      closed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      discarded: 'bg-red-500/10 text-red-400 border-red-500/20',
      negotiating: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    }
    return colorMap[status] || 'bg-white/5 text-soft-muted border-soft-subtle'
  }

  const tabs: { id: Tab; label: string; icon: typeof Target; count: number }[] = [
    { id: 'properties', label: t('prospectedProperties'), icon: Home, count: propTotal },
    { id: 'buyers', label: t('buyerProfiles'), icon: Users, count: buyerTotal },
    { id: 'matches', label: t('matchBoard'), icon: Zap, count: matchTotal },
  ]

  const currentPage = activeTab === 'properties' ? propPage : activeTab === 'buyers' ? buyerPage : matchPage
  const currentTotal = activeTab === 'properties' ? propTotal : activeTab === 'buyers' ? buyerTotal : matchTotal
  const totalPages = Math.ceil(currentTotal / ITEMS)
  const setPage = activeTab === 'properties' ? setPropPage : activeTab === 'buyers' ? setBuyerPage : setMatchPage

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg bg-navy-surface/40 border border-soft-subtle hover:border-gold/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-soft-white" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-soft-white">{t('prospection')}</h1>
              <p className="text-sm text-soft-muted mt-1">{t('prospectionSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'matches' && (
              <button
                onClick={handleRecompute}
                disabled={recomputing}
                className="px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${recomputing ? 'animate-spin' : ''}`} />
                {t('recomputeMatches')}
              </button>
            )}
            <div className="px-4 py-2 bg-navy-surface/40 border border-soft-subtle rounded-lg">
              <span className="text-sm text-soft-muted">{t('total')}: </span>
              <span className="text-lg font-bold text-gold">{currentTotal}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gold/10 text-gold border border-gold/20 shadow-lg shadow-gold/5'
                  : 'bg-navy-surface/40 text-soft-muted border border-soft-subtle hover:text-soft-white hover:border-blue-light/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-gold/20 text-gold' : 'bg-white/5 text-soft-muted'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-soft-muted animate-pulse">{t('loading')}</div>
          </div>
        ) : (
          <>
            {/* Properties Grid */}
            {activeTab === 'properties' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.length === 0 ? (
                  <div className="col-span-full bg-navy-surface/40 border border-soft-subtle rounded-2xl p-12 text-center">
                    <Target className="w-8 h-8 text-soft-muted mx-auto mb-3 opacity-40" />
                    <p className="text-soft-muted italic">{t('noProspectedProperties')}</p>
                  </div>
                ) : (
                  properties.map((prop, i) => {
                    const matchInfo = propertyMatchInfo.get(prop.id)
                    return (
                    <motion.div
                      key={prop.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-navy-surface/40 border border-soft-subtle rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-gold/5 flex flex-col"
                    >
                      <div className="p-5 border-b border-soft-subtle bg-navy-deep/20">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Home className="w-4 h-4 text-gold shrink-0" />
                            <h3 className="text-base font-bold text-soft-white group-hover:text-gold transition-colors line-clamp-1">
                              {prop.title || prop.city || 'Sin título'}
                            </h3>
                          </div>
                          <div className={`shrink-0 px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getScoreBg(prop.high_ticket_score ?? 0)}`}>
                            <span className={getScoreColor(prop.high_ticket_score ?? 0)}>{prop.high_ticket_score ?? 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-soft-muted">
                          <MapPin className="w-3 h-3 shrink-0" />
                              <span className="line-clamp-1">{prop.zone || '-'}</span>
                              <span className="text-soft-subtle">•</span>
                              <span>{prop.property_type || '-'}</span>
                            </div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300">
                            PBM
                          </span>
                          {matchInfo ? (
                            <span className="px-2 py-0.5 text-[10px] rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                              {matchInfo.count} match{matchInfo.count > 1 ? 'es' : ''}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] rounded-full border border-soft-subtle bg-white/5 text-soft-muted">
                              Sin matches
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-5 space-y-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-soft-muted uppercase tracking-wider">{t('price')}</span>
                          <div className="flex items-center gap-1 text-lg font-bold text-blue-light">
                            <Euro className="w-4 h-4" />
                            <span>{prop.price ? `${(prop.price / 1_000_000).toFixed(1)}M` : '-'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-soft-muted uppercase tracking-wider">{t('highTicketScore')}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 bg-navy-deep rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-gold to-amber-500 transition-all"
                                style={{ width: `${prop.high_ticket_score ?? 0}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold ${getScoreColor(prop.high_ticket_score ?? 0)}`}>
                              {prop.high_ticket_score ?? 0}
                            </span>
                          </div>
                        </div>
                        {prop.area_m2 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-soft-muted uppercase tracking-wider">{t('areaM2')}</span>
                            <span className="text-sm text-soft-white font-medium">{prop.area_m2} m²</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-soft-muted uppercase tracking-wider">{t('estimatedCommission')}</span>
                          <span className="text-sm font-semibold text-gold">
                            {matchInfo?.bestCommission != null ? `€${matchInfo.bestCommission.toLocaleString()}` : '-'}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-navy-deep/30 border-t border-soft-subtle/30 flex justify-between items-center">
                        <span className="text-[10px] text-soft-muted">{prop.source}</span>
                        <span className="text-[10px] text-soft-muted italic">{new Date(prop.created_at).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                    )
                  })
                )}
              </div>
            )}

            {/* Buyers Grid */}
            {activeTab === 'buyers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buyers.length === 0 ? (
                  <div className="col-span-full bg-navy-surface/40 border border-soft-subtle rounded-2xl p-12 text-center">
                    <Users className="w-8 h-8 text-soft-muted mx-auto mb-3 opacity-40" />
                    <p className="text-soft-muted italic">{t('noBuyerProfiles')}</p>
                  </div>
                ) : (
                  buyers.map((buyer, i) => (
                    <motion.div
                      key={buyer.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-navy-surface/40 border border-soft-subtle rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-gold/5 flex flex-col"
                    >
                      <div className="p-5 border-b border-soft-subtle bg-navy-deep/20">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                            <span className="text-gold font-bold text-sm">
                              {(buyer.full_name || 'NN').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-soft-white group-hover:text-gold transition-colors">
                              {buyer.full_name || 'Sin nombre'}
                            </h3>
                            <span className="text-xs text-soft-muted">{buyer.email || '—'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 space-y-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-soft-muted uppercase tracking-wider">{t('budgetRange')}</span>
                          <div className="flex items-center gap-1 text-sm font-bold text-blue-light">
                            <Euro className="w-3 h-3" />
                            {buyer.budget_min && buyer.budget_max
                              ? `${(buyer.budget_min / 1_000_000).toFixed(1)}M – ${(buyer.budget_max / 1_000_000).toFixed(1)}M`
                              : '-'
                            }
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-soft-muted uppercase tracking-wider">{t('motivationScore')}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-navy-deep rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-gold transition-all"
                                style={{ width: `${buyer.motivation_score}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold ${getScoreColor(buyer.motivation_score ?? 0)}`}>
                              {buyer.motivation_score ?? 0}
                            </span>
                          </div>
                        </div>
                        {buyer.preferred_zones?.length > 0 && (
                          <div>
                            <span className="text-xs text-soft-muted uppercase tracking-wider block mb-1">{t('preferredZones')}</span>
                            <div className="flex flex-wrap gap-1">
                              {buyer.preferred_zones.map((z) => (
                                <span key={z} className="px-2 py-0.5 text-[10px] bg-blue-500/10 text-blue-light border border-blue-500/15 rounded-full">
                                  {z}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {buyer.purchase_horizon && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-soft-muted uppercase tracking-wider">{t('investmentHorizon')}</span>
                            <span className="text-xs text-soft-white font-medium">{buyer.purchase_horizon}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-navy-deep/30 border-t border-soft-subtle/30 flex justify-between items-center">
                        <span className={`px-2 py-0.5 text-[10px] rounded-full border font-bold uppercase tracking-wider ${
                          buyer.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          buyer.status === 'inactive' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {buyer.status}
                        </span>
                        <span className="text-[10px] text-soft-muted italic">{new Date(buyer.created_at).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Matches Table */}
            {activeTab === 'matches' && (
              <div className="bg-navy-surface/40 border border-soft-subtle rounded-2xl overflow-hidden">
                {matches.length === 0 ? (
                  <div className="p-12 text-center">
                    <Zap className="w-8 h-8 text-soft-muted mx-auto mb-3 opacity-40" />
                    <p className="text-soft-muted italic">{t('noMatches')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-soft-subtle bg-navy-deep/30">
                          <th className="text-left px-5 py-3 text-xs text-soft-muted uppercase tracking-wider font-medium">{t('properties')}</th>
                          <th className="text-left px-5 py-3 text-xs text-soft-muted uppercase tracking-wider font-medium">{t('buyerName')}</th>
                          <th className="text-center px-5 py-3 text-xs text-soft-muted uppercase tracking-wider font-medium">{t('matchScore')}</th>
                          <th className="text-center px-5 py-3 text-xs text-soft-muted uppercase tracking-wider font-medium">{t('matchStatus')}</th>
                          <th className="text-right px-5 py-3 text-xs text-soft-muted uppercase tracking-wider font-medium">{t('commissionEstimate')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches.map((match, i) => (
                          <motion.tr
                            key={match.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-soft-subtle/30 hover:bg-white/[0.02] transition-colors cursor-pointer"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <Home className="w-4 h-4 text-gold shrink-0" />
                                <span className="text-sm text-soft-white font-medium truncate max-w-[200px]">
                                  {match.property_title || match.property_id.slice(0, 8)}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-sm text-soft-white">
                                {match.buyer_name || match.buyer_id.slice(0, 8)}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <div className="inline-flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-navy-deep rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-gold to-amber-500"
                                    style={{ width: `${match.match_score}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-bold ${getScoreColor(match.match_score)}`}>
                                  {match.match_score}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(match.match_status)}`}>
                                {getStatusLabel(match.match_status)}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className="text-sm font-semibold text-gold">
                                {match.commission_estimate
                                  ? `€${match.commission_estimate.toLocaleString()}`
                                  : '—'
                                }
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-navy-surface/40 border border-soft-subtle rounded-xl mt-6">
                <button
                  onClick={() => setPage((p: number) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-soft-muted hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs text-soft-muted font-medium">
                  Page <span className="text-gold font-bold">{currentPage + 1}</span> of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p: number) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-soft-muted hover:text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
