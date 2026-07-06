export type LiveCapabilityId =
  | 'pressure_management'
  | 'negotiation_support'
  | 'decision_support'

export type LiveCapabilityDefinition = {
  id: LiveCapabilityId
  label: string
  description: string
}

export const LIVE_CAPABILITY_REGISTRY: LiveCapabilityDefinition[] = [
  {
    id: 'pressure_management',
    label: 'Pressure management',
    description: 'Adjusts force, confidence, timing, and restraint when room pressure rises.',
  },
  {
    id: 'negotiation_support',
    label: 'Negotiation support',
    description: 'Strengthens leverage protection, concession discipline, and negotiation tone.',
  },
  {
    id: 'decision_support',
    label: 'Decision support',
    description: 'Keeps LIVE focused on options, tradeoffs, judgment, and next move clarity.',
  },
]

export function deriveLiveCapabilityIds(input: {
  conversationType?: string
  audienceType?: string
  userPosition?: string
  objective?: string
  knownContext?: string
  resources?: string[]
}): LiveCapabilityId[] {
  const signal = [
    input.conversationType,
    input.audienceType,
    input.userPosition,
    input.objective,
    input.knownContext,
    ...(input.resources || []),
  ].filter(Boolean).join(' ').toLowerCase()

  const capabilities = new Set<LiveCapabilityId>()

  if (
    /pressure|high stakes|objection|challenge|interview|boardroom|doctor|medical|executive|investor|regulator/.test(signal)
  ) {
    capabilities.add('pressure_management')
  }

  if (
    /negotiat|leverage|terms|concession|price|offer|contract|buyer|seller|deal|close/.test(signal)
  ) {
    capabilities.add('negotiation_support')
  }

  if (
    /decision|decide|tradeoff|evaluate|choose|approval|risk|next move|boardroom|investor|meeting/.test(signal)
  ) {
    capabilities.add('decision_support')
  }

  return Array.from(capabilities)
}
