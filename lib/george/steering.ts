export type SteeringSignal =
  | 'conversation_engine'
  | 'compare'
  | 'build_plan'
  | 'blind_spots'
  | 'scripture'
  | 'related'
  | null

export type SteeringResult = {
  signal: SteeringSignal
  label: string
  reason: string
  pulse: boolean
}

type Input = {
  userText: string
  tier?: 'smart' | 'intelligent' | 'brilliant'
  conversationMode?: string | null
}

export function getSteering(input: Input): SteeringResult {
  const text = (input.userText || '').trim().toLowerCase()

  // high-stakes people / performance moments
  if (/interview|boss|meeting|doctor|court|date|negotiat|conversation|argument/.test(text)) {
    return {
      signal: 'conversation_engine',
      label: 'Use Conversation Engine',
      reason: 'live human dynamics detected',
      pulse: true,
    }
  }

  // uncertainty
  if (/not sure|which|confused|lost|what should i do/.test(text)) {
    return {
      signal: 'compare',
      label: 'Compare strongest paths',
      reason: 'direction uncertainty',
      pulse: true,
    }
  }

  // build / money / execution
  if (/business|income|money|build|launch|start|project/.test(text)) {
    return {
      signal: 'build_plan',
      label: 'Build strongest path',
      reason: 'goal can be operationalized',
      pulse: true,
    }
  }

  // repeated failure
  if (/again|still|same problem|nothing works|keeps happening/.test(text)) {
    return {
      signal: 'blind_spots',
      label: 'Find bottleneck',
      reason: 'pattern repetition',
      pulse: true,
    }
  }

  // moral signal
  if (/wrong|guilt|sin|forgive|tempted|cheat|lie/.test(text)) {
    return {
      signal: 'scripture',
      label: 'Use Biblical Lens',
      reason: 'moral boundary relevant',
      pulse: true,
    }
  }

  return {
    signal: 'related',
    label: 'Better next move',
    reason: 'general optimization',
    pulse: false,
  }
}
