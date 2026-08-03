<!-- markdownlint-disable MD001 MD013 MD033 MD041 MD060 -->

<div align="center">

<img src="./frontend/public/brand/anclora-nexus.png" alt="Anclora Nexus" width="132" />

# Anclora Nexus

### Sistema intern de coordinació operativa per a documents i contractes

Plataforma centralitzada per a la gestió de carpetes d'operacions, documents, plantilles i fluxos de signatura en transaccions immobiliàries.

[Español](./README.md) · **Català** · [English](./README.en.md) · [Deutsch](./README.de.md)

<br />

![Anclora](https://img.shields.io/badge/Anclora-ecosystem-111827)
![Categoria](https://img.shields.io/badge/categoria-Interna-D4AF37)
![Idiomes](https://img.shields.io/badge/idiomes%20producte-4-047857)

</div>

---

> [!IMPORTANT]
> Repositori intern de l'ecosistema Anclora. Aquesta eina coordina operacions crítiques amb documents i dades reals de transaccions. No publiqueu detalls operatius, credencials, dades de clients ni lògica sensible fora dels canals autoritzats.

## Què és

Nexus és la plataforma operativa central per a la gestió de documents i contractes en el cicle de vida de transaccions immobiliàries. Coordina carpetes d'operacions, gestiona plantilles de documents, genera fluxos de signatura electrònica (DocuSeal), integra la validació de contractes mitjançant Advisor AI i proporciona vistes de control per a equips interns.

## Categoria a l'ecosistema

| Camp | Valor |
|---|---|
| Categoria | Interna |
| Accent de marca | `#D4AF37` |
| Tipografia | Inter |
| Repositori canònic | `anclora-nexus` |

## Funcionalitats principals

- **Gestió de carpetes d'operacions:** crear, llistar i gestionar carpetes vinculades a deals, propietats i parts interessades (leads, sellers, empreses, contactes)
- **Cicle de vida de documents:** pujada/baixada xifrada, versionat de documents, revisió legal i gestió de retenció conforme a polítiques
- **Biblioteca de plantilles:** plantilles per família de documents, metadades de qualitat, generació automàtica i validació
- **Fluxos de signatura:** integració amb DocuSeal, seguiment d'envelopes de signatura, immutabilitat de còpies signades
- **Validació de contractes:** integració amb Advisor AI per a la revisió automàtica de clàusules i riscos legals
- **Coordinació operativa:** indicadors, auditoria d'accions i vistes consolidades per a equips

## Stack tecnològic

| Àrea | Tecnologia |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Autenticació | Supabase Auth + NextAuth |
| Emmagatzematge | Supabase Storage (xifrat AES-GCM) |
| Estils | Tailwind CSS, Radix UI, shadcn |
| Testing | Vitest + React Testing Library |
| Components UI | Lucide React, Framer Motion |
| Documents | jsPDF, react-markdown, doc-viewer |

## Inici local

```bash
cd frontend
npm install
npm run dev
```

El servidor estarà disponible a `http://localhost:3000`.

## Idiomes suportats

El producte en producció admet 4 idiomes: Español (predeterminat), Català, English, Deutsch (`INTERNAL_LOCALES`, `frontend/src/lib/anclora-language-toggle.ts`). Aquesta documentació es manté en els 4 idiomes del producte.

## Documentació i governança

- Especificació de fluxos: [`docs/DMS_*.md`](./docs/)
- Contractes de marca i governança: `docs/standards/`
- Bóveda Anclora (font de veritat): `contracts/` i `docs/governance/`

---

<div align="center">

### Anclora Group

Ús intern

</div>
