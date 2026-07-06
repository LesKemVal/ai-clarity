export type ResourceEstimate = {
  prepSeconds: number
  runtimeMinutes: number
  estimatedCents: number
  intensity: 'Light' | 'Standard' | 'Heavy'
  resources: string[]
  reason: string
}

export function getPrepDocumentPrompt(conversationType: string, audienceType: string, objective = '') {
  const base = {
    label: 'Relevant Documentation',
    helper: 'These documents could improve my understanding of this conversation. Upload only what you think will help.',
  }

  const signal = `${conversationType} ${audienceType} ${objective}`.toLowerCase()

  if (/vc|venture|investor|capital|fundraising|raise|financing|valuation|term sheet|series\s*[abc]|\$|billion|deal/.test(signal)) {
    return {
      ...base,
      action: 'Upload documentation',
      recommendations: ['Pitch deck', 'Financial model', 'Cap table', 'Term sheet', 'Market analysis', 'Traction summary'],
      resource: 'investor documentation preload',
    }
  }

  if (conversationType === 'Interview') {
    return {
      ...base,
      action: 'Upload documentation',
      recommendations: ['Resume', 'Job description', 'Portfolio', 'Recruiter email', 'Company notes'],
      resource: 'interview documentation preload',
    }
  }

  if (conversationType === 'Boardroom') {
    return {
      ...base,
      action: 'Upload documentation',
      recommendations: ['Deck', 'Board memo', 'KPI report', 'Forecast', 'Agenda'],
      resource: 'boardroom documentation preload',
    }
  }

  if (conversationType === 'Negotiation') {
    return {
      ...base,
      action: 'Upload documentation',
      recommendations: ['Contract', 'Offer letter', 'Pricing sheet', 'Previous emails', 'Terms'],
      resource: 'negotiation documentation preload',
    }
  }

  if (conversationType === 'Doctor Appointment') {
    return {
      ...base,
      action: 'Upload documentation',
      recommendations: ['Symptoms timeline', 'Lab results', 'Medication list', 'Questions', 'Insurance notes'],
      resource: 'medical documentation preload',
    }
  }

  if (conversationType === 'Sales Call') {
    return {
      ...base,
      action: 'Upload documentation',
      recommendations: ['Product notes', 'Pricing', 'Prospect context', 'Objection notes', 'Offer'],
      resource: 'sales documentation preload',
    }
  }

  if (conversationType === 'Presentation') {
    return {
      ...base,
      action: 'Upload documentation',
      recommendations: ['Slides', 'Outline', 'Speaking notes', 'Audience context', 'Questions'],
      resource: 'presentation documentation preload',
    }
  }

  if (audienceType === 'Investor') {
    return {
      ...base,
      action: 'Upload documentation',
      recommendations: ['Pitch deck', 'Financial model', 'One-pager', 'Traction summary', 'Customer evidence'],
      resource: 'investor documentation preload',
    }
  }

  return {
    ...base,
    action: 'Upload documentation',
    recommendations: ['Agenda', 'Brief', 'Screenshot', 'Notes', 'Previous messages'],
    resource: 'conversation documentation preload',
  }
}

const CONVERSATION_BASE: Record<string, { minutes: number; cents: number; resource: string }> = {
  Interview: { minutes: 24, cents: 21, resource: 'answer framing + proof recall' },
  Meeting: { minutes: 28, cents: 23, resource: 'decision tracking + timing cues' },
  Boardroom: { minutes: 34, cents: 36, resource: 'executive framing + metric defense cues' },
  Negotiation: { minutes: 34, cents: 34, resource: 'leverage tracking + restraint cues' },
  'Sales Call': { minutes: 30, cents: 29, resource: 'objection handling + close timing' },
  'Doctor Appointment': { minutes: 24, cents: 22, resource: 'question tracking + advocacy prompts' },
  Presentation: { minutes: 36, cents: 31, resource: 'flow support + recovery cues' },
  'Everyday Conversation': { minutes: 18, cents: 14, resource: 'tone support + clarity cues' },
}

const AUDIENCE_WEIGHT: Record<string, { cents: number; resource: string }> = {
  Executive: { cents: 5, resource: 'executive compression' },
  Investor: { cents: 8, resource: 'risk/upside framing' },
  Recruiter: { cents: 4, resource: 'fit and experience framing' },
  Customer: { cents: 4, resource: 'trust and value framing' },
  Physician: { cents: 5, resource: 'factual recall discipline' },
  'Spouse / Family': { cents: 3, resource: 'tone sensitivity' },
  Regulator: { cents: 9, resource: 'precision and compliance posture' },
  'Audience / Crowd': { cents: 6, resource: 'public clarity structure' },
}

export function estimateResources({
  conversationType,
  audienceType,
  pacing,
  outputMode,
  objective,
}: {
  conversationType: string
  audienceType: string
  pacing: string
  outputMode: string
  objective: string
}): ResourceEstimate {
  const base = CONVERSATION_BASE[conversationType] || CONVERSATION_BASE.Meeting
  const audience = AUDIENCE_WEIGHT[audienceType] || AUDIENCE_WEIGHT.Executive
  const pacingCents = pacing === 'Sharp' ? 3 : pacing === 'Measured' ? 2 : 0
  const outputCents = outputMode === 'Repeatable lines' ? 4 : 1
  const objectiveCents = objective.trim().length > 20 ? 3 : 0
  const estimatedCents = base.cents + audience.cents + pacingCents + outputCents + objectiveCents
  const prepSeconds = Math.min(14, 5 + Math.ceil(estimatedCents / 9))
  const runtimeMinutes = base.minutes + (audience.cents >= 8 ? 6 : 0) + (outputMode === 'Repeatable lines' ? 3 : 0)
  const intensity = estimatedCents >= 44 ? 'Heavy' : estimatedCents >= 28 ? 'Standard' : 'Light'

  return {
    prepSeconds,
    runtimeMinutes,
    estimatedCents,
    intensity,
    resources: [
      base.resource,
      audience.resource,
      pacing === 'Sharp' ? 'compressed timing' : pacing === 'Measured' ? 'slower cue spacing' : 'balanced pacing',
      outputMode === 'Repeatable lines' ? 'repeatable line generation' : 'short cue generation',
      objective.trim().length > 20 ? 'objective-specific preload' : 'general room preload',
    ],
    reason: `${conversationType} + ${audienceType.toLowerCase()} audience requires ${intensity.toLowerCase()} runtime support.`,
  }
}

export function estimateWithResources(base: ResourceEstimate, resources: string[]): ResourceEstimate {
  const delta = resources.length - base.resources.length
  const estimatedCents = Math.max(8, base.estimatedCents + delta * 3)
  const runtimeMinutes = Math.max(8, base.runtimeMinutes + delta * 2)
  const prepSeconds = Math.max(4, Math.min(16, base.prepSeconds + delta))
  const intensity = estimatedCents >= 44 ? 'Heavy' : estimatedCents >= 28 ? 'Standard' : 'Light'

  return {
    ...base,
    estimatedCents,
    runtimeMinutes,
    prepSeconds,
    intensity,
    resources,
  }
}
