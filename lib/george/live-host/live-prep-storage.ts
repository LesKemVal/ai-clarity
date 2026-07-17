import { resolveLiveRuntimeAuthority } from '@/lib/george/live-runtime/live-runtime-authority'
import {
  legacyAssistModeFromSupportStyle,
  normalizeLiveSupportStyle,
} from '@/lib/george/live-runtime/support-style'
import type {
  LivePrepSetup,
  LiveRuntimeSupport,
} from '@/lib/george/live-runtime/prep-runtime'
import {
  claimLiveRuntimeOwnerLease,
  releaseLiveRuntimeOwnerLease,
} from './live-runtime-owner'

const LIVE_RUNTIME_START_KEY = 'george_live_runtime_started_at'
const LIVE_ASSIST_MODE_KEY = 'george_live_assist_mode'
const LIVE_RUNTIME_SUPPORT_ACTIVE_KEY = 'george_live_runtime_support_active'
const LIVE_RUNTIME_SUPPORT_LEGACY_KEY = 'george_live_runtime_support'

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

  const supportStyle = normalizeLiveSupportStyle(setup?.supportStyle || setup?.liveAssistMode)
  const legacyAssistMode = legacyAssistModeFromSupportStyle(supportStyle)

  if (setup?.supportStyle || setup?.liveAssistMode) {
    window.localStorage.setItem(LIVE_ASSIST_MODE_KEY, legacyAssistMode)
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
  } else if (setup === null) {
    return
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
