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
  getFolderFieldVault,
  previewMissingFields,
  putFolderFieldVault,
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

// ── Field labels & placeholders — es / ca / en / de ──────────────────────────

type WizardLang = "es" | "ca" | "en" | "de";

type FieldEntry = { label: string; placeholder: string };
type LangMap = Record<WizardLang, FieldEntry>;

const FIELD_I18N: Record<string, LangMap> = {
  // ── Deal / expediente ──────────────────────────────────────────────────────
  "deal.folder_reference": {
    es: { label: "Referencia del expediente",    placeholder: "EXP-2024-001" },
    ca: { label: "Referència de l'expedient",    placeholder: "EXP-2024-001" },
    en: { label: "File reference",               placeholder: "FILE-2024-001" },
    de: { label: "Aktenzeichen",                 placeholder: "AKT-2024-001" },
  },
  "deal.price": {
    es: { label: "Precio de compraventa",        placeholder: "350.000 €" },
    ca: { label: "Preu de compravenda",          placeholder: "350.000 €" },
    en: { label: "Purchase price",               placeholder: "€ 350,000" },
    de: { label: "Kaufpreis",                    placeholder: "350.000 €" },
  },
  "deal.offer_price": {
    es: { label: "Precio ofertado",              placeholder: "340.000 €" },
    ca: { label: "Preu ofert",                   placeholder: "340.000 €" },
    en: { label: "Offer price",                  placeholder: "€ 340,000" },
    de: { label: "Angebotspreis",                placeholder: "340.000 €" },
  },
  "deal.deposit_amount": {
    es: { label: "Importe de arras / señal",     placeholder: "10.000 €" },
    ca: { label: "Import d'arres / senyal",      placeholder: "10.000 €" },
    en: { label: "Deposit amount",               placeholder: "€ 10,000" },
    de: { label: "Anzahlung / Kaution",          placeholder: "10.000 €" },
  },
  "deal.signing_deadline": {
    es: { label: "Fecha límite de firma",        placeholder: "30/09/2026" },
    ca: { label: "Data límit de signatura",      placeholder: "30/09/2026" },
    en: { label: "Signing deadline",             placeholder: "09/30/2026" },
    de: { label: "Unterzeichnungsfrist",         placeholder: "30.09.2026" },
  },
  "deal.visit_date": {
    es: { label: "Fecha de visita",              placeholder: "15/06/2026" },
    ca: { label: "Data de visita",               placeholder: "15/06/2026" },
    en: { label: "Visit date",                   placeholder: "06/15/2026" },
    de: { label: "Besichtigungsdatum",           placeholder: "15.06.2026" },
  },
  "deal.operation_type": {
    es: { label: "Tipo de operación",            placeholder: "compraventa" },
    ca: { label: "Tipus d'operació",             placeholder: "compravenda" },
    en: { label: "Operation type",               placeholder: "sale" },
    de: { label: "Vorgangsart",                  placeholder: "Kauf" },
  },
  "deal.phase": {
    es: { label: "Fase del expediente",          placeholder: "negociación" },
    ca: { label: "Fase de l'expedient",          placeholder: "negociació" },
    en: { label: "File phase",                   placeholder: "negotiation" },
    de: { label: "Aktenphase",                   placeholder: "Verhandlung" },
  },
  "deal.language": {
    es: { label: "Idioma del contrato",          placeholder: "es" },
    ca: { label: "Idioma del contracte",         placeholder: "ca" },
    en: { label: "Contract language",            placeholder: "en" },
    de: { label: "Vertragssprache",              placeholder: "de" },
  },
  "deal.jurisdiction": {
    es: { label: "Jurisdicción",                 placeholder: "ES-IB" },
    ca: { label: "Jurisdicció",                  placeholder: "ES-IB" },
    en: { label: "Jurisdiction",                 placeholder: "ES-IB" },
    de: { label: "Zuständigkeit",               placeholder: "ES-IB" },
  },
  // ── Buyer ──────────────────────────────────────────────────────────────────
  "buyer.full_name": {
    es: { label: "Nombre completo del comprador",   placeholder: "Juan García López" },
    ca: { label: "Nom complet del comprador",       placeholder: "Joan Garcia López" },
    en: { label: "Buyer's full name",               placeholder: "John Smith" },
    de: { label: "Vollständiger Name des Käufers",  placeholder: "Hans Müller" },
  },
  "buyer.id_document": {
    es: { label: "DNI / NIE del comprador",         placeholder: "12345678A" },
    ca: { label: "DNI / NIE del comprador",         placeholder: "12345678A" },
    en: { label: "Buyer's ID / passport",           placeholder: "AB123456" },
    de: { label: "Ausweis des Käufers",             placeholder: "DE123456789" },
  },
  "buyer.email": {
    es: { label: "Email del comprador",             placeholder: "comprador@email.com" },
    ca: { label: "Correu del comprador",            placeholder: "comprador@email.com" },
    en: { label: "Buyer's email",                   placeholder: "buyer@email.com" },
    de: { label: "E-Mail des Käufers",              placeholder: "kaeufer@email.de" },
  },
  "buyer.phone": {
    es: { label: "Teléfono del comprador",          placeholder: "+34 600 000 000" },
    ca: { label: "Telèfon del comprador",           placeholder: "+34 600 000 000" },
    en: { label: "Buyer's phone",                   placeholder: "+44 7000 000000" },
    de: { label: "Telefon des Käufers",             placeholder: "+49 151 00000000" },
  },
  "buyer.address": {
    es: { label: "Dirección del comprador",         placeholder: "Calle Mayor 1, Madrid" },
    ca: { label: "Adreça del comprador",            placeholder: "Carrer Major 1, Barcelona" },
    en: { label: "Buyer's address",                 placeholder: "10 High Street, London" },
    de: { label: "Adresse des Käufers",             placeholder: "Hauptstraße 1, München" },
  },
  "buyer.nationality": {
    es: { label: "Nacionalidad del comprador",      placeholder: "española" },
    ca: { label: "Nacionalitat del comprador",      placeholder: "espanyola" },
    en: { label: "Buyer's nationality",             placeholder: "British" },
    de: { label: "Staatsangehörigkeit des Käufers", placeholder: "deutsch" },
  },
  "buyer.company_name": {
    es: { label: "Empresa del comprador",           placeholder: "Inmuebles García S.L." },
    ca: { label: "Empresa del comprador",           placeholder: "Immobles Garcia S.L." },
    en: { label: "Buyer's company",                 placeholder: "Smith Properties Ltd." },
    de: { label: "Firma des Käufers",               placeholder: "Müller Immobilien GmbH" },
  },
  "buyer.company_cif": {
    es: { label: "CIF empresa del comprador",       placeholder: "B12345678" },
    ca: { label: "CIF empresa del comprador",       placeholder: "B12345678" },
    en: { label: "Buyer's company tax ID",          placeholder: "GB123456789" },
    de: { label: "Steuer-ID der Käuferfirma",       placeholder: "DE123456789" },
  },
  // ── Seller ─────────────────────────────────────────────────────────────────
  "seller.full_name": {
    es: { label: "Nombre completo del vendedor",    placeholder: "María Martínez Ruiz" },
    ca: { label: "Nom complet del venedor",         placeholder: "Maria Martínez Ruiz" },
    en: { label: "Seller's full name",              placeholder: "Jane Brown" },
    de: { label: "Vollständiger Name des Verkäufers", placeholder: "Anna Schmidt" },
  },
  "seller.id_document": {
    es: { label: "DNI / NIE del vendedor",          placeholder: "87654321B" },
    ca: { label: "DNI / NIE del venedor",           placeholder: "87654321B" },
    en: { label: "Seller's ID / passport",          placeholder: "CD789012" },
    de: { label: "Ausweis des Verkäufers",          placeholder: "DE987654321" },
  },
  "seller.email": {
    es: { label: "Email del vendedor",              placeholder: "vendedor@email.com" },
    ca: { label: "Correu del venedor",              placeholder: "venedor@email.com" },
    en: { label: "Seller's email",                  placeholder: "seller@email.com" },
    de: { label: "E-Mail des Verkäufers",           placeholder: "verkaeufer@email.de" },
  },
  "seller.phone": {
    es: { label: "Teléfono del vendedor",           placeholder: "+34 611 000 000" },
    ca: { label: "Telèfon del venedor",             placeholder: "+34 611 000 000" },
    en: { label: "Seller's phone",                  placeholder: "+44 7111 000000" },
    de: { label: "Telefon des Verkäufers",          placeholder: "+49 152 00000000" },
  },
  "seller.address": {
    es: { label: "Dirección del vendedor",          placeholder: "Calle Colón 5, Valencia" },
    ca: { label: "Adreça del venedor",              placeholder: "Carrer Colom 5, València" },
    en: { label: "Seller's address",                placeholder: "5 Park Lane, London" },
    de: { label: "Adresse des Verkäufers",          placeholder: "Parkstraße 5, Berlin" },
  },
  "seller.nationality": {
    es: { label: "Nacionalidad del vendedor",       placeholder: "española" },
    ca: { label: "Nacionalitat del venedor",        placeholder: "espanyola" },
    en: { label: "Seller's nationality",            placeholder: "British" },
    de: { label: "Staatsangehörigkeit des Verkäufers", placeholder: "deutsch" },
  },
  // ── Landlord / tenant / guest ──────────────────────────────────────────────
  "landlord.full_name": {
    es: { label: "Nombre completo del arrendador",   placeholder: "Pedro Sánchez Gómez" },
    ca: { label: "Nom complet de l'arrendador",      placeholder: "Pere Sànchez Gómez" },
    en: { label: "Landlord's full name",             placeholder: "Peter Johnson" },
    de: { label: "Vollständiger Name des Vermieters",placeholder: "Peter Wagner" },
  },
  "landlord.id_document": {
    es: { label: "DNI / NIE del arrendador",         placeholder: "11223344C" },
    ca: { label: "DNI / NIE de l'arrendador",        placeholder: "11223344C" },
    en: { label: "Landlord's ID / passport",         placeholder: "EF345678" },
    de: { label: "Ausweis des Vermieters",           placeholder: "DE112233445" },
  },
  "landlord.email": {
    es: { label: "Email del arrendador",             placeholder: "arrendador@email.com" },
    ca: { label: "Correu de l'arrendador",           placeholder: "arrendador@email.com" },
    en: { label: "Landlord's email",                 placeholder: "landlord@email.com" },
    de: { label: "E-Mail des Vermieters",            placeholder: "vermieter@email.de" },
  },
  "tenant.full_name": {
    es: { label: "Nombre completo del arrendatario", placeholder: "Laura Fernández Gil" },
    ca: { label: "Nom complet de l'arrendatari",     placeholder: "Laura Fernández Gil" },
    en: { label: "Tenant's full name",               placeholder: "Laura Green" },
    de: { label: "Vollständiger Name des Mieters",   placeholder: "Laura Fischer" },
  },
  "tenant.id_document": {
    es: { label: "DNI / NIE del arrendatario",       placeholder: "44332211D" },
    ca: { label: "DNI / NIE de l'arrendatari",       placeholder: "44332211D" },
    en: { label: "Tenant's ID / passport",           placeholder: "GH901234" },
    de: { label: "Ausweis des Mieters",              placeholder: "DE443322110" },
  },
  "tenant.email": {
    es: { label: "Email del arrendatario",           placeholder: "arrendatario@email.com" },
    ca: { label: "Correu de l'arrendatari",          placeholder: "arrendatari@email.com" },
    en: { label: "Tenant's email",                   placeholder: "tenant@email.com" },
    de: { label: "E-Mail des Mieters",               placeholder: "mieter@email.de" },
  },
  "guest.full_name": {
    es: { label: "Nombre completo del huésped",      placeholder: "Sophie Dupont" },
    ca: { label: "Nom complet de l'hoste",           placeholder: "Sophie Dupont" },
    en: { label: "Guest's full name",                placeholder: "Sophie Dupont" },
    de: { label: "Vollständiger Name des Gastes",    placeholder: "Sophie Dupont" },
  },
  "guest.id_document": {
    es: { label: "Pasaporte / ID del huésped",       placeholder: "AB123456" },
    ca: { label: "Passaport / ID de l'hoste",        placeholder: "AB123456" },
    en: { label: "Guest's passport / ID",            placeholder: "AB123456" },
    de: { label: "Reisepass / Ausweis des Gastes",   placeholder: "AB123456" },
  },
  // ── Agent ──────────────────────────────────────────────────────────────────
  "agent.full_name": {
    es: { label: "Nombre del agente inmobiliario",   placeholder: "Ana López Sánchez" },
    ca: { label: "Nom de l'agent immobiliari",       placeholder: "Anna López Sànchez" },
    en: { label: "Real estate agent's name",         placeholder: "Ana López" },
    de: { label: "Name des Immobilienmaklers",       placeholder: "Ana López" },
  },
  "agent.email": {
    es: { label: "Email del agente",                 placeholder: "agente@anclora.com" },
    ca: { label: "Correu de l'agent",                placeholder: "agent@anclora.com" },
    en: { label: "Agent's email",                    placeholder: "agent@anclora.com" },
    de: { label: "E-Mail des Maklers",               placeholder: "makler@anclora.com" },
  },
  "agent.phone": {
    es: { label: "Teléfono del agente",              placeholder: "+34 622 000 000" },
    ca: { label: "Telèfon de l'agent",               placeholder: "+34 622 000 000" },
    en: { label: "Agent's phone",                    placeholder: "+34 622 000 000" },
    de: { label: "Telefon des Maklers",              placeholder: "+34 622 000 000" },
  },
  "agent.roaiib_number": {
    es: { label: "Número ROAIIB del agente",         placeholder: "ROAIIB-0001" },
    ca: { label: "Número ROAIIB de l'agent",         placeholder: "ROAIIB-0001" },
    en: { label: "Agent's ROAIIB number",            placeholder: "ROAIIB-0001" },
    de: { label: "ROAIIB-Nummer des Maklers",        placeholder: "ROAIIB-0001" },
  },
  // ── Property ───────────────────────────────────────────────────────────────
  "property.address": {
    es: { label: "Dirección del inmueble",           placeholder: "Carrer del Mar 10, Palma" },
    ca: { label: "Adreça de l'immoble",              placeholder: "Carrer del Mar 10, Palma" },
    en: { label: "Property address",                 placeholder: "10 Carrer del Mar, Palma" },
    de: { label: "Adresse der Immobilie",            placeholder: "Carrer del Mar 10, Palma" },
  },
  "property.municipality": {
    es: { label: "Municipio",                        placeholder: "Palma de Mallorca" },
    ca: { label: "Municipi",                         placeholder: "Palma de Mallorca" },
    en: { label: "Municipality",                     placeholder: "Palma de Mallorca" },
    de: { label: "Gemeinde",                         placeholder: "Palma de Mallorca" },
  },
  "property.postal_code": {
    es: { label: "Código postal",                    placeholder: "07001" },
    ca: { label: "Codi postal",                      placeholder: "07001" },
    en: { label: "Postal code",                      placeholder: "07001" },
    de: { label: "Postleitzahl",                     placeholder: "07001" },
  },
  "property.province": {
    es: { label: "Provincia",                        placeholder: "Illes Balears" },
    ca: { label: "Província",                        placeholder: "Illes Balears" },
    en: { label: "Province",                         placeholder: "Illes Balears" },
    de: { label: "Provinz",                          placeholder: "Illes Balears" },
  },
  "property.cadastral_reference": {
    es: { label: "Referencia catastral",             placeholder: "1234567AB1234C0001WX" },
    ca: { label: "Referència cadastral",             placeholder: "1234567AB1234C0001WX" },
    en: { label: "Cadastral reference",              placeholder: "1234567AB1234C0001WX" },
    de: { label: "Katasterreferenz",                 placeholder: "1234567AB1234C0001WX" },
  },
  "property.registry_reference": {
    es: { label: "Referencia registral",             placeholder: "Tomo 123, Libro 45, Finca 6789" },
    ca: { label: "Referència registral",             placeholder: "Tom 123, Llibre 45, Finca 6789" },
    en: { label: "Registry reference",               placeholder: "Volume 123, Book 45, Plot 6789" },
    de: { label: "Grundbuchreferenz",                placeholder: "Band 123, Buch 45, Grundstück 6789" },
  },
  "property.energy_certificate": {
    es: { label: "Certificado energético",           placeholder: "C" },
    ca: { label: "Certificat energètic",             placeholder: "C" },
    en: { label: "Energy certificate",               placeholder: "C" },
    de: { label: "Energieausweis",                   placeholder: "C" },
  },
  "property.energy_rating": {
    es: { label: "Calificación energética",          placeholder: "C" },
    ca: { label: "Qualificació energètica",          placeholder: "C" },
    en: { label: "Energy rating",                    placeholder: "C" },
    de: { label: "Energiebewertung",                 placeholder: "C" },
  },
  "property.habitation_certificate": {
    es: { label: "Cédula de habitabilidad",          placeholder: "CH-2024-001" },
    ca: { label: "Cèdula d'habitabilitat",           placeholder: "CH-2024-001" },
    en: { label: "Habitation certificate",           placeholder: "CH-2024-001" },
    de: { label: "Wohnfähigkeitsnachweis",           placeholder: "CH-2024-001" },
  },
  // ── Organization ───────────────────────────────────────────────────────────
  "organization.legal_name": {
    es: { label: "Razón social de la agencia",       placeholder: "Anclora Real Estate S.L." },
    ca: { label: "Raó social de l'agència",          placeholder: "Anclora Real Estate S.L." },
    en: { label: "Agency's legal name",              placeholder: "Anclora Real Estate S.L." },
    de: { label: "Firmenname der Agentur",           placeholder: "Anclora Real Estate S.L." },
  },
  "organization.trade_name": {
    es: { label: "Nombre comercial de la agencia",   placeholder: "Anclora" },
    ca: { label: "Nom comercial de l'agència",       placeholder: "Anclora" },
    en: { label: "Agency's trade name",              placeholder: "Anclora" },
    de: { label: "Handelsname der Agentur",          placeholder: "Anclora" },
  },
  "organization.tax_id": {
    es: { label: "CIF de la agencia",                placeholder: "B12345678" },
    ca: { label: "CIF de l'agència",                 placeholder: "B12345678" },
    en: { label: "Agency's tax ID",                  placeholder: "B12345678" },
    de: { label: "Steuer-ID der Agentur",            placeholder: "B12345678" },
  },
  "organization.address": {
    es: { label: "Dirección de la agencia",          placeholder: "Paseo del Born 5, Palma" },
    ca: { label: "Adreça de l'agència",              placeholder: "Passeig del Born 5, Palma" },
    en: { label: "Agency's address",                 placeholder: "5 Paseo del Born, Palma" },
    de: { label: "Adresse der Agentur",              placeholder: "Paseo del Born 5, Palma" },
  },
  "organization.phone": {
    es: { label: "Teléfono de la agencia",           placeholder: "+34 971 000 000" },
    ca: { label: "Telèfon de l'agència",             placeholder: "+34 971 000 000" },
    en: { label: "Agency's phone",                   placeholder: "+34 971 000 000" },
    de: { label: "Telefon der Agentur",              placeholder: "+34 971 000 000" },
  },
  "organization.email": {
    es: { label: "Email de la agencia",              placeholder: "info@anclora.com" },
    ca: { label: "Correu de l'agència",              placeholder: "info@anclora.com" },
    en: { label: "Agency's email",                   placeholder: "info@anclora.com" },
    de: { label: "E-Mail der Agentur",               placeholder: "info@anclora.com" },
  },
  "organization.roaiib_number": {
    es: { label: "Número ROAIIB de la agencia",      placeholder: "ROAIIB-ES-0001" },
    ca: { label: "Número ROAIIB de l'agència",       placeholder: "ROAIIB-ES-0001" },
    en: { label: "Agency's ROAIIB number",           placeholder: "ROAIIB-ES-0001" },
    de: { label: "ROAIIB-Nummer der Agentur",        placeholder: "ROAIIB-ES-0001" },
  },
  // ── Document ───────────────────────────────────────────────────────────────
  "document.generated_at": {
    es: { label: "Fecha del documento",              placeholder: "14/06/2026" },
    ca: { label: "Data del document",                placeholder: "14/06/2026" },
    en: { label: "Document date",                    placeholder: "06/14/2026" },
    de: { label: "Dokumentdatum",                    placeholder: "14.06.2026" },
  },
  // ── Deal (extended) ────────────────────────────────────────────────────────
  "deal.arras_date":              { es: { label: "Fecha de las arras",              placeholder: "30/06/2026" }, ca: { label: "Data de les arres",              placeholder: "30/06/2026" }, en: { label: "Deposit date",                   placeholder: "06/30/2026" }, de: { label: "Datum der Anzahlung",            placeholder: "30.06.2026" } },
  "deal.asking_price":            { es: { label: "Precio de salida",                placeholder: "380.000 €" }, ca: { label: "Preu de sortida",               placeholder: "380.000 €" }, en: { label: "Asking price",                   placeholder: "€ 380,000" }, de: { label: "Angebotspreis",                  placeholder: "380.000 €" } },
  "deal.commission_pct":          { es: { label: "Porcentaje de comisión (%)",      placeholder: "5 %" }, ca: { label: "Percentatge de comissió (%)",    placeholder: "5 %" }, en: { label: "Commission percentage (%)",       placeholder: "5 %" }, de: { label: "Provision (%)",                  placeholder: "5 %" } },
  "deal.commission_payer":        { es: { label: "Quién paga la comisión",          placeholder: "vendedor" }, ca: { label: "Qui paga la comissió",          placeholder: "venedor" }, en: { label: "Commission payer",               placeholder: "seller" }, de: { label: "Provisionszahler",               placeholder: "Verkäufer" } },
  "deal.deposit_deadline":        { es: { label: "Plazo para la señal",             placeholder: "10 días" }, ca: { label: "Termini per la senyal",          placeholder: "10 dies" }, en: { label: "Deposit deadline",               placeholder: "10 days" }, de: { label: "Frist für die Anzahlung",        placeholder: "10 Tage" } },
  "deal.deposit_payment_method":  { es: { label: "Forma de pago de la señal",       placeholder: "transferencia bancaria" }, ca: { label: "Forma de pagament de la senyal", placeholder: "transferència bancària" }, en: { label: "Deposit payment method",         placeholder: "bank transfer" }, de: { label: "Zahlungsart der Anzahlung",      placeholder: "Banküberweisung" } },
  "deal.deposit_proposed":        { es: { label: "Señal propuesta",                 placeholder: "10.000 €" }, ca: { label: "Senyal proposada",              placeholder: "10.000 €" }, en: { label: "Proposed deposit",               placeholder: "€ 10,000" }, de: { label: "Vorgeschlagene Anzahlung",       placeholder: "10.000 €" } },
  "deal.financing_condition":     { es: { label: "Condición de financiación",       placeholder: "sujeto a hipoteca" }, ca: { label: "Condició de finançament",        placeholder: "subjecte a hipoteca" }, en: { label: "Financing condition",            placeholder: "subject to mortgage" }, de: { label: "Finanzierungsbedingung",         placeholder: "vorbehaltlich Hypothek" } },
  "deal.financing_type":          { es: { label: "Tipo de financiación",            placeholder: "hipoteca" }, ca: { label: "Tipus de finançament",           placeholder: "hipoteca" }, en: { label: "Financing type",                 placeholder: "mortgage" }, de: { label: "Finanzierungsart",               placeholder: "Hypothek" } },
  "deal.mortgage_amount":         { es: { label: "Importe de la hipoteca",          placeholder: "200.000 €" }, ca: { label: "Import de la hipoteca",          placeholder: "200.000 €" }, en: { label: "Mortgage amount",                placeholder: "€ 200,000" }, de: { label: "Hypothekenbetrag",               placeholder: "200.000 €" } },
  "deal.minimum_price":           { es: { label: "Precio mínimo aceptado",          placeholder: "320.000 €" }, ca: { label: "Preu mínim acceptat",           placeholder: "320.000 €" }, en: { label: "Minimum accepted price",         placeholder: "€ 320,000" }, de: { label: "Mindestpreis",                   placeholder: "320.000 €" } },
  "deal.notary_name":             { es: { label: "Nombre del notario",              placeholder: "Ilmo. D. Carlos Pérez" }, ca: { label: "Nom del notari",                placeholder: "Il·lm. Sr. Carles Pérez" }, en: { label: "Notary's name",                  placeholder: "Notary Carlos Pérez" }, de: { label: "Name des Notars",                placeholder: "Notar Carlos Pérez" } },
  "deal.notary_address":          { es: { label: "Dirección de la notaría",         placeholder: "Calle Colón 3, Palma" }, ca: { label: "Adreça de la notaria",          placeholder: "Carrer Colom 3, Palma" }, en: { label: "Notary office address",          placeholder: "3 Carrer Colom, Palma" }, de: { label: "Adresse des Notars",             placeholder: "Carrer Colom 3, Palma" } },
  "deal.payment_method":          { es: { label: "Forma de pago",                   placeholder: "transferencia bancaria" }, ca: { label: "Forma de pagament",             placeholder: "transferència bancària" }, en: { label: "Payment method",                 placeholder: "bank transfer" }, de: { label: "Zahlungsart",                    placeholder: "Banküberweisung" } },
  "deal.price_remaining":         { es: { label: "Resto del precio",                placeholder: "340.000 €" }, ca: { label: "Resta del preu",                placeholder: "340.000 €" }, en: { label: "Remaining price",                placeholder: "€ 340,000" }, de: { label: "Restbetrag",                     placeholder: "340.000 €" } },
  "deal.price_total":             { es: { label: "Precio total",                    placeholder: "350.000 €" }, ca: { label: "Preu total",                    placeholder: "350.000 €" }, en: { label: "Total price",                    placeholder: "€ 350,000" }, de: { label: "Gesamtpreis",                    placeholder: "350.000 €" } },
  "deal.reservation_days":        { es: { label: "Días de reserva",                 placeholder: "30" }, ca: { label: "Dies de reserva",               placeholder: "30" }, en: { label: "Reservation days",               placeholder: "30" }, de: { label: "Reservierungstage",              placeholder: "30" } },
  "deal.signing_place":           { es: { label: "Lugar de firma",                  placeholder: "Notaría Pérez, Palma" }, ca: { label: "Lloc de signatura",             placeholder: "Notaria Pérez, Palma" }, en: { label: "Signing location",               placeholder: "Notary Pérez, Palma" }, de: { label: "Unterzeichnungsort",             placeholder: "Notar Pérez, Palma" } },
  "deal.exclusivity":             { es: { label: "¿Exclusividad?",                  placeholder: "sí" }, ca: { label: "¿Exclusivitat?",                placeholder: "sí" }, en: { label: "Exclusivity",                    placeholder: "yes" }, de: { label: "Exklusivität",                   placeholder: "ja" } },
  "deal.exclusivity_months":      { es: { label: "Duración de la exclusividad (meses)", placeholder: "6" }, ca: { label: "Durada de l'exclusivitat (mesos)", placeholder: "6" }, en: { label: "Exclusivity duration (months)",   placeholder: "6" }, de: { label: "Exklusivitätsdauer (Monate)",   placeholder: "6" } },
  "deal.exclusivity_notice_days": { es: { label: "Preaviso de no renovación (días)", placeholder: "30" }, ca: { label: "Preavís de no renovació (dies)", placeholder: "30" }, en: { label: "Non-renewal notice (days)",        placeholder: "30" }, de: { label: "Nicht-Verlängerungsfrist (Tage)", placeholder: "30" } },
  "deal.exclusivity_renewal":     { es: { label: "Renovación automática encargo",   placeholder: "no" }, ca: { label: "Renovació automàtica encàrrec",   placeholder: "no" }, en: { label: "Mandate auto-renewal",            placeholder: "no" }, de: { label: "Automatische Verlängerung",       placeholder: "nein" } },
  "deal.mandate_duration_months": { es: { label: "Duración del encargo (meses)",    placeholder: "6" }, ca: { label: "Durada de l'encàrrec (mesos)",   placeholder: "6" }, en: { label: "Mandate duration (months)",        placeholder: "6" }, de: { label: "Auftragsdauer (Monate)",          placeholder: "6" } },
  "deal.mandate_auto_renewal":    { es: { label: "Renovación automática del encargo", placeholder: "no" }, ca: { label: "Renovació automàtica de l'encàrrec", placeholder: "no" }, en: { label: "Mandate auto-renewal",           placeholder: "no" }, de: { label: "Automatische Aufragsverlängerung", placeholder: "nein" } },
  "deal.direct_sale_protection":  { es: { label: "Protección venta directa",        placeholder: "sí" }, ca: { label: "Protecció venda directa",        placeholder: "sí" }, en: { label: "Direct sale protection",          placeholder: "yes" }, de: { label: "Direktverkaufsschutz",            placeholder: "ja" } },
  "deal.post_exclusivity_protection_months": { es: { label: "Meses protección post-exclusividad", placeholder: "3" }, ca: { label: "Mesos protecció post-exclusivitat", placeholder: "3" }, en: { label: "Post-exclusivity protection (months)", placeholder: "3" }, de: { label: "Schutzfrist nach Exklusivität (Monate)", placeholder: "3" } },
  "deal.doc_review_condition":    { es: { label: "Condición revisión documental",   placeholder: "sujeto a revisión" }, ca: { label: "Condició revisió documental",    placeholder: "subjecte a revisió" }, en: { label: "Document review condition",       placeholder: "subject to review" }, de: { label: "Dokumentenprüfungsbedingung",    placeholder: "vorbehaltlich Prüfung" } },
  "deal.possession_agreement":    { es: { label: "Acuerdo de posesión",             placeholder: "en el momento de la firma" }, ca: { label: "Acord de possessió",            placeholder: "en el moment de la signatura" }, en: { label: "Possession agreement",           placeholder: "at signing" }, de: { label: "Besitzübergabevereinbarung",     placeholder: "bei Unterzeichnung" } },
  "deal.offer_validity_days":     { es: { label: "Validez de la oferta (días)",     placeholder: "15" }, ca: { label: "Validesa de l'oferta (dies)",    placeholder: "15" }, en: { label: "Offer validity (days)",           placeholder: "15" }, de: { label: "Angebotsgültigkeit (Tage)",       placeholder: "15" } },
  "deal.visit_notes":             { es: { label: "Notas de la visita",              placeholder: "Visita realizada con comprador" }, ca: { label: "Notes de la visita",            placeholder: "Visita realitzada amb el comprador" }, en: { label: "Visit notes",                    placeholder: "Visit conducted with buyer" }, de: { label: "Besichtigungsnotizen",           placeholder: "Besichtigung mit Käufer durchgeführt" } },
  "deal.origin_contract_type":    { es: { label: "Tipo de contrato de origen",      placeholder: "arras" }, ca: { label: "Tipus de contracte d'origen",    placeholder: "arres" }, en: { label: "Origin contract type",            placeholder: "deposit contract" }, de: { label: "Art des Ursprungsvertrags",       placeholder: "Anzahlungsvertrag" } },
  "deal.origin_contract_date":    { es: { label: "Fecha del contrato de origen",    placeholder: "01/03/2026" }, ca: { label: "Data del contracte d'origen",    placeholder: "01/03/2026" }, en: { label: "Origin contract date",            placeholder: "03/01/2026" }, de: { label: "Datum des Ursprungsvertrags",     placeholder: "01.03.2026" } },
  // ── Keys (entrega de llaves) ────────────────────────────────────────────────
  "keys.main_door_qty":   { es: { label: "Llaves puerta principal (cantidad)",  placeholder: "2" }, ca: { label: "Claus porta principal (quantitat)",  placeholder: "2" }, en: { label: "Main door keys (qty)",     placeholder: "2" }, de: { label: "Hauptschlüssel (Anzahl)",          placeholder: "2" } },
  "keys.main_door_notes": { es: { label: "Llaves puerta principal (notas)",     placeholder: "Llave Yale" }, ca: { label: "Claus porta principal (notes)",     placeholder: "Clau Yale" }, en: { label: "Main door keys (notes)",   placeholder: "Yale key" }, de: { label: "Hauptschlüssel (Notizen)",         placeholder: "Yale-Schlüssel" } },
  "keys.mailbox_qty":     { es: { label: "Llaves buzón (cantidad)",             placeholder: "2" }, ca: { label: "Claus bústia (quantitat)",           placeholder: "2" }, en: { label: "Mailbox keys (qty)",       placeholder: "2" }, de: { label: "Briefkastenschlüssel (Anzahl)",    placeholder: "2" } },
  "keys.mailbox_notes":   { es: { label: "Llaves buzón (notas)",                placeholder: "Buzón 3B" }, ca: { label: "Claus bústia (notes)",              placeholder: "Bústia 3B" }, en: { label: "Mailbox keys (notes)",     placeholder: "Mailbox 3B" }, de: { label: "Briefkastenschlüssel (Notizen)",   placeholder: "Briefkasten 3B" } },
  "keys.garage_qty":      { es: { label: "Mandos/llaves garaje (cantidad)",     placeholder: "1" }, ca: { label: "Mandaments/claus garatge (quantitat)", placeholder: "1" }, en: { label: "Garage keys/remotes (qty)", placeholder: "1" }, de: { label: "Garagenschlüssel/-fernbedienung (Anzahl)", placeholder: "1" } },
  "keys.garage_notes":    { es: { label: "Mandos/llaves garaje (notas)",        placeholder: "Mando Came" }, ca: { label: "Mandaments/claus garatge (notes)",  placeholder: "Comandament Came" }, en: { label: "Garage keys/remotes (notes)", placeholder: "Came remote" }, de: { label: "Garagenschlüssel (Notizen)",       placeholder: "Came Fernbedienung" } },
  "keys.remote_qty":      { es: { label: "Mandos a distancia (cantidad)",       placeholder: "2" }, ca: { label: "Comandaments a distància (quantitat)", placeholder: "2" }, en: { label: "Remote controls (qty)",    placeholder: "2" }, de: { label: "Fernbedienungen (Anzahl)",         placeholder: "2" } },
  "keys.remote_notes":    { es: { label: "Mandos a distancia (notas)",          placeholder: "Portero automático" }, ca: { label: "Comandaments (notes)",             placeholder: "Porter automàtic" }, en: { label: "Remote controls (notes)",  placeholder: "Intercom" }, de: { label: "Fernbedienungen (Notizen)",        placeholder: "Gegensprechanlage" } },
  "keys.card_qty":        { es: { label: "Tarjetas de acceso (cantidad)",       placeholder: "2" }, ca: { label: "Targetes d'accés (quantitat)",       placeholder: "2" }, en: { label: "Access cards (qty)",       placeholder: "2" }, de: { label: "Zugangskarten (Anzahl)",           placeholder: "2" } },
  "keys.card_notes":      { es: { label: "Tarjetas de acceso (notas)",          placeholder: "Acceso piscina" }, ca: { label: "Targetes d'accés (notes)",          placeholder: "Accés piscina" }, en: { label: "Access cards (notes)",     placeholder: "Pool access" }, de: { label: "Zugangskarten (Notizen)",          placeholder: "Poolzugang" } },
  "keys.other_qty":       { es: { label: "Otras llaves/mandos (cantidad)",      placeholder: "1" }, ca: { label: "Altres claus/mandaments (quantitat)", placeholder: "1" }, en: { label: "Other keys/remotes (qty)", placeholder: "1" }, de: { label: "Sonstige Schlüssel (Anzahl)",       placeholder: "1" } },
  "keys.other_notes":     { es: { label: "Otras llaves/mandos (notas)",         placeholder: "Trastero" }, ca: { label: "Altres claus (notes)",               placeholder: "Traster" }, en: { label: "Other keys (notes)",       placeholder: "Storage room" }, de: { label: "Sonstige Schlüssel (Notizen)",      placeholder: "Abstellraum" } },
  // ── Property (extended) ────────────────────────────────────────────────────
  "property.delivery_condition":  { es: { label: "Condición de entrega del inmueble", placeholder: "libre de ocupantes" }, ca: { label: "Condició de lliurament de l'immoble", placeholder: "lliure d'ocupants" }, en: { label: "Property delivery condition",    placeholder: "vacant possession" }, de: { label: "Übergabezustand der Immobilie",  placeholder: "frei von Bewohnern" } },
  "property.description":         { es: { label: "Descripción del inmueble",    placeholder: "Piso de 3 habitaciones en primera línea" }, ca: { label: "Descripció de l'immoble",       placeholder: "Pis de 3 habitacions en primera línia" }, en: { label: "Property description",           placeholder: "3-bedroom seafront apartment" }, de: { label: "Immobilienbeschreibung",          placeholder: "3-Zimmer-Wohnung in Meereslage" } },
  "property.rooms":               { es: { label: "Número de habitaciones",      placeholder: "3" }, ca: { label: "Nombre d'habitacions",             placeholder: "3" }, en: { label: "Number of rooms",                placeholder: "3" }, de: { label: "Anzahl der Zimmer",              placeholder: "3" } },
  "property.cadastral_area":      { es: { label: "Superficie catastral (m²)",   placeholder: "120" }, ca: { label: "Superfície cadastral (m²)",        placeholder: "120" }, en: { label: "Cadastral area (m²)",            placeholder: "120" }, de: { label: "Katasterfläche (m²)",            placeholder: "120" } },
  "property.registered_area":     { es: { label: "Superficie registral (m²)",   placeholder: "118" }, ca: { label: "Superfície registral (m²)",        placeholder: "118" }, en: { label: "Registered area (m²)",           placeholder: "118" }, de: { label: "Eingetragene Fläche (m²)",       placeholder: "118" } },
  "property.registry_office":     { es: { label: "Registro de la propiedad",    placeholder: "Registro nº 1 de Palma" }, ca: { label: "Registre de la propietat",         placeholder: "Registre nº 1 de Palma" }, en: { label: "Land registry office",           placeholder: "Land Registry No. 1 of Palma" }, de: { label: "Grundbuchamt",                   placeholder: "Grundbuchamt Nr. 1 Palma" } },
  "property.registry_record":     { es: { label: "Inscripción registral",       placeholder: "Tomo 123, Folio 45" }, ca: { label: "Inscripció registral",             placeholder: "Tom 123, Foli 45" }, en: { label: "Registry record",                placeholder: "Volume 123, Folio 45" }, de: { label: "Grundbucheintrag",               placeholder: "Band 123, Blatt 45" } },
  "property.occupation_status":   { es: { label: "Estado de ocupación",         placeholder: "desocupado" }, ca: { label: "Estat d'ocupació",                placeholder: "desocupat" }, en: { label: "Occupation status",              placeholder: "vacant" }, de: { label: "Belegungsstatus",                placeholder: "leer" } },
  "property.ibi_status":          { es: { label: "Estado IBI",                  placeholder: "al corriente" }, ca: { label: "Estat IBI",                       placeholder: "al corrent" }, en: { label: "Property tax (IBI) status",       placeholder: "up to date" }, de: { label: "Grundsteuer-Status",             placeholder: "aktuell" } },
  "property.charges":             { es: { label: "Cargas y gravámenes",          placeholder: "ninguna" }, ca: { label: "Càrregues i gravàmens",            placeholder: "cap" }, en: { label: "Charges and encumbrances",        placeholder: "none" }, de: { label: "Lasten und Belastungen",          placeholder: "keine" } },
  "property.mortgage_pending":    { es: { label: "Hipoteca pendiente",           placeholder: "50.000 €" }, ca: { label: "Hipoteca pendent",                placeholder: "50.000 €" }, en: { label: "Pending mortgage",               placeholder: "€ 50,000" }, de: { label: "Ausstehende Hypothek",           placeholder: "50.000 €" } },
  "property.community_debt_certificate": { es: { label: "Certificado deudas comunidad", placeholder: "0 €" }, ca: { label: "Certificat deutes comunitat",   placeholder: "0 €" }, en: { label: "Community debt certificate",      placeholder: "€ 0" }, de: { label: "Gemeinschaftsschulden-Zertifikat", placeholder: "0 €" } },
  "property.nota_simple_date":    { es: { label: "Fecha nota simple",            placeholder: "01/06/2026" }, ca: { label: "Data nota simple",               placeholder: "01/06/2026" }, en: { label: "Nota simple date",               placeholder: "06/01/2026" }, de: { label: "Datum nota simple",              placeholder: "01.06.2026" } },
  "property.nrua_number":         { es: { label: "Número NRUA / ETV",           placeholder: "ETV-2024-001" }, ca: { label: "Número NRUA / ETV",              placeholder: "ETV-2024-001" }, en: { label: "NRUA / ETV number",              placeholder: "ETV-2024-001" }, de: { label: "NRUA / ETV-Nummer",              placeholder: "ETV-2024-001" } },
  "property.etv_license":         { es: { label: "Licencia ETV",                placeholder: "ETV-2020-0001" }, ca: { label: "Llicència ETV",                  placeholder: "ETV-2020-0001" }, en: { label: "ETV license",                    placeholder: "ETV-2020-0001" }, de: { label: "ETV-Lizenz",                     placeholder: "ETV-2020-0001" } },
  "property.ite_certificate":     { es: { label: "Certificado ITE",             placeholder: "ITE-2023-001" }, ca: { label: "Certificat ITE",                 placeholder: "ITE-2023-001" }, en: { label: "ITE certificate",                placeholder: "ITE-2023-001" }, de: { label: "ITE-Zertifikat",                 placeholder: "ITE-2023-001" } },
  "property.habitation_cert_expiry": { es: { label: "Caducidad cédula habitabilidad", placeholder: "31/12/2030" }, ca: { label: "Caducitat cèdula habitabilitat",  placeholder: "31/12/2030" }, en: { label: "Habitation cert. expiry",         placeholder: "12/31/2030" }, de: { label: "Ablauf Wohnfähigkeitsnachweis",   placeholder: "31.12.2030" } },
  "property.capacity":            { es: { label: "Capacidad máxima (personas)",  placeholder: "6" }, ca: { label: "Capacitat màxima (persones)",       placeholder: "6" }, en: { label: "Maximum capacity (persons)",       placeholder: "6" }, de: { label: "Maximale Kapazität (Personen)",   placeholder: "6" } },
  "property.max_capacity":        { es: { label: "Aforo máximo",                 placeholder: "6" }, ca: { label: "Aforament màxim",                  placeholder: "6" }, en: { label: "Maximum occupancy",               placeholder: "6" }, de: { label: "Maximale Belegung",               placeholder: "6" } },
  "property.title_origin":        { es: { label: "Título de propiedad (origen)", placeholder: "compraventa escritura pública" }, ca: { label: "Títol de propietat (origen)",     placeholder: "compravenda escriptura pública" }, en: { label: "Title origin",                   placeholder: "public deed of sale" }, de: { label: "Eigentumsursprung",              placeholder: "notarieller Kaufvertrag" } },
  // ── Buyer (extended) ───────────────────────────────────────────────────────
  "buyer.birth_date":             { es: { label: "Fecha de nacimiento (comprador)", placeholder: "01/01/1980" }, ca: { label: "Data de naixement (comprador)",   placeholder: "01/01/1980" }, en: { label: "Buyer's date of birth",          placeholder: "01/01/1980" }, de: { label: "Geburtsdatum des Käufers",       placeholder: "01.01.1980" } },
  "buyer.id_type":                { es: { label: "Tipo de documento (comprador)", placeholder: "DNI" }, ca: { label: "Tipus de document (comprador)",   placeholder: "DNI" }, en: { label: "Buyer's ID type",                placeholder: "passport" }, de: { label: "Ausweisart des Käufers",         placeholder: "Reisepass" } },
  "buyer.id_expiry":              { es: { label: "Caducidad documento (comprador)", placeholder: "01/01/2030" }, ca: { label: "Caducitat document (comprador)",  placeholder: "01/01/2030" }, en: { label: "Buyer's ID expiry",              placeholder: "01/01/2030" }, de: { label: "Ablauf Ausweis (Käufer)",        placeholder: "01.01.2030" } },
  "buyer.tax_id":                 { es: { label: "NIF/CIF fiscal (comprador)",    placeholder: "12345678A" }, ca: { label: "NIF/CIF fiscal (comprador)",       placeholder: "12345678A" }, en: { label: "Buyer's tax ID",                 placeholder: "AB123456" }, de: { label: "Steuer-ID des Käufers",           placeholder: "DE123456789" } },
  "buyer.tax_country":            { es: { label: "País de residencia fiscal",     placeholder: "España" }, ca: { label: "País de residència fiscal",        placeholder: "Espanya" }, en: { label: "Tax residence country",           placeholder: "United Kingdom" }, de: { label: "Steuerdomizil-Land",             placeholder: "Deutschland" } },
  "buyer.professional_activity":  { es: { label: "Actividad profesional (comprador)", placeholder: "empresario" }, ca: { label: "Activitat professional (comprador)", placeholder: "empresari" }, en: { label: "Buyer's profession",             placeholder: "entrepreneur" }, de: { label: "Beruf des Käufers",              placeholder: "Unternehmer" } },
  "buyer.mortgage_bank":          { es: { label: "Banco de la hipoteca",         placeholder: "Banco Santander" }, ca: { label: "Banc de la hipoteca",             placeholder: "Banc Santander" }, en: { label: "Mortgage bank",                  placeholder: "Santander Bank" }, de: { label: "Hypothekenbank",                 placeholder: "Santander Bank" } },
  "buyer.funds_origin":           { es: { label: "Origen de los fondos",         placeholder: "ahorros propios" }, ca: { label: "Origen dels fons",                placeholder: "estalvis propis" }, en: { label: "Funds origin",                   placeholder: "own savings" }, de: { label: "Herkunft der Mittel",            placeholder: "eigene Ersparnisse" } },
  "buyer.is_pep":                 { es: { label: "¿Persona políticamente expuesta (PEP)?", placeholder: "no" }, ca: { label: "¿Persona políticament exposada (PEP)?", placeholder: "no" }, en: { label: "Politically exposed person (PEP)?", placeholder: "no" }, de: { label: "Politisch exponierte Person (PEP)?", placeholder: "nein" } },
  // ── Source of Funds (SOF) ──────────────────────────────────────────────────
  "sof.bank_name":            { es: { label: "Banco de origen de fondos",    placeholder: "Banco Santander" }, ca: { label: "Banc d'origen de fons",          placeholder: "Banc Santander" }, en: { label: "Source of funds bank",       placeholder: "Santander Bank" }, de: { label: "Bank (Mittelherkunft)",          placeholder: "Santander Bank" } },
  "sof.bank_account_last4":   { es: { label: "Últimos 4 dígitos cuenta",     placeholder: "1234" }, ca: { label: "Últims 4 dígits compte",          placeholder: "1234" }, en: { label: "Account last 4 digits",       placeholder: "1234" }, de: { label: "Letzte 4 Kontoziffern",          placeholder: "1234" } },
  "sof.business_activity":    { es: { label: "Actividad empresarial (SOF)",  placeholder: "consultoría" }, ca: { label: "Activitat empresarial (SOF)",    placeholder: "consultoria" }, en: { label: "Business activity (SOF)",     placeholder: "consultancy" }, de: { label: "Geschäftstätigkeit (Mittelherkunft)", placeholder: "Beratung" } },
  "sof.mortgage_bank":        { es: { label: "Banco hipoteca (SOF)",         placeholder: "CaixaBank" }, ca: { label: "Banc hipoteca (SOF)",             placeholder: "CaixaBank" }, en: { label: "Mortgage bank (SOF)",         placeholder: "CaixaBank" }, de: { label: "Hypothekenbank (Mittelherkunft)", placeholder: "CaixaBank" } },
  "sof.mortgage_amount":      { es: { label: "Importe hipoteca (SOF)",       placeholder: "180.000 €" }, ca: { label: "Import hipoteca (SOF)",           placeholder: "180.000 €" }, en: { label: "Mortgage amount (SOF)",       placeholder: "€ 180,000" }, de: { label: "Hypothekenbetrag (Mittelherkunft)", placeholder: "180.000 €" } },
  "sof.inheritance_date":     { es: { label: "Fecha herencia",               placeholder: "01/01/2020" }, ca: { label: "Data herència",                  placeholder: "01/01/2020" }, en: { label: "Inheritance date",            placeholder: "01/01/2020" }, de: { label: "Erbschaftsdatum",                placeholder: "01.01.2020" } },
  "sof.inheritance_notary":   { es: { label: "Notaría herencia",             placeholder: "Notaría López, Madrid" }, ca: { label: "Notaria herència",               placeholder: "Notaria López, Madrid" }, en: { label: "Inheritance notary",          placeholder: "Notary López, Madrid" }, de: { label: "Notar (Erbschaft)",              placeholder: "Notar López, Madrid" } },
  "sof.property_sale_date":   { es: { label: "Fecha venta inmueble anterior", placeholder: "01/06/2024" }, ca: { label: "Data venda immoble anterior",    placeholder: "01/06/2024" }, en: { label: "Previous property sale date", placeholder: "06/01/2024" }, de: { label: "Datum Vorimmobilienverkauf",      placeholder: "01.06.2024" } },
  "sof.property_sale_reference": { es: { label: "Referencia venta anterior", placeholder: "Escritura 123/2024" }, ca: { label: "Referència venda anterior",      placeholder: "Escriptura 123/2024" }, en: { label: "Previous sale reference",    placeholder: "Deed 123/2024" }, de: { label: "Vorreferenz Immobilienverkauf",   placeholder: "Urkunde 123/2024" } },
  "sof.other_description":    { es: { label: "Descripción otro origen fondos", placeholder: "Premio lotería" }, ca: { label: "Descripció altre origen fons",   placeholder: "Premi loteria" }, en: { label: "Other source of funds description", placeholder: "Lottery prize" }, de: { label: "Sonstige Mittelherkunft",        placeholder: "Lotteriegewinn" } },
  "sof.pep_details":          { es: { label: "Detalles PEP",                 placeholder: "Cargo público en..." }, ca: { label: "Detalls PEP",                    placeholder: "Càrrec públic a..." }, en: { label: "PEP details",                 placeholder: "Public office in..." }, de: { label: "PEP-Details",                    placeholder: "Öffentliches Amt in..." } },
  // ── Supply (suministros) ───────────────────────────────────────────────────
  "supply.electricity_company":  { es: { label: "Compañía eléctrica",         placeholder: "Endesa" }, ca: { label: "Companyia elèctrica",             placeholder: "Endesa" }, en: { label: "Electricity company",        placeholder: "Endesa" }, de: { label: "Stromversorger",                 placeholder: "Endesa" } },
  "supply.electricity_contract": { es: { label: "Nº contrato electricidad",   placeholder: "ES00-0000-0000-0000" }, ca: { label: "Nº contracte electricitat",      placeholder: "ES00-0000-0000-0000" }, en: { label: "Electricity contract no.",   placeholder: "ES00-0000-0000-0000" }, de: { label: "Stromvertragsnummer",            placeholder: "ES00-0000-0000-0000" } },
  "supply.electricity_reading":  { es: { label: "Lectura contador electricidad", placeholder: "12345 kWh" }, ca: { label: "Lectura comptador electricitat",  placeholder: "12345 kWh" }, en: { label: "Electricity meter reading",   placeholder: "12345 kWh" }, de: { label: "Stromzählerstand",               placeholder: "12345 kWh" } },
  "supply.water_company":        { es: { label: "Compañía agua",               placeholder: "EMAYA" }, ca: { label: "Companyia aigues",                placeholder: "EMAYA" }, en: { label: "Water company",               placeholder: "EMAYA" }, de: { label: "Wasserversorger",                placeholder: "EMAYA" } },
  "supply.water_contract":       { es: { label: "Nº contrato agua",            placeholder: "AGU-0000-001" }, ca: { label: "Nº contracte aigues",             placeholder: "AGU-0000-001" }, en: { label: "Water contract no.",          placeholder: "AGU-0000-001" }, de: { label: "Wasservertragsnummer",           placeholder: "AGU-0000-001" } },
  "supply.water_reading":        { es: { label: "Lectura contador agua",       placeholder: "1234 m³" }, ca: { label: "Lectura comptador aigues",         placeholder: "1234 m³" }, en: { label: "Water meter reading",         placeholder: "1234 m³" }, de: { label: "Wasserzählerstand",              placeholder: "1234 m³" } },
  "supply.gas_company":          { es: { label: "Compañía gas",                placeholder: "Naturgy" }, ca: { label: "Companyia gas",                   placeholder: "Naturgy" }, en: { label: "Gas company",                 placeholder: "Naturgy" }, de: { label: "Gasversorger",                   placeholder: "Naturgy" } },
  "supply.gas_contract":         { es: { label: "Nº contrato gas",             placeholder: "GAS-0000-001" }, ca: { label: "Nº contracte gas",                placeholder: "GAS-0000-001" }, en: { label: "Gas contract no.",            placeholder: "GAS-0000-001" }, de: { label: "Gasvertragsnummer",              placeholder: "GAS-0000-001" } },
  "supply.gas_reading":          { es: { label: "Lectura contador gas",        placeholder: "1234 m³" }, ca: { label: "Lectura comptador gas",            placeholder: "1234 m³" }, en: { label: "Gas meter reading",           placeholder: "1234 m³" }, de: { label: "Gaszählerstand",                 placeholder: "1234 m³" } },
  // ── Tenancy (arrendamiento) ────────────────────────────────────────────────
  "tenancy.rent_amount":          { es: { label: "Renta mensual",              placeholder: "1.200 €/mes" }, ca: { label: "Renda mensual",                  placeholder: "1.200 €/mes" }, en: { label: "Monthly rent",               placeholder: "€ 1,200/month" }, de: { label: "Monatliche Miete",               placeholder: "1.200 €/Monat" } },
  "tenancy.start_date":           { es: { label: "Fecha inicio arrendamiento", placeholder: "01/07/2026" }, ca: { label: "Data inici arrendament",          placeholder: "01/07/2026" }, en: { label: "Tenancy start date",         placeholder: "07/01/2026" }, de: { label: "Mietbeginn",                     placeholder: "01.07.2026" } },
  "tenancy.end_date":             { es: { label: "Fecha fin arrendamiento",    placeholder: "30/06/2027" }, ca: { label: "Data fi arrendament",             placeholder: "30/06/2027" }, en: { label: "Tenancy end date",           placeholder: "06/30/2027" }, de: { label: "Mietende",                       placeholder: "30.06.2027" } },
  "tenancy.duration_years":       { es: { label: "Duración (años)",            placeholder: "1" }, ca: { label: "Durada (anys)",                   placeholder: "1" }, en: { label: "Duration (years)",           placeholder: "1" }, de: { label: "Mietdauer (Jahre)",               placeholder: "1" } },
  "tenancy.duration_days":        { es: { label: "Duración (días)",            placeholder: "365" }, ca: { label: "Durada (dies)",                   placeholder: "365" }, en: { label: "Duration (days)",            placeholder: "365" }, de: { label: "Mietdauer (Tage)",                placeholder: "365" } },
  "tenancy.deposit_amount":       { es: { label: "Fianza",                     placeholder: "2.400 €" }, ca: { label: "Fiança",                          placeholder: "2.400 €" }, en: { label: "Security deposit",           placeholder: "€ 2,400" }, de: { label: "Kaution",                        placeholder: "2.400 €" } },
  "tenancy.deposit_months":       { es: { label: "Meses de fianza",            placeholder: "2" }, ca: { label: "Mesos de fiança",                  placeholder: "2" }, en: { label: "Deposit months",             placeholder: "2" }, de: { label: "Kautionsmonate",                  placeholder: "2" } },
  "tenancy.deposit_payment_method": { es: { label: "Forma pago fianza",        placeholder: "transferencia" }, ca: { label: "Forma pagament fiança",          placeholder: "transferència" }, en: { label: "Deposit payment method",     placeholder: "bank transfer" }, de: { label: "Kautionszahlungsart",             placeholder: "Banküberweisung" } },
  "tenancy.deposit_official_ref": { es: { label: "Referencia oficial fianza",  placeholder: "FIA-2026-001" }, ca: { label: "Referència oficial fiança",      placeholder: "FIA-2026-001" }, en: { label: "Deposit official reference",  placeholder: "DEP-2026-001" }, de: { label: "Offizielle Kautionsnummer",       placeholder: "KAU-2026-001" } },
  "tenancy.deposit_received_date":{ es: { label: "Fecha recepción fianza",     placeholder: "01/07/2026" }, ca: { label: "Data recepció fiança",            placeholder: "01/07/2026" }, en: { label: "Deposit received date",       placeholder: "07/01/2026" }, de: { label: "Kautionseingansdatum",            placeholder: "01.07.2026" } },
  "tenancy.deposit_registered":   { es: { label: "¿Fianza depositada en organismo?", placeholder: "sí" }, ca: { label: "¿Fiança dipositada en organisme?", placeholder: "sí" }, en: { label: "Deposit registered?",        placeholder: "yes" }, de: { label: "Kaution hinterlegt?",             placeholder: "ja" } },
  "tenancy.payment_day":          { es: { label: "Día de pago de la renta",    placeholder: "1" }, ca: { label: "Dia de pagament de la renda",      placeholder: "1" }, en: { label: "Rent payment day",           placeholder: "1" }, de: { label: "Mietzahlungstag",                 placeholder: "1" } },
  "tenancy.payment_method":       { es: { label: "Forma de pago renta",        placeholder: "transferencia bancaria" }, ca: { label: "Forma de pagament renda",        placeholder: "transferència bancària" }, en: { label: "Rent payment method",        placeholder: "bank transfer" }, de: { label: "Mietzahlungsart",                 placeholder: "Banküberweisung" } },
  "tenancy.rent_update_index":    { es: { label: "Índice actualización renta",  placeholder: "IPC" }, ca: { label: "Índex actualització renda",        placeholder: "IPC" }, en: { label: "Rent update index",          placeholder: "CPI" }, de: { label: "Mietanpassungsindex",             placeholder: "VPI" } },
  "tenancy.rent_period":          { es: { label: "Periodicidad de la renta",    placeholder: "mensual" }, ca: { label: "Periodicitat de la renda",        placeholder: "mensual" }, en: { label: "Rent period",                placeholder: "monthly" }, de: { label: "Mietperiode",                     placeholder: "monatlich" } },
  "tenancy.contract_reference":   { es: { label: "Referencia contrato arrendamiento", placeholder: "ARR-2026-001" }, ca: { label: "Referència contracte arrendament", placeholder: "ARR-2026-001" }, en: { label: "Tenancy contract reference", placeholder: "TEN-2026-001" }, de: { label: "Mietvertragsreferenz",            placeholder: "MIE-2026-001" } },
  "tenancy.contract_date":        { es: { label: "Fecha del contrato",          placeholder: "01/07/2026" }, ca: { label: "Data del contracte",             placeholder: "01/07/2026" }, en: { label: "Contract date",              placeholder: "07/01/2026" }, de: { label: "Vertragsdatum",                   placeholder: "01.07.2026" } },
  "tenancy.temporality_cause":    { es: { label: "Causa temporalidad",          placeholder: "viaje de trabajo" }, ca: { label: "Causa temporalitat",             placeholder: "viatge de feina" }, en: { label: "Temporality cause",          placeholder: "work trip" }, de: { label: "Befristungsgrund",                placeholder: "Dienstreise" } },
  "tenancy.cause_documents":      { es: { label: "Documentos justificativos",   placeholder: "contrato de trabajo" }, ca: { label: "Documents justificatius",        placeholder: "contracte de treball" }, en: { label: "Supporting documents",       placeholder: "employment contract" }, de: { label: "Nachweisdokumente",               placeholder: "Arbeitsvertrag" } },
  "tenancy.ibi_party":            { es: { label: "Quién paga el IBI",           placeholder: "propietario" }, ca: { label: "Qui paga l'IBI",                 placeholder: "propietari" }, en: { label: "IBI tax payer",              placeholder: "landlord" }, de: { label: "Grundsteuerzahler",               placeholder: "Eigentümer" } },
  "tenancy.community_charges_party": { es: { label: "Quién paga comunidad",    placeholder: "propietario" }, ca: { label: "Qui paga comunitat",             placeholder: "propietari" }, en: { label: "Community charges payer",    placeholder: "landlord" }, de: { label: "Hausgeldschuldner",               placeholder: "Eigentümer" } },
  "tenancy.additional_guarantee": { es: { label: "Garantía adicional",          placeholder: "aval bancario" }, ca: { label: "Garantia addicional",            placeholder: "aval bancari" }, en: { label: "Additional guarantee",       placeholder: "bank guarantee" }, de: { label: "Zusatzsicherheit",                placeholder: "Bankbürgschaft" } },
  // ── Booking (reserva turística) ────────────────────────────────────────────
  "booking.checkin_date":         { es: { label: "Fecha de entrada",            placeholder: "01/07/2026" }, ca: { label: "Data d'entrada",                 placeholder: "01/07/2026" }, en: { label: "Check-in date",              placeholder: "07/01/2026" }, de: { label: "Anreisedatum",                    placeholder: "01.07.2026" } },
  "booking.checkout_date":        { es: { label: "Fecha de salida",             placeholder: "15/07/2026" }, ca: { label: "Data de sortida",                placeholder: "15/07/2026" }, en: { label: "Check-out date",             placeholder: "07/15/2026" }, de: { label: "Abreisedatum",                    placeholder: "15.07.2026" } },
  "booking.checkin_time":         { es: { label: "Hora de entrada",             placeholder: "16:00" }, ca: { label: "Hora d'entrada",                 placeholder: "16:00" }, en: { label: "Check-in time",              placeholder: "4:00 PM" }, de: { label: "Ankunftszeit",                    placeholder: "16:00 Uhr" } },
  "booking.checkout_time":        { es: { label: "Hora de salida",              placeholder: "11:00" }, ca: { label: "Hora de sortida",                placeholder: "11:00" }, en: { label: "Check-out time",             placeholder: "11:00 AM" }, de: { label: "Abfahrtszeit",                    placeholder: "11:00 Uhr" } },
  "booking.nights":               { es: { label: "Número de noches",            placeholder: "14" }, ca: { label: "Nombre de nits",                  placeholder: "14" }, en: { label: "Number of nights",           placeholder: "14" }, de: { label: "Anzahl der Nächte",               placeholder: "14" } },
  "booking.total_price":          { es: { label: "Precio total de la reserva",  placeholder: "3.500 €" }, ca: { label: "Preu total de la reserva",        placeholder: "3.500 €" }, en: { label: "Total booking price",        placeholder: "€ 3,500" }, de: { label: "Gesamtbuchungspreis",             placeholder: "3.500 €" } },
  "booking.security_deposit":     { es: { label: "Depósito de seguridad",       placeholder: "500 €" }, ca: { label: "Dipòsit de seguretat",            placeholder: "500 €" }, en: { label: "Security deposit",           placeholder: "€ 500" }, de: { label: "Sicherheitsleistung",             placeholder: "500 €" } },
  "booking.tourist_tax":          { es: { label: "Tasa turística",              placeholder: "1,10 €/persona/noche" }, ca: { label: "Taxa turística",                 placeholder: "1,10 €/persona/nit" }, en: { label: "Tourist tax",                placeholder: "€ 1.10/person/night" }, de: { label: "Kurtaxe",                         placeholder: "1,10 €/Person/Nacht" } },
  "booking.guest_count":          { es: { label: "Número de adultos",           placeholder: "4" }, ca: { label: "Nombre d'adults",                  placeholder: "4" }, en: { label: "Number of adults",           placeholder: "4" }, de: { label: "Anzahl Erwachsene",               placeholder: "4" } },
  "booking.adults":               { es: { label: "Adultos",                     placeholder: "4" }, ca: { label: "Adults",                           placeholder: "4" }, en: { label: "Adults",                     placeholder: "4" }, de: { label: "Erwachsene",                      placeholder: "4" } },
  "booking.minors":               { es: { label: "Menores de edad",             placeholder: "0" }, ca: { label: "Menors d'edat",                    placeholder: "0" }, en: { label: "Minors",                     placeholder: "0" }, de: { label: "Minderjährige",                   placeholder: "0" } },
  "booking.pets_allowed":         { es: { label: "¿Mascotas permitidas?",       placeholder: "no" }, ca: { label: "¿Mascotas permeses?",              placeholder: "no" }, en: { label: "Pets allowed?",              placeholder: "no" }, de: { label: "Haustiere erlaubt?",              placeholder: "nein" } },
  "booking.smoking_allowed":      { es: { label: "¿Está permitido fumar?",      placeholder: "no" }, ca: { label: "¿Es permet fumar?",                placeholder: "no" }, en: { label: "Smoking allowed?",           placeholder: "no" }, de: { label: "Rauchen erlaubt?",                placeholder: "nein" } },
  "booking.prepayment":           { es: { label: "Pago anticipado",             placeholder: "30 %" }, ca: { label: "Pagament anticipat",              placeholder: "30 %" }, en: { label: "Prepayment",                 placeholder: "30 %" }, de: { label: "Vorauszahlung",                   placeholder: "30 %" } },
  "booking.cancellation_policy":  { es: { label: "Política de cancelación",     placeholder: "sin devolución pasadas 48h" }, ca: { label: "Política de cancel·lació",        placeholder: "sense devolució passades 48h" }, en: { label: "Cancellation policy",        placeholder: "non-refundable after 48h" }, de: { label: "Stornierungsrichtlinie",          placeholder: "nicht erstattungsfähig nach 48h" } },
  "booking.free_cancellation_date": { es: { label: "Fecha cancelación gratuita", placeholder: "15/06/2026" }, ca: { label: "Data cancel·lació gratuïta",     placeholder: "15/06/2026" }, en: { label: "Free cancellation until",    placeholder: "06/15/2026" }, de: { label: "Kostenlose Stornierung bis",      placeholder: "15.06.2026" } },
  // ── Tenant (extended) ──────────────────────────────────────────────────────
  "tenant.permanent_address":     { es: { label: "Domicilio habitual del arrendatario", placeholder: "Calle Mayor 5, Madrid" }, ca: { label: "Domicili habitual de l'arrendatari", placeholder: "Carrer Major 5, Madrid" }, en: { label: "Tenant's permanent address",  placeholder: "5 High Street, London" }, de: { label: "Dauerwohnsitz des Mieters",      placeholder: "Hauptstraße 5, Berlin" } },
};

