import assert from 'node:assert'
import { evaluateLiveRecommendation } from '../../lib/george/runtime/live-recommendation-governor.ts'

export function run() {
  const topicOnly = evaluateLiveRecommendation({
    latestUserText: 'I am building a product for founders and customers.',
    signalSufficiency: 'sufficient',
    objectiveKnown: false,
  })

  assert.equal(
    topicOnly.shouldSurfaceEarbud,
    false,
    'LIVE should not surface from topic interest alone.'
  )

  const outcomeButNoConversation = evaluateLiveRecommendation({
    latestUserText: 'I want to get funded eventually.',
    signalSufficiency: 'sufficient',
    objectiveKnown: true,
  })

  assert.equal(
    outcomeButNoConversation.shouldSurfaceEarbud,
    false,
    'LIVE should not surface until there is conversation signal.'
  )

  const conversationOutcome = evaluateLiveRecommendation({
    latestUserText: 'I have an investor meeting and I want a follow-up.',
    signalSufficiency: 'sufficient',
    objectiveKnown: true,
  })

  assert.equal(
    conversationOutcome.shouldSurfaceEarbud,
    true,
    'LIVE should surface when outcome and conversation signal are present.'
  )

  assert.equal(
    conversationOutcome.shouldRecommendLive,
    false,
    'LIVE should surface quietly unless execution pressure is imminent.'
  )

  const imminent = evaluateLiveRecommendation({
    latestUserText: 'I am walking into an investor meeting right now and I want a follow-up.',
    signalSufficiency: 'sufficient',
    objectiveKnown: true,
    pressureHigh: true,
  })

  assert.equal(imminent.shouldRecommendLive, true)

  return true
}
