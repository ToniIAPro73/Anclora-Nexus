# MANUAL DE USUARIO: Anclora Nexus

## 1. Objetivo del manual
Este manual explica de forma práctica cómo usar Anclora Nexus en el día a día, con foco especial en:
- lectura del dashboard,
- función de cada widget,
- gestión de leads, propiedades, tareas y equipo,
- resolución de incidencias frecuentes de acceso y roles.

## 2. Perfil de usuario y alcance
Anclora Nexus está pensado para operación comercial inmobiliaria con roles organizativos (`owner`, `manager`, `agent`) y trabajo coordinado por módulos.

Este manual cubre:
- uso funcional de frontend,
- criterios operativos recomendados,
- mensajes de error habituales y su interpretación.

## 3. Requisitos previos
- Cuenta de usuario activa.
- Membresía activa en una organización.
- Acceso por navegador actualizado.
- URL de entorno correcta (`localhost` o cloud, según despliegue).

## 4. Acceso a la plataforma
## 4.1 Inicio de sesión
1. Abre la pantalla de login.
2. Selecciona `Iniciar sesión`.
3. Introduce email y contraseña.
4. Pulsa `Acceder`.
5. Si credenciales y membresía son válidas, el sistema te redirige al dashboard.

## 4.2 Crear cuenta (flujo invitado)
1. Selecciona `Crear cuenta`.
2. Introduce email y contraseña.
3. Completa el alta.

Regla importante:
- El alta está orientada a usuarios invitados por organización.
- Si el sistema indica “invitación requerida”, solicita invitación al owner.

## 4.3 Recuperar contraseña
1. Introduce email en login.
2. Pulsa `Olvidé mi contraseña`.
3. Sigue el enlace de recuperación recibido.

## 5. Vista general de la aplicación
Tras iniciar sesión verás menú lateral con:
- `Panel de Control` (dashboard operativo),
- `Contactos`,
- `Propiedades`,
- `Tareas`,
- `Equipo`,
- `Intelligence`,
- `Perfil`.

Cada sección está conectada con datos de organización y permisos por rol.

## 6. Dashboard: guía detallada
El dashboard es el centro de mando diario. Su función es darte situación actual, prioridades y acciones rápidas sin navegar por múltiples pantallas.

## 6.1 Cómo leer el dashboard en 60 segundos
Secuencia recomendada al entrar:
1. Ver indicadores globales (estado y métricas rápidas).
2. Revisar leads recientes y prioridades.
3. Revisar tareas vencidas/hoy.
4. Revisar pipeline de propiedades.
5. Ejecutar acciones rápidas necesarias.

## 6.2 Widgets principales y su función
## A) `QuickStats`
Qué muestra:
- métricas resumidas (volumen de leads, actividad reciente, estado general del pipeline).

Para qué sirve:
- validar en segundos si estás por encima o por debajo de la carga esperada.

Cómo usarlo:
- compara tendencia con tu referencia semanal,
- si ves caída de actividad, prioriza prospección o seguimiento.

## B) `LeadsPulse`
Qué muestra:
- leads recientes,
- datos clave del lead (contacto, estado, prioridad),
- señales de urgencia comercial.

Para qué sirve:
- decidir rápidamente qué lead tocar primero.

Cómo usarlo:
- prioriza leads con mayor intención/urgencia,
- abre detalle del lead para registrar contacto, notas y siguiente acción.

Buenas prácticas:
- no dejes leads nuevos sin primer contacto dentro de la ventana objetivo.

## C) `TasksToday`
Qué muestra:
- tareas del día o vencidas,
- estado de cada tarea (pendiente/completada/cancelada según configuración),
- contexto operativo.

Para qué sirve:
- evitar que se acumulen seguimientos pendientes.

Cómo usarlo:
- ordena mentalmente por impacto comercial (no por facilidad),
- completa o reprograma tareas con criterio explícito.

## D) `PropertyPipeline`
Qué muestra:
- flujo de propiedades por etapas (pipeline),
- distribución por estado para detectar cuellos de botella.

Para qué sirve:
- saber dónde se detiene el avance comercial (entrada, maduración, cierre).

Cómo usarlo:
- identifica etapa saturada,
- revisa propiedades estancadas y define acción concreta.

## E) `AgentStream`
Qué muestra:
- actividad de agentes/procesos automáticos,
- eventos recientes de ejecuciones.

Para qué sirve:
- trazabilidad operativa de automatizaciones.

