import { georgeConfidenceEngine } from './confidence-engine'
import { compressForDelivery, DELIVERY_PROFILES, type DeliveryProfileId } from './delivery-profile'
import { georgeEmotionalVelocity } from './emotional-velocity'
import { georgeLoadManager } from './load-manager'
import { georgePostureEngine } from './posture-engine'
import { georgePowerDynamics } from './power-dynamics'
import { reinforceObjective, type LiveObjective } from './objective-engine'
import { georgeTrajectoryEngine } from './trajectory-engine'
import { georgeRecoveryEngine } from './recovery-engine'
import { georgeSilenceIntelligence } from './silence-intelligence'
import {
  getLiveRuntimeConfig,
  type LiveRuntimeTier,
} from './tier-runtime'
import { georgeLiveRuntimeState, type LiveRuntimeSnapshot } from './live-runtime-state'
import { partialTranscriptRuntime } from './partial-stream'
import { georgeDecisionWindow } from './decision-window'
import { georgePressureMemory } from './pressure-memory'
import { georgeResponseShaper } from './response-shaper'
import { georgeTurnManager } from './turn-manager'
import { transcriptBuffer } from './transcript-buffer'
import { georgeSilenceDetector } from './silence-detector'

export type OrchestratorPacket = {
  speaker: 'other_party' | 'user' | 'george_instruction' | 'unclear'
  shouldSpeak: boolean
  volley: string
  cue: string
  status: string
  confidence: number
  shadowUsed?: boolean
  roomPressure?: 'low' | 'moderate' | 'high' | 'authority'
  interruptionRisk?: number
  responseMode?: string
  responseTone?: string
  responseCompression?: string
  deliveryStyle?: string
  intervention?: string
}

export type LiveOrchestratorInput = {
  text: string
  packet: OrchestratorPacket
  activeObjective: LiveObjective
  deliveryProfileId: DeliveryProfileId
  usedPrewarm: boolean
  tier?: LiveRuntimeTier
}

export type LiveOrchestratorResult = {
  packet: OrchestratorPacket
  runtimeSnapshot: LiveRuntimeSnapshot
  silence: {
    shouldHold: boolean
    reason: string
  }
  queueText: string
}

