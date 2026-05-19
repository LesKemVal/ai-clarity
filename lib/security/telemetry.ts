type TelemetryLevel = 'info' | 'warn' | 'error'

function scrub(value: unknown) {
  if (typeof value !== 'string') return value

  if (value.includes('@')) {
    const [name, domain] = value.split('@')
    return `${name.slice(0, 2)}***@${domain || 'unknown'}`
  }

  if (value.length > 120) return `${value.slice(0, 120)}…`
  return value
}

export function logOperationalEvent(
  event: string,
  metadata: Record<string, unknown> = {},
  level: TelemetryLevel = 'info'
) {
  const safeMetadata = Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [key, scrub(value)])
  )

  const payload = {
    event,
    ts: new Date().toISOString(),
    ...safeMetadata,
  }

  if (level === 'error') {
    console.error('[GEORGE][ops]', payload)
    return
  }

  if (level === 'warn') {
    console.warn('[GEORGE][ops]', payload)
    return
  }

  console.info('[GEORGE][ops]', payload)
}
