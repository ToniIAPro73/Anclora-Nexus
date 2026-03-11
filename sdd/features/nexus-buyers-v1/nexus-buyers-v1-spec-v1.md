# Spec - ANCLORA-NBUY-001 v1.0

## Problema

Buyers existían en prospection, pero como CRM genérico. Faltaba distinguir origen operativo, referral network, señal comercial y vínculo con packs de inteligencia.

## Objetivo

Llevar buyers a un primer nivel operativo comparable al seller-side en intake y priorización, sin cerrar todavía outreach buyer-side completo.

## Alcance

- nuevas columnas en `buyer_profiles`
- scoring mínimo de intake:
  - `intent_score`
  - `trust_score`
  - `capacity_score`
  - `motivation_score`
- soporte explícito para:
  - `partner_referral`
  - `crm_reactivation`
  - `web_inbound`
- referencia opcional a `intelligence_pack_id`
- panel de intake y summary en `/prospection-unified`

## Reglas funcionales

1. `partner_referral` es la fuente más valiosa para el contexto eXp/partner network.
2. Si no llegan scores, backend los calcula.
3. `intelligence_pack_id` es opcional, pero permite alinear buyer demand con Tramuntana, Suroeste u otros packs.
4. La UI debe permitir intake manual rápido y mostrar resumen por fuente.

## Criterio de salida

El usuario puede dar de alta buyers de red/referral, CRM o web, verlos priorizados y entender de dónde vienen y qué calidad comercial tienen.
