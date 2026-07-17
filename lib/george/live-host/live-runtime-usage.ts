import {
  buildLiveRuntimeUsageRecord,
  type LivePrepSetup,
  type LiveRuntimeSupport,
  type LiveRuntimeUsageRecord,
} from '@/lib/george/live-runtime/prep-runtime'
import {
  clearLiveRuntimeStartedAt,
  readActiveLiveRuntimeSupport,
  readLiveRuntimeStartedAt,
} from './live-prep-storage'

const LIVE_RUNTIME_USAGE_KEY = 'GEORGE_LIVE_SESSION_METRICS'

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