export function orchestrateLiveTurn(
  input: LiveOrchestratorInput
): LiveOrchestratorResult {
  const { text, activeObjective, deliveryProfileId, usedPrewarm, tier = 'brilliant' } = input
  const runtimeConfig = getLiveRuntimeConfig(tier)
  const nextPacket = { ...input.packet }
  void runtimeConfig

  nextPacket.confidence =
    georgeConfidenceEngine.compute({
      interruptionRisk: nextPacket.interruptionRisk,
      roomPressure: nextPacket.roomPressure,
      usedPrewarm,
      partialFresh: partialTranscriptRuntime.isPredictionFresh(),
    })

  const velocityState = georgeEmotionalVelocity.update({
    text,
    roomPressure: nextPacket.roomPressure,
    interruptionRisk: nextPacket.interruptionRisk,
    timestamp: Date.now(),
  })

  const powerState = georgePowerDynamics.analyze({
    text,
    speaker: nextPacket.speaker,
    roomPressure: nextPacket.roomPressure,
    interruptionRisk: nextPacket.interruptionRisk,
    emotionalVelocity: velocityState.velocity,
  })

  const trajectoryState = georgeTrajectoryEngine.evaluate({
    text,
    objectiveId: activeObjective.id,
    roomPressure: nextPacket.roomPressure,
    interruptionRisk: nextPacket.interruptionRisk,
    emotionalVelocity: velocityState.velocity,
    powerFrame: powerState.frame,
  })

  const recoveryState = georgeRecoveryEngine.detect({
    text,
    trajectory: trajectoryState.trajectory,
    powerFrame: powerState.frame,
    emotionalVelocity: velocityState.velocity,
    interruptionRisk: nextPacket.interruptionRisk,
  })

  const decisionWindow = georgeDecisionWindow.evaluate({
    text,
    confidence: nextPacket.confidence,
    roomPressure: nextPacket.roomPressure,
    interruptionRisk: nextPacket.interruptionRisk,
    trajectory: trajectoryState.trajectory,
    recovery: recoveryState.state,
    powerFrame: powerState.frame,
    emotionalVelocity: velocityState.velocity,
  })

  const dominantRoleState = transcriptBuffer.getDominantRole()

  const pressureMemory = georgePressureMemory.update({
    text,
    trajectory: trajectoryState.trajectory,
    recovery: recoveryState.state,
    roomPressure: nextPacket.roomPressure,
    interruptionRisk: nextPacket.interruptionRisk,
    decisionAction: decisionWindow.action,
    memoryWindow: runtimeConfig.memoryWindow,
    dominantRole: dominantRoleState.role,
  })

  const strongestRolePressure = Object.entries(pressureMemory.rolePressure).reduce(
    (strongest, current) => current[1] > strongest[1] ? current : strongest,
    ['neutral', 0]
  )

  const partialForecast =
    partialTranscriptRuntime.getLatest()?.forecast || 'none'

  const partialForecastConfidence =
    partialTranscriptRuntime.getLatest()?.forecastConfidence || 0

  const forecastBias =
    partialForecastConfidence < 0.55
      ? 'none'
      : partialForecast === 'interruption_likely'
        ? 'hold'
        : partialForecast === 'authority_takeover'
          ? 'minimal'
          : partialForecast === 'hesitation_detected'
            ? 'support'
            : partialForecast === 'objection_forming'
              ? 'proof'
              : partialForecast === 'close_window_forming'
                ? 'advance'
                : 'none'

  const controlSnapshot = georgeTurnManager.getControlSnapshot()

  const normalizedRoomPressure =
    powerState.frame === 'authority_controls' ||
    trajectoryState.trajectory === 'authority_risk'
      ? 'authority'
      : velocityState.velocity === 'spiking'
        ? 'high'
        : nextPacket.roomPressure

  const normalizedPressureReasons = [
    powerState.frame === 'other_party_controls' ? 'other-party-control' : '',
    trajectoryState.recommendedAction === 'hold' ? 'trajectory-hold' : '',
    decisionWindow.action === 'hold' ? 'decision-hold' : '',
    pressureMemory.fatigueScore > 0.72 ? 'fatigue' : '',
    recoveryState.shouldReset ? 'recovery-reset' : '',
    controlSnapshot.owner === 'other_party' ? 'other-party-floor' : '',
    velocityState.velocity === 'spiking' ? 'velocity-spike' : '',
  ].filter(Boolean)

  const normalizedInterruptionRisk = normalizedPressureReasons.length
    ? Math.max(nextPacket.interruptionRisk || 0, 0.84)
    : nextPacket.interruptionRisk

  const postureDecision = georgePostureEngine.decide({
    dominantRole: dominantRoleState.role,
    speaker: nextPacket.speaker,
    roomPressure: normalizedRoomPressure,
    interruptionRisk: normalizedInterruptionRisk,
    confidence: nextPacket.confidence,
    emotionalVelocity: velocityState.velocity,
  })


  let leverageState = 'stable'
  let escalationLikelihood = 0.18
  let interventionUrgency = forecastBias === 'advance' || forecastBias === 'support'
    ? 'moderate'
    : 'low'

  if (
    powerState.frame === 'other_party_controls' ||
    controlSnapshot.owner === 'other_party'
  ) {
    leverageState = 'user_losing_leverage'
    escalationLikelihood += runtimeConfig.allowTrajectoryPrediction ? 0.28 : 0.16
  }

  if (
    powerState.frame === 'user_controls' &&
    trajectoryState.trajectory === 'positive'
  ) {
    leverageState = 'user_gaining_leverage'
    escalationLikelihood -= 0.08
  }

  if (
    trajectoryState.trajectory === 'escalating_conflict' ||
    velocityState.velocity === 'spiking'
  ) {
    escalationLikelihood += runtimeConfig.allowAggressiveIntervention ? 0.38 : 0.22
  }

  escalationLikelihood = Math.max(
    0,
    Math.min(1, Number(escalationLikelihood.toFixed(2)))
  )

  if (
    runtimeConfig.allowAggressiveIntervention &&
    (
      escalationLikelihood > 0.72 ||
      pressureMemory.fatigueScore > 0.76
    )
  ) {
    interventionUrgency = 'high'
  } else if (
    escalationLikelihood >
    (0.48 + (1 - runtimeConfig.interventionSensitivity) * 0.18)
  ) {
    interventionUrgency = 'moderate'
  }


  const loadDecision = georgeLoadManager.decide({
    confidence: nextPacket.confidence,
    interruptionRisk: normalizedInterruptionRisk,
    roomPressure: normalizedRoomPressure,
    speaker: nextPacket.speaker,
    strongestRolePressure,
    forecastBias,
  })

  nextPacket.volley = reinforceObjective(
    nextPacket.volley,
    activeObjective
  )

  const runtimeWordLimit =
    velocityState.velocity === 'spiking'
      ? Math.min(runtimeConfig.maxSpokenWords, 5)
      : runtimeConfig.maxSpokenWords

  nextPacket.volley = georgeLoadManager.compress(
    nextPacket.volley,
    Math.min(loadDecision.maxWords, runtimeWordLimit)
  )

  nextPacket.cue = `${postureDecision.cuePrefix} ${recoveryState.repair} ${nextPacket.cue || ''}`.trim()

  const shapedResponse = georgeResponseShaper.shape({
    volley: nextPacket.volley,
    cue: nextPacket.cue,
    objectiveId: activeObjective.id,
    posture: postureDecision.posture,
    trajectory: trajectoryState.trajectory,
    recovery: recoveryState.state,
    decisionAction: decisionWindow.action,
    roomPressure: nextPacket.roomPressure,
    fatigueScore: pressureMemory.fatigueScore,
    failedCloseTurns: pressureMemory.failedCloseTurns,
    allowAggressiveIntervention: runtimeConfig.allowAggressiveIntervention,
    emotionalVelocity: velocityState.velocity,
    transcript: text,
    strongestRolePressure,
    responseMode: nextPacket.responseMode,
    responseTone: nextPacket.responseTone,
    responseCompression: nextPacket.responseCompression,
    deliveryStyle: nextPacket.deliveryStyle,
    intervention: nextPacket.intervention,
  })

  nextPacket.volley = shapedResponse.volley
  nextPacket.cue = shapedResponse.cue

  nextPacket.status = `${nextPacket.status} Objective: ${activeObjective.label}. Forecast bias: ${forecastBias}. Normalized pressure: ${normalizedRoomPressure}/${Number(normalizedInterruptionRisk || 0).toFixed(2)} (${normalizedPressureReasons.join(', ') || 'stable'}). ${loadDecision.reason} ${velocityState.reason} ${postureDecision.reason} ${powerState.reason} ${trajectoryState.reason} ${recoveryState.reason} ${decisionWindow.reason} ${pressureMemory.summary} Control: ${controlSnapshot.owner}. ${controlSnapshot.reason} Leverage: ${leverageState}. Dominant role: ${dominantRoleState.role ?? 'neutral'} (${dominantRoleState.score}). Role pressure: ${strongestRolePressure[0]} (${Number(strongestRolePressure[1]).toFixed(2)}). Forecast: ${partialForecast} (${Number(partialForecastConfidence).toFixed(2)}). Escalation: ${escalationLikelihood}. Urgency: ${interventionUrgency}. Response shaping: ${shapedResponse.reason}.`.trim()

  nextPacket.shouldSpeak =
    georgeConfidenceEngine.shouldSpeak(nextPacket.confidence)

  const runtimeSnapshot = georgeLiveRuntimeState.update({
    transcript: text,
    speaker: nextPacket.speaker,
    objective: activeObjective.id,
    confidence: nextPacket.confidence,
    roomPressure: nextPacket.roomPressure || 'low',
    interruptionRisk: nextPacket.interruptionRisk || 0,
    velocity: velocityState.velocity,
    powerFrame: powerState.frame,
    trajectory: trajectoryState.trajectory,
    recovery: recoveryState.state,
    posture: postureDecision.posture,
    load: loadDecision.state,
    deliveryProfile: deliveryProfileId,
    shouldSpeak: nextPacket.shouldSpeak,
    nextMove: nextPacket.volley,
    cue: `${decisionWindow.action.toUpperCase()}: ${nextPacket.cue}`.trim(),
    status: nextPacket.status,
    onDeck: shapedResponse.onDeck || '',
    calmingLine: shapedResponse.calmingLine || '',
    postureCue: shapedResponse.postureCue || '',
    leverageState,
    escalationLikelihood,
    interventionUrgency,
    dominantRole: dominantRoleState.role ?? 'neutral',
    dominantRoleScore: dominantRoleState.score,
    forecast: partialForecast,
    forecastConfidence: partialForecastConfidence,
    forecastBias,
  })

  const silence = georgeSilenceIntelligence.decide({
    confidence: nextPacket.confidence,
    interruptionRisk: normalizedInterruptionRisk,
    roomPressure: normalizedRoomPressure,
    speaker: nextPacket.speaker,
    deliveryProfile: deliveryProfileId,
    controlOwner: controlSnapshot.owner,
    msSinceSpeech: georgeSilenceDetector.msSinceSpeech(),
    forcedIntervention: /george|help me|what do i say|tell me what to say|say something|jump in|i need help/i.test(text.toLowerCase()),
    strongestRolePressure,
    trajectory: trajectoryState.trajectory,
    decisionAction: decisionWindow.action,
    forecastBias,
  })

  const silenceSnapshot = georgeLiveRuntimeState.update({
    silence: silence.shouldHold ? 'hold' : `speak:${silence.silenceType}`,
  })

  return {
    packet: nextPacket,
    runtimeSnapshot: silenceSnapshot || runtimeSnapshot,
    silence,
    queueText: compressForDelivery(
      nextPacket.volley,
      DELIVERY_PROFILES[deliveryProfileId]
    ),
  }
}
