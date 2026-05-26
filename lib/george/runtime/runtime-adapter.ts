import type { GeorgeRuntimeInterpretation } from '@/lib/george/runtime/runtime-interpretation'

export type GeorgeRuntimeAdapter = {
  shouldCompress: boolean
  shouldNarrow: boolean
  continuitySensitive: boolean
  livePressure: boolean
  emotionalCareNeeded: boolean
  responseMode: 'open' | 'direct' | 'compressed' | 'live'
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

  return {
    shouldCompress,
    shouldNarrow,
    continuitySensitive,
    livePressure,
    emotionalCareNeeded,
    responseMode,
    source: 'runtime_adapter',
  }
}
