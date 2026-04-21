export type GeorgeTier = 'smart' | 'intelligent' | 'brilliant'

export type GoalState = {
  statedObjective: string | null
  likelyTrueObjective: string | null
  chosenPath: string | null
  bottleneck: string | null
  urgency: 'low' | 'medium' | 'high'
  resistance: 'low' | 'medium' | 'high'
  todayMove: string | null
  futureRisk: string | null
  upgradeRelevance: 'none' | 'intelligent' | 'brilliant'
}

type Input = {
  userText: string
  tier?: GeorgeTier
}

function clean(text: string) {
  return text.trim().replace(/\s+/g, ' ')
}

export function getGoalState(input: Input): GoalState {
  const text = clean(input.userText || '')
  const t = text.toLowerCase()

  let statedObjective: string | null = null
  let likelyTrueObjective: string | null = null
  let chosenPath: string | null = null
  let bottleneck: string | null = null
  let urgency: GoalState['urgency'] = 'medium'
  let resistance: GoalState['resistance'] = 'low'
  let todayMove: string | null = null
  let futureRisk: string | null = null
  let upgradeRelevance: GoalState['upgradeRelevance'] = 'none'

  if (/interview|job interview/.test(t)) {
    statedObjective = 'perform better in interviews'
    likelyTrueObjective = 'get hired'
    chosenPath = 'improve interview performance'
    bottleneck = 'unknown interview failure point'
    todayMove = 'identify exact interview failure phase'
    futureRisk = 'continued rejection without bottleneck diagnosis'
    upgradeRelevance = 'brilliant'
  } else if (/business|start a business|what business/.test(t)) {
    statedObjective = 'start a business'
    likelyTrueObjective = 'build income with fit and durability'
    chosenPath = 'choose a viable business model'
    bottleneck = 'insufficient narrowing variables'
    todayMove = 'narrow by capital, sales confidence, time, and model type'
    futureRisk = 'wasted time on low-fit or weak-economics path'
    upgradeRelevance = 'intelligent'
  } else if (/tradeline|tradelines/.test(t)) {
    statedObjective = 'use tradelines'
    likelyTrueObjective = 'improve credit profile or approvals'
    chosenPath = 'tradeline strategy'
    bottleneck = 'unclear file condition'
    todayMove = 'identify whether utilization, negatives, or thin file is the real issue'
    futureRisk = 'wasting money on weak leverage move'
    upgradeRelevance = 'none'
  } else if (/car|vehicle|transportation/.test(t)) {
    statedObjective = 'get a car'
    likelyTrueObjective = 'secure transportation with minimum long-term damage'
    chosenPath = 'obtain vehicle under current constraints'
    bottleneck = 'leverage position vs urgency'
    todayMove = 'decide between immediate purchase and leverage improvement'
    futureRisk = 'locking in weak terms under pressure'
    upgradeRelevance = 'intelligent'
  } else if (/stuck|confused|lost|not sure/.test(t)) {
    statedObjective = 'get unstuck'
    likelyTrueObjective = 'recover direction and regain motion'
    chosenPath = 'narrow strongest path'
    bottleneck = 'unclear objective'
    todayMove = 'reduce to one real target'
    futureRisk = 'continued drift and wasted time'
    upgradeRelevance = 'intelligent'
  }

  if (/today|now|asap|immediately|right away/.test(t)) {
    urgency = 'high'
  } else if (/later|eventually|someday/.test(t)) {
    urgency = 'low'
  }

  if (/anyway|i know|still want|insist|don't care|do it anyway/.test(t)) {
    resistance = 'high'
  } else if (/maybe|not sure|i think|probably/.test(t)) {
    resistance = 'medium'
  }

  return {
    statedObjective,
    likelyTrueObjective,
    chosenPath,
    bottleneck,
    urgency,
    resistance,
    todayMove,
    futureRisk,
    upgradeRelevance,
  }
}
