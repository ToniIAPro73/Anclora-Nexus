# Skills Specification — Intelligence (v1)

## 0) Overview
Especificación técnica de los skills orquestados por el motor de inteligencia. Todos los skills deben seguir el patrón de "Validación-Ejecución-Auditoría".

## 1) lead_intake
**Propósito**: Recibir, priorizar y guardar leads.
- **Input Schema (Pydantic)**:
  ```python
  class LeadIntakeInput(BaseModel):
      name: str
      email: EmailStr
      phone: Optional[str]
      budget: float
      property_id: Optional[UUID]
      message: str
  ```
- **Output Schema**:
  ```python
  class LeadIntakeOutput(BaseModel):
      lead_id: UUID
      priority: int = Field(ge=1, le=5)
      analysis: str # Resumen lujo
      status: str = "success"
  ```

## 2) prospection_weekly
**Propósito**: Generar recomendaciones semanales.
- **Input Schema**:
  ```python
  class ProspectionInput(BaseModel):
      agent_id: UUID
      max_properties: int = 10
  ```
- **Output Schema**:
  ```python
  class ProspectionOutput(BaseModel):
      match_list: List[Dict[str, Any]] # [Lead, Property, MatchScore]
      run_id: UUID
  ```

## 3) recap_weekly
**Propósito**: Informe ejecutivo dominical.
- **Input Schema**:
  ```python
  class RecapInput(BaseModel):
      start_date: datetime
      end_date: datetime
  ```

## 4) Error Handling & Retries
- **Retry Strategy**: 3 intentos, backoff 2s, 4s, 8s.
- **Logging**: JSON estructurado enviando `correlation_id` a `agent_logs`.

## 5) DB Sync
Todos los skills sincronizan con Supabase Realtime para actualizar los widgets del dashboard instantáneamente.
