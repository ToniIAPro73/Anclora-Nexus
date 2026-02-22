import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, FileJson, FileText, Loader2, PlayCircle, RotateCcw, ShieldAlert, UploadCloud } from 'lucide-react'
import {
  getFeedChannelConfig,
  getFeedWorkspace,
  listFeedRuns,
  publishFeedChannel,
  updateFeedChannelConfig,
  validateFeedChannel,
  type FeedChannelConfig,
  type FeedChannelName,
  type FeedChannelSummary,
  type FeedRunItem,
  type FeedValidationIssue,
  type FeedValidationResponse,
} from '@/lib/feed-orchestrator-api'

const CHANNEL_LABELS: Record<FeedChannelName, string> = {
  idealista: 'Idealista',
  fotocasa: 'Fotocasa',
  rightmove: 'Rightmove',
  kyero: 'Kyero',
}

function statusChip(status: FeedChannelSummary['status']): { label: string; cls: string } {
  if (status === 'healthy') return { label: 'Sano', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' }
  if (status === 'warning') return { label: 'Advertencias', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' }
  return { label: 'Bloqueado', cls: 'bg-red-500/15 text-red-300 border-red-500/30' }
}

export default function FeedOrchestratorPage() {
  const [loading, setLoading] = useState(true)
  const [workspace, setWorkspace] = useState<Awaited<ReturnType<typeof getFeedWorkspace>> | null>(null)
  const [runs, setRuns] = useState<FeedRunItem[]>([])
  const [selectedChannel, setSelectedChannel] = useState<FeedChannelName>('idealista')
  const [validation, setValidation] = useState<FeedValidationResponse | null>(null)
  const [channelConfig, setChannelConfig] = useState<FeedChannelConfig | null>(null)
  const [configEnabled, setConfigEnabled] = useState(true)
  const [configMaxItems, setConfigMaxItems] = useState(100)
  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [onlyActiveChannels, setOnlyActiveChannels] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [workspaceRes, runsRes] = await Promise.all([
        getFeedWorkspace(),
        listFeedRuns({ limit: 20 }),
      ])
      setWorkspace(workspaceRes)
      setRuns(runsRes.items)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo cargar la orquestacion de feeds.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const cfg = await getFeedChannelConfig(selectedChannel)
        setChannelConfig(cfg)
        setConfigEnabled(cfg.is_enabled)
        setConfigMaxItems(cfg.max_items_per_run)
      } catch {
        setChannelConfig(null)
      }
    }
    void loadConfig()
  }, [selectedChannel])

  useEffect(() => {
    if (!workspace?.channels?.length) return
    const exists = workspace.channels.some((c) => c.channel === selectedChannel)
    if (!exists) {
      setSelectedChannel(workspace.channels[0].channel)
      return
    }
    if (onlyActiveChannels) {
      const selected = workspace.channels.find((c) => c.channel === selectedChannel)
      if (selected && !selected.is_enabled) {
        const firstActive = workspace.channels.find((c) => c.is_enabled)
        if (firstActive) setSelectedChannel(firstActive.channel)
      }
    }
  }, [workspace?.channels, selectedChannel, onlyActiveChannels])

  const runAction = useCallback(async (key: string, action: () => Promise<void>) => {
    setBusy((prev) => ({ ...prev, [key]: true }))
    setMessage(null)
    setError(null)
    try {
      await action()
      await loadData()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error ejecutando la accion.'
      setError(msg)
    } finally {
      setBusy((prev) => ({ ...prev, [key]: false }))
    }
  }, [loadData])

  const selectedSummary = useMemo(
    () => workspace?.channels.find((c) => c.channel === selectedChannel),
    [workspace?.channels, selectedChannel],
  )

  const visibleChannels = useMemo(
    () => (workspace?.channels || []).filter((c) => (onlyActiveChannels ? c.is_enabled : true)),
    [workspace?.channels, onlyActiveChannels],
  )

  const selectedIssues = useMemo<FeedValidationIssue[]>(
    () => validation?.issues || [],
    [validation?.issues],
  )

  return (
    <div className="h-full p-6 overflow-hidden">
      <div className="max-w-[1440px] mx-auto h-full flex flex-col gap-5 overflow-hidden">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-soft-subtle/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/dashboard"
                className="p-2 rounded-xl border border-soft-subtle bg-navy-surface/40 text-soft-muted hover:text-soft-white hover:border-blue-light/50 transition-all group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <h1 className="text-4xl font-bold text-soft-white tracking-tight">Orquestador de Feeds</h1>
            </div>
            <p className="text-soft-muted">
              Publicacion multicanal XML/JSON con validacion previa y control operativo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            className="btn-action"
          >
            <span className="btn-action-emoji" aria-hidden="true">⟳</span>
            {loading ? 'Cargando' : 'Actualizar'}
          </button>
        </section>

        {message ? (
          <section className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {message}
          </section>
        ) : null}
        {error ? (
          <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </section>
        ) : null}

        <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <article className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">Canales</p>
            <p className="mt-2 text-3xl font-bold text-gold">{workspace?.totals.channels ?? 0}</p>
          </article>
          <article className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">Candidatos</p>
            <p className="mt-2 text-3xl font-bold text-gold">{workspace?.totals.candidates ?? 0}</p>
          </article>
          <article className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">Listos para publicar</p>
            <p className="mt-2 text-3xl font-bold text-emerald-300">{workspace?.totals.ready ?? 0}</p>
          </article>
          <article className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">Errores de validacion</p>
            <p className="mt-2 text-3xl font-bold text-red-300">{workspace?.totals.errors ?? 0}</p>
          </article>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4 min-h-0 overflow-hidden">
            <header className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-soft-white">Canales</h2>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 rounded-lg border border-soft-subtle/60 px-2 py-1 text-xs text-soft-muted">
                  <input
                    type="checkbox"
                    checked={onlyActiveChannels}
                    onChange={(e) => setOnlyActiveChannels(e.target.checked)}
                    className="h-3.5 w-3.5 accent-emerald-400"
                  />
                  Solo activos
                </label>
                <span className="text-xs text-soft-muted">{visibleChannels.length}</span>
              </div>
            </header>

            <div className="space-y-2 max-h-[560px] overflow-auto pr-1 custom-scrollbar">
              {visibleChannels.map((channel) => {
                const chip = statusChip(channel.status)
                const isSelected = selectedChannel === channel.channel
                const ratio = channel.total_candidates > 0
                  ? Math.round((channel.ready_to_publish / channel.total_candidates) * 100)
                  : 0
                return (
                  <button
                    key={channel.channel}
                    type="button"
                    onClick={() => setSelectedChannel(channel.channel)}
                    className={`w-full text-left rounded-xl border p-3 transition-all ${
                      isSelected
                        ? 'border-gold/50 bg-gold/5'
                        : 'border-soft-subtle/50 bg-navy-deep/25 hover:border-blue-light/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-soft-white">{CHANNEL_LABELS[channel.channel]}</p>
                      <div className="flex items-center gap-1.5">
                        {!channel.is_enabled && (
                          <span className="rounded-full border border-red-500/40 bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                            Desactivado
                          </span>
                        )}
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${chip.cls}`}>{chip.label}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-soft-muted">
                      {channel.format === 'xml' ? <FileText className="w-3.5 h-3.5" /> : <FileJson className="w-3.5 h-3.5" />}
                      <span>{channel.format.toUpperCase()}</span>
                      <span>•</span>
                      <span>{channel.ready_to_publish}/{channel.total_candidates} listos</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded bg-navy-surface overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-light to-gold"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </button>
                )
              })}
              {loading && (
                <div className="flex items-center justify-center py-10 text-soft-muted">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4 lg:col-span-2 min-h-0 overflow-hidden">
            <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-soft-white">
                  {selectedSummary ? CHANNEL_LABELS[selectedSummary.channel] : 'Canal'}
                </h2>
                <p className="text-xs text-soft-muted">Validacion previa y ejecucion de publicacion</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={Boolean(busy[`validate-${selectedChannel}`])}
                  onClick={() => void runAction(`validate-${selectedChannel}`, async () => {
                    const result = await validateFeedChannel(selectedChannel)
                    setValidation(result)
                    setMessage(`Validacion completada en ${CHANNEL_LABELS[selectedChannel]}.`)
                  })}
                  className="px-3 py-2 rounded-lg border border-blue-light/40 text-blue-light hover:bg-blue-light/10 text-sm font-semibold disabled:opacity-50"
                >
                  {busy[`validate-${selectedChannel}`] ? 'Validando...' : 'Validar'}
                </button>
                <button
                  type="button"
                  disabled={Boolean(busy[`publish-${selectedChannel}`]) || !configEnabled}
                  onClick={() => void runAction(`publish-${selectedChannel}`, async () => {
                    const result = await publishFeedChannel(selectedChannel, { dry_run: false, max_items: configMaxItems })
                    setValidation(null)
                    setMessage(`Publicacion ${result.status}: ${result.published_count} enviados, ${result.rejected_count} rechazados.`)
                  })}
                  className="px-3 py-2 rounded-lg border border-gold/40 bg-gold/10 text-gold hover:bg-gold/20 text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {busy[`publish-${selectedChannel}`] ? 'Publicando...' : <><UploadCloud className="w-4 h-4" /> Publicar</>}
                </button>
                <button
                  type="button"
                  disabled={Boolean(busy[`dry-${selectedChannel}`]) || !configEnabled}
                  onClick={() => void runAction(`dry-${selectedChannel}`, async () => {
                    const result = await publishFeedChannel(selectedChannel, { dry_run: true, max_items: configMaxItems })
                    setValidation(null)
                    setMessage(`Dry-run ${result.status}: ${result.rejected_count} con incidencias.`)
                  })}
                  className="px-3 py-2 rounded-lg border border-soft-subtle text-soft-muted hover:text-soft-white hover:border-soft-white/30 text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {busy[`dry-${selectedChannel}`] ? 'Simulando...' : <><PlayCircle className="w-4 h-4" /> Dry-run</>}
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-0">
              <div className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3 min-h-[230px]">
                <h3 className="text-sm font-semibold text-soft-white mb-2">Resumen de validacion</h3>
                {validation ? (
                  <div className="space-y-2 text-sm">
                    <p className="text-soft-muted">Candidatos: <span className="text-soft-white">{validation.total_candidates}</span></p>
                    <p className="text-soft-muted">Listos: <span className="text-emerald-300">{validation.ready_to_publish}</span></p>
                    <p className="text-soft-muted">Warnings: <span className="text-amber-300">{validation.warnings}</span></p>
                    <p className="text-soft-muted">Errores: <span className="text-red-300">{validation.errors}</span></p>
                  </div>
                ) : (
                  <p className="text-sm text-soft-muted">Ejecuta validacion para ver detalle del canal seleccionado.</p>
                )}
              </div>
              <div className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3 min-h-[230px]">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-soft-white">Configuracion del canal</h3>
                  <button
                    type="button"
                    disabled={Boolean(busy[`config-${selectedChannel}`])}
                    onClick={() => void runAction(`config-${selectedChannel}`, async () => {
                      const cfg = await updateFeedChannelConfig(selectedChannel, {
                        is_enabled: configEnabled,
                        max_items_per_run: configMaxItems,
                      })
                      setChannelConfig(cfg)
                      setMessage(`Configuracion guardada en ${CHANNEL_LABELS[selectedChannel]}.`)
                    })}
                    className="px-2.5 py-1 rounded-lg border border-gold/40 text-gold hover:bg-gold/10 text-xs font-semibold disabled:opacity-50"
                  >
                    {busy[`config-${selectedChannel}`] ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <label className="flex items-center justify-between rounded-lg border border-soft-subtle/40 p-2">
                    <span className="text-xs text-soft-muted">Canal activo</span>
                    <input
                      type="checkbox"
                      checked={configEnabled}
                      onChange={(e) => setConfigEnabled(e.target.checked)}
                      className="h-4 w-4 accent-emerald-400"
                    />
                  </label>
                  <label className="block rounded-lg border border-soft-subtle/40 p-2">
                    <span className="text-xs text-soft-muted">Maximo de items por ejecucion</span>
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={configMaxItems}
                      onChange={(e) => setConfigMaxItems(Number(e.target.value))}
                      className="mt-1 w-full rounded-md border border-soft-subtle bg-navy-surface/40 px-2 py-1 text-sm text-soft-white outline-none focus:border-blue-light/50"
                    />
                  </label>
                  {channelConfig && (
                    <p className="text-[11px] text-soft-muted">
                      Formato: <span className="text-soft-white">{channelConfig.format.toUpperCase()}</span>
                    </p>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-soft-white mb-2">Issues principales</h3>
                <div className="max-h-[220px] overflow-auto pr-1 custom-scrollbar space-y-2">
                  {selectedIssues.length === 0 ? (
                    <p className="text-sm text-soft-muted">Sin issues cargadas.</p>
                  ) : (
                    selectedIssues.map((issue, idx) => (
                      <div key={`${issue.property_id}-${issue.field}-${idx}`} className="rounded-lg border border-soft-subtle/50 p-2">
                        <p className="text-xs text-soft-white font-semibold">{issue.field}</p>
                        <p className="text-xs text-soft-muted">{issue.message}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px]">
                          {issue.severity === 'error' ? (
                            <span className="inline-flex items-center gap-1 text-red-300"><ShieldAlert className="w-3 h-3" /> error</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-300"><RotateCcw className="w-3 h-3" /> warning</span>
                          )}
                          <span className="text-soft-muted">{issue.property_id.slice(0, 8)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4 min-h-0 overflow-hidden">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-soft-white">Historial de ejecuciones</h2>
            <span className="text-xs text-soft-muted">{runs.length} registros</span>
          </header>
          <div className="max-h-[240px] overflow-auto pr-1 custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-soft-muted border-b border-soft-subtle/40">
                  <th className="text-left py-2 font-medium">Canal</th>
                  <th className="text-left py-2 font-medium">Estado</th>
                  <th className="text-left py-2 font-medium">Publicados</th>
                  <th className="text-left py-2 font-medium">Rechazados</th>
                  <th className="text-left py-2 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.run_id} className="border-b border-soft-subtle/20">
                    <td className="py-2 text-soft-white">{CHANNEL_LABELS[run.channel]}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${
                        run.status === 'success'
                          ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                          : run.status === 'error'
                            ? 'border-red-500/30 bg-red-500/15 text-red-300'
                            : 'border-amber-500/30 bg-amber-500/15 text-amber-300'
                      }`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="py-2 text-soft-white">{run.published_count}</td>
                    <td className="py-2 text-soft-white">{run.rejected_count}</td>
                    <td className="py-2 text-soft-muted">{new Date(run.generated_at).toLocaleString('es-ES')}</td>
                  </tr>
                ))}
                {runs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-soft-muted">
                      Sin ejecuciones registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-soft-muted inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            Recomendacion: ejecutar validacion antes de cada publicacion.
          </div>
        </section>
      </div>
    </div>
  )
}
