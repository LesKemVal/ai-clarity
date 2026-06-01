export type LiveChair = string

export type LiveSignalRequirement = {
  key: string
  label: string
  required: boolean
  reason: string
}

export type LiveSignalConfidence = {
  level: 'low' | 'usable' | 'strong'
  missingRequiredSignals: string[]
  suggestedQuestion?: string
}

export type LiveHumanEntry = {
  chairLabel: string
  recognition: string
  trustDirective: string
  signalAcquisitionDirective: string
}

export type LiveMandatorySignalQuestion = {
  key: string
  label: string
  question: string
  required: true
  reason: string
}

export type LiveRoomFormation = {
  humanEntry: LiveHumanEntry
  confidence: LiveSignalConfidence
  interpretation: string
  requiredSignals: LiveSignalRequirement[]
  nextMandatorySignal: LiveMandatorySignalQuestion | null
  canEnterLive: boolean
  entryDirective: string
}

export function resolveChairLabel(chairs: string[], customChair: string) {
  return chairs
    .map((item) => item === 'Other' && customChair.trim() ? customChair.trim() : item)
    .join(' + ')
}

export function hasMinimumLiveSignals({
  desiredOutcome,
  observedReality,
}: {
  desiredOutcome: string
  observedReality: string
}) {
  return Boolean(desiredOutcome.trim() && observedReality.trim())
}

export function deriveHumanEntry(chairs: string[]): LiveHumanEntry {
  const chairLabel = chairs.map((chair) => chair.trim()).filter(Boolean).join(' + ') || 'User'

  return {
    chairLabel,
    recognition: `GEORGE should first recognize the user's ${chairLabel} position without turning it into a separate mode or profession brain.`,
    trustDirective: 'Recognition should reduce apprehension and increase cooperation before asking for deeper signal.',
    signalAcquisitionDirective: 'Ask only for the next signal needed to improve confidence. Do not turn signal acquisition into a form.',
  }
}

export function deriveGeorgeInterpretation(chairs: string[], outcome: string, reality: string) {
  const text = `${chairs.join(' ')} ${outcome} ${reality}`.toLowerCase()
  const concerns: string[] = []

  const add = (...items: string[]) => {
    for (const item of items) {
      if (!concerns.includes(item)) concerns.push(item)
    }
  }

  if (/founder|operator|build|launch|product|company|startup/.test(text)) {
    add('execution', 'adoption', 'operational risk')
  }

  if (/investor|valuation|return|equity|capital|funding|sell my company|acquire|acquisition/.test(text)) {
    add('valuation', 'risk', 'future value')
  }

  if (/sell|seller|buyer|deal|terms|leverage|negotiate|negotiation|offer/.test(text)) {
    add('negotiating leverage', 'buyer quality', 'downside protection')
  }

  if (/candidate|interview|job|role|recruiter|hiring/.test(text)) {
    add('credibility', 'proof', 'positioning')
  }

  if (/patient|doctor|medical|symptom|diagnosis|treatment/.test(text)) {
    add('clarification', 'symptom accuracy', 'decision support')
  }

  if (/parent|family|spouse|child|home/.test(text)) {
    add('responsibility', 'tone', 'long-term impact')
  }

  if (/board|governance|oversight/.test(text)) {
    add('governance', 'oversight', 'capital allocation')
  }

  if (!concerns.length) {
    add('the outcome', 'the observed reality', 'the next useful move')
  }

  return `GEORGE will enter LIVE watching ${concerns.slice(0, 4).join(', ')} first.`
}

export function deriveRequiredSignals(chairs: string[]): LiveSignalRequirement[] {
  const text = chairs.join(' ').toLowerCase()

  const base: LiveSignalRequirement[] = [
    {
      key: 'desiredOutcome',
      label: 'Desired Outcome',
      required: true,
      reason: 'GEORGE needs to know what the user is trying to accomplish.',
    },
    {
      key: 'observedReality',
      label: 'Observed Reality',
      required: true,
      reason: 'GEORGE needs to know what reality the user is facing now.',
    },
  ]

  if (/patient|medical|doctor/.test(text)) {
    return [
      ...base,
      {
        key: 'primaryConcern',
        label: 'Primary Concern',
        required: false,
        reason: 'Medical conversations may improve with the main concern, symptom, or question.',
      },
    ]
  }

  if (/buyer|seller|investor|founder|board/.test(text)) {
    return [
      ...base,
      {
        key: 'stakes',
        label: 'Stakes',
        required: false,
        reason: 'Deal or business conversations may improve when GEORGE knows what cannot be lost.',
      },
    ]
  }

  return base
}

