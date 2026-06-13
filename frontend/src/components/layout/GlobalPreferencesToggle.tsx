"use client";

import { ChevronDown, Globe, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useI18n, Language } from "@/lib/i18n";
import {
  ANCLORA_INTERNAL_LOCALE_META,
  INTERNAL_LOCALES,
  type AncloraInternalLocale,
} from "@/lib/anclora-language-toggle";
import {
  CURRENCY_OPTIONS,
  useCurrency,
  type CurrencyCode,
  type UnitSystem,
} from "@/lib/currency";

const UNITS: { code: UnitSystem; symbol: string }[] = [
  { code: "metric", symbol: "m²" },
  { code: "imperial", symbol: "Sqft" },
];

const preferenceCopy = {
  es: {
    trigger: "Preferencias globales",
    dialog: "Ajustes de preferencias globales",
    eyebrow: "Ajustes",
    title: "Preferencias",
    close: "Cerrar preferencias",
    language: "Idioma",
    currency: "Moneda",
    units: "Unidades de medida",
    pending: "Pendiente",
    save: "Guardar y cerrar",
    currencyLabels: {
      EUR: "Euro",
      USD: "Dólar estadounidense",
      GBP: "Libra esterlina",
      CHF: "Franco suizo",
      SEK: "Corona sueca",
      DKK: "Corona danesa",
      NOK: "Corona noruega",
    },
    unitLabels: {
      metric: "Metro cuadrado - m² / Hectárea - ha",
      imperial: "Pie cuadrado - ft² / Acre - ac",
    },
  },
  en: {
    trigger: "Global preferences",
    dialog: "Global preferences settings",
    eyebrow: "Settings",
    title: "Preferences",
    close: "Close preferences",
    language: "Language",
    currency: "Currency",
    units: "Measure units",
    pending: "Pending",
    save: "Save and close",
    currencyLabels: {
      EUR: "Euro",
      USD: "US dollar",
      GBP: "Pound sterling",
      CHF: "Swiss franc",
      SEK: "Swedish krona",
      DKK: "Danish krone",
      NOK: "Norwegian krone",
    },
    unitLabels: {
      metric: "Square meter - m² / Hectare - ha",
      imperial: "Square foot - ft² / Acre - ac",
    },
  },
  de: {
    trigger: "Globale Einstellungen",
    dialog: "Globale Präferenzeinstellungen",
    eyebrow: "Einstellungen",
    title: "Präferenzen",
    close: "Einstellungen schließen",
    language: "Sprache",
    currency: "Währung",
    units: "Maßeinheiten",
    pending: "Ausstehend",
    save: "Speichern und schließen",
    currencyLabels: {
      EUR: "Euro",
      USD: "US-Dollar",
      GBP: "Pfund Sterling",
      CHF: "Schweizer Franken",
      SEK: "Schwedische Krone",
      DKK: "Dänische Krone",
      NOK: "Norwegische Krone",
    },
    unitLabels: {
      metric: "Quadratmeter - m² / Hektar - ha",
      imperial: "Quadratfuß - ft² / Acre - ac",
    },
  },
  ca: {
    trigger: "Preferències globals",
    dialog: "Ajustos de preferències globals",
    eyebrow: "Ajustos",
    title: "Preferències",
    close: "Tancar preferències",
    language: "Idioma",
    currency: "Moneda",
    units: "Unitats de mesura",
    pending: "Pendent",
    save: "Desar i tancar",
    currencyLabels: {
      EUR: "Euro",
      USD: "Dòlar nord-americà",
      GBP: "Lliura esterlina",
      CHF: "Franc suís",
      SEK: "Corona sueca",
      DKK: "Corona danesa",
      NOK: "Corona noruega",
    },
    unitLabels: {
      metric: "Metre quadrat - m² / Hectàrea - ha",
      imperial: "Peu quadrat - ft² / Acre - ac",
    },
  },
} as const;

export function GlobalPreferencesToggle() {
  const { language, setLanguage } = useI18n();
  const { currency, setCurrency, unitSystem, setUnitSystem } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLang = ANCLORA_INTERNAL_LOCALE_META[language];
  const currentUnit =
    UNITS.find((unit) => unit.code === unitSystem) || UNITS[0];
  const copy = preferenceCopy[language];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg border border-soft-subtle bg-navy-surface/40 px-3 py-2 transition-all hover:border-gold/50"
        aria-label={copy.trigger}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Globe className="h-4 w-4 text-soft-muted" />
        <span className="max-w-48 truncate text-xs font-semibold text-soft-white">
          {currentLang.nativeName} · {currency} · {currentUnit.symbol}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-soft-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border-2 border-soft-muted/30 bg-navy-deep p-3 shadow-2xl backdrop-blur-xl"
            role="dialog"
            aria-label={copy.dialog}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-soft-muted">
                  {copy.eyebrow}
                </p>
                <h2 className="text-sm font-bold text-soft-white">
                  {copy.title}
                </h2>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-soft-muted hover:bg-white/5 hover:text-soft-white"
                onClick={() => setIsOpen(false)}
                aria-label={copy.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <Field label={copy.language}>
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as Language)
                }
                className="w-full rounded-lg border border-soft-subtle/30 bg-navy-darker px-3 py-2 text-sm text-soft-white"
                aria-label={copy.language}
              >
                {INTERNAL_LOCALES.map((locale: AncloraInternalLocale) => {
                  const lang = ANCLORA_INTERNAL_LOCALE_META[locale];
                  const active = lang.status === "active";
                  return (
                    <option
                      key={lang.code}
                      disabled={!active}
                      value={lang.code}
                    >
                      {lang.nativeName} - {lang.englishName}
                      {active ? "" : ` - ${copy.pending}`}
                    </option>
                  );
                })}
              </select>
            </Field>

            <Field label={copy.currency}>
              <select
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value as CurrencyCode)
                }
                className="w-full rounded-lg border border-soft-subtle/30 bg-navy-darker px-3 py-2 text-sm text-soft-white"
                aria-label={copy.currency}
              >
                {CURRENCY_OPTIONS.map((item) => (
                  <option key={item.code} value={item.code}>
                    {copy.currencyLabels[item.code]} - {item.code} {item.symbol}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={copy.units}>
              <select
                value={unitSystem}
                onChange={(event) =>
                  setUnitSystem(event.target.value as UnitSystem)
                }
                className="w-full rounded-lg border border-soft-subtle/30 bg-navy-darker px-3 py-2 text-sm text-soft-white"
                aria-label={copy.units}
              >
                {UNITS.map((item) => (
                  <option key={item.code} value={item.code}>
                    {copy.unitLabels[item.code]}
                  </option>
                ))}
              </select>
            </Field>

            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-gold px-4 py-2 text-sm font-bold text-primary-foreground"
              onClick={() => setIsOpen(false)}
            >
              {copy.save}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-soft-muted">
        {label}
      </p>
      {children}
    </div>
  );
}
