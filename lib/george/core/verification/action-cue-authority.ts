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


function normalizeAuthorityContextValue(value?: string) {
  return String(value || '').trim()
}

function buildVerifiedResponse(input: {
  transcript?: string
  objective?: string
  room?: string
  knownContext?: string
  briefingKnowledge?: string
  userPosition?: string
  runtimeIntent?: string
  fallback?: string
}) {
  const transcript = normalizeAuthorityContextValue(input.transcript)
  const lowerTranscript = transcript.toLowerCase()
  const objective = normalizeAuthorityContextValue(input.objective)
  const room = normalizeAuthorityContextValue(input.room)
  const knownContext = normalizeAuthorityContextValue(input.knownContext)
  const briefingKnowledge = normalizeAuthorityContextValue(input.briefingKnowledge)
  const userPosition = normalizeAuthorityContextValue(input.userPosition)
  const context = [objective, room, knownContext, briefingKnowledge, userPosition].join(' ').toLowerCase()

  const isGeorgeQuestion = /\b(what is george|what business problem|how is george different|why george|why does the market need george|why should we choose george|build this ourselves|chatgpt|copilot|claude)\b/i.test(
    `${lowerTranscript} ${context}`
  )

  if (/\b(how much|cost|price|pricing|brilliant cost|subscription|tier)\b/i.test(lowerTranscript)) {
    return 'I would not give you an invented price. The right answer is to scope the deployment, define the level of support required, and price BRILLIANT against the operational value and implementation requirements of the pilot.'
  }

  if (/\b(how many|customers|enterprise customers|clients|current customers)\b/i.test(lowerTranscript)) {
    return 'I would not claim customer counts we cannot verify. The stronger answer is to focus this discussion on the product, the pilot design, the measurable outcomes, and the evidence we can produce during evaluation.'
  }

  if (/\b(guarantee|guaranteed|promise improved|guarantee improved performance)\b/i.test(lowerTranscript)) {
    return 'I would not guarantee performance before measurement. What we can do is define the baseline, run a controlled pilot, measure communication quality, decision quality, and execution quality, then decide whether the results justify expansion.'
  }

  if (/\b(measurable|outcomes|pilot|measure success|metrics|roi|return on investment|business value)\b/i.test(lowerTranscript)) {
    return 'A pilot should measure whether GEORGE improves communication quality, decision quality, and execution quality in real operating moments. We would define the baseline first, compare GEORGE-supported work against the current workflow, and scale only if the evidence shows measurable improvement.'
  }

  if (isGeorgeQuestion && /\b(chatgpt|copilot|claude|different|instead)\b/i.test(lowerTranscript)) {
    return 'ChatGPT, Copilot, and Claude primarily generate answers. GEORGE is designed as an operational intelligence runtime: it uses the room, objective, role, briefing, timing, evidence, and conversation signals to help the user prepare, respond, decide, and execute toward a desired outcome.'
  }

  if (isGeorgeQuestion && /\b(build this ourselves|ourselves|choose george)\b/i.test(lowerTranscript)) {
    return 'You can build tools, but GEORGE is not just a prompt interface. The value is the runtime judgment around timing, restraint, evidence, delivery style, room context, and outcome movement. A pilot lets us prove whether that operating layer improves execution before you commit to scaling.'
  }

  if (isGeorgeQuestion && /\b(market need|why does the market|why need)\b/i.test(lowerTranscript)) {
    return 'The market needs GEORGE because work increasingly depends on live judgment, not just stored information. People do not only need more answers; they need better decisions, better communication, and better execution in the moments where outcomes are won or lost.'
  }

  if (isGeorgeQuestion && /\b(business problem|problem does george solve)\b/i.test(lowerTranscript)) {
    return 'GEORGE addresses the gap between knowing something and executing well when the moment matters. It helps people prepare for the room, recognize operational signals while the conversation is happening, communicate with better timing and judgment, and turn the outcome into measurable learning.'
  }

  if (isGeorgeQuestion) {
    return 'GEORGE is an operational intelligence runtime. It helps people prepare, communicate, decide, and execute in important moments by reasoning from the objective, room, role, briefing, evidence, timing, and live conversation signals—not from words alone.'
  }

  if (/\b(privacy|security|confidential|data|compliance)\b/i.test(lowerTranscript)) {
    return 'The security answer has to be evidence-based. We would define what data GEORGE can access, what stays out of scope, how enterprise controls are enforced, and what review is required before deployment.'
  }

  return cleanAuthorityText(input.fallback || '') || 'I would separate what we know, what we can measure, and what evidence is required before making the claim.'
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
  briefingKnowledge?: string
  room?: string
  userPosition?: string
  runtimeIntent?: string
  fallback?: string
}) {
  return buildVerifiedResponse(input)
}


