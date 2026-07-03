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
    input.actionCue.evidence?.briefingKnowledge,
    input.actionCue.evidence?.secondaryOutcome,
    input.actionCue.evidence?.secondaryObjective,
    input.actionCue.evidence?.intangibleObjective,
    input.actionCue.evidence?.userPosition,
    input.actionCue.evidence?.deliveryStyle,
    input.actionCue.evidence?.runtimeIntent,
    input.context?.room,
    input.context?.objective,
    input.context?.knownContext,
    input.context?.briefingKnowledge,
  ].join(' ')
}

function cleanAuthorityText(rawCue: string) {
  return String(rawCue || '')
    .replace(/^(cue|advice|say|ask|response|presentation):\s*/i, '')
    .replace(/^["“”]+|["“”]+$/g, '')
    .trim()
}

function violatesResponseAuthority(text: string) {
  const clean = text.toLowerCase()

  return (
    /\b(i am|i'm)\s+(george|george live|an ai|a conversational ai)\b/i.test(text) ||
    /\b(ai assistant|conversational ai|virtual assistant|human-like conversation|empathetic responses)\b/i.test(clean) ||
    /\b(as an ai|i can help|i am here to)\b/i.test(clean)
  )
}

function repairResponseAuthority(input: {
  text: string
  transcript?: string
  objective?: string
  knownContext?: string
  userPosition?: string
}) {
  const transcript = String(input.transcript || '').toLowerCase()
  const evidence = [
    input.objective,
    input.knownContext,
    input.userPosition,
  ].join(' ').toLowerCase()

  if (/\b(ai assistant|another ai assistant|just another ai|why shouldn't|why should not|what is george)\b/i.test(transcript)) {
    if (/\b(investor|venture|capital|founder|executive|investment|operational intelligence|outcome|runtime)\b/i.test(evidence)) {
      return 'GEORGE is not another AI assistant. It is an operational intelligence runtime that helps people prepare for, perform in, and learn from high-stakes conversations where timing, judgment, and communication affect the outcome. The value is not just generating answers; it is improving execution before, during, and after the room.'
    }

    return 'GEORGE is operational intelligence. It helps people prepare, communicate, decide, and execute better in important moments, then uses what happened to improve future preparation.'
  }

  return ''
}


function safeResponseEvidenceReplacement(input: {
  transcript?: string
  objective?: string
  knownContext?: string
}) {
  const transcript = String(input.transcript || '').toLowerCase()
  const context = [input.objective, input.knownContext].join(' ').toLowerCase()

  if (/\broi|numbers?|metrics?|business value|measurable|productivity|pilot\b/i.test(transcript + ' ' + context)) {
    return 'We should not ask you to believe unsupported numbers. The right way to prove this is to define the baseline, run a controlled pilot, measure the agreed success metrics, and compare GEORGE-supported outcomes against the current workflow. If the results do not show measurable improvement, we either adjust the implementation or we do not scale it.'
  }

  if (/\bprivacy|security|confidential|data\b/i.test(transcript + ' ' + context)) {
    return 'The answer has to be evidence-based: define what data GEORGE can access, what stays out of scope, how information is protected, and how enterprise controls are enforced. I would not ask you to accept broad claims without a security review, deployment boundaries, and measurable compliance requirements.'
  }

  return 'I would not make a factual claim we cannot support. The strongest answer is to separate what we know, what we can measure in a pilot, and what evidence would be required before scaling.'
}

function extractContinuationText(rawCue: string) {
  const cleanGenerated = cleanAuthorityText(rawCue)

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

  if (deliveryStyle === 'response') {
    const text = cleanAuthorityText(input.actionCue.cue)
    if (!text) return input.actionCue

    const replacementText = violatesResponseAuthority(text)
      ? repairResponseAuthority({
          text,
          transcript: input.actionCue.evidence?.transcript,
          objective: input.actionCue.evidence?.objective || input.context?.objective,
          knownContext: [
            input.actionCue.evidence?.knownContext,
            input.actionCue.evidence?.briefingKnowledge,
            input.context?.knownContext,
            input.context?.briefingKnowledge,
          ].join(' '),
          userPosition: input.actionCue.evidence?.userPosition,
        })
      : ''

    console.info('[GEORGE][core][response-authority-check]', {
      deliveryStyle,
      originalCue: input.actionCue.cue,
      text,
      replaced: Boolean(replacementText),
      transcript: input.actionCue.evidence?.transcript,
      objective: input.actionCue.evidence?.objective || input.context?.objective,
    })

    if (replacementText) {
      markRuntimeEvent(input.actionCue.turnId || text, 'core_authority_replaced')
      return {
        ...input.actionCue,
        cue: replacementText,
      }
    }

    const evidence = buildActionCueAuthorityEvidence(input)
    const evidenceAuthority = violatesEvidenceAuthority(text, evidence)

    if (evidenceAuthority.violates) {
      const safeReplacement = safeResponseEvidenceReplacement({
        transcript: input.actionCue.evidence?.transcript,
        objective: input.actionCue.evidence?.objective || input.context?.objective,
        knownContext: [
          input.actionCue.evidence?.knownContext,
          input.actionCue.evidence?.briefingKnowledge,
          input.context?.knownContext,
          input.context?.briefingKnowledge,
        ].join(' '),
      })

      console.warn('[GEORGE][core][response-authority-replaced]', {
        reason: evidenceAuthority.reason,
        unsupportedTerms: evidenceAuthority.unsupportedTerms,
        originalText: text,
        replacementText: safeReplacement,
      })

      markRuntimeEvent(input.actionCue.turnId || text, 'core_authority_replaced')
      return {
        ...input.actionCue,
        cue: safeReplacement,
      }
    }

    markRuntimeEvent(input.actionCue.turnId || text, 'core_authority_pass')
    return {
      ...input.actionCue,
      cue: text,
    }
  }

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
