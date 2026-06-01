export type LiveChair = string

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

  return `GEORGE will enter LIVE assuming ${concerns.slice(0, 4).join(', ')} are likely to matter first.`
}
