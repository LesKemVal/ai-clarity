import type { LivePrepSetup } from './prep-runtime'

type LiveBriefingMode = 'cues' | 'lines'

type LiveEntryBriefingInput = {
  setup: LivePrepSetup | null
  defaultRoom?: string
  estimatedCents?: number | null
}

type SignalSummary = {
  phrase?: string
  meaningLabel?: string
}

function clean(value: unknown) {
  return String(value || '').trim()
}

function normalizeRoom(value: unknown, fallback = 'this room') {
  const room = clean(value)
  return room || fallback
}

function normalizeAssistMode(setup: LivePrepSetup | null): LiveBriefingMode {
  return setup?.liveAssistMode === 'lines' ? 'lines' : 'cues'
}

function getName(setup: LivePrepSetup | null) {
  return (
    clean((setup as any)?.name) ||
    clean((setup as any)?.alias) ||
    clean((setup as any)?.profileName) ||
    clean((setup as any)?.userName) ||
    clean((setup as any)?.chair) ||
    'You'
  )
}

function getSecondaryPosition(setup: LivePrepSetup | null) {
  return (
    clean((setup as any)?.secondaryObjective) ||
    clean((setup as any)?.acceptableOutcome) ||
    clean((setup as any)?.fallbackOutcome) ||
    clean((setup as any)?.floor)
  )
}

function buildSignalLine(setup: LivePrepSetup | null) {
  const signals = (setup as any)?.roomSignals as SignalSummary[] | undefined

  if (!signals || signals.length === 0) {
    return 'Remember your steering phrases.'
  }

  const first = signals[0]

  if (!first?.phrase || !first?.meaningLabel) {
    return 'Remember your steering phrases.'
  }

  return `Remember your steering phrases. “${first.phrase}” tells me ${first.meaningLabel.toLowerCase()}.`
}

function buildAssistLine(mode: LiveBriefingMode) {
  if (mode === 'lines') {
    return 'If useful, I can help frame the opening or formulate important moments when greater precision would improve the outcome.'
  }

  return 'I will default to brief observations, useful details, and support that preserves your voice. If useful, I can also help frame the opening or formulate important moments when greater precision would improve the outcome.'
}

function buildRoomObservation(setup: LivePrepSetup | null, room: string, desiredOutcome: string, observedReality: string) {
  const outcome = clean(desiredOutcome)
  const reality = clean(observedReality)
  const signal = `${room} ${outcome} ${reality}`.toLowerCase()

  if (!outcome || outcome === 'your desired outcome') {
    return ''
  }

  if (!reality) {
    return ''
  }

  if (/interview|candidate|hiring|job/.test(signal)) {
    return `For the outcome “${outcome},” examples that show judgment, fit, and how you think are likely more useful than trying to sound perfect.`
  }

  if (/investor|capital|fundraising|raise|fund/.test(signal)) {
    return `For the outcome “${outcome},” credibility, traction, risk control, and a clear next step are likely to affect whether the room moves forward.`
  }

  if (/doctor|medical|patient|treatment|symptom/.test(signal)) {
    return `For the outcome “${outcome},” a clear timeline, specific symptoms, and prepared questions are likely to improve the usefulness of the visit.`
  }

  if (/negotiat|offer|terms|deal|price|counter/.test(signal)) {
    return `For the outcome “${outcome},” precision, timing, alternatives, and avoiding premature concessions are likely to affect leverage.`
  }

  if (/sales|customer|client|buyer/.test(signal)) {
    return `For the outcome “${outcome},” trust, fit, urgency, and a clear next step are likely to matter more than pressure.`
  }

  if (/conflict|argument|apology|repair|relationship/.test(signal)) {
    return `For the outcome “${outcome},” reducing threat, being understood, and keeping the next step realistic are likely to affect whether repair remains possible.`
  }

  if (/board|ceo|executive|leadership|strategy/.test(signal)) {
    return `For the outcome “${outcome},” concise interpretation, risk awareness, and decision-ready language are likely to matter more than explanation volume.`
  }

  return ''
}

export function buildLiveEntryBriefing(input: LiveEntryBriefingInput) {
  const setup = input.setup
  const name = getName(setup)
  const room = normalizeRoom(setup?.room, input.defaultRoom || 'this room')
  const mode = normalizeAssistMode(setup)
  const desiredOutcome = clean(setup?.objective) || 'your desired outcome'
  const observedReality =
    clean((setup as any)?.observedReality) ||
    clean((setup as any)?.reality) ||
    clean((setup as any)?.currentReality) ||
    clean((setup as any)?.knownContext)

  const secondaryPosition = getSecondaryPosition(setup)
  const signalLine = buildSignalLine(setup)
  const observation = buildRoomObservation(setup, room, desiredOutcome, observedReality)
  const estimatedCents =
    typeof input.estimatedCents === 'number' && Number.isFinite(input.estimatedCents)
      ? Math.max(0, Math.round(input.estimatedCents))
      : null

  return [
    `${name}.`,
    '',
    'You made it.',
    '',
    `Your primary objective is: ${desiredOutcome}.`,
    '',
    observation ? `Observed facts and signals suggest: ${observation}` : null,
    '',
    estimatedCents !== null ? `Estimated LIVE support: ${estimatedCents}¢.` : null,
    '',
    'Check the box.',
    '',
    "We can't continue until you do.",
    '',
    '[RESPONSIBILITY_CHECKPOINT]',
    '',
    'Good.',
    '',
    secondaryPosition
      ? 'I also understand your secondary outcome.'
      : null,
    secondaryPosition
      ? `But that's secondary.`
      : null,
    secondaryPosition ? '' : null,
    'Before we go LIVE, double-check facts and signals.',
    '',
    'Based on what you’ve shared, I’ll help you notice what matters, keep important details organized, communicate with greater precision when useful, and adapt as the room reveals itself — while preserving your agency and your voice.',
    '',
    buildAssistLine(mode),
    '',
    'Repeated use sharpens support.',
    '',
    'Check the next box.',
    '',
    '[TOA_CHECKPOINT]',
    '',
    'Okay.',
    '',
    signalLine,
    '',
    'Use your steering language or phone screen, according to availability, to adjust support, delivery style, or tone.',
    '',
    'Questions?',
    '',
    `Okay, then. Please proceed, ${name}.`,
    '',
    'I’ll help guide your conversation as it develops.',
    '',
    'Then let’s go to work.',
  ].filter(Boolean).join('\n')
}


