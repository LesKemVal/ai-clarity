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
      recoveryState.shouldReset
        ? Math.max(nextPacket.interruptionRisk || 0, 0.82)
        : nextPacket.interruptionRisk,
    confidence: nextPacket.confidence,
    emotionalVelocity: velocityState.velocity,
  })

  const loadDecision = georgeLoadManager.decide({
    confidence: nextPacket.confidence,
    interruptionRisk:
      postureDecision.posture === 'silent' ||
      velocityState.velocity === 'spiking'
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

  nextPacket.status = `${nextPacket.status} Objective: ${activeObjective.label}. ${loadDecision.reason} ${velocityState.reason} ${postureDecision.reason} ${powerState.reason} ${trajectoryState.reason} ${recoveryState.reason} ${decisionWindow.reason}`.trim()

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
  })

  const silence = georgeSilenceIntelligence.decide({
    confidence: nextPacket.confidence,
    interruptionRisk:
      decisionWindow.action === 'hold' ||
      nextPacket.status?.includes('Interaction is accelerating toward conflict')
        ? Math.max(nextPacket.interruptionRisk || 0, 0.86)
        : nextPacket.interruptionRisk,
    roomPressure: nextPacket.roomPressure,
    speaker: nextPacket.speaker,
    deliveryProfile: deliveryProfileId,
  })

  const silenceSnapshot = georgeLiveRuntimeState.update({
    silence: silence.shouldHold ? 'hold' : 'speak',
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
