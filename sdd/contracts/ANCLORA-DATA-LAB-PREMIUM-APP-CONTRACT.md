# Anclora Data Lab Premium App Contract

Fecha: `2026-05-05`
Estado: `ACTIVE`
Ámbito: futuras integraciones de acceso, invitación y UX relacionada con `anclora-data-lab`

## Objetivo

Establecer el contrato SDD de referencia para Anclora Data Lab como aplicación **PREMIUM**, alineada con la bóveda (`ToniIAPro73/boveda-anclora`) y con `anclora-design-system`.

Este contrato sirve como referencia para cualquier feature de Nexus que afecte a Data Lab, especialmente solicitudes de acceso, aprobación, invitación, onboarding y enlaces hacia la app.

## Autoridad

Fuentes obligatorias:

```text
1. ToniIAPro73/boveda-anclora/docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md
2. ToniIAPro73/boveda-anclora/docs/standards/ANCLORA_BRANDING_MASTER_CONTRACT.md
3. ToniIAPro73/boveda-anclora/docs/standards/ANCLORA_PREMIUM_APP_CONTRACT.md
4. ToniIAPro73/anclora-design-system/docs/design-system-audit-and-target-architecture.md
```

## Clasificación

```text
Aplicación: anclora-data-lab
Grupo: Premium
Dominio: real estate / analytics / market intelligence
Idiomas objetivo: es / en / de
Tema objetivo: dark / light / system
Uso: señales de mercado, inteligencia analítica, acceso selectivo para inversores y perfiles institucionales
```

## Branding Premium aplicado a Data Lab

Según el branding maestro de la bóveda:

```text
Grupo: Premium
Borde de icono: cobre rosado
Tipografía: DM Sans
Accent de app: #2DA078
Hue: 155°
Símbolo fundacional: círculo + tres ondas horizontales
```

## Gramática visual

Data Lab debe sentirse premium, analítico y preciso. Comparte disciplina premium con Synergi, pero su carácter debe ser más técnico, sobrio y orientado a insight.

Prioridades:

```text
precisión analítica > confianza institucional > claridad de señal > acabado premium
```

Permitido:

- surfaces premium sobrias
- dashboards editoriales con lectura analítica
- gráficos, métricas y señales con jerarquía clara
- dark/light/system si ambos modos están diseñados, no derivados accidentalmente

No permitido:

- parecer dashboard interno sin acabado premium
- usar exceso de decoración que compita con datos
- usar estética ultra premium inmobiliaria como capa dominante
- redefinir botones/cards/modales fuera del design system sin excepción documentada

## Botones y acciones

Deben existir las familias semánticas:

```text
primary
secondary
ghost
destructive
```

Reglas:

- el CTA principal puede usar el acento esmeralda Data Lab
- foreground y contraste deben ser estables entre dark/light/system
- acciones analíticas deben ser sobrias y fáciles de escanear
- no más de un CTA dominante por viewport principal

## Cards, métricas y surfaces

Las surfaces de Data Lab deben priorizar datos y señales:

- jerarquía numérica clara
- etiquetas legibles
- estados visibles
- densidad útil sin saturación
- hover medido
- cero solapes o shifts entre cards
- textos técnicos contenidos dentro del layout

Si `MetricCard`, `DataTable`, `SurfacePanel` o patrones equivalentes existen o se promueven en `anclora-design-system`, deben consumirse desde allí.

## Modales y onboarding

Se aplica `MODAL_CONTRACT.md` y `ANCLORA_PREMIUM_APP_CONTRACT.md`.

Para flujos de acceso:

- explicar qué señal/valor recibirá el usuario
- explicar el carácter selectivo del acceso
- mantener cierre claro
- footer accionable
- evitar scroll evitable
- no mezclar lenguaje comercial masivo con análisis institucional

## Localización

Data Lab debe mantener `es/en/de`.

No se permite mezclar idiomas en una misma vista. Los layouts deben absorber expansiones de texto, especialmente en métricas, labels y filtros.

## Relación con Nexus

Nexus aprueba o rechaza solicitudes. Data Lab consume invitaciones o estados de acceso.

Nexus no debe imponer su gramática INTERNAL a las pantallas públicas o autenticadas de Data Lab. Solo debe enviar al usuario hacia una experiencia Data Lab coherente con este contrato.

## Gate de aceptación

Una feature relacionada con Data Lab no está lista si:

- trata Data Lab como app interna
- rompe dark/light/system si la feature toca tema
- usa acentos o tipografía que contradicen el branding premium
- añade gráficos, métricas o modales sin jerarquía analítica clara
- mezcla el lenguaje visual de Private Estates con Data Lab
- ignora `ANCLORA_PREMIUM_APP_CONTRACT`
- ignora el rol de Nexus como gestor de decisión, no como UI final de Data Lab
