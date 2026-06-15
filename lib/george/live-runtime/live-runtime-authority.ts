import type { LivePrepSetup, LiveRuntimeSupport } from './prep-runtime'

function clean(value: unknown) {
  return String(value || '').trim()
}

function firstClean(...values: unknown[]) {
  for (const value of values) {
    const next = clean(value)
    if (next) return next
  }
  return ''
}

export function resolveLiveRuntimeAuthority(params: {
  preparedSetup?: LivePrepSetup | null
  activeSetup?: LivePrepSetup | null
  lastSetup?: LivePrepSetup | null
  existingSupport?: LiveRuntimeSupport | null
}): LiveRuntimeSupport | null {
  const preparedSetup = params.preparedSetup || null
  const activeSetup = params.activeSetup || null
  const lastSetup = params.lastSetup || null

  const setup =
    preparedSetup ||
    activeSetup ||
    lastSetup ||
    null

  const existingSupport = params.existingSupport || null
  const setupSupport = setup?.runtimeSupport || null

  if (!setup && !existingSupport && !setupSupport) return null

  const room = firstClean(
    existingSupport?.room,
    setupSupport?.room,
    setup?.room,
    setupSupport?.purview?.label,
    existingSupport?.purview?.label
  )

  const objective = firstClean(
    existingSupport?.objective,
    setupSupport?.objective,
    setup?.objective,
    setupSupport?.purview?.line,
    setupSupport?.purview?.body,
    existingSupport?.purview?.line,
    existingSupport?.purview?.body
  )

  const chair = firstClean(
    existingSupport?.chair,
    setupSupport?.chair,
    setupSupport?.userPosition,
    existingSupport?.userPosition
  )

  return {
    ...(setupSupport || {}),
    ...(existingSupport || {}),
    ...(room ? { room } : {}),
    ...(objective ? { objective } : {}),
    ...(chair ? { chair } : {}),
    selectedCapacityCents:
      existingSupport?.selectedCapacityCents ??
      setupSupport?.selectedCapacityCents ??
      setup?.selectedCapacityCents ??
      null,
    selectedCapabilityIds:
      existingSupport?.selectedCapabilityIds ||
      setupSupport?.selectedCapabilityIds ||
      setup?.selectedCapabilityIds ||
      [],
    estimatedCents:
      existingSupport?.estimatedCents ??
      setupSupport?.estimatedCents ??
      setup?.estimatedCents ??
      null,
    purview:
      existingSupport?.purview ||
      setupSupport?.purview ||
      setup?.purview ||
      null,
    deliveryOverlay:
      existingSupport?.deliveryOverlay ||
      setupSupport?.deliveryOverlay ||
      setup?.deliveryOverlay ||
      null,
  }
}
