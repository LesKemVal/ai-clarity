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

export type LiveRoomFormation = {
  humanEntry: LiveHumanEntry
  confidence: LiveSignalConfidence
  interpretation: string
  requiredSignals: LiveSignalRequirement[]
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
  const interpretation = deriveGeorgeInterpretation(chairs, desiredOutcome, observedReality)
  const canEnterLive = confidence.missingRequiredSignals.length === 0

  return {
    humanEntry,
    confidence,
    interpretation,
    requiredSignals,
    canEnterLive,
    entryDirective: canEnterLive
      ? 'LIVE may begin. Do not repeat preview work. Execute from the outcome and observed reality.'
      : 'Do not enter LIVE yet. Recognize the user’s chair, then ask only for the missing required signal.',
  }
}
