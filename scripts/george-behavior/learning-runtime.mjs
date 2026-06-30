import assert from 'node:assert'
import {
  discardLearningCandidates,
  evaluateLearningCandidates,
  holdLearningCandidates,
  promoteLearningCandidates,
} from '../../lib/george/learning/runtime.mjs'

export function run() {
  const candidates = evaluateLearningCandidates(
    {
      conversationPackage: {
        desiredOutcome: 'secure a second investor meeting',
        conversationContext: 'investor asked about retention and acquisition cost',
        conversationWith: 'Jordan at Acme Ventures',
      },
      evidenceCandidates: [
        {
          id: 'person-jordan',
          type: 'person',
          evidence: 'Jordan at Acme Ventures asked for retention metrics.',
          confidence: 0.76,
          futureUseful: true,
        },
        {
          id: 'pattern-retention-first',
          type: 'communication_pattern',
          evidence: 'Lead with retention proof before discussing acquisition cost.',
          confidence: 0.68,
          outcomeRelevant: true,
        },
        {
          id: 'unrelated-weather',
          type: 'conversation',
          evidence: 'It was raining outside before the meeting.',
          confidence: 0.9,
        },
      ],
    },
    { timestamp: '2026-06-30T14:00:00.000Z' }
  )

  const person = candidates.find((candidate) => candidate.id === 'person-jordan')
  assert.equal(person.type, 'person')
  assert.equal(person.outcomeRelevant, true)
  assert.equal(
    person.decision,
    'promote',
    'Outcome-linked people with strong evidence should be eligible for promoted learning.'
  )

  const pattern = candidates.find((candidate) => candidate.id === 'pattern-retention-first')
  assert.equal(pattern.type, 'communication_pattern')
  assert.equal(pattern.outcomeRelevant, true)
  assert.equal(
    pattern.decision,
    'hold_for_more_evidence',
    'Communication patterns should usually be held until confidence grows through repeated usefulness.'
  )

  const unrelated = candidates.find((candidate) => candidate.id === 'unrelated-weather')
  assert.equal(unrelated.outcomeRelevant, false)
  assert.equal(
    unrelated.decision,
    'discard_not_outcome_relevant',
    'High confidence alone should not preserve evidence that is unrelated to the outcome.'
  )

  assert.deepEqual(
    promoteLearningCandidates(candidates).map((candidate) => candidate.id),
    ['person-jordan']
  )

  assert.deepEqual(
    holdLearningCandidates(candidates).map((candidate) => candidate.id),
    ['pattern-retention-first']
  )

  assert.deepEqual(
    discardLearningCandidates(candidates).map((candidate) => candidate.id),
    ['unrelated-weather']
  )

  return true
}
