export type LiveRuntimeTier = 'smart' | 'intelligent' | 'brilliant'

export type LiveRuntimeTierConfig = {
  orchestrationCadenceMs: number
  interventionSensitivity: number
  predictiveDepth: number
  memoryWindow: number
  maxSpokenWords: number
  allowTrajectoryPrediction: boolean
  allowAggressiveIntervention: boolean
  preserveBridgeLanguage: boolean
}

export const LIVE_RUNTIME_CONFIG: Record<LiveRuntimeTier, LiveRuntimeTierConfig> = {
  smart: {
    orchestrationCadenceMs: 2200,
    interventionSensitivity: 0.35,
    predictiveDepth: 0,
    memoryWindow: 2,
    maxSpokenWords: 10,
    allowTrajectoryPrediction: false,
    allowAggressiveIntervention: false,
    preserveBridgeLanguage: false,
  },

  intelligent: {
    orchestrationCadenceMs: 1350,
    interventionSensitivity: 0.62,
    predictiveDepth: 1,
    memoryWindow: 5,
    maxSpokenWords: 18,
    allowTrajectoryPrediction: true,
    allowAggressiveIntervention: false,
    preserveBridgeLanguage: true,
  },

  brilliant: {
    orchestrationCadenceMs: 700,
    interventionSensitivity: 0.9,
    predictiveDepth: 3,
    memoryWindow: 12,
    maxSpokenWords: 28,
    allowTrajectoryPrediction: true,
    allowAggressiveIntervention: true,
    preserveBridgeLanguage: true,
  },
}

export function getLiveRuntimeConfig(
  tier: LiveRuntimeTier = 'smart'
) {
  return LIVE_RUNTIME_CONFIG[tier]
}
