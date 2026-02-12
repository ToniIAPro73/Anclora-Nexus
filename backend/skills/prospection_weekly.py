import json
from datetime import datetime
from typing import Dict, Any, List
from backend.services.llm_service import LLMService
from backend.services.supabase_service import SupabaseService

async def run_prospection_weekly(data: Dict[str, Any], llm: LLMService, db: SupabaseService) -> Dict[str, Any]:
    """
    Skill for weekly property prospection and lead matching.
    1. Fetch high-priority leads.
    2. Fetch available properties.
    3. Match lead-property with LLM (GPT-4o-mini).
    4. Generate luxury weekly summary (Claude 3.5 Sonnet).
    5. Register matching.
    """
    
    # 1. Fetch context
    priority_min = data.get("priority_min", 3)
    leads = await db.get_active_leads(priority_min=priority_min)
    properties = await db.get_available_properties()
    
    if not leads:
        return {"status": "skipped", "reason": "No active leads found with required priority."}
    
    if not properties:
        return {"status": "skipped", "reason": "No available properties found for matching."}

    # 2. Property Matching (GPT-4o-mini)
    # We'll do a batch analysis to find the best property for each lead
    matching_prompt = f"""
    Eres un experto inmobiliario de lujo en Mallorca.
    Tu tarea es cruzar estos LEADS con estas PROPIEDADES disponibles.
    
    LEADS:
    {json.dumps([{ 'id': l['id'], 'name': l['name'], 'interest': l['property_interest'], 'budget': l['budget_range']} for l in leads], ensure_ascii=False)}
    
    PROPIEDADES:
    {json.dumps([{ 'id': p['id'], 'address': p['address'], 'price': p['price'], 'type': p['property_type']} for p in properties], ensure_ascii=False)}
    
    Para cada LEAD, encuentra la mejor propiedad coincidente (si hay alguna razonable).
    
    Responde UNICAMENTE con un JSON:
    {{
      "matchings": [
        {{
          "lead_id": "uuid",
          "property_id": "uuid",
          "score": 0.0-1.0,
          "reason": "breve explicación de por qué encaja"
        }}
      ]
    }}
    """
    
    matching_raw = await llm.analyze(matching_prompt)
    matchings = []
    try:
        if "```json" in matching_raw:
            matching_raw = matching_raw.split("```json")[1].split("```")[0].strip()
        matching_data = json.loads(matching_raw)
        matchings = matching_data.get("matchings", [])
    except Exception as e:
        print(f"Error parsing matching response: {e}")
        # Fallback empty matchings

    # 3. Luxury Summary (Claude 3.5 Sonnet)
    summary_prompt = f"""
    Genera un resumen ejecutivo de prospección semanal con tono de lujo.
    Hemos cruzado {len(leads)} leads de alta prioridad con {len(properties)} propiedades.
    Se han encontrado {len(matchings)} coincidencias estratégicas.
    
    DETALLES DE MATCHING:
    {json.dumps(matchings, ensure_ascii=False)}
    
    El resumen debe ser sofisticado, motivador y breve. Enfócate en las oportunidades detectadas en Andratx, Calvià y Son Ferrer.
    """
    
    summary = await llm.generate_copy(summary_prompt)

    # 4. Prepare results
    result = {
        "leads_processed": len(leads),
        "properties_analyzed": len(properties),
        "matches_found": len(matchings),
        "matchings": matchings,
        "luxury_summary": summary,
        "processed_at": datetime.utcnow().isoformat()
    }

    return result
