'use client'

import { useState } from 'react'
import { UserSearch, MapPin, ExternalLink, ChevronDown, Phone, Mail, Calendar, Star } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type EstadoContacto =
  | 'sin_contacto'
  | 'primer_contacto'
  | 'en_seguimiento'
  | 'reunion_agendada'
  | 'propuesta_enviada'
  | 'mandato_exclusivo'
  | 'descartado'

export interface NexusSeller {
  id: string
  nombre_propietario?: string
  empresa?: string
  anuncio_url?: string
  direccion?: string
  zona: string
  fuente: string
  precio_publicado?: number
  dias_en_mercado?: number
  estado_contacto: EstadoContacto
  prioridad: number
  notas?: string
  senales_motivacion?: string[]
  fecha_deteccion: string
  fecha_ultimo_contacto?: string
}

interface SellersTableProps {
  sellers: NexusSeller[]
  onEstadoChange?: (sellerId: string, newEstado: EstadoContacto) => Promise<void>
  onOpenDetail?: (seller: NexusSeller) => void
  loading?: boolean
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const ESTADO_LABELS: Record<EstadoContacto, string> = {
  sin_contacto: 'Sin contacto',
  primer_contacto: 'Primer contacto',
  en_seguimiento: 'En seguimiento',
  reunion_agendada: 'Reunión agendada',
  propuesta_enviada: 'Propuesta enviada',
  mandato_exclusivo: 'Mandato exclusivo',
  descartado: 'Descartado',
}

const ESTADO_COLORS: Record<EstadoContacto, string> = {
  sin_contacto: 'bg-gray-700/50 text-gray-300 border-gray-600',
  primer_contacto: 'bg-blue-900/50 text-blue-300 border-blue-700',
  en_seguimiento: 'bg-blue-800/50 text-blue-200 border-blue-600',
  reunion_agendada: 'bg-amber-900/50 text-amber-300 border-amber-700',
  propuesta_enviada: 'bg-purple-900/50 text-purple-300 border-purple-700',
  mandato_exclusivo: 'bg-emerald-900/50 text-emerald-300 border-emerald-600',
  descartado: 'bg-red-900/30 text-red-400 border-red-800',
}

const ESTADO_NEXT: Partial<Record<EstadoContacto, EstadoContacto>> = {
  sin_contacto: 'primer_contacto',
  primer_contacto: 'en_seguimiento',
  en_seguimiento: 'reunion_agendada',
  reunion_agendada: 'propuesta_enviada',
  propuesta_enviada: 'mandato_exclusivo',
}

const FUENTE_LABELS: Record<string, string> = {
  idealista: 'Idealista',
  fotocasa: 'Fotocasa',
  fsbo: 'FSBO',
  str_enforcement: 'STR Enforcement',
  prospection_match: 'Prospección',
  manual: 'Manual',
  referral: 'Referido',
  scraping: 'Scraping',
}

const ZONA_LABELS: Record<string, string> = {
  andratx: 'Andratx',
  calvia: 'Calvià',
  son_ferrer: 'Son Ferrer',
  santa_ponca: 'Santa Ponça',
  paguera: 'Paguera',
  portals_nous: 'Portals Nous',
  bendinat: 'Bendinat',
  punta_negra: 'Punta Negra',
  costa_den_blanes: "Costa d'en Blanes",
  port_adriano: 'Port Adriano',
  palma: 'Palma',
  otra: 'Otra',
}

function PrioridadBadge({ prioridad }: { prioridad: number }) {
  if (prioridad >= 5) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gold/20 text-gold border border-gold/40">
        <Star className="w-3 h-3 fill-gold" /> Whale
      </span>
    )
  }
  if (prioridad >= 4) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-light/20 text-blue-light border border-blue-light/30">
        Alta
      </span>
    )
  }
  if (prioridad >= 3) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700/40 text-gray-300 border border-gray-600/40">
        Media
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800/40 text-gray-500 border border-gray-700/40">
      Baja
    </span>
  )
}

