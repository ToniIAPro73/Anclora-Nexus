"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Scale,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RotateCcw,
  Shield,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

// ── API helpers ───────────────────────────────────────────────────────────────

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────

type ReviewStatus = "pending" | "approved" | "approved_with_conditions" | "changes_required" | "rejected" | "escalated";
type RiskLevel = "low" | "medium" | "high" | "critical" | "unknown";

interface ReviewItem {
  id: string;
  generated_document_id: string;
  title?: string;
  folder_id?: string;
  folder_reference?: string;
  status: ReviewStatus;
  risk_level: RiskLevel;
  block_signing: boolean;
  review_type: "auto" | "manual";
  notes: string | null;
  decided_at: string | null;
  created_at: string;
  document?: {
    id: string;
    title: string;
    status: string;
    folder_id: string;
    language: string;
  };
}

type DecisionType = "approved" | "approved_with_conditions" | "changes_required" | "rejected";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  approved_with_conditions: "Aprobado con condiciones",
  changes_required: "Cambios requeridos",
  rejected: "Rechazado",
  escalated: "Escalado",
};

const STATUS_COLOR: Record<ReviewStatus, string> = {
  pending: "text-yellow-400",
  approved: "text-green-400",
  approved_with_conditions: "text-blue-400",
  changes_required: "text-orange-400",
  rejected: "text-red-400",
  escalated: "text-purple-400",
};

const RISK_COLOR: Record<RiskLevel, string> = {
  low: "text-green-400 bg-green-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  high: "text-orange-400 bg-orange-400/10",
  critical: "text-red-400 bg-red-400/10",
  unknown: "text-gray-400 bg-gray-400/10",
};

// ── Decision form ─────────────────────────────────────────────────────────────

function DecisionForm({
  documentId,
  onDone,
}: {
  documentId: string;
  onDone: () => void;
}) {
  const [decision, setDecision] = useState<DecisionType | "">("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!decision) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiPost(`/api/dms/generated-documents/${documentId}/review-decisions`, {
        decision,
        notes,
      });
      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-border-subtle bg-surface-base p-4">
      <p className="text-xs font-semibold text-soft-white">Decisión de revisión</p>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { value: "approved", label: "Aprobar", cls: "text-green-400 border-green-400/30 hover:bg-green-400/10" },
            { value: "approved_with_conditions", label: "Aprobar con condiciones", cls: "text-blue-400 border-blue-400/30 hover:bg-blue-400/10" },
            { value: "changes_required", label: "Solicitar cambios", cls: "text-orange-400 border-orange-400/30 hover:bg-orange-400/10" },
            { value: "rejected", label: "Rechazar", cls: "text-red-400 border-red-400/30 hover:bg-red-400/10" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDecision(opt.value)}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${opt.cls} ${decision === opt.value ? "opacity-100 ring-1 ring-current" : "opacity-70"}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas, condiciones o motivo de rechazo (opcional)..."
        rows={2}
        className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs text-soft-white placeholder:text-soft-subtle focus:border-blue-light/50 focus:outline-none"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        onClick={submit}
        disabled={!decision || submitting}
        className="flex items-center gap-1.5 rounded-lg bg-gold-light/20 px-3 py-2 text-xs font-medium text-gold-light transition hover:bg-gold-light/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CheckCircle className="h-3.5 w-3.5" />
        )}
        Registrar decisión
      </button>
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────

