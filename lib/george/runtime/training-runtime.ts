import {
  buildEvaluationResponse,
  buildTrainingFollowThrough,
  buildTrainingIntakeOverride,
  detectTrainingTrack,
  evaluateCDL,
  evaluateCNA,
  evaluateDrivers,
  evaluateGED,
  extractAnswers,
  type TrainingTrack,
} from '@/lib/george/training/training-helpers'

export type TrainingRuntimeResult = {
  response: string | null
  override: string | null
  guidedLine: string | null
  metadata: {
    track?: TrainingTrack | null
    score?: number
    total?: number
  }
}

export function resolveTrainingRuntime(input: {
  text: string
  activePromptContext: string | null
}): TrainingRuntimeResult {
  const text = input.text || ''
  const answers = extractAnswers(text)

  if (answers.length >= 3) {
    const track = detectTrainingTrack(text)

    if (track) {
      const result =
        track === 'drivers' ? evaluateDrivers(answers) :
        track === 'cdl' ? evaluateCDL(answers) :
        track === 'ged' ? evaluateGED(answers) :
        track === 'cna' ? evaluateCNA(answers) :
        null

      if (result) {
        return {
          response: buildEvaluationResponse(result),
          override: null,
          guidedLine: result.score === result.total
            ? 'You’re solid. Move forward.'
            : `You got ${result.score}/${result.total}. Fix weak points and try again.`,
          metadata: {
            track,
            score: result.score,
            total: result.total,
          },
        }
      }
    }
  }

  const followThrough = buildTrainingFollowThrough(text, input.activePromptContext)
  if (followThrough) {
    return {
      response: null,
      override: followThrough,
      guidedLine: null,
      metadata: {},
    }
  }

  const intakeOverride = buildTrainingIntakeOverride(text)
  if (intakeOverride) {
    return {
      response: null,
      override: intakeOverride,
      guidedLine: null,
      metadata: {},
    }
  }

  return {
    response: null,
    override: null,
    guidedLine: null,
    metadata: {},
  }
}
