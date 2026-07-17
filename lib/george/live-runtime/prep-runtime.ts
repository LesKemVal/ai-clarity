import type { LegacyLiveAssistMode, LiveSupportStyle } from './support-style'

export type LiveAssistMode = LegacyLiveAssistMode

export type LiveRuntimeCostBreakdownItem = {
  label: string
  cents: number
}

export type LiveRuntimeCostEstimate = {
  expectedMinutes?: number
  totalCents?: number
  baseCents?: number
  capacityCents?: number
  outputModeCents?: number
  outputMode?: LiveSupportStyle
  breakdown?: LiveRuntimeCostBreakdownItem[]
  basis?: string
}

export type LiveDeliveryOverlay = {
  cadenceProfile?: string
  compressionBias?: number
  declarativeStrength?: number
  silenceTolerance?: string
  interruptionTiming?: string
  qualificationStyle?: string
  linguisticDensity?: string
  deliveryNotes?: string[]
}

export type LivePurview = {
  label?: string
  body?: string
  line?: string
}

export type LiveRuntimeSupport = {
  room?: string
  objective?: string
  chair?: string
  selectedCapacityCents?: number | null
  selectedCapabilityIds?: string[]
  selectedCapabilities?: Array<{ label?: string; description?: string }>
  baseRuntimeCents?: number | null
  capacityCents?: number
  estimatedCents?: number | null
  resourceEstimate?: LiveRuntimeCostEstimate | null
  runtimeBias?: unknown[]
  purview?: LivePurview | null
  userPosition?: string
  knownContext?: string
  briefingKnowledge?: string
  secondaryOutcome?: string
  secondaryObjective?: string
  intangibleObjective?: string
  liveRoomObjectiveOption?: string
  customLiveRoomObjective?: string
  deliveryOverlay?: LiveDeliveryOverlay | null
}

export type LivePrepSetup = {
  room?: string
  language?: string
  cadence?: string
  objective?: string
  userPosition?: string
  controlWords?: string
  outcomeShiftPhrase?: string
  toneAdjustment?: 'softer' | 'balanced' | 'sharper'
  supportDensity?: 'minimal' | 'balanced' | 'supportive'
  supportStyle?: LiveSupportStyle
  /** Legacy compatibility. Prefer supportStyle. */
  liveAssistMode?: LiveAssistMode
  purview?: LivePurview | null
  deliveryOverlay?: LiveDeliveryOverlay | null
  skipPrep?: boolean
  runtimeSupport?: LiveRuntimeSupport | null
  selectedCapacityCents?: number | null
  selectedCapabilityIds?: string[]
  estimatedCents?: number | null
  createdAt?: number
}

export type LiveCommunicationBaseline =
  | 'adaptive'
  | 'executive'
  | 'conversational'

export type LiveRuntimeMemory = {
  acceptedCarryCount: number
  overrideCount: number
  hesitationCount: number
  preferredForce: 'light' | 'balanced' | 'strong'
  toneCorrection: 'softer' | 'firmer' | 'neutral'
  communicationBaseline: LiveCommunicationBaseline
  roomCommunicationNotes: string[]
}

export type LiveRuntimeUsageRecord = {
  id: string
  createdAt: number
  startedAt: number
  endedAt: number
  durationMinutes: number
  estimatedCents: number | null
  actualCents: number | null
  composition: string[]
  summary: string
  setup?: LivePrepSetup | null
  resourceEstimate?: LiveRuntimeCostEstimate | null
}

function normalizeCompositionLabel(label: string) {
  const clean = String(label || '').trim().toLowerCase()
  if (!clean) return ''

  if (clean.includes('speech') || clean.includes('audio')) return 'speech processing'
  if (clean.includes('reason')) return 'adaptive reasoning'
  if (clean.includes('line') || clean.includes('cue') || clean.includes('response')) return 'response shaping'
  if (clean.includes('continuity') || clean.includes('memory')) return 'continuity active'

  return clean
}

function uniqueComposition(items: string[]) {
  const seen = new Set<string>()

  return items
    .map(normalizeCompositionLabel)
    .filter(Boolean)
    .filter((item) => {
      if (seen.has(item)) return false
      seen.add(item)
      return true
    })
}

export function buildLiveRuntimeComposition(params: {
  runtimeSupport?: LiveRuntimeSupport | null
  setup?: LivePrepSetup | null
  durationMinutes?: number
}) {
  const runtimeSupport = params.runtimeSupport || params.setup?.runtimeSupport || null
  const estimate = runtimeSupport?.resourceEstimate || null
  const capabilityLabels = runtimeSupport?.selectedCapabilities?.map((item) => item.label || '') || []
  const language = params.setup?.language || ''

  const base = [
    'LIVE runtime minutes',
    language && language !== 'English' ? 'multilingual processing' : '',
    ...(estimate?.breakdown?.map((item) => item.label) || []),
    ...capabilityLabels,
    'continuity active',
  ]

  return uniqueComposition(base)
}

