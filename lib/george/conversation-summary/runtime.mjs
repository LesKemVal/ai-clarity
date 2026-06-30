function clean(value) {
  return String(value || '').trim()
}

function normalizeList(value) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
}

function firstText(...values) {
  for (const value of values) {
    const text = clean(value)
    if (text) return text
  }
  return ''
}

function deriveSuggestedNextAction({ desiredOutcome, outcome, transcript, signals }) {
  const combined = `${desiredOutcome} ${outcome} ${transcript} ${signals.join(' ')}`.toLowerCase()

  if (combined.includes('follow up') || combined.includes('second meeting') || combined.includes('next meeting')) {
    return 'Follow up with the materials or confirmation needed to keep the outcome moving.'
  }

  if (combined.includes('objection') || combined.includes('concern') || combined.includes('risk')) {
    return 'Clarify the concern and respond with evidence tied to the desired outcome.'
  }

  if (combined.includes('doctor') || combined.includes('appointment') || combined.includes('medical')) {
    return 'Organize the key facts, questions, and next steps from the conversation.'
  }

  if (desiredOutcome) {
    return `Take the next action that most directly advances: ${desiredOutcome}`
  }

  return 'Identify the next action that would most improve the outcome.'
}

function buildEvidenceCandidates({ outcome, transcript, signals, documentation }) {
  const candidates = []

  if (outcome) {
    candidates.push({
      type: 'outcome',
      evidence: outcome,
      confidence: 0.72,
    })
  }

  for (const signal of signals) {
    candidates.push({
      type: 'signal',
      evidence: signal,
      confidence: 0.64,
    })
  }

  if (transcript) {
    candidates.push({
      type: 'conversation',
      evidence: transcript.length > 220 ? `${transcript.slice(0, 217)}...` : transcript,
      confidence: 0.58,
    })
  }

  for (const doc of documentation) {
    candidates.push({
      type: 'documentation',
      evidence: typeof doc === 'string' ? doc : clean(doc.title) || clean(doc.name) || clean(doc.id),
      confidence: 0.6,
    })
  }

  return candidates.filter((candidate) => candidate.evidence)
}

export function summarizeConversation(input = {}, options = {}) {
  const conversationPackage = input.conversationPackage || {}
  const conversation = input.conversation || {}
  const liveResult = input.liveResult || {}

  const desiredOutcome = firstText(
    input.desiredOutcome,
    conversation.desiredOutcome,
    liveResult.desiredOutcome,
    conversationPackage.desiredOutcome
  )

  const outcome = firstText(
    liveResult.outcome,
    liveResult.result,
    conversation.outcome,
    input.outcome
  )

  const transcript = firstText(
    liveResult.transcript,
    conversation.transcript,
    input.transcript
  )

  const signals = normalizeList(
    liveResult.signals ||
      conversation.signals ||
      input.signals
  ).map(clean).filter(Boolean)

  const documentation = normalizeList(
    liveResult.relevantDocumentation ||
      conversation.relevantDocumentation ||
      conversationPackage.relevantDocumentation ||
      input.relevantDocumentation
  )

  const summaryText = firstText(
    liveResult.summary,
    input.summary,
    [
      desiredOutcome ? `Desired outcome: ${desiredOutcome}` : '',
      outcome ? `Observed outcome: ${outcome}` : '',
      signals.length ? `Signals: ${signals.join('; ')}` : '',
    ].filter(Boolean).join('\n')
  )

  const evidenceCandidates = buildEvidenceCandidates({
    outcome,
    transcript,
    signals,
    documentation,
  })

  const suggestedNextAction = firstText(
    liveResult.nextSuggestedAction,
    input.nextSuggestedAction,
    deriveSuggestedNextAction({ desiredOutcome, outcome, transcript, signals })
  )

  return {
    id: input.id || options.id || `conversation-summary-${clean(options.timestamp).replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'runtime'}`,
    source: 'conversation-summary-runtime',
    desiredOutcome,
    outcome,
    summary: summaryText,
    evidenceCandidates,
    suggestedNextAction,
    createdAt: options.timestamp || new Date().toISOString(),
  }
}