// ── Namespace fallback ─────────────────────────────────────────────────────────

const NS_LABEL: Record<WizardLang, Record<string, string>> = {
  es: { booking: "Reserva", inventory: "Inventario", keys: "Llaves", sof: "Origen de fondos", supply: "Suministros", tenancy: "Arrendamiento", deal: "Expediente", buyer: "Comprador", seller: "Vendedor", landlord: "Arrendador", tenant: "Arrendatario", guest: "Huésped", agent: "Agente", property: "Inmueble", organization: "Agencia", document: "Documento", party_1: "Parte 1", party_2: "Parte 2", mandate: "Encargo" },
  ca: { booking: "Reserva", inventory: "Inventari", keys: "Claus", sof: "Origen de fons", supply: "Subministraments", tenancy: "Arrendament", deal: "Expedient", buyer: "Comprador", seller: "Venedor", landlord: "Arrendador", tenant: "Arrendatari", guest: "Hoste", agent: "Agent", property: "Immoble", organization: "Agència", document: "Document", party_1: "Part 1", party_2: "Part 2", mandate: "Encàrrec" },
  en: { booking: "Booking", inventory: "Inventory", keys: "Keys", sof: "Source of funds", supply: "Utilities", tenancy: "Tenancy", deal: "File", buyer: "Buyer", seller: "Seller", landlord: "Landlord", tenant: "Tenant", guest: "Guest", agent: "Agent", property: "Property", organization: "Agency", document: "Document", party_1: "Party 1", party_2: "Party 2", mandate: "Mandate" },
  de: { booking: "Buchung", inventory: "Inventar", keys: "Schlüssel", sof: "Mittelherkunft", supply: "Versorgung", tenancy: "Mietverhältnis", deal: "Akte", buyer: "Käufer", seller: "Verkäufer", landlord: "Vermieter", tenant: "Mieter", guest: "Gast", agent: "Makler", property: "Immobilie", organization: "Agentur", document: "Dokument", party_1: "Partei 1", party_2: "Partei 2", mandate: "Auftrag" },
};

