export type LiveContextType =
  | 'unknown'
  | 'interview'
  | 'workplace'
  | 'negotiation'
  | 'relationship'
  | 'advocacy'
  | 'sales_or_service'
  | 'operator_call'
  | 'presentation'
  | 'learning_or_explanation'

export type LiveContextPrimitive = {
  type: LiveContextType
  label: string
  intent: string
  defaultNeed: string
  reusablePrimitives: string[]
}

export const INDIVIDUAL_LIVE_CONTEXTS: Record<LiveContextType, LiveContextPrimitive> = {
  unknown: {
    type: 'unknown',
    label: 'Unknown LIVE conversation',
    intent: 'Clarify the room without assuming a campaign, sales process, or firm workflow.',
    defaultNeed: 'Ask what the user is walking into and what outcome matters most.',
    reusablePrimitives: ['one-question narrowing', 'pressure scan', 'next-move guidance'],
  },
  interview: {
    type: 'interview',
    label: 'Interview',
    intent: 'Help the user answer clearly, prove fit, stay composed, and move toward offer.',
    defaultNeed: 'Provide short credible answers, proof framing, and recovery lines.',
    reusablePrimitives: ['answer framing', 'proof recall', 'confidence pacing', 'follow-up control'],
  },
  workplace: {
    type: 'workplace',
    label: 'Workplace pressure',
    intent: 'Help the user protect position, communicate cleanly, and avoid weak framing.',
    defaultNeed: 'Clarify the ask, boundary, decision, or response line.',
    reusablePrimitives: ['power-dynamic reading', 'boundary wording', 'professional compression'],
  },
  negotiation: {
    type: 'negotiation',
    label: 'Negotiation',
    intent: 'Protect leverage, timing, concession discipline, and useful silence.',
    defaultNeed: 'Give the next line, fallback, and restraint cue.',
    reusablePrimitives: ['leverage protection', 'counteroffer framing', 'silence timing', 'concession control'],
  },
  relationship: {
    type: 'relationship',
    label: 'Relationship or family tension',
    intent: 'Help the user speak honestly without escalating or surrendering dignity.',
    defaultNeed: 'Shape honest language, emotional calibration, and boundaries.',
    reusablePrimitives: ['tone softening', 'truth compression', 'repair line', 'boundary line'],
  },
  advocacy: {
    type: 'advocacy',
    label: 'Advocacy',
    intent: 'Help the user ask better questions, protect facts, and clarify next steps.',
    defaultNeed: 'Track symptoms, facts, questions, documents, and escalation points.',
    reusablePrimitives: ['question tracking', 'fact discipline', 'respectful escalation'],
  },
  sales_or_service: {
    type: 'sales_or_service',
    label: 'Sales or service conversation',
    intent: 'Help the individual handle objections, trust, timing, and next steps without campaign assumptions.',
    defaultNeed: 'Give concise ethical language for the current customer moment.',
    reusablePrimitives: ['objection handling', 'trust repair', 'value framing', 'next-step close'],
  },
  operator_call: {
    type: 'operator_call',
    label: 'Telephone or service operator call',
    intent: 'Help an individual operator stay clear, calm, useful, and compliant on the current call.',
    defaultNeed: 'Give short service-safe lines, clarification questions, and de-escalation cues.',
    reusablePrimitives: ['de-escalation', 'clarifying question', 'policy-safe phrasing', 'resolution framing'],
  },
  presentation: {
    type: 'presentation',
    label: 'Presentation',
    intent: 'Help the user keep flow, recover, land points, and close cleanly.',
    defaultNeed: 'Give pacing cues, transition lines, and recovery language.',
    reusablePrimitives: ['flow support', 'audience read', 'recovery line', 'closing line'],
  },
  learning_or_explanation: {
    type: 'learning_or_explanation',
    label: 'Learning or explanation',
    intent: 'Help the user explain, understand, or teach without losing clarity.',
    defaultNeed: 'Compress the idea and produce a repeatable explanation.',
    reusablePrimitives: ['plain-language translation', 'analogy selection', 'step compression'],
  },
}

export function detectIndividualLiveContext(input: string): LiveContextPrimitive {
  const t = input.toLowerCase().trim()

  if (/operator|customer service|support call|service call|retention|billing|dispatch|phone service|telephone/.test(t)) {
    return INDIVIDUAL_LIVE_CONTEXTS.operator_call
  }
  if (/interview|hiring manager|recruiter|job offer|salary question|tell me about yourself/.test(t)) {
    return INDIVIDUAL_LIVE_CONTEXTS.interview
  }
  if (/boss|manager|coworker|hr|meeting|presentation|briefing|workplace|supervisor|employee/.test(t)) {
    return INDIVIDUAL_LIVE_CONTEXTS.workplace
  }
  if (/deal|price|seller|dealer|negotiat|offer|counter|terms|discount/.test(t)) {
    return INDIVIDUAL_LIVE_CONTEXTS.negotiation
  }
  if (/girlfriend|boyfriend|wife|husband|dating|text her|text him|relationship|argument|apologize|family/.test(t)) {
    return INDIVIDUAL_LIVE_CONTEXTS.relationship
  }
  if (/doctor|nurse|hospital|appointment|diagnosis|symptoms|medication|insurance/.test(t)) {
    return INDIVIDUAL_LIVE_CONTEXTS.advocacy
  }
  if (/customer|client|prospect|lead|objection|close|follow up|follow-up|sales call|cold call|service issue/.test(t)) {
    return INDIVIDUAL_LIVE_CONTEXTS.sales_or_service
  }
  if (/speech|presentation|audience|stage|pitch/.test(t)) {
    return INDIVIDUAL_LIVE_CONTEXTS.presentation
  }
  if (/explain|teach|understand|learn|walk me through/.test(t)) {
    return INDIVIDUAL_LIVE_CONTEXTS.learning_or_explanation
  }

  return INDIVIDUAL_LIVE_CONTEXTS.unknown
}

export function buildIndividualLiveContextNote(context: LiveContextPrimitive) {
  return `
INDIVIDUAL LIVE CONTEXT
- Room: ${context.label}
- Runtime intent: ${context.intent}
- Default need: ${context.defaultNeed}
- Useful primitives: ${context.reusablePrimitives.join(', ')}
- Do not assume Pro LIVE, campaign management, firm mode, CRM workflow, or team governance.
`.trim()
}
