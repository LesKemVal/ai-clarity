/**
 * LIVE Entry outcome-briefing presentation helpers.
 *
 * These helpers shape onboarding and briefing copy from user-provided room signal.
 * They do not select conversation strategy, operational judgment, execution policy,
 * or LIVE support behavior. Canonical runtime authority remains with GEORGE's
 * shared runtime pipeline. Normal and LIVE are execution modes of one GEORGE.
 */

export function cleanBriefingValue(value: unknown) {
  return String(value || '').trim()
}

export function titleBriefingValue(value: unknown, fallback = 'this room') {
  const clean = cleanBriefingValue(value)
  if (!clean) return fallback
  return clean
}

export function buildBriefingObservation(room: string, audience: string, objective: string, context: string) {
  const signal = `${room} ${audience} ${objective} ${context}`.toLowerCase()

  if (/investor|capital|fundraising|raise|fund/.test(signal)) {
    return 'I am aware that credibility may matter before persuasion in this room.'
  }

  if (/ceo|board|executive|acquisition|strategy/.test(signal)) {
    return 'I am aware that precision, timing, and what stays unresolved may matter here.'
  }

  if (/interview|candidate|hiring|job/.test(signal)) {
    return 'I am aware that how you think may matter as much as the answer itself.'
  }

  if (/sales|client|customer|buyer/.test(signal)) {
    return 'I am aware that trust and signal may matter before pressure.'
  }

  if (/doctor|medical|patient|treatment|symptom/.test(signal)) {
    return 'I am aware that clarity and follow-through may matter more than speed.'
  }

  if (/negotiat|offer|terms|deal|price|counter/.test(signal)) {
    return 'I am aware that pressure may start shaping the language.'
  }

  return 'I am aware that the room may reveal more once the conversation begins.'
}

export function buildNextBriefingBenefit(room: string, audience: string, objective: string, position: string) {
  const signal = `${room} ${audience} ${objective} ${position}`.toLowerCase()

  if (/interview|candidate|hiring|job|recruiter|amazon|warehouse|fulfillment/.test(signal)) {
    return 'The next question will help me tailor your answers to the role and what the interviewer is likely testing.'
  }

  if (/investor|capital|fundraising|raise|fund|terms|valuation/.test(signal)) {
    return 'The next question will help me anticipate objections, credibility tests, and timing pressure.'
  }

  if (/acquisition|merger|board|executive|enterprise|corporate/.test(signal)) {
    return 'The next question will help me protect precision, leverage, and decision authority in a high-consequence room.'
  }

  if (/negotiat|offer|deal|price|counter|buyer|seller/.test(signal)) {
    return 'The next question will help me recognize leverage, pressure, and better timing.'
  }

  if (/doctor|medical|patient|symptom|treatment|physician/.test(signal)) {
    return 'The next question will help me organize facts, unanswered questions, and next steps.'
  }

  if (/sales|client|customer|buyer/.test(signal)) {
    return 'The next question will help me notice trust, buying signals, objections, and moments to ask better questions.'
  }

  return 'The next question will help me make my guidance more specific to this room.'
}

export function buildBriefingSupport(room: string, audience: string, objective: string, mode: string) {
  const signal = `${room} ${audience} ${objective}`.toLowerCase()

  if (/ceo|board|executive|acquisition|investor|capital|fundraising/.test(signal)) {
    return [
      'help you keep important details organized',
      'surface facts, numbers, or contradictions when they matter',
      'notice shifts in pressure, leverage, or credibility',
      'support precision without replacing your voice',
    ]
  }

  if (/interview|candidate|hiring|job/.test(signal)) {
    return [
      'help you organize your thinking under pressure',
      'notice what the interviewer may actually be testing',
      'support stronger examples when useful',
      mode === 'continue' || mode === 'response' || mode === 'presentation'
        ? 'help formulate important answers when precision matters'
        : 'keep support concise unless you ask for more',
    ]
  }

  if (/sales|client|customer|buyer/.test(signal)) {
    return [
      'notice buying signals and resistance',
      'track what the other side seems to value',
      'help you ask better questions',
      'support clarity without making you sound scripted',
    ]
  }

  if (/doctor|medical|patient|treatment|symptom/.test(signal)) {
    return [
      'help track symptoms, timelines, and unanswered questions',
      'surface details you may want to revisit',
      'support advocacy without taking over the conversation',
      'help organize decisions as information changes',
    ]
  }

  return [
    'help you notice what matters',
    'keep important details organized',
    'support precision when useful',
    'adapt as the room reveals itself',
  ]
}

export function buildProofReply(input: string, objective: string, room: string) {
  const clean = cleanBriefingValue(input)
  const signal = `${clean} ${objective} ${room}`.toLowerCase()

  if (!clean) return ''

  if (/valuation|price|terms|leverage|capital|investor|fund/.test(signal)) {
    return 'Understood. Preserving momentum without losing leverage appears important here.'
  }

  if (/freeze|nervous|pressure|stumble|anxious/.test(signal)) {
    return 'Understood. Helping you organize your thinking under pressure may matter more than perfect wording.'
  }

  if (/answer|clarity|understand|doctor|medical|symptom/.test(signal)) {
    return 'Understood. Clarity, follow-through, and unanswered questions should stay visible.'
  }

  if (/trust|relationship|conflict|apology|repair/.test(signal)) {
    return 'Understood. Reducing threat and protecting trust may matter before trying to resolve everything.'
  }

  return 'Understood. I will keep that outcome visible as the conversation develops.'
}