function normalizeLang(lang?: string | null): WizardLang {
  if (lang === "ca" || lang === "en" || lang === "de") return lang;
  return "es";
}

function fieldLabel(key: string, lang: WizardLang): string {
  if (FIELD_I18N[key]) {
    return FIELD_I18N[key][lang]?.label ?? FIELD_I18N[key].es.label;
  }
  // Smart fallback: translate namespace + humanize key part
  const [ns, ...rest] = key.split(".");
  const nsLabel = NS_LABEL[lang]?.[ns] ?? ns;
  const keyPart = rest.join(".").replace(/_/g, " ");
  return `${nsLabel} · ${keyPart}`;
}

function fieldPlaceholder(key: string, lang: WizardLang): string {
  if (FIELD_I18N[key]) {
    return FIELD_I18N[key][lang]?.placeholder ?? FIELD_I18N[key].es.placeholder;
  }
  const fallback: Record<WizardLang, string> = { es: `Ej: valor`, ca: `Ex: valor`, en: `E.g.: value`, de: `Z.B.: Wert` };
  return fallback[lang];
}

// ── Exported i18n helpers for the field vault drawer ─────────────────────────

export type { WizardLang };
export { normalizeLang, fieldLabel, fieldPlaceholder };

/** All explicitly mapped field keys, grouped by namespace prefix. */
export const FIELD_GROUPS: Record<string, string[]> = (() => {
  const groups: Record<string, string[]> = {};
  for (const key of Object.keys(FIELD_I18N)) {
    const ns = key.split(".")[0];
    if (!groups[ns]) groups[ns] = [];
    groups[ns].push(key);
  }
  return groups;
})();

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
  /** Folder language (es / ca / en / de). Drives field label language. */
  language?: string | null;
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
  language,
  preselectTemplateId,
  onSuccess,
  onClose,
}: WizardProps) {
  const lang = normalizeLang(language);
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
      const [res, vault] = await Promise.all([
        previewMissingFields(folderId, { template_version_id: versionId, overrides: {} }),
        getFolderFieldVault(folderId).catch(() => ({} as Record<string, string>)),
      ]);
      setMissingFields(res.missing_fields ?? []);
      setPrerequisiteIssues(res.prerequisite_issues ?? {});
      setPreviewBlocked(false);
      // Pre-fill from vault first, then keep any values already typed in the wizard
      const initValues: Record<string, string> = {};
      for (const f of res.missing_fields ?? []) {
        initValues[f] = fieldValues[f] || vault[f] || "";
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
      // Persist filled values back to the folder vault for future reuse
      if (Object.keys(payload).length > 0) {
        void putFolderFieldVault(folderId, payload).catch(() => undefined);
      }
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
                          {fieldLabel(field, lang)}
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
                          placeholder={fieldPlaceholder(field, lang)}
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
