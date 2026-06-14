"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Loader2,
  Save,
  Search,
  X,
} from "lucide-react";
import {
  FIELD_GROUPS,
  WizardLang,
  fieldLabel,
  fieldPlaceholder,
  normalizeLang,
} from "./GenerateDocumentWizard";
import { getFolderFieldVault, putFolderFieldVault } from "@/lib/dms-api";

// ── Namespace display names per language ──────────────────────────────────────

const NS_DISPLAY: Record<WizardLang, Record<string, string>> = {
  es: {
    deal: "Expediente",
    buyer: "Comprador / Cliente",
    seller: "Vendedor",
    landlord: "Arrendador",
    tenant: "Arrendatario",
    guest: "Huésped",
    agent: "Agente",
    property: "Inmueble",
    organization: "Agencia",
    document: "Documento",
    keys: "Llaves",
    sof: "Origen de fondos",
    supply: "Suministros",
    tenancy: "Arrendamiento",
    booking: "Reserva turística",
    inventory: "Inventario",
    nda: "Acuerdo de confidencialidad",
    delivery: "Entrega del inmueble",
  },
  ca: {
    deal: "Expedient",
    buyer: "Comprador / Client",
    seller: "Venedor",
    landlord: "Arrendador",
    tenant: "Arrendatari",
    guest: "Hoste",
    agent: "Agent",
    property: "Immoble",
    organization: "Agència",
    document: "Document",
    keys: "Claus",
    sof: "Origen de fons",
    supply: "Subministraments",
    tenancy: "Arrendament",
    booking: "Reserva turística",
    inventory: "Inventari",
    nda: "Acord de confidencialitat",
    delivery: "Lliurament de l'immoble",
  },
  en: {
    deal: "File / Deal",
    buyer: "Buyer / Client",
    seller: "Seller",
    landlord: "Landlord",
    tenant: "Tenant",
    guest: "Guest",
    agent: "Agent",
    property: "Property",
    organization: "Agency",
    document: "Document",
    keys: "Keys",
    sof: "Source of funds",
    supply: "Utilities",
    tenancy: "Tenancy",
    booking: "Tourist booking",
    inventory: "Inventory",
    nda: "Confidentiality agreement",
    delivery: "Property handover",
  },
  de: {
    deal: "Akte / Vorgang",
    buyer: "Käufer / Mandant",
    seller: "Verkäufer",
    landlord: "Vermieter",
    tenant: "Mieter",
    guest: "Gast",
    agent: "Makler",
    property: "Immobilie",
    organization: "Agentur",
    document: "Dokument",
    keys: "Schlüssel",
    sof: "Mittelherkunft",
    supply: "Versorgung",
    tenancy: "Mietverhältnis",
    booking: "Touristenbuchung",
    inventory: "Inventar",
    nda: "Vertraulichkeitsvereinbarung",
    delivery: "Immobilienübergabe",
  },
};

const NS_ORDER = [
  "deal",
  "buyer",
  "seller",
  "landlord",
  "tenant",
  "guest",
  "property",
  "tenancy",
  "booking",
  "keys",
  "supply",
  "sof",
  "inventory",
  "nda",
  "delivery",
  "agent",
  "organization",
  "document",
];

// ── Component ─────────────────────────────────────────────────────────────────

interface FolderFieldVaultDrawerProps {
  folderId: string;
  primaryPartyName?: string;
  operationLabel?: string;
  language?: string | null;
  onClose: () => void;
}