Cómo usarlo:
- confirma que flujos esperados se han ejecutado,
- si hay comportamiento anómalo, revisa logs y resultado asociado.

## F) `QuickActions`
Qué muestra:
- accesos directos para acciones frecuentes (crear lead/tarea, lanzar proceso, etc. según versión).

Para qué sirve:
- reducir fricción en acciones repetitivas de alto valor.

Cómo usarlo:
- dispara desde aquí tareas operativas recurrentes en vez de navegar varias pantallas.

## 6.3 Interpretación operativa del dashboard
## Señales de buen estado
- tareas al día,
- leads nuevos atendidos,
- pipeline con movimiento,
- actividad de agentes coherente.

## Señales de riesgo
- backlog de tareas vencidas,
- leads nuevos sin seguimiento,
- pipeline estancado en una etapa,
- errores repetidos en flujos automáticos.

## 6.4 Rutina diaria recomendada (15-20 min)
1. `QuickStats`: validar pulso general.
2. `LeadsPulse`: seleccionar top 3 leads.
3. `TasksToday`: resolver pendientes críticos.
4. `PropertyPipeline`: desbloquear etapa más atascada.
5. `QuickActions`: ejecutar acción inmediata de mayor impacto.

## 6.5 Rutina semanal recomendada
1. revisar métricas agregadas,
2. comparar carga real vs capacidad,
3. ajustar prioridades de tareas/prospección,
4. limpiar pipeline inactivo,
5. revisar miembros y roles si hay cambios de equipo.

## 7. Módulo Contactos (Leads)
Funciones habituales:
- alta de lead,
- edición de datos,
- actualización de estado,
- registro de notas y contexto.

Objetivo operativo:
- convertir lead en oportunidad trazable con siguiente acción clara.

## 8. Módulo Propiedades
Funciones habituales:
- alta y edición de propiedades,
- transición de estados en pipeline,
- revisión de disponibilidad y avance.

Objetivo operativo:
- mantener inventario vivo y accionable.

## 9. Módulo Tareas
Funciones habituales:
- crear tareas manuales,
- consumir tareas generadas por flujos,
- completar/reprogramar.

Objetivo operativo:
- ejecutar compromisos comerciales sin pérdida de seguimiento.

## 10. Módulo Equipo
## 10.1 Invitar miembros
1. introduce email,
2. selecciona rol permitido,
3. pulsa `Invitar`.

## 10.2 Estados de membresía
- `active`: operativo.
- `pending`: invitado pendiente.
- `suspended`: bloqueado temporal.
- `removed`: fuera de organización.

## 10.3 Reglas de rol recomendadas
- mantener owner único activo salvo necesidad organizativa concreta,
- asignar privilegio mínimo suficiente,
- revisar impacto antes de promoción/democión.

## 11. Módulo Perfil
Funciones:
- actualizar nombre/biografía/campos de perfil,
- cambiar avatar,
- revisar rol y organización.

Si no se guarda avatar:
- comprobar sesión activa,
- revisar permisos de storage en entorno.

## 12. Gestión por rol (resumen)
- `owner`: control total organizativo y de equipo.
- `manager`: gestión operativa según permisos habilitados.
- `agent`: ejecución comercial con alcance restringido.

## 13. Errores frecuentes y solución
## 13.1 “Email o contraseña incorrectos”
- revisar credenciales,
- usar recuperación de contraseña,
- si persiste, pedir reset administrativo.

## 13.2 “Acceso restringido” en Equipo
- tu rol no permite esa acción,
- entrar con owner o solicitar ajuste de rol.

## 13.3 “Cuenta inactiva”
- membresía no activa en organización,
- solicitar reactivación.

## 13.4 “No invitado / invitación requerida”
- el correo no tiene invitación válida,
- solicitar invitación antes de crear cuenta.

## 13.5 Login correcto pero no entra al dashboard
- puede faltar membresía activa,
- recargar sesión (`Ctrl+F5`),
- verificar estado en Equipo.

## 14. Buenas prácticas
- usar un único email por usuario,
- no compartir cuentas,
- mantener roles mínimos necesarios,
- documentar cambios de estado importantes,
- revisar dashboard al inicio y cierre de jornada.

## 15. Protocolo de soporte interno
Cuando reportes incidencia, incluir:
- email afectado,
- módulo y acción exacta,
- mensaje textual del error,
- captura de pantalla,
- hora aproximada.

Con esto el diagnóstico y resolución son más rápidos y precisos.