function formatPrice(price?: number): string {
  if (!price) return '—'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function SellersTable({ sellers, onEstadoChange, onOpenDetail, loading }: SellersTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleAdvanceEstado = async (seller: NexusSeller) => {
    const next = ESTADO_NEXT[seller.estado_contacto]
    if (!next || !onEstadoChange) return
    setUpdatingId(seller.id)
    try {
      await onEstadoChange(seller.id, next)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-soft-muted">
        <div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full mr-3" />
        Cargando sellers...
      </div>
    )
  }

  if (sellers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-soft-muted gap-3">
        <UserSearch className="w-12 h-12 opacity-30" />
        <p className="text-sm">No hay sellers detectados todavía.</p>
        <p className="text-xs opacity-60">
          Los sellers se añaden automáticamente cuando se detectan señales de vendedores motivados.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-soft-subtle/30">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-soft-subtle/30 bg-navy-surface/40">
            <th className="text-left px-4 py-3 text-soft-muted font-medium text-xs uppercase tracking-wide">
              Propietario / Propiedad
            </th>
            <th className="text-left px-4 py-3 text-soft-muted font-medium text-xs uppercase tracking-wide">
              Zona
            </th>
            <th className="text-left px-4 py-3 text-soft-muted font-medium text-xs uppercase tracking-wide">
              Fuente
            </th>
            <th className="text-right px-4 py-3 text-soft-muted font-medium text-xs uppercase tracking-wide">
              Precio
            </th>
            <th className="text-right px-4 py-3 text-soft-muted font-medium text-xs uppercase tracking-wide">
              DOM
            </th>
            <th className="text-left px-4 py-3 text-soft-muted font-medium text-xs uppercase tracking-wide">
              Estado
            </th>
            <th className="text-left px-4 py-3 text-soft-muted font-medium text-xs uppercase tracking-wide">
              Prioridad
            </th>
            <th className="text-left px-4 py-3 text-soft-muted font-medium text-xs uppercase tracking-wide">
              Detección
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sellers.map((seller, index) => {
            const isWhale = seller.prioridad >= 5
            const nextEstado = ESTADO_NEXT[seller.estado_contacto]
            const isMandato = seller.estado_contacto === 'mandato_exclusivo'

            return (
              <tr
                key={seller.id}
                className={`
                  border-b border-soft-subtle/20 transition-colors
                  ${isWhale ? 'bg-gold/5 hover:bg-gold/10' : 'hover:bg-navy-surface/30'}
                  ${isMandato ? 'bg-emerald-900/10' : ''}
                `}
              >
                {/* Propietario */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-soft-white">
                      {seller.nombre_propietario || 'Propietario desconocido'}
                    </span>
                    {seller.direccion && (
                      <span className="text-xs text-soft-muted truncate max-w-[200px]">
                        {seller.direccion}
                      </span>
                    )}
                    {seller.anuncio_url && (
                      <a
                        href={seller.anuncio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-light hover:text-gold transition-colors"
                      >
                        Ver anuncio <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </td>

                {/* Zona */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-soft-muted">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs">{ZONA_LABELS[seller.zona] || seller.zona}</span>
                  </div>
                </td>

                {/* Fuente */}
                <td className="px-4 py-3">
                  <span className="text-xs text-soft-muted">
                    {FUENTE_LABELS[seller.fuente] || seller.fuente}
                  </span>
                </td>

                {/* Precio */}
                <td className="px-4 py-3 text-right">
                  <span className="font-mono text-xs text-soft-white">
                    {formatPrice(seller.precio_publicado)}
                  </span>
                </td>

                {/* DOM */}
                <td className="px-4 py-3 text-right">
                  {seller.dias_en_mercado != null ? (
                    <span
                      className={`text-xs font-mono ${
                        seller.dias_en_mercado > 180
                          ? 'text-red-400'
                          : seller.dias_en_mercado > 90
                          ? 'text-amber-400'
                          : 'text-soft-muted'
                      }`}
                    >
                      {seller.dias_en_mercado}d
                    </span>
                  ) : (
                    <span className="text-xs text-soft-muted/40">—</span>
                  )}
                </td>

                {/* Estado */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      ESTADO_COLORS[seller.estado_contacto] || 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {ESTADO_LABELS[seller.estado_contacto] || seller.estado_contacto}
                  </span>
                </td>

                {/* Prioridad */}
                <td className="px-4 py-3">
                  <PrioridadBadge prioridad={seller.prioridad} />
                </td>

                {/* Detección */}
                <td className="px-4 py-3">
                  <span className="text-xs text-soft-muted">
                    {formatDate(seller.fecha_deteccion)}
                  </span>
                </td>

                {/* Acción */}
                <td className="px-4 py-3">
                  {onOpenDetail && (
                    <button
                      type="button"
                      onClick={() => onOpenDetail(seller)}
                      className="text-xs px-2 py-1 rounded-lg border border-blue-light/30 text-blue-light hover:bg-blue-light/10 transition-colors mr-2"
                    >
                      Gravity Claw
                    </button>
                  )}
                  {nextEstado && !isMandato && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceEstado(seller)}
                      disabled={updatingId === seller.id}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gold/40 text-gold hover:bg-gold/10 transition-colors disabled:opacity-40 whitespace-nowrap"
                    >
                      {updatingId === seller.id ? '...' : `→ ${ESTADO_LABELS[nextEstado]}`}
                    </button>
                  )}
                  {isMandato && (
                    <span className="text-xs text-emerald-400 font-semibold">✓ Exclusiva</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