export function deriveSignalConfidence({
  chairs,
  desiredOutcome,
  observedReality,
}: {
  chairs: string[]
  desiredOutcome: string
  observedReality: string
}): LiveSignalConfidence {
  deriveRequiredSignals(chairs)

  const missingRequiredSignals: string[] = []

  if (!desiredOutcome.trim()) missingRequiredSignals.push('Desired Outcome')
  if (!observedReality.trim()) missingRequiredSignals.push('Observed Reality')

  if (missingRequiredSignals.length > 0) {
    return {
      level: 'low',
      missingRequiredSignals,
      suggestedQuestion: missingRequiredSignals.includes('Desired Outcome')
        ? 'What are you trying to accomplish?'
        : 'What is happening right now?',
    }
  }

  const combined = `${desiredOutcome} ${observedReality}`.trim()

  if (combined.length < 24) {
    return {
      level: 'usable',
      missingRequiredSignals: [],
      suggestedQuestion: 'What is the single detail that most changes the outcome?',
    }
  }

  return {
    level: 'strong',
    missingRequiredSignals: [],
  }
}

export function deriveNextMandatorySignalQuestion({
  chairs,
  desiredOutcome,
  observedReality,
}: {
  chairs: string[]
  desiredOutcome: string
  observedReality: string
}): LiveMandatorySignalQuestion | null {
  const chairText = chairs.join(' ').toLowerCase()
  const outcome = desiredOutcome.trim()
  const reality = observedReality.trim()

  if (!outcome) {
    return {
      key: 'desiredOutcome',
      label: 'Desired Outcome',
      question: 'What are you trying to accomplish?',
      required: true,
      reason: 'Outcome is the highest-leverage missing signal because GEORGE cannot judge the next move without the destination.',
    }
  }

  if (!reality) {
    return {
      key: 'observedReality',
      label: 'Observed Reality',
      question: 'What is happening right now?',
      required: true,
      reason: 'Observed reality is the highest-leverage missing signal because GEORGE needs the terrain before execution.',
    }
  }

  const combined = `${outcome} ${reality}`.trim()

  if (combined.length < 24) {
    return {
      key: 'decisiveDetail',
      label: 'Decisive Detail',
      question: 'What is the one detail that most changes the outcome?',
      required: true,
      reason: 'The core signals exist, but confidence is still thin. One decisive detail should improve room formation more than adding a full form.',
    }
  }

  if (/patient|medical|doctor/.test(chairText) && !/symptom|pain|diagnosis|test|result|medication|treatment|risk|concern/i.test(combined)) {
    return {
      key: 'primaryConcern',
      label: 'Primary Concern',
      question: 'What is the main concern you do not want missed?',
      required: true,
      reason: 'For patient-chair conversations, the next best signal is the concern that must not be overlooked.',
    }
  }

  if (/buyer|seller|investor|founder|board/.test(chairText) && !/risk|runway|price|money|deadline|equity|terms|leverage|offer|stake/i.test(combined)) {
    return {
      key: 'stakes',
      label: 'Stakes',
      question: 'What cannot be lost here?',
      required: true,
      reason: 'For business, deal, or governance chairs, the next best signal is the stake that should control judgment.',
    }
  }

  return null
}

export function deriveRoomFormation({
  chairs,
  desiredOutcome,
  observedReality,
}: {
  chairs: string[]
  desiredOutcome: string
  observedReality: string
}): LiveRoomFormation {
  const requiredSignals = deriveRequiredSignals(chairs)
  const humanEntry = deriveHumanEntry(chairs)
  const confidence = deriveSignalConfidence({ chairs, desiredOutcome, observedReality })
  const nextMandatorySignal = deriveNextMandatorySignalQuestion({ chairs, desiredOutcome, observedReality })
  const interpretation = deriveGeorgeInterpretation(chairs, desiredOutcome, observedReality)
  const canEnterLive = !nextMandatorySignal && confidence.missingRequiredSignals.length === 0

  return {
    humanEntry,
    confidence,
    interpretation,
    requiredSignals,
    nextMandatorySignal,
    canEnterLive,
    entryDirective: canEnterLive
      ? 'LIVE may begin. Do not repeat preview work. Execute from the outcome and observed reality.'
      : 'Do not enter LIVE yet. Recognize the user’s chair, then ask the single next mandatory signal question.',
  }
}