export function FolderFieldVaultDrawer({
  folderId,
  primaryPartyName,
  operationLabel,
  language,
  onClose,
}: FolderFieldVaultDrawerProps) {
  const lang = normalizeLang(language);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["deal", "buyer", "seller", "landlord", "tenant", "property"]),
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFolderFieldVault(folderId)
      .then((v) => {
        if (!cancelled) {
          setValues(v);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [folderId]);

  const handleChange = useCallback((key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const nonEmpty: Record<string, string> = {};
      for (const [k, v] of Object.entries(values)) {
        if (v.trim()) nonEmpty[k] = v.trim();
      }
      await putFolderFieldVault(folderId, nonEmpty);
      setSaved(true);
    } catch {
      setError(
        lang === "ca"
          ? "No s'ha pogut desar. Torna-ho a intentar."
          : lang === "en"
            ? "Could not save. Please try again."
            : lang === "de"
              ? "Speichern fehlgeschlagen. Bitte erneut versuchen."
              : "No se pudo guardar. Inténtalo de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (ns: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(ns)) next.delete(ns);
      else next.add(ns);
      return next;
    });
  };

  const orderedNs = [
    ...NS_ORDER.filter((ns) => FIELD_GROUPS[ns]),
    ...Object.keys(FIELD_GROUPS).filter((ns) => !NS_ORDER.includes(ns)),
  ];

  const needle = search.toLowerCase().trim();

  const filledCount = (ns: string) =>
    (FIELD_GROUPS[ns] ?? []).filter((k) => values[k]?.trim()).length;

  const totalFilled = Object.values(values).filter((v) => v?.trim()).length;
  const totalFields = Object.values(FIELD_GROUPS).reduce(
    (acc, keys) => acc + keys.length,
    0,
  );

  const saveLabel = saving
    ? lang === "en"
      ? "Saving…"
      : lang === "de"
        ? "Speichern…"
        : lang === "ca"
          ? "Desant…"
          : "Guardando…"
    : saved
      ? lang === "en"
        ? "Saved"
        : lang === "de"
          ? "Gespeichert"
          : lang === "ca"
            ? "Desat"
            : "Guardado"
      : lang === "en"
        ? "Save"
        : lang === "de"
          ? "Speichern"
          : lang === "ca"
            ? "Desar"
            : "Guardar";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-white/10 bg-[#050a18] shadow-2xl shadow-black/70">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]/25">
              <Save className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                {primaryPartyName ??
                  (lang === "en"
                    ? "File data"
                    : lang === "de"
                      ? "Aktendaten"
                      : lang === "ca"
                        ? "Dades de l'expedient"
                        : "Datos del expediente")}
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                {operationLabel ?? ""}
                {operationLabel && totalFields > 0 && " · "}
                {totalFilled > 0
                  ? `${totalFilled} / ${totalFields} ${lang === "en" ? "fields filled" : lang === "de" ? "Felder ausgefüllt" : lang === "ca" ? "camps emplenats" : "campos rellenos"}`
                  : lang === "en"
                    ? `${totalFields} fields available`
                    : lang === "de"
                      ? `${totalFields} Felder verfügbar`
                      : lang === "ca"
                        ? `${totalFields} camps disponibles`
                        : `${totalFields} campos disponibles`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="border-b border-white/10 px-8 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                lang === "ca"
                  ? "Cerca camps…"
                  : lang === "en"
                    ? "Search fields…"
                    : lang === "de"
                      ? "Felder suchen…"
                      : "Buscar campos…"
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#AFD2FA]/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-7 w-7 animate-spin text-zinc-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {orderedNs.map((ns) => {
                const keys = (FIELD_GROUPS[ns] ?? []).filter((k) => {
                  if (!needle) return true;
                  return (
                    fieldLabel(k, lang).toLowerCase().includes(needle) ||
                    k.includes(needle)
                  );
                });
                if (keys.length === 0) return null;

                const isOpen = openSections.has(ns) || Boolean(needle);
                const filled = filledCount(ns);
                const nsLabel = NS_DISPLAY[lang]?.[ns] ?? ns;

                return (
                  <div
                    key={ns}
                    className="rounded-xl border border-white/8 bg-white/2.5 overflow-hidden"
                  >
                    {/* Section header */}
                    <button
                      onClick={() => toggleSection(ns)}
                      className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-white/3"
                    >
                      <div className="flex items-center gap-2.5">
                        {isOpen ? (
                          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                        )}
                        <span className="text-sm font-semibold text-zinc-200">
                          {nsLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {filled > 0 && (
                          <span className="flex items-center gap-1 rounded-full bg-green-500/12 px-2.5 py-0.5 text-[10px] font-medium text-green-400">
                            <CheckCircle className="h-3 w-3" />
                            {filled}/{keys.length}
                          </span>
                        )}
                        {filled === 0 && (
                          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-zinc-600">
                            {keys.length}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Section fields — 2-column grid */}
                    {isOpen && (
                      <div className="border-t border-white/8 px-5 pb-5 pt-4">
                        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                          {keys.map((key) => (
                            <div key={key} className="space-y-1.5">
                              <label className="block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                                {fieldLabel(key, lang)}
                              </label>
                              <input
                                value={values[key] ?? ""}
                                onChange={(e) =>
                                  handleChange(key, e.target.value)
                                }
                                placeholder={fieldPlaceholder(key, lang)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 transition focus:border-[#AFD2FA]/40 focus:bg-white/8 focus:outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-8 py-4">
          {error && <p className="mb-3 text-xs text-red-400">{error}</p>}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-zinc-500">
              {lang === "ca"
                ? "Els valors es recuperaran automàticament cada vegada que generis un document d'aquest expedient."
                : lang === "en"
                  ? "These values will auto-fill every document you generate for this file."
                  : lang === "de"
                    ? "Diese Werte werden beim Generieren jedes Dokuments dieser Akte automatisch eingefügt."
                    : "Estos valores se usarán automáticamente en todos los documentos de este expediente."}
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-action shrink-0 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
