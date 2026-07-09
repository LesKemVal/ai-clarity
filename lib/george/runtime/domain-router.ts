export type GeorgeRuntimeDomain = 'credit' | 'cdl' | 'ged' | 'cna'

type ResolveDomainRuntimeInput = {
  text: string
  activeMemoryFolder?: string | null
  previousUserMessages?: string[]
}

type ResolveDomainRuntimeResult = {
  domain: GeorgeRuntimeDomain | null
  detectedDomain: GeorgeRuntimeDomain | null
  domainPrefix: string
  firstResponseOverride: string | null
  metadata: {
    creditIntent?: string
    creditType?: string
    tradelineAdvice?: string
  }
}

export function detectGeorgeRuntimeDomain(text: string): GeorgeRuntimeDomain | null {
  const t = text.toLowerCase()

  if (t.includes('credit') || t.includes('tradeline') || t.includes('score')) return 'credit'
  if (t.includes('cdl') || t.includes('truck') || t.includes('trucking')) return 'cdl'
  if (t.includes('ged') || t.includes('high school equivalency')) return 'ged'
  if (t.includes('cna') || t.includes('nursing assistant')) return 'cna'

  return null
}

function resolveMemoryDomain(activeMemoryFolder?: string | null): GeorgeRuntimeDomain | null {
  return activeMemoryFolder === 'Credit' ? 'credit' : null
}

export function resolveDomainRuntime(input: ResolveDomainRuntimeInput): ResolveDomainRuntimeResult {
  const text = input.text || ''
  const t = text.toLowerCase()
  const detectedDomain = detectGeorgeRuntimeDomain(text)
  const domain = detectedDomain || resolveMemoryDomain(input.activeMemoryFolder) || null

  let domainPrefix = ''
  let firstResponseOverride: string | null = null
  let creditIntent = ''
  let creditType = ''
  let tradelineAdvice = ''

  const lastCreditIntent = (input.previousUserMessages || [])
    .slice()
    .reverse()
    .find((message) => /tradeline|authorized user/i.test(message || ''))
    ? 'tradelines'
    : ''

  if (domain === 'credit') {
    if (
      t.includes('maxed') ||
      t.includes('maxed out') ||
      t.includes('cards are maxed') ||
      t.includes('credit cards are maxed') ||
      t.includes('utilization') ||
      t.includes('balance') ||
      t.includes('balances')
    ) {
      creditType = 'utilization'
    } else if (t.includes('collection') || t.includes('charge off') || t.includes('late')) {
      creditType = 'derogatory'
    } else if (t.includes('no credit') || t.includes('no history') || t.includes('thin file')) {
      creditType = 'thin'
    } else if (t.includes('tradeline') || t.includes('authorized user')) {
      creditType = 'tradelines'
    }

    if (creditType === 'thin') {
      tradelineAdvice = 'Tradelines may help if your file is thin, but they need to be clean, aged, and low utilization to matter.'
    } else if (creditType === 'utilization') {
      tradelineAdvice = 'Tradelines won’t fix high utilization. Lowering your balances will have a much stronger impact.'
    } else if (creditType === 'derogatory') {
      tradelineAdvice = 'Tradelines won’t remove negative marks. You need to focus on resolving or removing derogatory items first.'
    } else if (creditType === 'tradelines') {
      tradelineAdvice = 'Tradelines can help in specific situations, but they are often overrated and misused.'
    }

    if (
      t.includes('raise score') ||
      t.includes('increase score') ||
      t.includes('improve score') ||
      t.includes('boost score') ||
      t.includes('improve my score') ||
      t.includes('raise my score') ||
      t.includes('build my credit') ||
      t.includes('improve my credit')
    ) {
      creditIntent = 'score'
    } else if (
      t.includes('approval') ||
      t.includes('approved') ||
      t.includes('loan') ||
      t.includes('car') ||
      t.includes('mortgage') ||
      t.includes('apartment')
    ) {
      creditIntent = 'approval'
    } else if (
      t.includes('fix credit') ||
      t.includes('repair credit') ||
      t.includes('clean up credit')
    ) {
      creditIntent = 'repair'
    } else if (t.includes('tradeline') || t.includes('authorized user')) {
      creditIntent = 'tradelines'
    }

    if (!creditIntent && lastCreditIntent) creditIntent = lastCreditIntent

    domainPrefix = `You are helping with credit.

First, identify the user's real goal (raise score, get approved, fix profile).

Then:
- If utilization is the issue → focus on paydown timing and balance strategy
- If derogatories → focus on removal, not score tricks
- If thin file → tradelines may be relevant
- If tradelines mentioned → evaluate if they actually help or are a distraction

Do NOT assume tradelines are the answer.

Ask one sharp question that reveals what is actually holding them back.

Credit type detected: ${creditType || 'unknown'}\nUser intent: ${creditIntent || 'unknown'}\nTradeline guidance: ${tradelineAdvice || 'evaluate case by case'}`

    const multiProblem = /interview|job|boss|meeting|business|income|car|transportation|relationship|court|doctor/i.test(text)

    if (/maxed|maxed|balance|balances|utilization/i.test(text) && !multiProblem) {
      firstResponseOverride = 'Your cards being maxed out is the issue. Tradelines will not fix that. Bring each card under 30%—under 10% if possible. Paydown or balance shifting is the move. I can help you build a paydown plan, or I can show you the fastest way to lower utilization without adding new debt.'
    }
  }

  if (detectedDomain === 'cdl') {
    domainPrefix = 'You are helping with CDL path. Focus on permit, training, test, endorsements, and job placement. Give the fastest credible path to income.'
  }

  if (detectedDomain === 'ged') {
    domainPrefix = 'You are helping with GED. Focus on passing strategy, weakest subject, scheduling, and speed to completion.'
  }

  if (detectedDomain === 'cna') {
    domainPrefix = 'You are helping with CNA. Focus on certification steps, exam, skills check, and fastest path to employment.'
  }

  return {
    domain,
    detectedDomain,
    domainPrefix,
    firstResponseOverride,
    metadata: {
      creditIntent: creditIntent || undefined,
      creditType: creditType || undefined,
      tradelineAdvice: tradelineAdvice || undefined,
    },
  }
}
