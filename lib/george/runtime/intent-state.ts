import {
  classifyControlState,
  scoreRuntimeSignals,
  detectLikelyBottleneck,
  detectLiveScenario,
  type ChatSignalMessage,
} from '@/lib/george/chat/runtime-signals'
import { detectCadenceAvoidance } from '@/lib/george/chat/runtime-signals'

export type GeorgePressureLevel = 'low' | 'medium' | 'high'
export type GeorgeObjectiveState = 'clear' | 'emerging' | 'unclear'
export type GeorgeIntentState = {
  operational: boolean
  exploratory: boolean
  actionable: boolean
  pressureLevel: GeorgePressureLevel
  objectiveState: GeorgeObjectiveState
  narrowingReadiness: number
  continuityDependency: number
  liveRisk: boolean
  emotionalLoad: number
  cadenceAvoid: string[]
  bottleneck: {
    label: string
    confidence: string
  }
  liveScenario: {
    active: boolean
    type: string
  }
  source: 'passive_aggregator'
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

export function buildPassiveIntentState(input: {
  latestUserText: string
  messages: ChatSignalMessage[]
  promptContext?: string | null
}): GeorgeIntentState {
  const text = input.latestUserText.toLowerCase().trim()
  const control = classifyControlState(input.latestUserText)
  const scores = scoreRuntimeSignals(input.latestUserText)
  const bottleneck = detectLikelyBottleneck(input.latestUserText)
  const liveScenario = detectLiveScenario(input.latestUserText, input.promptContext)
  const cadenceAvoid = detectCadenceAvoidance(input.messages)

  const wordCount = text ? text.split(/\s+/).length : 0
  const asksHowOrWhat = /\b(how|what|which|where|when|why|should|can)\b/.test(text)
  const executionWords = /build|launch|start|create|write|fix|send|call|apply|plan|strategy|next|go|do this|make/i.test(text)
  const explorationWords = /explain|understand|learn|what is|what does|tell me about|curious|research/i.test(text)
  const continuityWords = /before|earlier|remember|last time|continue|pick up where we left off|as i said/i.test(text)
  const emotionalWords = /hurt|angry|sad|depressed|anxious|stress|stressed|upset|overwhelmed|afraid|scared|worried/i.test(text)

  const pressureLevel = control.pressureLevel.toLowerCase() as GeorgePressureLevel

  const objectiveState: GeorgeObjectiveState =
    control.objectiveMode === 'clarification' || wordCount <= 3
      ? 'unclear'
      : asksHowOrWhat && !executionWords
        ? 'emerging'
        : 'clear'

  const operational =
    executionWords ||
    control.objectiveMode === 'execution' ||
    control.objectiveMode === 'planning' ||
    control.objectiveMode === 'writing' ||
    liveScenario.active

  const exploratory =
    explorationWords ||
    (!operational && objectiveState !== 'clear')

  const actionable =
    operational &&
    (pressureLevel === 'high' ||
      liveScenario.active ||
      /today|tomorrow|now|asap|deadline|court|meeting|call|interview|send|file|pay|buy|sign/i.test(text))

  const narrowingReadiness = clamp01(
    (scores.confusionScore >= 4 ? 0.75 : 0) +
      (bottleneck.confidence === 'high' ? 0.25 : 0) +
      (operational ? 0.2 : 0) -
      (exploratory ? 0.25 : 0)
  )

  const continuityDependency = clamp01(
    (continuityWords ? 0.7 : 0) +
      (input.messages.length > 10 ? 0.25 : 0)
  )

  const emotionalLoad = clamp01(
    (emotionalWords ? 0.55 : 0) +
      (control.userState === 'emotional' || control.userState === 'overwhelmed' ? 0.35 : 0) +
      (scores.seriousnessScore >= 4 ? 0.1 : 0)
  )

  return {
    operational,
    exploratory,
    actionable,
    pressureLevel,
    objectiveState,
    narrowingReadiness,
    continuityDependency,
    liveRisk: liveScenario.active && actionable,
    emotionalLoad,
    cadenceAvoid,
    bottleneck,
    liveScenario,
    source: 'passive_aggregator',
  }
}
