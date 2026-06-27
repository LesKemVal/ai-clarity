import type { GeorgeActionCue, GeorgeLiveHubContext } from '@/lib/george/live-hub/types'
import { markRuntimeEvent } from '@/lib/george/live-metrics/runtime-metrics'
import { violatesEvidenceAuthority } from './evidence-gate'
import { safeContinuationReplacement } from './continuation-replacement'

function buildActionCueAuthorityEvidence(input: {
  actionCue: GeorgeActionCue
  context?: GeorgeLiveHubContext
}) {
  return [
    input.actionCue.evidence?.transcript,
    input.actionCue.evidence?.recentTranscript,
    input.actionCue.evidence?.room,
    input.actionCue.evidence?.objective,
    input.actionCue.evidence?.knownContext,
    input.actionCue.evidence?.secondaryOutcome,
    input.actionCue.evidence?.secondaryObjective,
    input.actionCue.evidence?.intangibleObjective,
    input.actionCue.evidence?.userPosition,
    input.actionCue.evidence?.deliveryStyle,
    input.actionCue.evidence?.runtimeIntent,
    input.context?.room,
    input.context?.objective,
    input.context?.knownContext,
  ].join(' ')
}

function extractContinuationText(rawCue: string) {
  const cleanGenerated = String(rawCue || '')
    .replace(/^(cue|advice|say|ask|response|presentation):\s*/i, '')
    .replace(/^["“”]+|["“”]+$/g, '')
    .trim()

  if (cleanGenerated.startsWith('...')) return cleanGenerated

  const withoutCueOpening = cleanGenerated
    .replace(/^good[—,\-\s]+then\s+/i, '')
    .replace(/^good[—,\-\s]+/i, '')
    .replace(/^then\s+/i, '')
    .trim()

  if (!withoutCueOpening) return cleanGenerated

  const imperativeCuePattern =
    /^(ask|clarify|maintain|reassess|slow|pause|control|anchor|focus|lead|return|listen|confirm|probe|surface|verify|build)\b/i

  if (imperativeCuePattern.test(withoutCueOpening)) return cleanGenerated

  const startsLikeSentence =
    /^(whether|because|that|so|if|when|while|without|with|by|to|as|and|but|or|which|who|what|where|why|how)\b/i.test(withoutCueOpening)

  if (startsLikeSentence || withoutCueOpening.length > 90) {
    return `...${withoutCueOpening.replace(/^[.,;:!?\s]+/, '')}`
  }

  return cleanGenerated
}

export function finalizeGeorgeActionCueAuthority(input: {
  actionCue: GeorgeActionCue
  context?: GeorgeLiveHubContext
}): GeorgeActionCue {
  const deliveryStyle =
    input.actionCue.evidence?.deliveryStyle ||
    input.context?.deliveryStyle

  if (deliveryStyle !== 'continue') return input.actionCue

  const text = extractContinuationText(input.actionCue.cue)
  if (!text) return input.actionCue

  const evidence = buildActionCueAuthorityEvidence(input)
  const authority = violatesEvidenceAuthority(text, evidence)

  console.info('[GEORGE][core][action-cue-authority-check]', {
    deliveryStyle,
    originalCue: input.actionCue.cue,
    text,
    evidence,
    evidenceFromActionCue: input.actionCue.evidence,
    context: input.context,
    violates: authority.violates,
    reason: authority.reason,
    unsupportedTerms: authority.unsupportedTerms,
  })

  if (!authority.violates) {
    markRuntimeEvent(input.actionCue.turnId || text, 'core_authority_pass')

    return {
      ...input.actionCue,
      cue: text,
    }
  }

  const replacementText = safeContinuationReplacement({
    fallback: text,
    transcript: input.actionCue.evidence?.transcript || text,
    lastFiveSeconds: input.actionCue.evidence?.recentTranscript,
    desiredOutcome: input.actionCue.evidence?.objective || input.context?.objective,
    activeOutcome:
      input.actionCue.evidence?.secondaryOutcome ||
      input.actionCue.evidence?.secondaryObjective ||
      input.actionCue.evidence?.intangibleObjective,
    shadowMap: [
      input.actionCue.evidence?.knownContext,
      input.actionCue.evidence?.userPosition,
      input.actionCue.evidence?.deliveryStyle,
      input.actionCue.evidence?.runtimeIntent,
      input.context?.knownContext,
    ].join(' '),
  })

  console.warn('[GEORGE][core][action-cue-authority-replaced]', {
    reason: authority.reason,
    unsupportedTerms: authority.unsupportedTerms,
    originalText: text,
    replacementText,
  })

  markRuntimeEvent(input.actionCue.turnId || text, 'core_authority_replaced')

  return {
    ...input.actionCue,
    cue: replacementText,
  }
}
