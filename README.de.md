<!-- markdownlint-disable MD001 MD013 MD033 MD041 MD060 -->

<div align="center">

<img src="./frontend/public/brand/anclora-nexus.png" alt="Anclora Nexus" width="132" />

# Anclora Nexus

### Internes operatives Koordinationssystem für Dokumente und Verträge

Zentralisierte Plattform für die Verwaltung von Vorgangsordnern, Dokumenten, Vorlagen und Unterschrifts-Workflows bei Immobilientransaktionen.

[Español](./README.md) · [Català](./README.ca.md) · [English](./README.en.md) · **Deutsch**

<br />

![Anclora](https://img.shields.io/badge/Anclora-ecosystem-111827)
![Kategorie](https://img.shields.io/badge/kategorie-Intern-D4AF37)
![Sprachen](https://img.shields.io/badge/produktsprachen-4-047857)

</div>

---

> [!IMPORTANT]
> Internes Repository des Anclora-Ökosystems. Dieses Tool koordiniert kritische Vorgänge mit echten Transaktionsdokumenten und -daten. Keine operativen Details, Zugangsdaten, Kundendaten oder sensible Logik außerhalb autorisierter Kanäle veröffentlichen.

## Was es ist

Nexus ist die zentrale operative Plattform für die Verwaltung von Dokumenten und Verträgen über den gesamten Lebenszyklus von Immobilientransaktionen. Sie koordiniert Vorgangsordner, verwaltet Dokumentvorlagen, erzeugt E-Signatur-Workflows (DocuSeal), integriert Vertragsvalidierung via Advisor AI und bietet Überblicksansichten für interne Teams.

## Kategorie im Ökosystem

| Feld | Wert |
|---|---|
| Kategorie | Intern |
| Markenakzent | `#D4AF37` |
| Typografie | Inter |
| Kanonisches Repository | `anclora-nexus` |

## Kernfunktionen

- **Verwaltung von Vorgangsordnern:** Ordner verknüpft mit Deals, Immobilien und Beteiligten (Leads, Verkäufer, Unternehmen, Kontakte) erstellen, auflisten und verwalten
- **Dokumentlebenszyklus:** verschlüsselter Up-/Download, Dokumentversionierung, rechtliche Prüfung und richtlinienkonforme Aufbewahrung
- **Vorlagenbibliothek:** Vorlagen nach Dokumentfamilie, Qualitätsmetadaten, automatische Generierung und Validierung
- **Unterschrifts-Workflows:** DocuSeal-Integration, Tracking von Signatur-Envelopes, Unveränderlichkeit signierter Kopien
- **Vertragsvalidierung:** Advisor-AI-Integration für automatische Klausel- und Rechtsrisikoprüfung
- **Operative Koordination:** Kennzahlen, Aktionsprotokollierung und konsolidierte Ansichten für Teams

## Technologie-Stack

| Bereich | Technologie |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Authentifizierung | Supabase Auth + NextAuth |
| Speicher | Supabase Storage (AES-GCM-verschlüsselt) |
| Styling | Tailwind CSS, Radix UI, shadcn |
| Tests | Vitest + React Testing Library |
| UI-Komponenten | Lucide React, Framer Motion |
| Dokumente | jsPDF, react-markdown, doc-viewer |

## Lokaler Start

```bash
cd frontend
npm install
npm run dev
```

Der Server ist unter `http://localhost:3000` erreichbar.

## Unterstützte Sprachen

Das Produkt unterstützt in der Produktion 4 Sprachen: Español (Standard), Català, English, Deutsch (`INTERNAL_LOCALES`, `frontend/src/lib/anclora-language-toggle.ts`). Diese Dokumentation wird in allen 4 Produktsprachen gepflegt.

## Dokumentation und Governance

- Workflow-Spezifikationen: [`docs/DMS_*.md`](./docs/)
- Marken- und Governance-Verträge: `docs/standards/`
- Anclora Vault (Quelle der Wahrheit): `contracts/` und `docs/governance/`

---

<div align="center">

### Anclora Group

Interne Nutzung

</div>