function ReviewCard({
  item,
  onRefresh,
}: {
  item: ReviewItem;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const docId = item.document?.id ?? item.generated_document_id;
  const docTitle = item.document?.title ?? `Documento ${docId.slice(0, 8)}`;
  const isPending = item.status === "pending";

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-elevated p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-gold-light" />
            <p className="truncate text-sm font-medium text-soft-white">{docTitle}</p>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className={STATUS_COLOR[item.status]}>{STATUS_LABEL[item.status]}</span>
            <span className="text-soft-subtle">·</span>
            <span className={`rounded-full px-2 py-0.5 ${RISK_COLOR[item.risk_level]}`}>
              {item.risk_level}
            </span>
            {item.block_signing && (
              <>
                <span className="text-soft-subtle">·</span>
                <span className="flex items-center gap-0.5 text-red-400">
                  <Shield className="h-3 w-3" /> bloquea firma
                </span>
              </>
            )}
            <span className="text-soft-subtle">·</span>
            <span className="text-soft-subtle">
              {new Date(item.created_at).toLocaleDateString("es-ES")}
            </span>
          </div>
          {item.notes && (
            <p className="mt-1.5 text-xs text-soft-muted line-clamp-2">{item.notes}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => router.push(`/dms/documents/${docId}`)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-soft-subtle transition hover:border-blue-light/40 hover:text-soft-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isPending && (
        <button
          onClick={() => setExpanded((x) => !x)}
          className="mt-3 flex items-center gap-1.5 text-xs text-soft-muted transition hover:text-soft-white"
        >
          <Scale className="h-3.5 w-3.5" />
          {expanded ? "Cerrar revisión" : "Revisar ahora"}
        </button>
      )}

      {expanded && isPending && (
        <DecisionForm documentId={docId} onDone={() => { setExpanded(false); onRefresh(); }} />
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type FilterStatus = "pending" | "all" | "approved" | "rejected";

export default function LegalReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("pending");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<ReviewItem[]>("/api/dms/legal-review/queue");
      setItems(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // If endpoint not found, return empty — the queue endpoint may need setup
      if (msg.includes("404")) {
        setItems([]);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "pending") return item.status === "pending";
    if (filter === "approved") return item.status === "approved" || item.status === "approved_with_conditions";
    if (filter === "rejected") return item.status === "rejected" || item.status === "changes_required";
    return true;
  });

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const blockedCount = items.filter((i) => i.block_signing).length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="shrink-0 border-b border-border-subtle px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-gold-light" />
              <h1 className="text-base font-semibold text-soft-white">Cola de revisión jurídica</h1>
            </div>
            <p className="mt-0.5 text-xs text-soft-muted">
              Revisión humana de documentos contractuales antes de firma
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-soft-subtle transition hover:border-blue-light/40 hover:text-soft-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2">
            <p className="text-xs text-soft-muted">Pendientes</p>
            <p className="mt-0.5 text-lg font-semibold text-yellow-400">{pendingCount}</p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2">
            <p className="text-xs text-soft-muted">Firmas bloqueadas</p>
            <p className="mt-0.5 text-lg font-semibold text-red-400">{blockedCount}</p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2">
            <p className="text-xs text-soft-muted">Total</p>
            <p className="mt-0.5 text-lg font-semibold text-soft-white">{items.length}</p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="shrink-0 flex gap-1.5 border-b border-border-subtle px-6 py-3">
        {(
          [
            { value: "pending", label: "Pendientes", icon: Clock },
            { value: "approved", label: "Aprobados", icon: CheckCircle },
            { value: "rejected", label: "Rechazados/Cambios", icon: XCircle },
            { value: "all", label: "Todos", icon: RefreshCw },
          ] as const
        ).map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
              filter === value
                ? "bg-gold-light/20 text-gold-light"
                : "text-soft-muted hover:text-soft-white"
            }`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold-light border-t-transparent" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <p className="text-sm text-soft-muted">{error}</p>
            <button onClick={load} className="text-xs text-blue-400 hover:underline">
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-soft-muted">
            {filter === "pending" ? (
              <>
                <CheckCircle className="h-10 w-10 text-green-400 opacity-50" />
                <p className="text-sm">Sin documentos pendientes de revisión.</p>
                <p className="text-xs opacity-60">Los documentos aparecen aquí cuando requieren aprobación antes de firma.</p>
              </>
            ) : (
              <>
                <RotateCcw className="h-10 w-10 opacity-30" />
                <p className="text-sm">Sin resultados para este filtro.</p>
              </>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((item) => (
              <ReviewCard key={item.id} item={item} onRefresh={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
