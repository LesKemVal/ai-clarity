import type {
  FormulaRetrievalContext,
  RetrievedOperationalFormula,
} from './types'

export type OperationalMemoryRetrievalPolicy = {
  maximumResults: number
  minimumScore: number
  personalReserve: number
  organizationReserve: number
  generalReserve: number
}

export type OperationalMemoryExecutionMode =
  | 'normal'
  | 'preparation'
  | 'live'
  | 'post_live'

export function isExplicitOperationalMemoryRequest(text: unknown) {
  const normalized = String(text || '').trim().toLowerCase()
  if (!normalized) return false

  return /\b(what did i tell you|last month|previous notes?|prior (conversation|call)|previous (investor|contact|decision|strategy)|who was that investor|show (?:me )?(?:my )?(?:previous|prior)|use the last conversation|compare (?:this|it) to the previous)\b/.test(normalized)
}

export function shouldRetrieveOperationalMemory(input: {
  mode: OperationalMemoryExecutionMode
  explicitUserRequest?: boolean
  currentContextSufficient?: boolean
}) {
  if (input.mode === 'live') {
    return Boolean(input.explicitUserRequest) || !input.currentContextSufficient
  }

  return true
}

const DEFAULT_POLICY: OperationalMemoryRetrievalPolicy = {
  maximumResults: 5,
  minimumScore: 0.5,
  personalReserve: 2,
  organizationReserve: 2,
  generalReserve: 1,
}

export function normalizeFormulaRetrievalType(value: unknown) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return normalized || undefined
}

export function buildFormulaRetrievalContext(
  context: FormulaRetrievalContext,
  overrides: Partial<OperationalMemoryRetrievalPolicy> = {}
): FormulaRetrievalContext {
  const policy = { ...DEFAULT_POLICY, ...overrides }

  return {
    ...context,
    observedSignalTypes: [...new Set(context.observedSignalTypes)],
    limit: Math.max(1, context.limit ?? policy.maximumResults),
  }
}

export function applyOperationalMemoryRetrievalPolicy(
  retrieved: RetrievedOperationalFormula[],
  overrides: Partial<OperationalMemoryRetrievalPolicy> = {}
) {
  const policy = { ...DEFAULT_POLICY, ...overrides }
  const eligible = retrieved.filter((item) => item.score >= policy.minimumScore)
  const selected: RetrievedOperationalFormula[] = []
  const selectedIds = new Set<string>()

  const reserve = (
    scope: RetrievedOperationalFormula['formula']['scope'],
    count: number
  ) => {
    for (const item of eligible) {
      if (selected.length >= policy.maximumResults || count <= 0) break
      if (item.formula.scope !== scope || selectedIds.has(item.formula.id)) continue

      selected.push(item)
      selectedIds.add(item.formula.id)
      count -= 1
    }
  }

  reserve('personal', policy.personalReserve)
  reserve('organization', policy.organizationReserve)
  reserve('general', policy.generalReserve)

  for (const item of eligible) {
    if (selected.length >= policy.maximumResults) break
    if (selectedIds.has(item.formula.id)) continue

    selected.push(item)
    selectedIds.add(item.formula.id)
  }

  return selected.sort((left, right) => right.score - left.score)
}
