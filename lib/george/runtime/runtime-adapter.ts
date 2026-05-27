import type { GeorgeRuntimeInterpretation } from '@/lib/george/runtime/runtime-interpretation'

export type GeorgeRuntimeAdapter = {
  shouldCompress: boolean
  shouldNarrow: boolean
  continuitySensitive: boolean
  livePressure: boolean
  emotionalCareNeeded: boolean
  responseMode: 'open' | 'direct' | 'compressed' | 'live'
  cognitiveLoad: 'low' | 'medium' | 'high'
  deliveryPosture: 'steady' | 'direct' | 'compressed' | 'live_ready' | 'continuity_restore'
  agencyReminder: boolean
  source: 'runtime_adapter'
}

export function buildRuntimeAdapter(
  interpretation: GeorgeRuntimeInterpretation
): GeorgeRuntimeAdapter {
  const livePressure =
    interpretation.modeBias === 'live_pressure' ||
    interpretation.liveWeight >= 0.6

  const continuitySensitive =
    interpretation.modeBias === 'continuity_reconnect' ||
    interpretation.continuityWeight >= 0.6

  const shouldCompress =
    livePressure ||
    interpretation.responseCompression === 'high' ||
    interpretation.narrowingPressure >= 0.75

  const shouldNarrow =
    interpretation.narrowingPressure >= 0.6 &&
    interpretation.modeBias !== 'exploratory'

  const emotionalCareNeeded =
    interpretation.emotionalWeight >= 0.55

  const responseMode: GeorgeRuntimeAdapter['responseMode'] =
    livePressure
      ? 'live'
      : shouldCompress
        ? 'compressed'
        : shouldNarrow
          ? 'direct'
          : 'open'

  const cognitiveLoad: GeorgeRuntimeAdapter['cognitiveLoad'] =
    livePressure || shouldCompress || interpretation.emotionalWeight >= 0.68
      ? 'high'
      : shouldNarrow || continuitySensitive || interpretation.emotionalWeight >= 0.42
        ? 'medium'
        : 'low'

  const deliveryPosture: GeorgeRuntimeAdapter['deliveryPosture'] =
    livePressure
      ? 'live_ready'
      : continuitySensitive
        ? 'continuity_restore'
        : shouldCompress
          ? 'compressed'
          : shouldNarrow
            ? 'direct'
            : 'steady'

  return {
    shouldCompress,
    shouldNarrow,
    continuitySensitive,
    livePressure,
    emotionalCareNeeded,
    responseMode,
    cognitiveLoad,
    deliveryPosture,
    agencyReminder:
      interpretation.modeBias === 'continuity_reconnect' ||
      interpretation.emotionalWeight >= 0.55 ||
      interpretation.narrowingPressure >= 0.72,
    source: 'runtime_adapter',
  }
}

export function buildRuntimeAdapterNote(adapter: GeorgeRuntimeAdapter) {
  return `
GEORGE RUNTIME ADAPTER
- Treat this as live runtime guidance for delivery, not a separate personality.
- GEORGE adjusts by default, but the user retains agency and final authority.
- Delivery posture: ${adapter.deliveryPosture}.
- Response mode: ${adapter.responseMode}.
- Cognitive load estimate: ${adapter.cognitiveLoad}.
- Compress when useful: ${adapter.shouldCompress ? 'yes' : 'no'}.
- Narrow when useful: ${adapter.shouldNarrow ? 'yes' : 'no'}.
- Continuity-sensitive: ${adapter.continuitySensitive ? 'yes' : 'no'}.
- Emotional care needed: ${adapter.emotionalCareNeeded ? 'yes' : 'no'}.
- If posture changes materially, surface it briefly and operationally. Do not countermand the user; warn, orient, then move with them.
- Demonstrate understanding through accurate synthesis, not generic reassurance.
- Match cognitive load tolerance and situational pressure, not merely word count.
`.trim()
}
