import { detectConversationSignals } from '@/lib/george/live-voice/runtime/conversation-signals'
import { classifyLiveSpeakerIntent } from '@/lib/george/live-voice/runtime/speaker-intent'
import { analyzeRoom } from '@/lib/george/live-voice/runtime/room-analyzer'
import { inferObjectiveHypothesis } from '@/lib/george/live-voice/runtime/objective-engine'
import { georgeTrajectoryEngine } from '@/lib/george/live-voice/runtime/trajectory-engine'
import { deriveActiveOutcome } from '@/lib/george/live-voice/runtime/active-outcome'
import { georgeOutcomeGovernor } from '@/lib/george/live-voice/runtime/outcome-governor'
import { createGeorgeCoreInterpretation } from './interpretation'
import { evaluateSignalSufficiency } from '@/lib/george/runtime/signal-sufficiency'
import { rankSignals } from '@/lib/george/runtime/signal-ranking'
import { arbitrateRuntimeSignals } from '@/lib/george/runtime/runtime-signal-arbitrator'
import { buildGeorgeOperationalUnderstanding } from '@/lib/george/core/operational-understanding'

export function buildGeorgeCoreInterpretation(input: {
  transcript: string
  shadowMap?: string
  knownUserSpeaking?: boolean
  room?: string
  desiredOutcome?: string
  knownContext?: string
  userPosition?: string
}) {
  const text = String(input.transcript || '').trim()

  const understanding = buildGeorgeOperationalUnderstanding({
    transcript: text,
    objective: input.desiredOutcome,
    room: input.room,
    knownContext: input.knownContext,
    userPosition: input.userPosition,
  })

  const operationalObjective = understanding.operationalObjective

  const context = [input.shadowMap, text, understanding.persistentSignalSummary].filter(Boolean).join('\n')
  const signalText = [operationalObjective, input.knownContext, context].filter(Boolean).join('\n')

  const conversationSignals = detectConversationSignals(context)

  const speakerIntent = classifyLiveSpeakerIntent({
    transcript: text,
    knownUserSpeaking: input.knownUserSpeaking,
    activeRoom: input.room,
    objective: operationalObjective,
  })

  const roomAnalysis = analyzeRoom(context)

  const objectiveHypothesis = inferObjectiveHypothesis(
    [operationalObjective, input.room, input.knownContext, text]
      .filter(Boolean)
      .join(' ')
  )
  const objective = objectiveHypothesis.objective

  const trajectory = georgeTrajectoryEngine.evaluate({
    text: context,
    objectiveId: objective,
    roomPressure: roomAnalysis.pressure,
    interruptionRisk: roomAnalysis.interruptionRisk,
    emotionalVelocity:
      roomAnalysis.emotionalTemperature > 0.78
        ? 'spiking'
        : roomAnalysis.emotionalTemperature > 0.55
          ? 'rising'
          : 'stable',
  })

  const activeOutcome = deriveActiveOutcome({
    desiredOutcome: operationalObjective,
    room: input.room,
    transcript: text,
    userPosition: input.userPosition,
    knownContext: input.knownContext,
  })

  const userHasRequestedHelp =
    speakerIntent.intent === 'addressed_to_george' ||
    speakerIntent.intent === 'assisted_continuation'

  const signalSufficiency = evaluateSignalSufficiency({
    transcript: text,
    outcome: operationalObjective,
    context: input.knownContext,
  })

  const rankedSignals = rankSignals(signalText)

  const outcomeGovernor = georgeOutcomeGovernor.evaluate({
    objectiveKnown: Boolean(input.desiredOutcome) || objectiveHypothesis.confidence >= 0.72,
    desiredOutcome: operationalObjective,
    activeOutcome,
    confidence: Math.max(speakerIntent.confidence, trajectory.score),
    consequence:
      roomAnalysis.pressure === 'authority' || roomAnalysis.pressure === 'high'
        ? 'high'
        : 'moderate',
    opportunityCost:
      trajectory.trajectory === 'decision_ready' ? 'high' : 'moderate',
    userPosition: input.userPosition,
    knownContextAvailable: Boolean(input.knownContext),
    userHasRequestedHelp,
    roomHasRecentSignal: conversationSignals.signals.length > 0,
    missingCriticalSignal:
      speakerIntent.intent === 'ambiguous' &&
      conversationSignals.signals.length === 0,
    userPositionAtRisk:
      roomAnalysis.pressure === 'authority' ||
      trajectory.trajectory === 'escalating_conflict',
    canAcquireContextNaturally:
      speakerIntent.intent === 'addressed_to_george' ||
      speakerIntent.intent === 'ambiguous',
  })

  const operationalConfidence = Number(
    Math.max(
      signalSufficiency.confidence,
      speakerIntent.confidence,
      trajectory.score
    ).toFixed(3)
  )

  const signalArbitration = arbitrateRuntimeSignals({
    explicitUserSignal: userHasRequestedHelp,
    objectiveRisk: ['protect_position', 'buy_time', 'context_recovery'].includes(outcomeGovernor.move),
    livePressure: roomAnalysis.pressure === 'authority' || roomAnalysis.pressure === 'high',
    emotionalCareNeeded: roomAnalysis.emotionalTemperature > 0.7,
    shouldCompress: input.room === 'LIVE' || input.room === 'Investor Meeting',
    shouldNarrow: !signalSufficiency.sufficient,
  })

  return createGeorgeCoreInterpretation({
    speakerIntent,
    conversationSignals,
    roomAnalysis,
    objective,
    objectiveHypothesis,
    trajectory,
    activeOutcome,
    outcomeGovernor,
    signalSufficiency,
    rankedSignals,
    signalArbitration,
    operationalReadiness: signalSufficiency.sufficient ? 'sufficient' : 'needs_signal',
    operationalConfidence,
  })
}
