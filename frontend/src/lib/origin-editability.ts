import type { Lead, Property } from '@/lib/store'

export type EditabilityReason =
  | 'manual'
  | 'lead_auto_ingested'
  | 'property_non_manual_trace'
  | 'property_pbm_scoring'

export type LeadEditableField =
  | 'name'
  | 'email'
  | 'phone'
  | 'budget'
  | 'property_interest'
  | 'priority'
  | 'status'

export type PropertyEditableField =
  | 'title'
  | 'address'
  | 'price'
  | 'status'
  | 'source_system'
  | 'source_portal'
  | 'match_score'
  | 'useful_area_m2'
  | 'built_area_m2'
  | 'plot_area_m2'
  | 'zone'
  | 'type'

export interface EditabilityPolicy<TField extends string> {
  origin: string
  lockedFields: TField[]
  editableFields: TField[]
  reasons: EditabilityReason[]
}

const LEAD_FIELDS: LeadEditableField[] = [
  'name',
  'email',
  'phone',
  'budget',
  'property_interest',
  'priority',
  'status',
]

const PROPERTY_FIELDS: PropertyEditableField[] = [
  'title',
  'address',
  'price',
  'status',
  'source_system',
  'source_portal',
  'match_score',
  'useful_area_m2',
  'built_area_m2',
  'plot_area_m2',
  'zone',
  'type',
]

export function buildLeadEditabilityPolicy(sourceSystem?: Lead['source_system']): EditabilityPolicy<LeadEditableField> {
  const origin = sourceSystem || 'manual'
  const lockedFields: LeadEditableField[] = []
  const reasons: EditabilityReason[] = []

  if (origin !== 'manual') {
    lockedFields.push('name', 'email', 'phone', 'budget', 'property_interest')
    reasons.push('lead_auto_ingested')
  }

  const editableFields = LEAD_FIELDS.filter((field) => !lockedFields.includes(field))
  return { origin, lockedFields, editableFields, reasons: reasons.length > 0 ? reasons : ['manual'] }
}

export function buildPropertyEditabilityPolicy(sourceSystem?: Property['source_system']): EditabilityPolicy<PropertyEditableField> {
  const origin = sourceSystem || 'manual'
  const lockedFields: PropertyEditableField[] = []
  const reasons: EditabilityReason[] = []

  if (origin !== 'manual') {
    lockedFields.push('source_system', 'source_portal')
    reasons.push('property_non_manual_trace')
  }
  if (origin === 'pbm') {
    lockedFields.push('match_score')
    reasons.push('property_pbm_scoring')
  }

  const editableFields = PROPERTY_FIELDS.filter((field) => !lockedFields.includes(field))
  return { origin, lockedFields, editableFields, reasons: reasons.length > 0 ? reasons : ['manual'] }
}

export function sanitizeLeadUpdates(
  updates: Partial<Lead>,
  policy: EditabilityPolicy<LeadEditableField>,
): Partial<Lead> {
  const sanitized: Partial<Lead> = { ...updates }
  for (const field of policy.lockedFields) {
    delete sanitized[field]
  }
  return sanitized
}

export function sanitizePropertyUpdates(
  updates: Partial<Property>,
  policy: EditabilityPolicy<PropertyEditableField>,
): Partial<Property> {
  const sanitized: Partial<Property> = { ...updates }
  for (const field of policy.lockedFields) {
    delete sanitized[field]
  }
  return sanitized
}
