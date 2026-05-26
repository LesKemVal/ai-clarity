import type { GeorgeIntentState } from '@/lib/george/runtime/intent-state'

export type GeorgeRuntimeModeBias =
  | 'exploratory'
  | 'operational'
  | 'live_pressure'
  | 'continuity_reconnect'

export type GeorgeRuntimeCompression = 'low' | 'medium' | 'high'

export type GeorgeRuntimeInterpretation = {
  modeBias: GeorgeRuntimeModeBias
  responseCompression: GeorgeRuntimeCompression
  narrowingPressure: number
  continuityWeight: number
  liveWeight: number
  emotionalWeight: number
  source: 'runtime_interpretation'
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

export function buildRuntimeInterpretation(
  intentState: GeorgeIntentState
): GeorgeRuntimeInterpretation {
  const modeBias: GeorgeRuntimeModeBias =
    intentState.liveRisk || intentState.liveScenario.active
      ? 'live_pressure'
      : intentState.continuityDependency >= 0.6
        ? 'continuity_reconnect'
        : intentState.operational
          ? 'operational'
          : 'exploratory'

  const responseCompression: GeorgeRuntimeCompression =
    intentState.liveRisk || intentState.pressureLevel === 'high'
      ? 'high'
      : intentState.operational || intentState.narrowingReadiness >= 0.6
        ? 'medium'
        : 'low'

  return {
    modeBias,
    responseCompression,
    narrowingPressure: clamp01(intentState.narrowingReadiness),
    continuityWeight: clamp01(intentState.continuityDependency),
    liveWeight: clamp01(intentState.liveScenario.active ? 0.75 : 0),
    emotionalWeight: clamp01(intentState.emotionalLoad),
    source: 'runtime_interpretation',
  }
}
