export const GEORGE_RUNTIME_CONTROL_KEYS = {
  adaptiveLearning: 'GEORGE_ADAPTIVE_LEARNING',
  durableMemory: 'GEORGE_DURABLE_MEMORY',
  continuity: 'GEORGE_CONTINUITY',
  earbudCompression: 'GEORGE_EARBUD_COMPRESSION',
} as const

export function readRuntimeControl(
  key: keyof typeof GEORGE_RUNTIME_CONTROL_KEYS,
  fallback = 'auto'
) {
  if (typeof window === 'undefined') return fallback

  const storageKey = GEORGE_RUNTIME_CONTROL_KEYS[key]
  const value = window.localStorage.getItem(storageKey)

  if (value === null) return fallback

  if (value === 'on') return 'on'
  if (value === 'off') return 'off'

  return 'auto'
}

export function writeRuntimeControl(
  key: keyof typeof GEORGE_RUNTIME_CONTROL_KEYS,
  value: 'auto' | 'on' | 'off'
) {
  if (typeof window === 'undefined') return

  const storageKey = GEORGE_RUNTIME_CONTROL_KEYS[key]

  window.localStorage.setItem(storageKey, value)
}

export function resetGeorgeRuntimeMemory() {
  if (typeof window === 'undefined') return

  const keys = [
    'GEORGE_MEMORY',
    'GEORGE_SESSIONS',
    'GEORGE_LAST_FOLDER',
    'george_active_context',
    'george_active_label',
  ]

  for (const key of keys) {
    window.localStorage.removeItem(key)
  }
}
