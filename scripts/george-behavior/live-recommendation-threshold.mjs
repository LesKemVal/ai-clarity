import assert from 'node:assert'
import { evaluateLiveRecommendationEvidence } from '../../lib/george/runtime/live-recommendation-governor.ts'
import { resolveLiveSupportJudgment } from '../../lib/george/runtime/operational-judgment.ts'

function judge(input) {
  const evidence = evaluateLiveRecommendationEvidence(input)
  return resolveLiveSupportJudgment(evidence, input.signalSufficiency)
}

export function run() {
  const topicOnly = judge({
    latestUserText: 'I am building a product for founders and customers.',
    signalSufficiency: 'sufficient',
    objectiveKnown: false,
  })

  assert.equal(topicOnly.posture, 'none', 'LIVE should not surface from topic interest alone.')

  const outcomeButNoConversation = judge({
    latestUserText: 'I want to get funded eventually.',
    signalSufficiency: 'sufficient',
    objectiveKnown: true,
  })

  assert.equal(outcomeButNoConversation.posture, 'none', 'LIVE should not surface until there is conversation signal.')

  const conversationOutcome = judge({
    latestUserText: 'I have an investor meeting and I want a follow-up.',
    signalSufficiency: 'sufficient',
    objectiveKnown: true,
  })

  assert.equal(conversationOutcome.posture, 'surface', 'LIVE should surface when outcome and conversation signal are present.')
  assert.equal(conversationOutcome.explainOnRequest, true, 'quiet LIVE surfacing should explain only on request.')

  const naturalImminentStart = judge({
    latestUserText: 'The meeting starts in five minutes. I have my earbuds with me.',
    signalSufficiency: 'sufficient',
    objectiveKnown: true,
  })

  assert.equal(
    naturalImminentStart.posture,
    'recommend',
    'Natural imminent-start phrasing should recommend LIVE.'
  )

  const imminent = judge({
    latestUserText: 'I am walking into an investor meeting right now and I want a follow-up.',
    signalSufficiency: 'sufficient',
    objectiveKnown: true,
    pressureHigh: true,
  })

  assert.equal(imminent.posture, 'recommend')
  assert.equal(imminent.strength, 'strong')

  return true
}
