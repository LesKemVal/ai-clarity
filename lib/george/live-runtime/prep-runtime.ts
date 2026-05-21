export type LiveAssistMode = 'cues' | 'lines'

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
  outputMode?: LiveAssistMode
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
  selectedCapacityCents?: number | null
  selectedCapabilityIds?: string[]
  selectedCapabilities?: Array<{ label?: string; description?: string }>
  baseRuntimeCents?: number | null
  capacityCents?: number
  estimatedCents?: number | null
  resourceEstimate?: LiveRuntimeCostEstimate | null
  runtimeBias?: unknown[]
  purview?: LivePurview | null
  deliveryOverlay?: LiveDeliveryOverlay | null
}

export type LivePrepSetup = {
  room?: string
  language?: string
  cadence?: string
  objective?: string
  controlWords?: string
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

export type LiveRuntimeMemory = {
  acceptedCarryCount: number
  overrideCount: number
  hesitationCount: number
  preferredForce: 'light' | 'balanced' | 'strong'
  toneCorrection: 'softer' | 'firmer' | 'neutral'
}

export function readPreparedLiveSetup(): LivePrepSetup | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem('GEORGE_LIVE_SETUP')
    return raw ? (JSON.parse(raw) as LivePrepSetup) : null
  } catch {
    return null
  }
}

export function consumePreparedLiveSetup(): LivePrepSetup | null {
  if (typeof window === 'undefined') return null

  const setup = readPreparedLiveSetup()
  window.localStorage.removeItem('GEORGE_LIVE_SETUP')
  return setup
}

export function persistActiveLiveRuntimeSupport(setup: LivePrepSetup | null) {
  if (typeof window === 'undefined') return

  if (setup?.liveAssistMode === 'lines' || setup?.liveAssistMode === 'cues') {
    window.localStorage.setItem('george_live_assist_mode', setup.liveAssistMode)
  }

  if (setup?.runtimeSupport) {
    window.localStorage.setItem('george_live_runtime_support_active', JSON.stringify(setup.runtimeSupport))
  }
}

export function readActiveLiveRuntimeSupport(): LiveRuntimeSupport | null {
  if (typeof window === 'undefined') return null

  try {
    return JSON.parse(window.localStorage.getItem('george_live_runtime_support_active') || 'null')
  } catch {
    return null
  }
}

export function applyPreparedRuntimeMemory(
  current: LiveRuntimeMemory,
  setup: LivePrepSetup | null
): LiveRuntimeMemory {
  const capabilityIds = setup?.runtimeSupport?.selectedCapabilityIds || setup?.selectedCapabilityIds || []

  return {
    ...current,
    preferredForce: capabilityIds.includes('pressure_management') ? 'strong' : current.preferredForce,
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
    room ? `LIVE room: ${room}` : 'LIVE room: Adaptive LIVE',
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
  const runtimeSupport = setup?.runtimeSupport || null
  const resourceEstimate = runtimeSupport?.resourceEstimate || null
  const purview = runtimeSupport?.purview || setup?.purview || null

  const supportLine =
    Array.isArray(runtimeSupport?.selectedCapabilities) && runtimeSupport.selectedCapabilities.length > 0
      ? `Support loaded: ${runtimeSupport.selectedCapabilities
          .map((item) => item.label)
          .filter(Boolean)
          .join(', ')}`
      : ''

  const capacityLine =
    typeof setup?.estimatedCents === 'number'
      ? `Estimated runtime cost: ~${setup.estimatedCents}¢`
      : typeof resourceEstimate?.totalCents === 'number'
        ? `Estimated runtime cost: ~${resourceEstimate.totalCents}¢`
        : ''

  const purviewLine = purview?.label ? `Purview loaded: ${purview.label}` : ''

  const resourceBasisLine = Array.isArray(resourceEstimate?.breakdown)
    ? `Resource basis: ${resourceEstimate.breakdown
        .map((item) => `${item.label} ~${item.cents}¢`)
        .join('; ')}`
    : ''

  return {
    supportLine,
    capacityLine,
    purviewLine,
    resourceBasisLine,
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
