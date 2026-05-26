import { detectIndividualLiveContext } from '@/lib/george/chat/live-context'

export type ChatSignalMessage = {
  role: 'user' | 'assistant'
  content: string
}

export function classifyControlState(input: string) {
  const t = input.toLowerCase().trim()

  const urgent = /now|asap|today|immediately|urgent|fast|quick|deadline/.test(t)
  const emotional = /hurt|angry|sad|depressed|anxious|stress|stressed|upset/.test(t)
  const builder = /build|launch|start|create|business|company|app|project/.test(t)
  const writing = /rewrite|write|text message|email|caption|bio|resume/.test(t)
  const live = /interview|date|meeting|call|conversation|talk to|negotiat/.test(t)
  const vague = t.split(/\s+/).length <= 3
  const overwhelmed = /overwhelmed|too much|confused|lost|behind/.test(t)

  const userState =
    overwhelmed ? 'overwhelmed' :
    urgent ? 'urgent' :
    emotional ? 'emotional' :
    builder ? 'builder' :
    vague ? 'vague' :
    'focused'

  const objectiveMode =
    writing ? 'writing' :
    live ? 'live-pressure' :
    builder ? 'planning' :
    vague ? 'clarification' :
    'execution'

  const pressureLevel =
    urgent ? 'high' :
    emotional || overwhelmed ? 'medium' :
    'low'

  return { userState, objectiveMode, pressureLevel }
}

export function scoreRuntimeSignals(input: string) {
  const t = input.toLowerCase().trim()

  let seriousnessScore = 1
  let opportunityScore = 1
  let confusionScore = 1
  let urgencyScore = 1

  if (/need|must|can't|cannot|stuck|problem|issue|behind|risk|pressure|serious/.test(t)) {
    seriousnessScore += 2
  }
  if (/business|build|launch|grow|income|opportunity|client|customers|market|invest/.test(t)) {
    opportunityScore += 2
  }
  if (/confused|lost|not sure|don't know|dont know|overwhelmed|too much|which one|what should i do/.test(t)) {
    confusionScore += 2
  }
  if (/now|today|asap|urgent|immediately|fast|quick|deadline|tonight/.test(t)) {
    urgencyScore += 2
  }

  if (t.split(/\s+/).length <= 3) {
    confusionScore += 1
  }

  seriousnessScore = Math.min(5, seriousnessScore)
  opportunityScore = Math.min(5, opportunityScore)
  confusionScore = Math.min(5, confusionScore)
  urgencyScore = Math.min(5, urgencyScore)

  return { seriousnessScore, opportunityScore, confusionScore, urgencyScore }
}

export function detectLikelyBottleneck(input: string) {
  const t = input.toLowerCase().trim()

  if (/credit|maxed|maxed out|score|approval|loan|mortgage/.test(t)) {
    return { label: 'profile strength', confidence: 'high' }
  }
  if (/job|interview|hired|resume/.test(t)) {
    return { label: 'conversion bottleneck', confidence: 'high' }
  }
  if (/money|bills|rent|broke|cash/.test(t)) {
    return { label: 'cashflow pressure', confidence: 'high' }
  }
  if (/confused|lost|not sure|which one|what should i do/.test(t)) {
    return { label: 'decision fog', confidence: 'high' }
  }
  if (/build|launch|business|project|app/.test(t)) {
    return { label: 'execution clarity', confidence: 'medium' }
  }

  return { label: 'unknown', confidence: 'low' }
}

export function detectBuilderSubtype(input: string) {
  const t = input.toLowerCase().trim()

  if (/trucking|truck|freight|dispatch|brokerage|owner operator|owner-operator|cdl/.test(t)) {
    return 'trucking'
  }
  if (/saas|software|app|platform|ai product|startup/.test(t)) {
    return 'software'
  }
  if (/brand|clothing|merch|ecommerce|shopify|store/.test(t)) {
    return 'consumer-brand'
  }
  if (/agency|consulting|service business|client work/.test(t)) {
    return 'service-business'
  }
  if (/course|community|coaching|content business|youtube|podcast/.test(t)) {
    return 'audience-business'
  }

  return 'general'
}

export function detectCadenceAvoidance(messages: ChatSignalMessage[]) {
  const recentAssistant = messages
    .filter((m) => m.role === 'assistant')
    .slice(-4)
    .map((m) => m.content.toLowerCase())

  const avoid: string[] = []

  if (recentAssistant.some((t) => t.startsWith('good.') || t.startsWith('good '))) {
    avoid.push('opening with Good')
  }
  if (recentAssistant.some((t) => t.includes('two paths'))) {
    avoid.push('phrase two paths')
  }
  if (recentAssistant.some((t) => t.includes('real issue is'))) {
    avoid.push('phrase real issue is')
  }
  if (recentAssistant.some((t) => t.includes('bottleneck'))) {
    avoid.push('leading with bottleneck wording')
  }
  if (recentAssistant.some((t) => t.includes('absolutely.'))) {
    avoid.push('hard-opening with Absolutely')
  }
  if (recentAssistant.some((t) => t.includes('strong path exists'))) {
    avoid.push('phrase strong path exists')
  }
  if (recentAssistant.some((t) => t.includes('the strongest move'))) {
    avoid.push('phrase the strongest move')
  }
  if (recentAssistant.some((t) => t.includes('here’s what i’d do'))) {
    avoid.push('phrase here’s what I’d do')
  }
  if (recentAssistant.some((t) => t.includes('let’s narrow'))) {
    avoid.push('phrase let’s narrow')
  }

  return [...new Set(avoid)].slice(0, 5)
}

export function detectLiveScenario(input: string, promptContext?: string | null) {
  const context = (promptContext || '').toLowerCase()

  if (
    context.includes('manual_live') ||
    context.includes('brilliant_live') ||
    context.includes('conversation_assist') ||
    context.includes('professional_')
  ) {
    return { active: true, type: 'live-context' }
  }

  const liveContext = detectIndividualLiveContext(input)

  if (liveContext.type !== 'unknown') {
    return { active: true, type: liveContext.type }
  }

  const t = input.toLowerCase().trim()

  if (/call in 5|about to call|right now talking|live conversation|on the phone|in the room|they just said|he just said|she just said/.test(t)) {
    return { active: true, type: 'immediate-live' }
  }

  return { active: false, type: 'none' }
}
