const clamp01 = (value: number) =>
  Math.max(0, Math.min(1, value))

export type RuntimeOutcomeSignals = {
  clarityImproved: number
  overloadDetected: number
  userConfidenceImproved: number
  pressureReduced: number
  leverageImproved: number
  executionLikelihood: number
}

export function evaluateRuntimeOutcomeSignals(input: {
  latestUserText: string
  previousAssistantLength?: number
  pressureHigh?: boolean
}) {
  const text = input.latestUserText.toLowerCase()

  const clarityImproved = clamp01(
    (
      (/\b(got it|understood|makes sense|okay|i see|that helps)\b/.test(text) ? 0.45 : 0) +
      (/\b(next step|so i should|i'll do|let's do|i can do that)\b/.test(text) ? 0.35 : 0)
    )
  )

  const overloadDetected = clamp01(
    (
      (/\b(too much|shorter|brief|confused|slow down|what\?)\b/.test(text) ? 0.55 : 0) +
      (
        input.previousAssistantLength &&
        input.previousAssistantLength > 900 &&
        text.split(/\s+/).length <= 4
          ? 0.35
          : 0
      )
    )
  )

  const userConfidenceImproved = clamp01(
    /\b(i can do that|i got this|understood|i'm ready|okay)\b/.test(text)
      ? 0.62
      : 0.28
  )

  const pressureReduced = clamp01(
    /\b(calm|better|steady|less worried|that helps)\b/.test(text)
      ? 0.58
      : input.pressureHigh
        ? 0.24
        : 0.4
  )

  const leverageImproved = clamp01(
    /\b(better position|more leverage|they agreed|approval|progress)\b/.test(text)
      ? 0.7
      : 0.32
  )

  const executionLikelihood = clamp01(
    (
      (/\b(i will|i'll|doing it|next step|send it|call them)\b/.test(text) ? 0.52 : 0.2) +
      (clarityImproved * 0.2)
    )
  )

  return {
    clarityImproved,
    overloadDetected,
    userConfidenceImproved,
    pressureReduced,
    leverageImproved,
    executionLikelihood,
    note: buildRuntimeOutcomeLearningNote({
      clarityImproved,
      overloadDetected,
      userConfidenceImproved,
      pressureReduced,
      leverageImproved,
      executionLikelihood,
    }),
  }
}

function buildRuntimeOutcomeLearningNote(
  signals: RuntimeOutcomeSignals
) {
  return `
RUNTIME OUTCOME LEARNING
- Treat outcome interpretation as probabilistic.
- Do not pretend certainty about user psychology.
- Quietly adapt when signals are weak.
- Ask briefly when signals become strong.

Observed outcome tendencies:
- clarity improved: ${signals.clarityImproved.toFixed(2)}
- overload detected: ${signals.overloadDetected.toFixed(2)}
- confidence improved: ${signals.userConfidenceImproved.toFixed(2)}
- pressure reduced: ${signals.pressureReduced.toFixed(2)}
- leverage improved: ${signals.leverageImproved.toFixed(2)}
- execution likelihood: ${signals.executionLikelihood.toFixed(2)}

Behavior guidance:
- If overload rises:
  reduce density immediately.
- If clarity rises:
  continue current structure.
- If execution likelihood rises:
  narrow toward action.
- If pressure reduces:
  avoid unnecessary escalation.
`.trim()
}
