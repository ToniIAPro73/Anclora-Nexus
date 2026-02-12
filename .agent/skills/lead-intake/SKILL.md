```markdown
---
name: lead-intake
description: "Implementar el skill lead_intake end-to-end: formulario web → n8n webhook → backend skill → Supabase → dashboard realtime. Usar cuando se pida implementar lead intake, formulario de contacto, o procesamiento de leads."
---

# Skill Lead Intake — End-to-End

## Contexto
Lee product-spec-v0.md Sección 3.3 (Skill 1: lead_intake) y Sección 3.1 (US-01).

## Instrucciones

### Paso 1: Formulario Web
Crear `frontend/app/contact/page.tsx`:
- Campos: nombre, email, teléfono, interés (select: villa, apartment, land, investment), rango presupuesto (select: <300k, 300-500k, 500k-1M, 1-3M, >3M), urgencia (select: browsing, 3-6 meses, <3 meses, inmediato), mensaje
- OnSubmit: POST a n8n webhook URL (env var N8N_WEBHOOK_URL)
- Feedback: toast de confirmación "Gracias, te contactaremos en breve"

### Paso 2: Skill Python
Crear `backend/skills/lead_intake.py`:
```python
async def run_lead_intake(data: dict, llm: LLMService, db: SupabaseService) -> dict:
    # 1. Insertar lead en DB con status='new'
    lead = await db.insert_lead(data)

    # 2. Calcular prioridad
    priority_score, priority_scale = calculate_lead_priority(data)

    # 3. Generar resumen IA
    ai_summary = await llm.summarize(
        f"Resume este lead inmobiliario en 3 líneas: {json.dumps(data, ensure_ascii=False)}"
    )

    # 4. Generar copy email
    copy_email = await llm.generate_copy(
        f"""Genera un email de primer contacto para un lead inmobiliario de lujo.
        Datos: {json.dumps(data, ensure_ascii=False)}
        Tono: sofisticado, discreto, personalizado. Firma: Toni Amengual, Anclora Private Estates."""
    )

    # 5. Generar copy WhatsApp (más corto)
    copy_whatsapp = await llm.generate_copy(
        f"""Genera un WhatsApp breve de primer contacto para este lead de lujo.
        Datos: {json.dumps(data, ensure_ascii=False)}
        Máximo 3 líneas. Tono cercano pero profesional."""
    )

    # 6. Definir next_action
    if priority_scale >= 4:
        next_action = "call_24h"
    elif priority_scale >= 3:
        next_action = "email_48h"
    else:
        next_action = "email_weekly"

    # 7. Actualizar lead en DB
    await db.update_lead(lead['id'], {
        'ai_summary': ai_summary,
        'ai_priority': priority_scale,
        'priority_score': priority_score,
        'next_action': next_action,
        'copy_email': copy_email,
        'copy_whatsapp': copy_whatsapp,
        'status': 'new',
        'processed_at': datetime.utcnow().isoformat()
    })

    # 8. Crear task de follow-up
    due_date = calculate_due_date(next_action)
    await db.insert_task({
        'title': f"Follow-up: {data['name']}",
        'description': f"Prioridad {priority_scale}/5. Acción: {next_action}. Resumen: {ai_summary}",
        'type': 'follow_up',
        'related_lead_id': lead['id'],
        'due_date': due_date.isoformat(),
        'ai_generated': True
    })

    return {
        'lead_id': lead['id'],
        'ai_summary': ai_summary,
        'priority': priority_scale,
        'priority_score': priority_score,
        'next_action': next_action,
        'copy_email': copy_email,
        'copy_whatsapp': copy_whatsapp,
        'task_due_date': due_date.isoformat()
    }
```

### Paso 3: n8n Workflow
Crear `n8n/workflows/lead-intake-form.json`:
1. Trigger: Webhook (POST)
2. Nodo: Supabase Insert (tabla leads, datos raw)
3. Nodo: HTTP Request → POST backend /agents/lead_intake
4. Nodo: Parse response
5. Nodo: (Opcional) Send WhatsApp notification vía Twilio

### Paso 4: Test E2E
```bash
# Simular envío de formulario
curl -X POST http://localhost:8000/agents/lead_intake \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María García",
    "email": "maria@example.com",
    "phone": "+34612345678",
    "property_interest": "villa",
    "budget_range": "1-3M",
    "urgency": "high",
    "source": "web"
  }'

# Verificar en Supabase:
# 1. leads tiene registro con ai_summary, priority, copy
# 2. tasks tiene follow-up creado
# 3. agent_logs tiene registro de ejecución
# 4. audit_log tiene entrada
```

## Criterios de Aceptación
- Formulario web envía datos a n8n en < 1s
- Skill procesa lead completo en < 30s
- ai_summary tiene 3 líneas útiles
- copy_email tiene tono lujo, personalizado, < 150 palabras
- copy_whatsapp tiene < 3 líneas
- priority_score en rango [0.0, 1.0] y escala 1-5 coherente
- Task creada con due_date correcta según next_action
- Dashboard muestra lead nuevo en < 3s (Realtime)
```
