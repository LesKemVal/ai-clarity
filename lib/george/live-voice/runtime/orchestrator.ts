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
import { georgeLiveRuntimeState, type LiveRuntimeSnapshot } from './live-runtime-state'
import { partialTranscriptRuntime } from './partial-stream'
import { georgeDecisionWindow } from './decision-window'
import { georgePressureMemory } from './pressure-memory'
import { georgeResponseShaper } from './response-shaper'
import { georgeTurnManager } from './turn-manager'
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
}

export type LiveOrchestratorInput = {
  text: string
  packet: OrchestratorPacket
  activeObjective: LiveObjective
  deliveryProfileId: DeliveryProfileId
  usedPrewarm: boolean
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
  const { text, activeObjective, deliveryProfileId, usedPrewarm } = input
  const nextPacket = { ...input.packet }

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

  const pressureMemory = georgePressureMemory.update({
    text,
    trajectory: trajectoryState.trajectory,
    recovery: recoveryState.state,
    roomPressure: nextPacket.roomPressure,
    interruptionRisk: nextPacket.interruptionRisk,
    decisionAction: decisionWindow.action,
  })

  const controlSnapshot = georgeTurnManager.getControlSnapshot()

  const postureDecision = georgePostureEngine.decide({
    speaker: nextPacket.speaker,
    roomPressure:
      powerState.frame === 'authority_controls' ||
      trajectoryState.trajectory === 'authority_risk'
        ? 'authority'
        : nextPacket.roomPressure,
    interruptionRisk:
      powerState.frame === 'other_party_controls' ||
      trajectoryState.recommendedAction === 'hold' ||
      decisionWindow.action === 'hold' ||
      pressureMemory.fatigueScore > 0.72 ||
      recoveryState.shouldReset ||
      controlSnapshot.owner === 'other_party'
        ? Math.max(nextPacket.interruptionRisk || 0, 0.82)
        : nextPacket.interruptionRisk,
    confidence: nextPacket.confidence,
    emotionalVelocity: velocityState.velocity,
  })


  let leverageState = 'stable'
  let escalationLikelihood = 0.18
  let interventionUrgency = 'low'

  if (
    powerState.frame === 'other_party_controls' ||
    controlSnapshot.owner === 'other_party'
  ) {
    leverageState = 'user_losing_leverage'
    escalationLikelihood += 0.28
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
    escalationLikelihood += 0.38
  }

  escalationLikelihood = Math.max(
    0,
    Math.min(1, Number(escalationLikelihood.toFixed(2)))
  )

  if (
    escalationLikelihood > 0.72 ||
    pressureMemory.fatigueScore > 0.76
  ) {
    interventionUrgency = 'high'
  } else if (escalationLikelihood > 0.48) {
    interventionUrgency = 'moderate'
  }


  const loadDecision = georgeLoadManager.decide({
    confidence: nextPacket.confidence,
    interruptionRisk:
      postureDecision.posture === 'silent' ||
      velocityState.velocity === 'spiking' ||
      pressureMemory.fatigueScore > 0.72 ||
      controlSnapshot.owner === 'other_party'
        ? Math.max(nextPacket.interruptionRisk || 0, 0.85)
        : nextPacket.interruptionRisk,
    roomPressure:
      velocityState.velocity === 'spiking'
        ? 'high'
        : nextPacket.roomPressure,
    speaker: nextPacket.speaker,
  })

  nextPacket.volley = reinforceObjective(
    nextPacket.volley,
    activeObjective
  )

  nextPacket.volley = georgeLoadManager.compress(
    nextPacket.volley,
    velocityState.velocity === 'spiking'
      ? Math.min(loadDecision.maxWords, 5)
      : loadDecision.maxWords
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
    emotionalVelocity: velocityState.velocity,
    transcript: text,
  })

  nextPacket.volley = shapedResponse.volley
  nextPacket.cue = shapedResponse.cue

  nextPacket.status = `${nextPacket.status} Objective: ${activeObjective.label}. ${loadDecision.reason} ${velocityState.reason} ${postureDecision.reason} ${powerState.reason} ${trajectoryState.reason} ${recoveryState.reason} ${decisionWindow.reason} ${pressureMemory.summary} Control: ${controlSnapshot.owner}. ${controlSnapshot.reason} Leverage: ${leverageState}. Escalation: ${escalationLikelihood}. Urgency: ${interventionUrgency}. Response shaping: ${shapedResponse.reason}.`.trim()

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
    leverageState,
    escalationLikelihood,
    interventionUrgency,
  })

  const silence = georgeSilenceIntelligence.decide({
    confidence: nextPacket.confidence,
    interruptionRisk:
      decisionWindow.action === 'hold' ||
      pressureMemory.fatigueScore > 0.72 ||
      controlSnapshot.owner === 'other_party' ||
      nextPacket.status?.includes('Interaction is accelerating toward conflict')
        ? Math.max(nextPacket.interruptionRisk || 0, 0.86)
        : nextPacket.interruptionRisk,
    roomPressure: nextPacket.roomPressure,
    speaker: nextPacket.speaker,
    deliveryProfile: deliveryProfileId,
    controlOwner: controlSnapshot.owner,
    msSinceSpeech: georgeSilenceDetector.msSinceSpeech(),
    forcedIntervention: /george|help me|what do i say|tell me what to say|say something|jump in|i need help/i.test(text.toLowerCase()),
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
