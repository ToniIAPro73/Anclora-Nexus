# Prompt - ANCLORA-SPA-001 v1

Construir `Synergi Partner Admission` como capability real del ecosistema Anclora con estas restricciones:

- entrada publica desde `/private-area/partner`
- persistencia de solicitudes con `org_id`
- categorias de partner incluyendo `eco`
- cola interna de revision en Nexus
- aceptacion/rechazo con notas y opcion de notificacion
- fallback `mailto` si SMTP no esta configurado
- UI alineada con contratos de superficies, tipografia e i18n

Resultado esperado:

1. El partner puede enviar su solicitud desde el portal publico.
2. Nexus puede revisar y decidir sobre la solicitud desde una pagina operativa.
3. La feature queda documentada con migracion, spec, test plan, QA y gate.
