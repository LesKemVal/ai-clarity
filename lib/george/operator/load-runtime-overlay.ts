import { resolveRuntimeOverlay, type GeorgeRuntimeOverlay } from './runtime-overlays'

export const GEORGE_ACTIVE_RUNTIME_OVERLAY_KEY = 'GEORGE_ACTIVE_RUNTIME_OVERLAY'
export const GEORGE_RUNTIME_OBJECTIVE_KEY = 'GEORGE_RUNTIME_OBJECTIVE'
export const GEORGE_RUNTIME_TARGETS_KEY = 'GEORGE_RUNTIME_TARGETS'
export const GEORGE_RUNTIME_SIGNAL_KEY = 'GEORGE_RUNTIME_SIGNAL'
export const GEORGE_RUNTIME_MOTION_KEY = 'GEORGE_RUNTIME_MOTION'
export const GEORGE_LIVE_SETUP_KEY = 'GEORGE_LIVE_SETUP'

export type RuntimeOverlayLoadResult = {
  overlay: GeorgeRuntimeOverlay
  tier: GeorgeRuntimeOverlay['tier']
}

export function buildRuntimeMotionContext(overlay: GeorgeRuntimeOverlay) {
  return {
    code: overlay.code,
    title: overlay.title,
    objective: overlay.objective,
    operationalGoal: overlay.operationalGoal,
    completionModel: overlay.completionModel,
    posture: overlay.posture,
    runtimePriorities: overlay.runtimePriorities,
    likelyUsers: overlay.likelyUsers,
    localOpportunityModel: overlay.localOpportunityModel,
    outreachFrame: overlay.outreachFrame,
    pressureModel: overlay.pressureModel,
    userSignalPrompts: overlay.userSignalPrompts,
    loadedAt: Date.now(),
  }
}

export function applyRuntimeOverlayFromCode(code: string): RuntimeOverlayLoadResult | null {
  if (typeof window === 'undefined') return null

  const overlay = resolveRuntimeOverlay(code)
  if (!overlay) return null

  const motionContext = buildRuntimeMotionContext(overlay)

  window.localStorage.setItem('george_tier', overlay.tier)
  window.localStorage.setItem(GEORGE_ACTIVE_RUNTIME_OVERLAY_KEY, overlay.code)
  window.localStorage.setItem(GEORGE_RUNTIME_OBJECTIVE_KEY, overlay.operationalGoal)
  window.localStorage.setItem(GEORGE_RUNTIME_TARGETS_KEY, JSON.stringify(overlay.likelyUsers))
  window.localStorage.setItem(GEORGE_RUNTIME_SIGNAL_KEY, JSON.stringify(overlay.userSignalPrompts))
  window.localStorage.setItem(GEORGE_RUNTIME_MOTION_KEY, JSON.stringify(motionContext))

  window.localStorage.setItem(
    GEORGE_LIVE_SETUP_KEY,
    JSON.stringify({
      room: overlay.prepDefaults.room,
      language: overlay.prepDefaults.language,
      cadence: overlay.prepDefaults.cadence,
      objective: overlay.operationalGoal,
      controlWords: overlay.prepDefaults.controlWords,
      runtimeOverlay: overlay.code,
      hiddenPrep: true,
      createdAt: Date.now(),
    })
  )

  return {
    overlay,
    tier: overlay.tier,
  }
}

export function getActiveRuntimeMotionContext() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(GEORGE_RUNTIME_MOTION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearRuntimeOverlay() {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem(GEORGE_ACTIVE_RUNTIME_OVERLAY_KEY)
  window.localStorage.removeItem(GEORGE_RUNTIME_OBJECTIVE_KEY)
  window.localStorage.removeItem(GEORGE_RUNTIME_TARGETS_KEY)
  window.localStorage.removeItem(GEORGE_RUNTIME_SIGNAL_KEY)
  window.localStorage.removeItem(GEORGE_RUNTIME_MOTION_KEY)
}