function isEnvironmentalOrSocialResponse(text: string) {
  return /\b(turn on the lights|turn off the lights|lights on|lights off|coffee|bathroom|lunch|door|projector|chair|temperature|too hot|too cold)\b/i.test(text)
}

function isTierOrBrandTranscript(text: string) {
  return /\b(smart|intelligent|brilliant|george|branesx|tier|plan|subscription|product|platform|agent)\b/i.test(text)
}

function violatesResponseRelevance(input: {
  text: string
  transcript?: string
  objective?: string
  knownContext?: string
}) {
  const transcript = String(input.transcript || '')
  const context = [input.objective, input.knownContext].join(' ')

  if (
    isEnvironmentalOrSocialResponse(input.text) &&
    !isEnvironmentalOrSocialResponse(transcript) &&
    (isTierOrBrandTranscript(transcript) || isTierOrBrandTranscript(context))
  ) {
    return true
  }

  return false
}

function safeResponseRelevanceReplacement(input: {
  transcript?: string
}) {
  const transcript = String(input.transcript || '').toLowerCase()

  if (/\bsmart|intelligent|brilliant\b/i.test(transcript)) {
    return 'Yes. SMART, INTELLIGENT, and BRILLIANT are the access tiers. SMART is the entry level, INTELLIGENT adds stronger operational support, and BRILLIANT is the highest tier for the most capable GEORGE experience.'
  }

  return 'Let me stay with the question. I would answer the point directly and tie it back to the room, the objective, and the decision in front of us.'
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

    if (violatesResponseRelevance({
      text,
      transcript: input.actionCue.evidence?.transcript,
      objective: input.actionCue.evidence?.objective || input.context?.objective,
      knownContext: [
        input.actionCue.evidence?.knownContext,
        input.actionCue.evidence?.briefingKnowledge,
        input.context?.knownContext,
        input.context?.briefingKnowledge,
      ].join(' '),
    })) {
      const safeReplacement = safeResponseRelevanceReplacement({
        transcript: input.actionCue.evidence?.transcript,
      })

      console.warn('[GEORGE][core][response-relevance-replaced]', {
        originalText: text,
        replacementText: safeReplacement,
        transcript: input.actionCue.evidence?.transcript,
      })

      markRuntimeEvent(input.actionCue.turnId || text, 'core_authority_replaced')
      return {
        ...input.actionCue,
        cue: safeReplacement,
      }
    }

    const evidence = buildActionCueAuthorityEvidence(input)
    const evidenceAuthority = violatesEvidenceAuthority(text, evidence)

    if (evidenceAuthority.violates) {
      const safeReplacement = safeResponseEvidenceReplacement({
        transcript: input.actionCue.evidence?.transcript,
        objective: input.actionCue.evidence?.objective || input.context?.objective,
        room: input.actionCue.evidence?.room || input.context?.room,
        knownContext: [
          input.actionCue.evidence?.knownContext,
          input.context?.knownContext,
        ].join(' '),
        briefingKnowledge: [
          input.actionCue.evidence?.briefingKnowledge,
          input.context?.briefingKnowledge,
        ].join(' '),
        userPosition: input.actionCue.evidence?.userPosition,
        runtimeIntent: input.actionCue.evidence?.runtimeIntent,
        fallback: text,
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