export function estimateActualRuntimeCents(params: {
  startedAt: number
  endedAt?: number
  runtimeSupport?: LiveRuntimeSupport | null
  setup?: LivePrepSetup | null
}) {
  const endedAt = params.endedAt || Date.now()
  const durationMinutes = Math.max(1, Math.round((endedAt - params.startedAt) / 60000))
  const resourceEstimate = params.runtimeSupport?.resourceEstimate || params.setup?.runtimeSupport?.resourceEstimate || null
  const expectedMinutes = Math.max(1, Number(resourceEstimate?.expectedMinutes || durationMinutes))
  const estimatedCents = typeof resourceEstimate?.totalCents === 'number'
    ? resourceEstimate.totalCents
    : typeof params.setup?.estimatedCents === 'number'
      ? params.setup.estimatedCents
      : null

  const actualCents = estimatedCents === null
    ? null
    : Math.max(1, Math.round(estimatedCents * (durationMinutes / expectedMinutes)))

  return {
    durationMinutes,
    estimatedCents,
    actualCents,
  }
}

export function buildLiveRuntimeUsageRecord(params: {
  startedAt: number
  endedAt?: number
  setup?: LivePrepSetup | null
  runtimeSupport?: LiveRuntimeSupport | null
}) {
  const endedAt = params.endedAt || Date.now()
  const runtimeSupport = params.runtimeSupport || params.setup?.runtimeSupport || null
  const resourceEstimate = runtimeSupport?.resourceEstimate || null
  const cost = estimateActualRuntimeCents({
    startedAt: params.startedAt,
    endedAt,
    runtimeSupport,
    setup: params.setup,
  })
  const composition = buildLiveRuntimeComposition({
    runtimeSupport,
    setup: params.setup,
    durationMinutes: cost.durationMinutes,
  })

  return {
    id: `live_usage_${endedAt}`,
    createdAt: endedAt,
    startedAt: params.startedAt,
    endedAt,
    durationMinutes: cost.durationMinutes,
    estimatedCents: cost.estimatedCents,
    actualCents: cost.actualCents,
    composition,
    summary: composition.join(' · '),
    setup: params.setup || null,
    resourceEstimate,
  } satisfies LiveRuntimeUsageRecord
}

export function applyPreparedRuntimeMemory(
  current: LiveRuntimeMemory,
  setup: LivePrepSetup | null
): LiveRuntimeMemory {
  const capabilityIds = setup?.runtimeSupport?.selectedCapabilityIds || setup?.selectedCapabilityIds || []

  return {
    ...current,
    preferredForce: capabilityIds.includes('pressure_management') ? 'strong' : current.preferredForce,
    communicationBaseline: current.communicationBaseline || 'adaptive',
    roomCommunicationNotes: current.roomCommunicationNotes || [],
  }
}

export function buildPreparedRuntimeContextBuffer(params: {
  setup: LivePrepSetup | null
  objectiveLine?: string
  steeringLine?: string
}) {
  const setup = params.setup
  const room = setup?.room || ''
  const runtimeSupport = setup?.runtimeSupport || null
  const resourceEstimate = runtimeSupport?.resourceEstimate || null
  const deliveryOverlay = runtimeSupport?.deliveryOverlay || setup?.deliveryOverlay || null
  const purview = runtimeSupport?.purview || setup?.purview || null

  return [
    room ? `LIVE conversation: ${room}` : 'LIVE conversation: Adaptive LIVE',
    params.objectiveLine || '',
    params.steeringLine || '',
    purview?.label ? `Purview: ${purview.label}` : '',
    purview?.line ? `Purview line: ${purview.line}` : '',
    deliveryOverlay?.cadenceProfile ? `Cadence profile: ${deliveryOverlay.cadenceProfile}` : '',
    deliveryOverlay?.qualificationStyle ? `Qualification style: ${deliveryOverlay.qualificationStyle}` : '',
    deliveryOverlay?.silenceTolerance ? `Silence tolerance: ${deliveryOverlay.silenceTolerance}` : '',
    resourceEstimate?.expectedMinutes ? `Expected room duration: ${resourceEstimate.expectedMinutes} minutes` : '',
    resourceEstimate?.totalCents ? `Estimated runtime cost: ~${resourceEstimate.totalCents}¢` : '',
    Array.isArray(resourceEstimate?.breakdown)
      ? `Runtime cost basis: ${resourceEstimate.breakdown
          .map((item) => `${item.label} ~${item.cents}¢`)
          .join('; ')}`
      : '',
    Array.isArray(runtimeSupport?.selectedCapabilities)
      ? `Runtime support selected: ${runtimeSupport.selectedCapabilities
          .map((item) => item.label)
          .filter(Boolean)
          .join(', ')}`
      : '',
    Array.isArray(deliveryOverlay?.deliveryNotes)
      ? `Delivery notes: ${deliveryOverlay.deliveryNotes.join(' ')}`
      : '',
  ].filter(Boolean)
}

export function buildPreparedRuntimeIntroLines(setup: LivePrepSetup | null) {
  const room = setup?.room?.trim()
  const objective = setup?.objective?.trim()

  return {
    supportLine: room ? `${room} loaded.` : 'LIVE loaded.',
    capacityLine: objective ? `Desired outcome: ${objective}` : '',
    purviewLine: 'Signals received.',
    resourceBasisLine: "I'm listening.",
  }
}

export function buildPreparedRuntimeSessionMetadata(
  setup: LivePrepSetup | null,
  subscriberMetadata: Record<string, unknown>
) {
  const runtimeSupport = setup?.runtimeSupport || null

  return {
    ...subscriberMetadata,
    liveSetup: setup,
    runtimeSupport,
    resourceEstimate: runtimeSupport?.resourceEstimate || null,
    deliveryOverlay: runtimeSupport?.deliveryOverlay || setup?.deliveryOverlay || null,
    purview: runtimeSupport?.purview || setup?.purview || null,
  }
}
