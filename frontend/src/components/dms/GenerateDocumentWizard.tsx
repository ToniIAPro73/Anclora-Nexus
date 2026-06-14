"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  FileText,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { generateDocument, previewMissingFields, type GeneratedDocumentEnvelope } from "@/lib/dms-api";

// ── Types ─────────────────────────────────────────────────────────────────────

type TemplateOption = {
  id: string;
  name: string;
  template_document_type?: string;
  latest_version?: { id: string; version_number?: number } | null;
  has_usable_version?: boolean;
};

type PrerequisiteIssues = {
  primary_client_required?: boolean;
  missing_party_roles?: string[];
};

function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    buyer: "comprador",
    seller: "vendedor",
    agent: "agente",
    guarantor: "avalista",
    co_buyer: "cocomprador",
    co_seller: "covendedor",
    notary: "notario",
  };
  return labels[role] ?? role;
}

function formatGenerationError(message: string): string {
  try {
    const parsed = JSON.parse(message) as PrerequisiteIssues;
    const parts: string[] = [];
    if (parsed.primary_client_required) parts.push("añade un cliente principal");
    if (parsed.missing_party_roles?.length) {
      parts.push(`añade partes con estos roles: ${parsed.missing_party_roles.map(roleLabel).join(", ")}`);
    }
    if (parts.length) return `Faltan datos del expediente: ${parts.join("; ")}.`;
  } catch {
    // Keep the original API message when it is not a JSON detail payload.
  }
  return message;
}

interface WizardProps {
  folderId: string;
  templates: TemplateOption[];
  onSuccess: (documentId: string) => void;
  onClose: () => void;
}

