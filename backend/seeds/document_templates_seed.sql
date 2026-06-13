-- =============================================================
-- Anclora Nexus · document_templates seed
-- 14 plantillas base en español · ES-IB · v0.1-draft
-- Generado: 2026-06-13
-- ⚠️  legal_review_status = 'pending' en todos los registros
-- NO publicar automáticamente. Requiere revisión jurídica humana.
-- =============================================================

BEGIN;

INSERT INTO document_templates (
  template_key, template_family, display_name, operation_type,
  jurisdiction, language, version, legal_review_status,
  brand, storage_path, is_active
) VALUES
  ('arras-penitenciales',        'arras-penitenciales',        'Arras penitenciales',             'compraventa',        'ES-IB', 'es', '0.1-draft', 'pending', 'Anclora Private Estates', 'templates/es/tpl-arras-penitenciales.es.md',        TRUE),
  ('contrato-compraventa',       'contrato-compraventa',       'Contrato de compraventa',         'compraventa',        'ES-IB', 'es', '0.1-draft', 'pending', 'Anclora Private Estates', 'templates/es/tpl-contrato-compraventa.es.md',       TRUE),
  ('oferta-compra',              'oferta-compra',              'Oferta de compra',                'compraventa',        'ES-IB', 'es', '0.1-draft', 'pending', 'Anclora Private Estates', 'templates/es/tpl-oferta-compra.es.md',              TRUE),
  ('contrato-reserva-senal',     'contrato-reserva-senal',     'Contrato de reserva / señal',     'compraventa',        'ES-IB', 'es', '0.1-draft', 'pending', 'Anclora Private Estates', 'templates/es/tpl-contrato-reserva-senal.es.md',     TRUE),
  ('nota-encargo',               'nota-encargo',               'Nota de encargo',                 'captacion',          'ES-IB', 'es', '0.1-draft', 'pending', 'Anclora Private Estates', 'templates/es/tpl-nota-encargo.es.md',               TRUE),
  ('contrato-temporada',         'contrato-temporada',         'Contrato de temporada',           'alquiler_temporada', 'ES-IB', 'es', '0.1-draft', 'pending', 'Anclora Private Estates', 'templates/es/tpl-contrato-temporada.es.md',         TRUE),
  ('contrato-arrendamiento',     'contrato-arrendamiento',     'Contrato de arrendamiento',       'alquiler_residencial','ES-IB','es', '0.1-draft', 'pending', 'Anclora Private Estates', 'templates/es/tpl-contrato-arrendamiento.es.md',     TRUE),
  ('contrato-alquiler-turistico','contrato-alquiler-turistico','Contrato de alquiler turístico',  'alquiler_turistico', 'ES-IB', 'es', '0.1-draft', 'pending', 'Anclora Private Estates', 'templates/es/tpl-contrato-alquiler-turistico.es.md',TRUE),
  ('recibo-fianza',              'recibo-fianza',              'Recibo de fianza',                'alquiler',           'ES-IB', 'es', '0.1-draft', 'pending', 'Anclora Private Estates', 'templates/es/tpl-recibo-fianza.es.md',              TRUE),
  ('acta-entrega-llaves',        'acta-entrega-llaves',        'Acta de entrega de llaves',       'entrega',            'ES-IB', 'es', '0.1-draft', 'pending', 'Anclora Private Estates', 'templates/es/tpl-acta-entrega-llaves.es.md',        TRUE),
  ('mandato-exclusiva',          'mandato-exclusiva',          'Mandato de exclusiva',            'captacion',          'ES-IB', 'es', '0.1-draft', 'pending', 'Anclora Private Estates', 'templates/es/tpl-mandato-exclusiva.es.md',          TRUE),
  ('kyc-identificacion-cliente', 'kyc-identificacion-cliente', 'KYC — Identificación de cliente', 'compliance',         'ES-IB', 'es', '0.1-draft', 'pending', 'Anclora Private Estates', 'templates/es/tpl-kyc-identificacion-cliente.es.md', TRUE),
  ('acuerdo-confidencialidad',   'acuerdo-confidencialidad',   'Acuerdo de confidencialidad',     'general',            'ES-IB', 'es', '0.1-draft', 'pending', 'Anclora Private Estates', 'templates/es/tpl-acuerdo-confidencialidad.es.md',   TRUE),
  ('generico',                   'generico',                   'Genérico',                        'general',            'ES-IB', 'es', '0.1-draft', 'pending', 'Anclora Private Estates', 'templates/es/tpl-generico.es.md',                   TRUE)
ON CONFLICT (template_key) DO UPDATE SET
  display_name          = EXCLUDED.display_name,
  operation_type        = EXCLUDED.operation_type,
  legal_review_status   = EXCLUDED.legal_review_status,
  storage_path          = EXCLUDED.storage_path,
  updated_at            = NOW();

COMMIT;
