"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  FileText,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import {
  generateDocument,
  previewMissingFields,
  type GeneratedDocumentEnvelope,
} from "@/lib/dms-api";

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

// ── Field label / placeholder map ─────────────────────────────────────────────

const FIELD_META: Record<string, { label: string; placeholder: string }> = {
  // Deal / folder
  "deal.folder_reference":    { label: "Referencia del expediente",       placeholder: "EXP-2024-001" },
  "deal.price":               { label: "Precio de compraventa",           placeholder: "350.000 €" },
  "deal.offer_price":         { label: "Precio ofertado",                 placeholder: "340.000 €" },
  "deal.deposit_amount":      { label: "Importe de arras / señal",        placeholder: "10.000 €" },
  "deal.signing_deadline":    { label: "Fecha límite de firma",           placeholder: "30/09/2026" },
  "deal.visit_date":          { label: "Fecha de visita",                 placeholder: "15/06/2026" },
  "deal.operation_type":      { label: "Tipo de operación",               placeholder: "compraventa" },
  "deal.phase":               { label: "Fase del expediente",             placeholder: "negociación" },
  "deal.language":            { label: "Idioma del contrato",             placeholder: "es" },
  "deal.jurisdiction":        { label: "Jurisdicción",                    placeholder: "ES-IB" },
  // Buyer
  "buyer.full_name":          { label: "Nombre completo del comprador",   placeholder: "Juan García López" },
  "buyer.id_document":        { label: "DNI / NIE del comprador",         placeholder: "12345678A" },
  "buyer.email":              { label: "Email del comprador",             placeholder: "comprador@email.com" },
  "buyer.phone":              { label: "Teléfono del comprador",          placeholder: "+34 600 000 000" },
  "buyer.address":            { label: "Dirección del comprador",         placeholder: "Calle Mayor 1, Madrid" },
  "buyer.nationality":        { label: "Nacionalidad del comprador",      placeholder: "española" },
  "buyer.company_name":       { label: "Empresa del comprador",           placeholder: "Inmuebles García S.L." },
  "buyer.company_cif":        { label: "CIF empresa del comprador",       placeholder: "B12345678" },
  // Seller
  "seller.full_name":         { label: "Nombre completo del vendedor",    placeholder: "María Martínez Ruiz" },
  "seller.id_document":       { label: "DNI / NIE del vendedor",          placeholder: "87654321B" },
  "seller.email":             { label: "Email del vendedor",              placeholder: "vendedor@email.com" },
  "seller.phone":             { label: "Teléfono del vendedor",           placeholder: "+34 611 000 000" },
  "seller.address":           { label: "Dirección del vendedor",          placeholder: "Calle Colón 5, Valencia" },
  "seller.nationality":       { label: "Nacionalidad del vendedor",       placeholder: "española" },
  // Landlord / tenant / guest
  "landlord.full_name":       { label: "Nombre completo del arrendador",  placeholder: "Pedro Sánchez Gómez" },
  "landlord.id_document":     { label: "DNI / NIE del arrendador",        placeholder: "11223344C" },
  "landlord.email":           { label: "Email del arrendador",            placeholder: "arrendador@email.com" },
  "tenant.full_name":         { label: "Nombre completo del arrendatario",placeholder: "Laura Fernández Gil" },
  "tenant.id_document":       { label: "DNI / NIE del arrendatario",      placeholder: "44332211D" },
  "tenant.email":             { label: "Email del arrendatario",          placeholder: "arrendatario@email.com" },
  "guest.full_name":          { label: "Nombre completo del huésped",     placeholder: "Sophie Dupont" },
  "guest.id_document":        { label: "Pasaporte / ID del huésped",      placeholder: "AB123456" },
  // Agent
  "agent.full_name":          { label: "Nombre del agente inmobiliario",  placeholder: "Ana López Sánchez" },
  "agent.email":              { label: "Email del agente",                placeholder: "agente@anclora.com" },
  "agent.phone":              { label: "Teléfono del agente",             placeholder: "+34 622 000 000" },
  "agent.roaiib_number":      { label: "Número ROAIIB del agente",        placeholder: "ROAIIB-0001" },
  // Property
  "property.address":         { label: "Dirección del inmueble",          placeholder: "Carrer del Mar 10, Palma" },
  "property.municipality":    { label: "Municipio",                       placeholder: "Palma de Mallorca" },
  "property.postal_code":     { label: "Código postal",                   placeholder: "07001" },
  "property.province":        { label: "Provincia",                       placeholder: "Illes Balears" },
  "property.cadastral_reference": { label: "Referencia catastral",        placeholder: "1234567AB1234C0001WX" },
  "property.registry_reference":  { label: "Referencia registral",        placeholder: "Tomo 123, Libro 45, Finca 6789" },
  "property.energy_certificate":  { label: "Certificado energético",      placeholder: "C" },
  "property.energy_rating":       { label: "Calificación energética",     placeholder: "C" },
  "property.habitation_certificate": { label: "Cédula de habitabilidad",  placeholder: "CH-2024-001" },
  // Organization
  "organization.legal_name":  { label: "Razón social de la agencia",      placeholder: "Anclora Real Estate S.L." },
  "organization.trade_name":  { label: "Nombre comercial de la agencia",  placeholder: "Anclora" },
  "organization.tax_id":      { label: "CIF de la agencia",               placeholder: "B12345678" },
  "organization.address":     { label: "Dirección de la agencia",         placeholder: "Paseo del Born 5, Palma" },
  "organization.phone":       { label: "Teléfono de la agencia",          placeholder: "+34 971 000 000" },
  "organization.email":       { label: "Email de la agencia",             placeholder: "info@anclora.com" },
  "organization.roaiib_number": { label: "Número ROAIIB de la agencia",   placeholder: "ROAIIB-ES-0001" },
  // Document
  "document.generated_at":    { label: "Fecha del documento",             placeholder: "14/06/2026" },
};