## 16. Casos prácticos (dashboard y trabajo diario)
Esta sección traduce el dashboard a acciones concretas de negocio.

## 16.1 Caso práctico Owner: “Arranque de semana”
Objetivo:
- revisar salud comercial de la organización en 20 minutos,
- asignar prioridades al equipo.

Pasos:
1. `QuickStats`:
- compara volumen semanal de leads vs semana anterior,
- identifica si el ritmo comercial sube, cae o se estanca.
2. `LeadsPulse`:
- detecta leads sin contacto inicial,
- etiqueta los de mayor potencial económico para seguimiento inmediato.
3. `TasksToday`:
- localiza tareas vencidas críticas,
- reasigna carga si hay cuello de botella en un miembro concreto.
4. `PropertyPipeline`:
- revisa etapa más saturada (por ejemplo, muchas propiedades en fase inicial y pocas avanzadas),
- define una acción de desbloqueo para cada propiedad estancada.
5. `AgentStream`:
- confirma que automatizaciones semanales se han ejecutado sin errores.

Resultado esperado:
- tablero limpio de tareas críticas,
- prioridades claras por miembro,
- pipeline con acciones concretas para generar cierres.

## 16.2 Caso práctico Owner: “Control de calidad del equipo”
Objetivo:
- asegurar que roles, permisos y carga de trabajo están alineados.

Pasos:
1. entra a `Equipo`,
2. valida que no existan miembros activos sin propósito operativo,
3. confirma que cada miembro tenga el rol mínimo necesario,
4. detecta cuentas `pending` antiguas y decide activar o retirar.

Resultado esperado:
- menor riesgo de seguridad y mejor gobernanza interna.

## 16.3 Caso práctico Manager: “Bloque de captación de mañana”
Objetivo:
- convertir el dashboard en plan de ejecución de 2-3 horas.

Pasos:
1. `LeadsPulse`: selecciona top 5 leads por potencial y urgencia.
2. `TasksToday`: crea/ajusta tareas de llamada, email y seguimiento.
3. `PropertyPipeline`: cruza leads activos con propiedades nuevas.
4. `QuickActions`: registra nuevas oportunidades detectadas durante llamadas.

Resultado esperado:
- aumento de ratio de contacto efectivo,
- menor tiempo muerto entre detección y acción.

## 16.4 Caso práctico Manager: “Cierre de día”
Objetivo:
- dejar el sistema preparado para el siguiente día.

Pasos:
1. marca tareas completadas y reprograma pendientes con fecha realista,
2. actualiza estado de leads contactados,
3. añade notas breves pero útiles (objeciones, presupuesto, timing),
4. revisa `AgentStream` para detectar errores de ejecución y reportarlos.

Resultado esperado:
- continuidad operativa sin pérdida de contexto.

## 16.5 Caso práctico Owner + Manager: “Lead de alto ticket”
Escenario:
- entra un lead con alto presupuesto y urgencia media.

Flujo recomendado:
1. identificarlo en `LeadsPulse` como prioridad alta,
2. crear secuencia de tareas en `TasksToday` (llamada + propuesta + seguimiento),
3. vincular con propiedades premium en pipeline,
4. registrar feedback de cliente para refinar el matching.

KPI sugeridos:
- tiempo de primera respuesta,
- tiempo hasta primera visita,
- ratio visita/oferta,
- ticket medio potencial.

## 17. Nuevas funcionalidades propuestas (enfoque prospección alto ticket)
Las siguientes funcionalidades amplían Anclora Nexus como CRM inmobiliario orientado a captación y cierre de operaciones premium.

## 17.1 Prospección de inmuebles multi-canal (portal + social)
Objetivo:
- descubrir inmuebles de alto ticket de forma sistemática.

Canales objetivo:
- portales inmobiliarios,
- Facebook (grupos/marketplace),
- Instagram (publicaciones y perfiles).

Recomendación técnica:
- usar APIs oficiales o conectores permitidos,
- evitar scraping no autorizado que incumpla términos de uso.

Datos mínimos por inmueble captado:
- fuente/canal,
- URL origen,
- precio,
- zona,
- tipología,
- m2 y características clave,
- señales de exclusividad/urgencia.

## 17.2 Scoring de alto ticket para inmuebles
Crear un score `property_high_ticket_score` (0-100) por inmueble.

Fórmula sugerida:
- 40% precio absoluto y precio/m2 en zona premium,
- 25% calidad de ubicación (microzona),
- 20% liquidez estimada (demanda histórica),
- 15% calidad del activo (estado, singularidad, amenities).

