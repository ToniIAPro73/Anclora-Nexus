"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Lock,
  Save,
  SplitSquareHorizontal,
} from "lucide-react";
import {
  editGeneratedDocument,
  listGeneratedDocumentVersions,
} from "@/lib/dms-api";

// ── Types ──────────────────────────────────────────────────────────────────────

type DocVersion = {
  id: string;
  version_number: number;
  change_summary?: string;
  created_at?: string;
  immutable?: boolean;
  is_signed_immutable?: boolean;
  content_md5?: string;
  edited_text?: string;
};

type DocMeta = {
  id: string;
  title: string;
  status: string;
  folder_id: string;
  current_version_id?: string;
};

// ── Diff helper (line-by-line) ─────────────────────────────────────────────────

type DiffLine = { type: "same" | "added" | "removed"; text: string };

function computeDiff(a: string, b: string): DiffLine[] {
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  const result: DiffLine[] = [];

  let ai = 0;
  let bi = 0;

  while (ai < aLines.length || bi < bLines.length) {
    if (ai >= aLines.length) {
      result.push({ type: "added", text: bLines[bi++] });
    } else if (bi >= bLines.length) {
      result.push({ type: "removed", text: aLines[ai++] });
    } else if (aLines[ai] === bLines[bi]) {
      result.push({ type: "same", text: aLines[ai] });
      ai++;
      bi++;
    } else {
      result.push({ type: "removed", text: aLines[ai++] });
      result.push({ type: "added", text: bLines[bi++] });
    }
  }
  return result;
}

