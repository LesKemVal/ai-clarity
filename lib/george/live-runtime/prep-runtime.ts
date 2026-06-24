import { resolveLiveRuntimeAuthority } from './live-runtime-authority'

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

export type LiveRuntimeOwnerLease = {
  ownerId: string
  claimedAt: number
  heartbeatAt: number
  expiresAt: number
}

const LIVE_RUNTIME_USAGE_KEY = 'GEORGE_LIVE_SESSION_METRICS'
const LIVE_RUNTIME_START_KEY = 'george_live_runtime_started_at'
const LIVE_ASSIST_MODE_KEY = 'george_live_assist_mode'
const LIVE_RUNTIME_SUPPORT_ACTIVE_KEY = 'george_live_runtime_support_active'
const LIVE_RUNTIME_SUPPORT_LEGACY_KEY = 'george_live_runtime_support'
const LIVE_RUNTIME_OWNER_KEY = 'george_live_runtime_owner'
const LIVE_RUNTIME_OWNER_TTL_MS = 15_000
const LIVE_RUNTIME_OWNER_HEARTBEAT_MS = 5_000

let liveRuntimeOwnerId: string | null = null
let liveRuntimeHeartbeatId: number | null = null
let liveRuntimePagehideBound = false

function createRuntimeOwnerId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `live_owner_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function getRuntimeOwnerId() {
  if (!liveRuntimeOwnerId) liveRuntimeOwnerId = createRuntimeOwnerId()
  return liveRuntimeOwnerId
}

function parseRuntimeOwner(raw: string | null): LiveRuntimeOwnerLease | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<LiveRuntimeOwnerLease>
    if (!parsed.ownerId || !parsed.expiresAt || !parsed.heartbeatAt) return null
    return {
      ownerId: String(parsed.ownerId),
      claimedAt: Number(parsed.claimedAt || parsed.heartbeatAt),
      heartbeatAt: Number(parsed.heartbeatAt),
      expiresAt: Number(parsed.expiresAt),
    }
  } catch {
    return null
  }
}

export function readLiveRuntimeOwnerLease(): LiveRuntimeOwnerLease | null {
  if (typeof window === 'undefined') return null
  return parseRuntimeOwner(window.localStorage.getItem(LIVE_RUNTIME_OWNER_KEY))
}

export function hasActiveLiveRuntimeOwner(now = Date.now()) {
  const owner = readLiveRuntimeOwnerLease()
  return Boolean(owner && owner.expiresAt > now)
}

export function ownsActiveLiveRuntime() {
  const owner = readLiveRuntimeOwnerLease()
  return Boolean(owner && owner.ownerId === liveRuntimeOwnerId && owner.expiresAt > Date.now())
}

function writeLiveRuntimeOwnerLease(ownerId: string, claimedAt = Date.now()) {
  if (typeof window === 'undefined') return null

  const now = Date.now()
  const lease: LiveRuntimeOwnerLease = {
    ownerId,
    claimedAt,
    heartbeatAt: now,
    expiresAt: now + LIVE_RUNTIME_OWNER_TTL_MS,
  }

  window.localStorage.setItem(LIVE_RUNTIME_OWNER_KEY, JSON.stringify(lease))
  return lease
}

export function refreshLiveRuntimeOwnerLease() {
  if (typeof window === 'undefined') return null
  if (!liveRuntimeOwnerId) return null

  const existing = readLiveRuntimeOwnerLease()
  if (existing && existing.ownerId !== liveRuntimeOwnerId && existing.expiresAt > Date.now()) {
    return existing
  }

  return writeLiveRuntimeOwnerLease(liveRuntimeOwnerId, existing?.claimedAt || Date.now())
}

function bindRuntimeOwnerPagehide() {
  if (typeof window === 'undefined' || liveRuntimePagehideBound) return
  liveRuntimePagehideBound = true

  const release = () => releaseLiveRuntimeOwnerLease()
  window.addEventListener('pagehide', release)
  window.addEventListener('beforeunload', release)
}

function startRuntimeOwnerHeartbeat() {
  if (typeof window === 'undefined') return
  if (liveRuntimeHeartbeatId !== null) return

  refreshLiveRuntimeOwnerLease()
  liveRuntimeHeartbeatId = window.setInterval(() => {
    refreshLiveRuntimeOwnerLease()
  }, LIVE_RUNTIME_OWNER_HEARTBEAT_MS)

  bindRuntimeOwnerPagehide()
}

function stopRuntimeOwnerHeartbeat() {
  if (typeof window === 'undefined') return
  if (liveRuntimeHeartbeatId === null) return

  window.clearInterval(liveRuntimeHeartbeatId)
  liveRuntimeHeartbeatId = null
}

export function claimLiveRuntimeOwnerLease() {
  if (typeof window === 'undefined') return null

  const ownerId = getRuntimeOwnerId()
  const existing = readLiveRuntimeOwnerLease()
  const now = Date.now()

  if (existing && existing.ownerId !== ownerId && existing.expiresAt > now) {
    return existing
  }

  const lease = writeLiveRuntimeOwnerLease(ownerId, existing?.claimedAt || now)
  startRuntimeOwnerHeartbeat()
  return lease
}

export function releaseLiveRuntimeOwnerLease() {
  if (typeof window === 'undefined') return

  const owner = readLiveRuntimeOwnerLease()
  if (!owner || owner.ownerId === liveRuntimeOwnerId || owner.expiresAt <= Date.now()) {
    window.localStorage.removeItem(LIVE_RUNTIME_OWNER_KEY)
  }

  stopRuntimeOwnerHeartbeat()
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
    window.localStorage.setItem(LIVE_ASSIST_MODE_KEY, setup.liveAssistMode)
  } else {
    window.localStorage.removeItem(LIVE_ASSIST_MODE_KEY)
  }

  if (setup?.runtimeSupport || setup?.room || setup?.objective) {
    const activeRuntimeSupport = resolveLiveRuntimeAuthority({
      preparedSetup: setup,
      existingSupport: readActiveLiveRuntimeSupport(),
    })

    const serializedSupport = JSON.stringify(activeRuntimeSupport)
    window.localStorage.setItem(LIVE_RUNTIME_SUPPORT_ACTIVE_KEY, serializedSupport)
    window.localStorage.setItem(LIVE_RUNTIME_SUPPORT_LEGACY_KEY, serializedSupport)
  } else {
    window.localStorage.removeItem(LIVE_RUNTIME_SUPPORT_ACTIVE_KEY)
    window.localStorage.removeItem(LIVE_RUNTIME_SUPPORT_LEGACY_KEY)
  }
}

export function readActiveLiveRuntimeSupport(): LiveRuntimeSupport | null {
  if (typeof window === 'undefined') return null

  try {
    const raw =
      window.localStorage.getItem(LIVE_RUNTIME_SUPPORT_ACTIVE_KEY) ||
      window.localStorage.getItem(LIVE_RUNTIME_SUPPORT_LEGACY_KEY) ||
      'null'

    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function markLiveRuntimeStarted(startedAt = Date.now()) {
  if (typeof window === 'undefined') return
  claimLiveRuntimeOwnerLease()
  window.localStorage.setItem(LIVE_RUNTIME_START_KEY, String(startedAt))
}

export function readLiveRuntimeStartedAt() {
  if (typeof window === 'undefined') return null

  const value = Number(window.localStorage.getItem(LIVE_RUNTIME_START_KEY) || '0')
  return Number.isFinite(value) && value > 0 ? value : null
}

export function clearLiveRuntimeStartedAt() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(LIVE_RUNTIME_START_KEY)
  releaseLiveRuntimeOwnerLease()
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

export function persistLiveRuntimeUsageRecord(record: LiveRuntimeUsageRecord) {
  if (typeof window === 'undefined') return

  try {
    const existing = JSON.parse(window.localStorage.getItem(LIVE_RUNTIME_USAGE_KEY) || '[]')
    const next = Array.isArray(existing) ? [record, ...existing].slice(0, 30) : [record]
    window.localStorage.setItem(LIVE_RUNTIME_USAGE_KEY, JSON.stringify(next))
  } catch {
    window.localStorage.setItem(LIVE_RUNTIME_USAGE_KEY, JSON.stringify([record]))
  }

  fetch('/api/runtime-usage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ record }),
    keepalive: true,
  }).catch(() => {})
}

export function reconcileActiveLiveRuntimeUsage(params: {
  setup?: LivePrepSetup | null
  runtimeSupport?: LiveRuntimeSupport | null
  endedAt?: number
}) {
  const startedAt = readLiveRuntimeStartedAt()
  if (!startedAt) return null

  const record = buildLiveRuntimeUsageRecord({
    startedAt,
    endedAt: params.endedAt,
    setup: params.setup || null,
    runtimeSupport: params.runtimeSupport || readActiveLiveRuntimeSupport(),
  })

  persistLiveRuntimeUsageRecord(record)
  clearLiveRuntimeStartedAt()

  return record
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
