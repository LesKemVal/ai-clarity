export type LiveRuntimeOwnerLease = {
  ownerId: string
  claimedAt: number
  heartbeatAt: number
  expiresAt: number
}

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