function DiffView({ before, after }: { before: string; after: string }) {
  const lines = computeDiff(before, after);
  const changed = lines.filter((l) => l.type !== "same").length;

  if (changed === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-sm text-emerald-300">
        <CheckCircle className="h-4 w-4 shrink-0" />
        Sin cambios respecto a la versión anterior.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-soft-muted">
        {changed} línea(s) modificada(s) respecto a la versión anterior.
      </p>
      <div className="max-h-72 overflow-y-auto rounded-xl border border-border-subtle bg-surface-base font-mono text-xs leading-6">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`flex gap-2 px-3 ${
              line.type === "added"
                ? "bg-emerald-400/10 text-emerald-300"
                : line.type === "removed"
                ? "bg-red-400/10 text-red-300 line-through opacity-70"
                : "text-soft-muted"
            }`}
          >
            <span className="w-4 shrink-0 select-none text-soft-subtle/50">
              {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
            </span>
            <span className="whitespace-pre-wrap break-all">{line.text || " "}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Version selector ───────────────────────────────────────────────────────────

function VersionBadge({ version }: { version: DocVersion }) {
  const isImmutable = Boolean(version.immutable ?? version.is_signed_immutable);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-soft-muted">v{version.version_number}</span>
      {isImmutable && <Lock className="h-3 w-3 text-amber-400" aria-label="Versión firmada — inmutable" />}
      {version.change_summary && (
        <span className="truncate text-xs text-soft-muted">{version.change_summary}</span>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function DocumentEditPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const router = useRouter();

  const [doc, setDoc] = useState<DocMeta | null>(null);
  const [versions, setVersions] = useState<DocVersion[]>([]);
  const [baseVersionId, setBaseVersionId] = useState<string>("");
  const [baseText, setBaseText] = useState("");
  const [editedText, setEditedText] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [showDiff, setShowDiff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [docRes, versionsRes] = await Promise.all([
        fetch(`/api/dms/generated-documents/${documentId}`, { credentials: "include" }).then(async (r) => {
          if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
          const d = await r.json();
          return (d.document ?? d) as DocMeta;
        }),
        listGeneratedDocumentVersions(documentId) as Promise<DocVersion[]>,
      ]);

      setDoc(docRes);
      setVersions(versionsRes);

      const latest = versionsRes[0];
      if (latest) {
        setBaseVersionId(latest.id);
        const text = latest.edited_text ?? "";
        setBaseText(text);
        setEditedText(text);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando el documento");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => { void load(); }, [load]);

  const latestVersion = versions[0];
  const isImmutable = Boolean(
    latestVersion?.immutable ?? latestVersion?.is_signed_immutable,
  );
  const isSignedStatus = doc?.status === "signed";
  const blocked = isImmutable || isSignedStatus;

  const handleSave = async () => {
    if (blocked) return;
    if (!editedText.trim()) {
      setError("El contenido no puede estar vacío");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await editGeneratedDocument(documentId, {
        edited_text: editedText,
        change_summary: changeSummary.trim() || "Edición manual",
      });
      setSaved(true);
      setChangeSummary("");
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-soft-subtle" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
          <button
            onClick={() => router.push(`/dms/documents/${documentId}`)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-soft-muted hover:text-soft-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-soft-subtle" />
              <h1 className="text-sm font-semibold text-soft-white truncate">
                {doc?.title ?? "Documento"}
              </h1>
            </div>
            <p className="text-xs text-soft-muted">Editor de versiones · {versions.length} versión(es)</p>
          </div>
        </div>

        {/* Blocked state */}
        {blocked && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4">
            <Lock className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Documento inmutable</p>
              <p className="mt-0.5 text-xs text-amber-200/80">
                Este documento ha sido firmado electrónicamente. No se pueden crear nuevas versiones
                para preservar la integridad del contrato.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/5 p-3 text-sm text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-3 text-sm text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Nueva versión guardada correctamente.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Sidebar: version history */}
          <aside className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-soft-muted">
              Historial de versiones
            </h2>
            <div className="rounded-xl border border-border-subtle bg-surface-elevated overflow-hidden">
              {versions.length === 0 ? (
                <p className="p-4 text-xs text-soft-muted">Sin versiones guardadas.</p>
              ) : (
                <div className="divide-y divide-border-subtle/40">
                  {versions.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setBaseVersionId(v.id);
                        const text = v.edited_text ?? "";
                        setBaseText(text);
                        setEditedText(text);
                        setSaved(false);
                        setShowDiff(false);
                      }}
                      className={`w-full p-3 text-left transition hover:bg-surface-base ${
                        baseVersionId === v.id ? "bg-surface-base border-l-2 border-gold-light" : ""
                      }`}
                    >
                      <VersionBadge version={v} />
                      {v.created_at && (
                        <p className="mt-1 flex items-center gap-1 text-[10px] text-soft-subtle">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(v.created_at).toLocaleDateString("es-ES")}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Compare toggle */}
            {versions.length > 1 && (
              <button
                onClick={() => setShowDiff((v) => !v)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle py-2 text-xs text-soft-muted hover:text-soft-white transition"
              >
                <SplitSquareHorizontal className="h-3.5 w-3.5" />
                {showDiff ? "Ocultar diff" : "Ver diff"}
              </button>
            )}
          </aside>

          {/* Main editor */}
          <div className="space-y-3">
            {/* Diff view */}
            {showDiff && versions.length > 1 && (
              <div className="rounded-xl border border-border-subtle bg-surface-elevated p-4 space-y-2">
                <h3 className="text-xs font-semibold text-soft-muted flex items-center gap-2">
                  <SplitSquareHorizontal className="h-3.5 w-3.5" />
                  Comparación con versión anterior
                </h3>
                <DiffView before={baseText} after={editedText} />
              </div>
            )}

            {/* Text editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-soft-muted">
                  Contenido del documento
                </label>
                <span className="text-[10px] text-soft-subtle">
                  {editedText.length} caracteres · {editedText.split("\n").length} líneas
                </span>
              </div>
              <textarea
                value={editedText}
                onChange={(e) => {
                  setEditedText(e.target.value);
                  setSaved(false);
                }}
                disabled={blocked}
                rows={24}
                className="w-full resize-none rounded-xl border border-border-subtle bg-surface-base p-4 font-mono text-sm text-soft-white placeholder:text-soft-subtle focus:border-blue-light/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Contenido del documento en formato Markdown..."
                spellCheck={false}
              />
            </div>

            {/* Change summary + Save */}
            {!blocked && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-soft-muted">
                    Descripción del cambio (opcional)
                  </label>
                  <input
                    value={changeSummary}
                    onChange={(e) => setChangeSummary(e.target.value)}
                    placeholder="Ej: Corrección de cláusula 4.2"
                    className="w-full rounded-xl border border-border-subtle bg-surface-base px-3 py-2 text-sm text-soft-white placeholder:text-soft-subtle focus:border-blue-light/50 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => void handleSave()}
                  disabled={saving || editedText === baseText}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-gold-light/15 px-4 py-2.5 text-sm font-medium text-gold-light hover:bg-gold-light/25 disabled:cursor-not-allowed disabled:opacity-40 transition"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Guardar nueva versión
                </button>
              </div>
            )}

            {!blocked && editedText !== baseText && (
              <p className="text-[10px] text-soft-muted flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-400" />
                Hay cambios sin guardar. Al guardar se creará una nueva versión incremental.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
