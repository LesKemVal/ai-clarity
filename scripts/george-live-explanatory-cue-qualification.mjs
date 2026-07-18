import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = process.cwd()

const typesSource = readFileSync(
  `${root}/lib/george/live-hub/types.ts`,
  'utf8'
)
const assessmentSource = readFileSync(
  `${root}/lib/george/live-runtime/operational-assessment.ts`,
  'utf8'
)
const routerSource = readFileSync(
  `${root}/lib/george/live-delivery/delivery-router.ts`,
  'utf8'
)

for (const expected of [
  'export type GeorgeOperationalAssessment',
  'action: string',
  'evidence?: string',
  'outcomeImpact?: string',
  'confidence: number',
]) {
  assert(
    typesSource.includes(expected),
    `Operational assessment contract should include ${expected}`
  )
}

for (const expected of [
  'resolveGeorgeOperationalAssessment',
  'composeGeorgeOperationalCueText',
  'isUserFacingEvidence',
  'INTERNAL_REASON_PATTERNS',
]) {
  assert(
    assessmentSource.includes(expected),
    `Operational assessment runtime should include ${expected}`
  )
}

assert(
  routerSource.includes('const operationalAssessment = resolveGeorgeOperationalAssessment'),
  'Delivery router should resolve the canonical operational assessment once'
)

assert(
  routerSource.includes('text: explanatoryText'),
  'Receiver policy should receive action plus evidence text'
)

assert(
  routerSource.includes('operationalAssessment,'),
  'Delivery cue should carry the governing operational assessment'
)

console.log('GEORGE LIVE explanatory cue qualification passed')