Uso:
- priorizar solo inmuebles por encima de umbral (por ejemplo, >75).

## 17.3 Prospección de compradores potenciales
Objetivo:
- construir cartera de compradores con demanda real.

Fuentes:
- base de contactos existente,
- formularios inbound,
- redes profesionales y social ads cualificados.

Datos mínimos por comprador:
- presupuesto objetivo,
- zonas de interés,
- tipo de activo preferido,
- horizonte temporal de compra,
- nivel de motivación y condiciones financieras.

## 17.4 Motor de vínculo comprador-propiedad (matching score)
Objetivo:
- calcular afinidad entre comprador y propiedad para priorizar oportunidades de cierre.

Puntuación sugerida `match_score` (0-100):
- 35% ajuste de presupuesto,
- 25% ajuste de zona,
- 20% ajuste de tipología y características,
- 10% timing de compra,
- 10% motivación y probabilidad de respuesta.

Interpretación:
- `80-100`: vínculo fuerte (contacto inmediato),
- `60-79`: vínculo medio (nutrición y seguimiento),
- `<60`: vínculo bajo (backlog o descarte).

## 17.5 Base de datos propuesta para vínculos
Añadir entidades para persistir investigación y relación comprador-vendedor.

Tablas propuestas:
1. `prospected_properties`
- propiedad detectada en fuentes externas.
2. `buyer_profiles`
- ficha normalizada de comprador potencial.
3. `property_buyer_matches`
- vínculos y puntuación de afinidad.
4. `match_activity_log`
- histórico de acciones y resultados del vínculo.

Ejemplo mínimo de estructura:

```sql
create table if not exists prospected_properties (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id),
  source text not null, -- portal, facebook, instagram
  source_url text,
  title text,
  zone text,
  city text,
  price numeric(14,2),
  property_type text,
  bedrooms int,
  bathrooms int,
  area_m2 numeric(10,2),
  high_ticket_score numeric(5,2),
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists buyer_profiles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id),
  full_name text,
  email text,
  phone text,
  budget_min numeric(14,2),
  budget_max numeric(14,2),
  preferred_zones text[],
  preferred_types text[],
  required_features jsonb default '{}'::jsonb,
  purchase_horizon text, -- inmediato, 3m, 6m, 12m
  motivation_score numeric(5,2),
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists property_buyer_matches (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id),
  property_id uuid not null references prospected_properties(id) on delete cascade,
  buyer_id uuid not null references buyer_profiles(id) on delete cascade,
  match_score numeric(5,2) not null,
  score_breakdown jsonb default '{}'::jsonb,
  match_status text default 'candidate', -- candidate, contacted, viewing, negotiating, closed, dropped
  commission_estimate numeric(14,2),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (property_id, buyer_id)
);

create table if not exists match_activity_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id),
  match_id uuid not null references property_buyer_matches(id) on delete cascade,
  activity_type text not null, -- call, email, visit, offer, close
  outcome text,
  details jsonb default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);
```

## 17.6 Workflow recomendado de negocio (buyer-seller linkage)
1. captar propiedad de alto ticket (`prospected_properties`),
2. puntuarla (`high_ticket_score`),
3. captar/completar compradores (`buyer_profiles`),
4. ejecutar matching automático (`property_buyer_matches`),
5. priorizar top matches >80,
6. registrar acciones y feedback (`match_activity_log`),
7. avanzar a visita/oferta/cierre.

Objetivo final:
- aumentar velocidad de conexión comprador-vendedor,
- elevar tasa de cierre y comisión potencial.

## 17.7 Nuevos widgets recomendados para dashboard
1. `HighTicketRadar`
- top propiedades por `high_ticket_score`.
2. `BuyerDemandHeatmap`
- mapa de demanda por zonas y rango presupuestario.
3. `MatchEngine`
- top vínculos comprador-propiedad por `match_score`.
4. `CommissionPipeline`
- comisión estimada por fase (candidate -> closed).

## 18. Priorización de implementación recomendada
Fase 1:
- tablas `prospected_properties`, `buyer_profiles`, `property_buyer_matches`,
- cálculo inicial de `match_score`.

Fase 2:
- conectores de fuentes (portales + social),
- dashboard de top matches,
- tareas automáticas de seguimiento por score.

Fase 3:
- IA de recomendación de siguiente mejor acción por vínculo,
- predicción de probabilidad de cierre y comisión esperada.