export type OutcomeTestedBriefingSupportKind = 'risk' | 'opportunity' | 'previousPattern'

export type OutcomeTestedBriefingSupportItem = {
  id: OutcomeTestedBriefingSupportKind
  label: string
  line: string
  detail: string
  why: string
}

export function buildOutcomeTestedBriefingSupport({
  room,
  audience,
  objective,
  observedReality,
  previousPattern,
}: {
  room: string
  audience: string
  objective: string
  observedReality: string
  previousPattern?: string
}): OutcomeTestedBriefingSupportItem[] {
  const outcome = clean(objective)
  const reality = clean(observedReality)
  const prior = clean(previousPattern)
  const signal = `${room} ${audience} ${outcome} ${reality} ${prior}`.toLowerCase()

  if (!outcome || outcome === 'the desired outcome' || !reality) {
    return []
  }

  const items: OutcomeTestedBriefingSupportItem[] = []

  if (/investor|capital|fundraising|raise|fund|valuation|terms/.test(signal)) {
    items.push({
      id: 'risk',
      label: 'Risk',
      line: 'Credibility, traction, terms, or risk control may decide whether the room moves forward.',
      detail: `Because the stated outcome is “${outcome},” GEORGE should watch for hesitation around proof, control, valuation, or next steps.`,
      why: 'Capital rooms usually turn on confidence in execution and whether the next step feels justified.',
    })
    items.push({
      id: 'opportunity',
      label: 'Opportunity',
      line: 'A clear next step may matter more than a longer explanation.',
      detail: 'If the room shows interest, GEORGE should help preserve momentum and move toward a specific next action.',
      why: 'Investor interest can fade when the conversation becomes broad instead of actionable.',
    })
  } else if (/interview|candidate|hiring|job|recruiter/.test(signal)) {
    items.push({
      id: 'risk',
      label: 'Risk',
      line: 'Broad answers may weaken proof.',
      detail: `Because the stated outcome is “${outcome},” GEORGE should help return answers to specific examples, judgment, and fit.`,
      why: 'Interview rooms often reward evidence more than polish.',
    })
    items.push({
      id: 'opportunity',
      label: 'Opportunity',
      line: 'A strong example can shift the room from evaluation to confidence.',
      detail: 'GEORGE should help identify moments where a concrete story or result would improve the answer.',
      why: 'Examples make capability easier for the other side to trust.',
    })
  } else if (/doctor|medical|patient|symptom|treatment|physician/.test(signal)) {
    items.push({
      id: 'risk',
      label: 'Risk',
      line: 'Important facts or next steps may remain unclear.',
      detail: `Because the stated outcome is “${outcome},” GEORGE should watch for unanswered questions, missing timelines, and unclear follow-up.`,
      why: 'Medical conversations depend on accuracy, sequence, and usable next steps.',
    })
    items.push({
      id: 'opportunity',
      label: 'Opportunity',
      line: 'Clear questions can improve the usefulness of the visit.',
      detail: 'GEORGE should help organize symptoms, concerns, options, and follow-up questions without inventing facts.',
      why: 'Prepared questions help the user advocate while preserving responsibility.',
    })
  } else if (/negotiat|offer|deal|price|counter|buyer|seller|terms/.test(signal)) {
    items.push({
      id: 'risk',
      label: 'Risk',
      line: 'Pressure may create premature concession.',
      detail: `Because the stated outcome is “${outcome},” GEORGE should watch pace, leverage, unclear terms, and moments where silence is stronger than filling space.`,
      why: 'Negotiation outcomes often change through timing and restraint.',
    })
    items.push({
      id: 'opportunity',
      label: 'Opportunity',
      line: 'A precise question may create more leverage than an immediate answer.',
      detail: 'GEORGE should help slow the room, clarify terms, and protect the user from accepting ambiguity too early.',
      why: 'Questions can reveal flexibility, pressure, or hidden constraints.',
    })
  } else {
    items.push({
      id: 'risk',
      label: 'Risk',
      line: 'The conversation may drift away from the desired outcome.',
      detail: `Because the stated outcome is “${outcome},” GEORGE should watch for confusion, pressure, unanswered questions, or loss of direction.`,
      why: 'Most consequential rooms change when attention moves away from the real objective.',
    })
    items.push({
      id: 'opportunity',
      label: 'Opportunity',
      line: 'Returning to the objective may improve the probability of success.',
      detail: 'GEORGE should help identify moments where a clarifying question, summary, or next step would restore movement.',
      why: 'Outcome-centered language keeps the room from becoming generic conversation.',
    })
  }

  if (prior) {
    items.push({
      id: 'previousPattern',
      label: 'Previous Pattern',
      line: prior,
      detail: 'GEORGE should treat this as historical signal only if it improves the probability of reaching the current desired outcome.',
      why: 'Past patterns are useful only when they change preparation, timing, risk, or opportunity in the current room.',
    })
  }

  return items.slice(0, 3)
}