type WizardStep = "select" | "fields" | "generating" | "done";

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition ${
          done
            ? "border-green-400 bg-green-400/15 text-green-400"
            : active
            ? "border-gold-light bg-gold-light/15 text-gold-light"
            : "border-border-subtle text-soft-subtle"
        }`}
      >
        {done ? <CheckCircle className="h-3.5 w-3.5" /> : active ? "●" : "○"}
      </div>
      <span className={`text-[10px] ${active ? "text-gold-light" : done ? "text-green-400" : "text-soft-subtle"}`}>
        {label}
      </span>
    </div>
  );
}

// ── Main wizard ────────────────────────────────────────────────────────────────

export function GenerateDocumentWizard({ folderId, templates, onSuccess, onClose }: WizardProps) {
  const [step, setStep] = useState<WizardStep>("select");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [prerequisiteIssues, setPrerequisiteIssues] = useState<PrerequisiteIssues>({});
  const [previewBlocked, setPreviewBlocked] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [loadingFields, setLoadingFields] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedId, setGeneratedId] = useState<string | null>(null);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const versionId = selectedTemplate?.latest_version?.id ?? "";

  // On template select, auto-set default title
  useEffect(() => {
    if (selectedTemplate && !docTitle) {
      setDocTitle(selectedTemplate.name);
    }
  }, [selectedTemplate, docTitle]);

  const fetchMissingFields = useCallback(async () => {
    if (!folderId || !versionId) return;
    setLoadingFields(true);
    setError(null);
    try {
      const res = await previewMissingFields(folderId, { template_version_id: versionId, overrides: {} });
      setMissingFields(res.missing_fields ?? []);
      setPrerequisiteIssues(res.prerequisite_issues ?? {});
      setPreviewBlocked(false);
      // Pre-fill any values already known
      const initValues: Record<string, string> = {};
      for (const f of res.missing_fields ?? []) {
        initValues[f] = fieldValues[f] ?? "";
      }
      setFieldValues(initValues);
      setStep("fields");
    } catch (err) {
      setMissingFields([]);
      setPrerequisiteIssues({});
      setPreviewBlocked(true);
      setError(err instanceof Error ? formatGenerationError(err.message) : "No se pudo comprobar la plantilla.");
      setStep("fields");
    } finally {
      setLoadingFields(false);
    }
  }, [folderId, versionId, fieldValues]);

  const handleNext = () => {
    if (step === "select") {
      if (!selectedTemplateId || !versionId) return;
      void fetchMissingFields();
    }
  };

  const handleGenerate = async () => {
    if (!versionId) return;
    setStep("generating");
    setError(null);
    try {
      const payload: Record<string, string> = {};
      for (const [k, v] of Object.entries(fieldValues)) {
        if (v.trim()) payload[k] = v.trim();
      }
      const envelope: GeneratedDocumentEnvelope = await generateDocument(folderId, {
        template_version_id: versionId,
        title: docTitle || selectedTemplate?.name || "Documento generado",
        generation_payload: payload,
      });
      const docId = envelope.document?.id ?? "";
      setGeneratedId(docId);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? formatGenerationError(err.message) : "Error al generar el documento");
      setStep("fields");
    }
  };

  const allFieldsFilled = missingFields.every((f) => fieldValues[f]?.trim());
  const missingRoles = prerequisiteIssues.missing_party_roles ?? [];
  const hasPrerequisiteIssues = Boolean(prerequisiteIssues.primary_client_required || missingRoles.length);
  const canGenerate = !previewBlocked && !hasPrerequisiteIssues && (missingFields.length === 0 || allFieldsFilled);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-border-subtle bg-[#050a18] shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold-light" />
            <h2 className="text-sm font-semibold text-soft-white">Generar documento</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-soft-subtle hover:text-soft-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-6 border-b border-border-subtle px-6 py-3">
          <StepDot
            active={step === "select"}
            done={step !== "select"}
            label="Plantilla"
          />
          <ChevronRight className="h-3 w-3 text-soft-subtle" />
          <StepDot
            active={step === "fields"}
            done={step === "generating" || step === "done"}
            label="Variables"
          />
          <ChevronRight className="h-3 w-3 text-soft-subtle" />
          <StepDot
            active={step === "generating" || step === "done"}
            done={step === "done"}
            label="Generar"
          />
        </div>

        {/* Body */}
        <div className="p-6">
          {/* ── Step 1: Select template ── */}
          {step === "select" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-soft-muted">Plantilla</label>
                <div className="max-h-64 overflow-y-auto space-y-1.5 rounded-xl border border-border-subtle p-2">
                  {templates.length === 0 ? (
                    <p className="py-4 text-center text-xs text-soft-muted">
                      No hay plantillas disponibles para este expediente.
                    </p>
                  ) : (
                    templates.map((tpl) => {
                      const hasVersion = Boolean(tpl.latest_version?.id);
                      const isSelected = selectedTemplateId === tpl.id;
                      return (
                      <button
                        key={tpl.id}
                        onClick={() => hasVersion && setSelectedTemplateId(tpl.id)}
                        disabled={!hasVersion}
                        title={!hasVersion ? "Esta plantilla no tiene una versión disponible" : undefined}
                        className={`w-full flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                          isSelected
                            ? "border-gold-light/60 bg-gold-light/15"
                            : "border-border-subtle bg-surface-elevated/70 hover:border-gold-light/30 hover:bg-surface-elevated"
                        } ${!hasVersion ? "cursor-not-allowed border-border-subtle/60 bg-surface-base/70" : ""}`}
                      >
                        <FileText className={`mt-0.5 h-4 w-4 shrink-0 ${isSelected ? "text-gold-light" : "text-soft-muted"}`} />
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-semibold ${hasVersion ? "text-soft-white" : "text-soft-muted"}`}>
                            {tpl.name}
                          </p>
                          <p className="text-xs text-soft-muted">{tpl.template_document_type ?? ""}</p>
                          {!hasVersion && (
                            <p className="mt-1 text-[10px] font-medium text-amber-300">
                              Sin versión disponible
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-gold-light" />
                        )}
                      </button>
                    )})
                  )}
                </div>
              </div>

              {selectedTemplate && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-soft-muted">Título del documento</label>
                  <input
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full rounded-xl border border-border-subtle bg-surface-elevated px-3 py-2 text-sm text-soft-white placeholder:text-soft-subtle focus:border-blue-light/50 focus:outline-none"
                    placeholder="Título del documento..."
                  />
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={!selectedTemplateId || !versionId || loadingFields}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-light/20 py-2.5 text-sm font-medium text-gold-light transition hover:bg-gold-light/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loadingFields ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Siguiente <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── Step 2: Fill missing fields ── */}
          {step === "fields" && (
            <div className="space-y-4">
              {hasPrerequisiteIssues ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />
                    <div className="space-y-1 text-xs text-yellow-100">
                      <p className="font-semibold text-yellow-200">Faltan datos del expediente antes de generar.</p>
                      {prerequisiteIssues.primary_client_required && (
                        <p>Añade un cliente principal al expediente.</p>
                      )}
                      {missingRoles.length > 0 && (
                        <p>Añade partes con estos roles: {missingRoles.map(roleLabel).join(", ")}.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : missingFields.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <p className="text-sm font-medium text-soft-white">Todos los datos están disponibles</p>
                  <p className="text-xs text-soft-muted">
                    El sistema puede generar el documento con los datos del expediente.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                    <p className="text-xs text-yellow-300">
                      Faltan {missingFields.length} {missingFields.length === 1 ? "campo" : "campos"} que debes rellenar manualmente.
                    </p>
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-2.5">
                    {missingFields.map((field) => (
                      <div key={field} className="space-y-1">
                        <label className="text-xs font-mono text-soft-muted">{field}</label>
                        <input
                          value={fieldValues[field] ?? ""}
                          onChange={(e) =>
                            setFieldValues((prev) => ({ ...prev, [field]: e.target.value }))
                          }
                          className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-sm text-soft-white placeholder:text-soft-subtle focus:border-blue-light/50 focus:outline-none"
                          placeholder={`Valor para ${field}...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <p className="rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs text-red-400">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("select")}
                  className="flex-1 rounded-xl border border-border-subtle py-2.5 text-sm text-soft-muted transition hover:text-soft-white"
                >
                  Atrás
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gold-light/20 py-2.5 text-sm font-medium text-gold-light transition hover:bg-gold-light/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Sparkles className="h-4 w-4" />
                  Generar ahora
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Generating ── */}
          {step === "generating" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-light/20 bg-gold-light/5">
                <Loader2 className="h-7 w-7 animate-spin text-gold-light" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-soft-white">Generando documento…</p>
                <p className="mt-1 text-xs text-soft-muted">Aplicando plantilla y variables del expediente.</p>
              </div>
            </div>
          )}

          {/* ── Done ── */}
          {step === "done" && generatedId && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-green-400/20 bg-green-400/5">
                <CheckCircle className="h-7 w-7 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-soft-white">Documento generado</p>
                <p className="mt-1 text-xs text-soft-muted">{docTitle}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="rounded-xl border border-border-subtle px-4 py-2 text-sm text-soft-muted hover:text-soft-white"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => onSuccess(generatedId)}
                  className="rounded-xl bg-green-400/15 px-4 py-2 text-sm font-medium text-green-400 hover:bg-green-400/25"
                >
                  Ver documento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
