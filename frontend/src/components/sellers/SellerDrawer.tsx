'use client'

import { useEffect, useState } from 'react'
import { Mail, Sparkles, X } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Interaction {
  id: string
  tipo: string
  estado: string
  contenido: string
  resultado?: string
  metadata?: Record<string, unknown>
  created_at: string
}

interface SellerDrawerProps {
  sellerId: string | null
  sellerName?: string
  open: boolean
  onClose: () => void
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-ES')
}

function typeLabel(tipo: string) {
  const labels: Record<string, string> = {
    llamada: 'Llamada',
    email: 'Email',
    whatsapp: 'WhatsApp',
    reunion: 'Reunión',
    nota: 'Nota',
    email_draft: 'Borrador email',
    dossier: 'Dossier',
  }
  return labels[tipo] || tipo
}

export function SellerDrawer({ sellerId, sellerName, open, onClose }: SellerDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [generating, setGenerating] = useState(false)
  const [draftSubject, setDraftSubject] = useState('')
  const [draftBody, setDraftBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loadInteractions = async () => {
    if (!sellerId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/sellers/${sellerId}/interactions?limit=30`)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = (await res.json()) as Interaction[]
      setInteractions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando interacciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && sellerId) {
      loadInteractions()
    }
  }, [open, sellerId])

  const generateDossier = async () => {
    if (!sellerId) return
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/sellers/${sellerId}/generate-dossier`, {
        method: 'POST',
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Error ${res.status}`)
      }
      const data = await res.json()
      setDraftSubject(data.email_subject || '')
      setDraftBody(data.email_body || '')
      await loadInteractions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar dossier')
    } finally {
      setGenerating(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="w-full max-w-2xl h-full bg-navy border-l border-soft-subtle/40 p-6 overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display text-xl text-soft-white">Gravity Claw</h2>
            <p className="text-sm text-soft-muted">{sellerName || 'Seller seleccionado'}</p>
          </div>
          <button onClick={onClose} className="text-soft-muted hover:text-gold">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-gold/30 bg-gold/5 p-4">
          <button
            onClick={generateDossier}
            disabled={generating || !sellerId}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/50 text-gold hover:bg-gold/10 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'Generando dossier...' : 'Generar Dossier + Email Draft'}
          </button>
          <p className="text-xs text-soft-muted mt-2">
            Usa inteligencia territorial + LLM para crear argumentario y primer contacto.
          </p>
        </div>

        {(draftSubject || draftBody) && (
          <div className="mb-6 rounded-xl border border-blue-light/30 bg-blue-light/5 p-4">
            <div className="flex items-center gap-2 mb-2 text-blue-light">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-semibold">Borrador de Email</span>
            </div>
            <p className="text-xs text-soft-muted mb-2">Asunto</p>
            <p className="text-sm text-soft-white mb-3">{draftSubject || '—'}</p>
            <p className="text-xs text-soft-muted mb-2">Cuerpo</p>
            <pre className="whitespace-pre-wrap text-sm text-soft-white">{draftBody || '—'}</pre>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-soft-white mb-3">Historial de interacciones</h3>
          {error && (
            <div className="mb-3 rounded-lg border border-red-800/40 bg-red-900/20 px-3 py-2 text-red-300 text-xs">
              {error}
            </div>
          )}
          {loading ? (
            <p className="text-sm text-soft-muted">Cargando...</p>
          ) : interactions.length === 0 ? (
            <p className="text-sm text-soft-muted">Sin interacciones todavía.</p>
          ) : (
            <div className="space-y-3">
              {interactions.map((item) => (
                <div key={item.id} className="rounded-lg border border-soft-subtle/30 bg-navy-surface/30 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gold">{typeLabel(item.tipo)}</span>
                    <span className="text-[11px] text-soft-muted">{formatDate(item.created_at)}</span>
                  </div>
                  <p className="text-sm text-soft-white whitespace-pre-wrap">{item.contenido}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
