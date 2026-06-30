import assert from 'node:assert'
import { buildGeorgeCoreInterpretation } from '../../lib/george/core/build-interpretation.ts'

export function run() {
  const state = buildGeorgeCoreInterpretation({
    transcript: 'Why should I believe retention will hold? The investor needs evidence before another meeting.',
    shadowMap: 'Investor is testing proof, risk, authority, and follow-up viability.',
    room: 'Investor Meeting',
    desiredOutcome: 'Secure investor follow-up meeting',
    knownContext: 'Retention and investor proof are the current leverage points.',
    userPosition: 'Founder',
  })

  assert.equal(state.source, 'george_core_interpretation')

  assert(
    state.conversationSignals?.has('proof_challenge'),
    'Operational state should preserve detected conversation signals.'
  )

  assert(
    state.signalSufficiency?.sufficient,
    'Operational state should expose whether GEORGE has enough signal to act.'
  )

  assert(
    Array.isArray(state.rankedSignals),
    'Operational state should expose ranked signals.'
  )

  assert(
    state.signalArbitration?.winner,
    'Operational state should expose the governing signal arbitration result.'
  )

  assert(
    ['sufficient', 'needs_signal'].includes(state.operationalReadiness),
    'Operational state should expose readiness.'
  )

  assert(
    typeof state.operationalConfidence === 'number' &&
      state.operationalConfidence >= 0 &&
      state.operationalConfidence <= 1,
    'Operational state should expose bounded confidence.'
  )

  assert.equal(
    state.objectiveHypothesis?.objective,
    state.objective,
    'Operational state should remain internally coherent.'
  )

  return true
}