function fieldLabel(key: string): string {
  return FIELD_META[key]?.label ?? key.replace(/\./g, " › ").replace(/_/g, " ");
}

function fieldPlaceholder(key: string): string {
  return FIELD_META[key]?.placeholder ?? `Valor para ${key}…`;
}

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
    if (parsed.primary_client_required)
      parts.push("añade un cliente principal");
    if (parsed.missing_party_roles?.length) {
      parts.push(
        `añade partes con estos roles: ${parsed.missing_party_roles.map(roleLabel).join(", ")}`,
      );
    }
    if (parts.length)
      return `Faltan datos del expediente: ${parts.join("; ")}.`;
  } catch {
    // Keep the original API message when it is not a JSON detail payload.
  }
  return message;
}

interface WizardProps {
  folderId: string;
  templates: TemplateOption[];
  /** When set, the wizard shows only this template and skips to step 2 automatically. */
  preselectTemplateId?: string;
  onSuccess: (documentId: string) => void;
  onClose: () => void;
}

type WizardStep = "select" | "fields" | "generating" | "done";

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition ${
          done
            ? "border-green-400 bg-green-400/15 text-green-400"
            : active
              ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]"
              : "border-white/15 text-zinc-500"
        }`}
      >
        {done ? <CheckCircle className="h-3.5 w-3.5" /> : active ? "●" : "○"}
      </div>
      <span
        className={`text-[10px] ${active ? "text-[#D4AF37]" : done ? "text-green-400" : "text-zinc-500"}`}
      >
        {label}
      </span>
    </div>
  );
}

// ── Main wizard ────────────────────────────────────────────────────────────────

export function GenerateDocumentWizard({
  folderId,
  templates: allTemplates,
  preselectTemplateId,
  onSuccess,
  onClose,
}: WizardProps) {
  const templates = preselectTemplateId
    ? allTemplates.filter((t) => t.id === preselectTemplateId)
    : allTemplates;

  const [step, setStep] = useState<WizardStep>("select");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    preselectTemplateId ?? "",
  );
  const [docTitle, setDocTitle] = useState("");
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [prerequisiteIssues, setPrerequisiteIssues] =
    useState<PrerequisiteIssues>({});
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

  // When opened with a preselected template, skip step 1 immediately
  const autoAdvanced = useRef(false);
  useEffect(() => {
    if (preselectTemplateId && versionId && !autoAdvanced.current) {
      autoAdvanced.current = true;
      void fetchMissingFields();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectTemplateId, versionId]);

  const fetchMissingFields = useCallback(async () => {
    if (!folderId || !versionId) return;
    setLoadingFields(true);
    setError(null);
    try {
      const res = await previewMissingFields(folderId, {
        template_version_id: versionId,
        overrides: {},
      });
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
      setError(
        err instanceof Error
          ? formatGenerationError(err.message)
          : "No se pudo comprobar la plantilla.",
      );
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
      const envelope: GeneratedDocumentEnvelope = await generateDocument(
        folderId,
        {
          template_version_id: versionId,
          title: docTitle || selectedTemplate?.name || "Documento generado",
          generation_payload: payload,
        },
      );
      const docId = envelope.document?.id ?? "";
      setGeneratedId(docId);
      setStep("done");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      // Detect prerequisite errors from the generate endpoint and surface them
      // using the same warning UI that the preview step uses.
      try {
        const parsed = JSON.parse(raw) as
          | { detail?: PrerequisiteIssues }
          | PrerequisiteIssues;
        const issues =
          "detail" in parsed && parsed.detail
            ? (parsed.detail as PrerequisiteIssues)
            : (parsed as PrerequisiteIssues);
        if (issues.primary_client_required || issues.missing_party_roles?.length) {
          setPrerequisiteIssues(issues);
          setMissingFields([]);
          setStep("fields");
          return;
        }
      } catch {
        // not a JSON prerequisite payload — fall through to generic error
      }
      setError(
        raw ? formatGenerationError(raw) : "Error al generar el documento",
      );
      setStep("fields");
    }
  };

  const allFieldsFilled = missingFields.every((f) => fieldValues[f]?.trim());
  const missingRoles = prerequisiteIssues.missing_party_roles ?? [];
  const hasPrerequisiteIssues = Boolean(
    prerequisiteIssues.primary_client_required || missingRoles.length,
  );
  const canGenerate =
    !hasPrerequisiteIssues &&
    (missingFields.length === 0 || allFieldsFilled);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#050a18] shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-linear-to-r from-[#0a1228] to-[#050a18] px-6 py-4 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#D4AF37]" />
            <h2 className="text-sm font-semibold text-zinc-100">
              Generar documento
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-6 border-b border-white/10 px-6 py-3">
          <StepDot
            active={step === "select"}
            done={step !== "select"}
            label="Plantilla"
          />
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <StepDot
            active={step === "fields"}
            done={step === "generating" || step === "done"}
            label="Variables"
          />
          <ChevronRight className="h-3 w-3 text-zinc-600" />
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
                <label className="text-xs font-semibold text-zinc-400">
                  Plantilla
                </label>
                <div className="max-h-64 overflow-y-auto space-y-1.5 rounded-xl border border-white/10 p-2">
                  {templates.length === 0 ? (
                    <p className="py-4 text-center text-xs text-zinc-500">
                      No hay plantillas disponibles para este expediente.
                    </p>
                  ) : (
                    templates.map((tpl) => {
                      const hasVersion = Boolean(tpl.latest_version?.id);
                      const isSelected = selectedTemplateId === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          onClick={() =>
                            hasVersion && setSelectedTemplateId(tpl.id)
                          }
                          disabled={!hasVersion}
                          title={
                            !hasVersion
                              ? "Esta plantilla no tiene una versión disponible"
                              : undefined
                          }
                          className={`w-full flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                            isSelected
                              ? "border-[#D4AF37]/60 bg-[#D4AF37]/10"
                              : "border-white/10 bg-white/5 hover:border-[#D4AF37]/30 hover:bg-white/8"
                          } ${!hasVersion ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                          <FileText
                            className={`mt-0.5 h-4 w-4 shrink-0 ${isSelected ? "text-[#D4AF37]" : "text-zinc-400"}`}
                          />
                          <div className="min-w-0">
                            <p
                              className={`truncate text-sm font-semibold ${hasVersion ? "text-zinc-100" : "text-zinc-500"}`}
                            >
                              {tpl.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {tpl.template_document_type ?? ""}
                            </p>
                            {!hasVersion && (
                              <p className="mt-1 text-[10px] font-medium text-amber-300">
                                Sin versión disponible
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-[#D4AF37]" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {selectedTemplate && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">
                    Título del documento
                  </label>
                  <input
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#AFD2FA]/50 focus:outline-none"
                    placeholder="Título del documento..."
                  />
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={!selectedTemplateId || !versionId || loadingFields}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37]/20 py-2.5 text-sm font-medium text-[#D4AF37] transition hover:bg-[#D4AF37]/30 disabled:cursor-not-allowed disabled:opacity-40"
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
                      <p className="font-semibold text-yellow-200">
                        Faltan datos del expediente antes de generar.
                      </p>
                      {prerequisiteIssues.primary_client_required && (
                        <p>Añade un cliente principal al expediente.</p>
                      )}
                      {missingRoles.length > 0 && (
                        <p>
                          Añade partes con estos roles:{" "}
                          {missingRoles.map(roleLabel).join(", ")}.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : missingFields.length === 0 ? (
                previewBlocked ? (
                  <div className="flex flex-col items-center gap-2 py-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-yellow-400" />
                    <p className="text-sm font-medium text-zinc-100">
                      No se pudo verificar la plantilla
                    </p>
                    <p className="text-xs text-zinc-400">
                      Puedes intentar generar igualmente; el servidor validará
                      los datos en el momento de la generación.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                    <p className="text-sm font-medium text-zinc-100">
                      Todos los datos están disponibles
                    </p>
                    <p className="text-xs text-zinc-400">
                      El sistema puede generar el documento con los datos del
                      expediente.
                    </p>
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                    <p className="text-xs text-yellow-300">
                      Faltan {missingFields.length}{" "}
                      {missingFields.length === 1 ? "campo" : "campos"} que
                      debes rellenar manualmente.
                    </p>
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-2.5">
                    {missingFields.map((field) => (
                      <div key={field} className="space-y-1">
                        <label className="block text-xs font-medium text-zinc-300">
                          {fieldLabel(field)}
                          <span className="ml-1.5 font-mono text-[10px] text-zinc-600">
                            {field}
                          </span>
                        </label>
                        <input
                          value={fieldValues[field] ?? ""}
                          onChange={(e) =>
                            setFieldValues((prev) => ({
                              ...prev,
                              [field]: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[#AFD2FA]/50 focus:outline-none"
                          placeholder={fieldPlaceholder(field)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && !previewBlocked && (
                <p className="rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs text-red-400">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("select")}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-zinc-400 transition hover:border-white/20 hover:text-zinc-100"
                >
                  Atrás
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37]/20 py-2.5 text-sm font-medium text-[#D4AF37] transition hover:bg-[#D4AF37]/30 disabled:cursor-not-allowed disabled:opacity-40"
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
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5">
                <Loader2 className="h-7 w-7 animate-spin text-[#D4AF37]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-100">
                  Generando documento…
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Aplicando plantilla y variables del expediente.
                </p>
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
                <p className="text-sm font-semibold text-zinc-100">
                  Documento generado
                </p>
                <p className="mt-1 text-xs text-zinc-400">{docTitle}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:text-zinc-100"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => onSuccess(generatedId)}
                  className="rounded-xl bg-green-400/15 px-4 py-2 text-sm font-medium text-green-400 transition hover:bg-green-400/25"
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
