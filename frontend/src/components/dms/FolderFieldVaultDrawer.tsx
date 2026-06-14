"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Database,
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
  },
};

// ── Namespace order (most common first) ───────────────────────────────────────

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
  "agent",
  "organization",
  "document",
];

// ── Component ─────────────────────────────────────────────────────────────────

interface FolderFieldVaultDrawerProps {
  folderId: string;
  folderName?: string;
  language?: string | null;
  onClose: () => void;
}

export function FolderFieldVaultDrawer({
  folderId,
  folderName,
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
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["deal", "buyer", "seller", "landlord", "tenant", "property"]));

  // Load existing vault values
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFolderFieldVault(folderId)
      .then((v) => { if (!cancelled) { setValues(v); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
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
        lang === "ca" ? "No s'ha pogut desar. Torna-ho a intentar."
        : lang === "en" ? "Could not save. Please try again."
        : lang === "de" ? "Speichern fehlgeschlagen. Bitte erneut versuchen."
        : "No se pudo guardar. Inténtalo de nuevo."
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

  // Build ordered namespace list from FIELD_GROUPS
  const orderedNs = [
    ...NS_ORDER.filter((ns) => FIELD_GROUPS[ns]),
    ...Object.keys(FIELD_GROUPS).filter((ns) => !NS_ORDER.includes(ns)),
  ];

  const needle = search.toLowerCase().trim();

  const filledCount = (ns: string) =>
    (FIELD_GROUPS[ns] ?? []).filter((k) => values[k]?.trim()).length;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative ml-auto flex h-full w-full max-w-xl flex-col bg-[#070d1a] shadow-2xl shadow-black/60 border-l border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-[#D4AF37]" />
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                {lang === "ca" ? "Dades de l'expedient"
                  : lang === "en" ? "File data vault"
                  : lang === "de" ? "Aktendaten"
                  : "Datos del expediente"}
              </p>
              {folderName && (
                <p className="text-xs text-zinc-500">{folderName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-white/10 px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "ca" ? "Cerca camps…" : lang === "en" ? "Search fields…" : lang === "de" ? "Felder suchen…" : "Buscar campos…"}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[#AFD2FA]/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
          ) : (
            <div className="space-y-2">
              {orderedNs.map((ns) => {
                const keys = (FIELD_GROUPS[ns] ?? []).filter((k) => {
                  if (!needle) return true;
                  const lbl = fieldLabel(k, lang).toLowerCase();
                  return lbl.includes(needle) || k.includes(needle);
                });
                if (keys.length === 0) return null;

                const isOpen = openSections.has(ns) || Boolean(needle);
                const filled = filledCount(ns);
                const nsLabel = NS_DISPLAY[lang]?.[ns] ?? ns;

                return (
                  <div key={ns} className="rounded-xl border border-white/8 bg-white/[0.02]">
                    <button
                      onClick={() => toggleSection(ns)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-2">
                        {isOpen
                          ? <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                          : <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                        }
                        <span className="text-sm font-medium text-zinc-200">{nsLabel}</span>
                      </div>
                      {filled > 0 && (
                        <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-400">
                          {filled}/{keys.length}
                        </span>
                      )}
                    </button>

                    {isOpen && (
                      <div className="border-t border-white/8 px-4 pb-4 pt-3 space-y-3">
                        {keys.map((key) => (
                          <div key={key} className="space-y-1">
                            <label className="block text-xs font-medium text-zinc-400">
                              {fieldLabel(key, lang)}
                            </label>
                            <input
                              value={values[key] ?? ""}
                              onChange={(e) => handleChange(key, e.target.value)}
                              placeholder={fieldPlaceholder(key, lang)}
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[#AFD2FA]/50 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4">
          {error && (
            <p className="mb-3 text-xs text-red-400">{error}</p>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-zinc-500">
              {lang === "ca"
                ? "Els valors guardats s'usaran automàticament en tots els documents d'aquest expedient."
                : lang === "en"
                ? "Saved values will auto-fill all documents in this file."
                : lang === "de"
                ? "Gespeicherte Werte werden in allen Dokumenten dieser Akte automatisch ausgefüllt."
                : "Los valores guardados se usarán automáticamente en todos los documentos del expediente."}
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#e5c340] disabled:opacity-50"
            >
              {saving
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : saved
                ? <span>✓</span>
                : <Save className="h-4 w-4" />}
              {saving
                ? (lang === "en" ? "Saving…" : lang === "de" ? "Speichern…" : "Guardando…")
                : saved
                ? (lang === "ca" ? "Desat" : lang === "en" ? "Saved" : lang === "de" ? "Gespeichert" : "Guardado")
                : (lang === "ca" ? "Desar" : lang === "en" ? "Save" : lang === "de" ? "Speichern" : "Guardar")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
