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
const receiverPolicySource = readFileSync(
  `${root}/lib/george/live-delivery/receiver-policy.ts`,
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
  'isUserFacingEvidence',
  'INTERNAL_REASON_PATTERNS',
]) {
  assert(
    assessmentSource.includes(expected),
    `Operational assessment runtime should include ${expected}`
  )
}

assert(
  !assessmentSource.includes('export function composeGeorgeOperationalCueText'),
  'Operational assessment must not export receiver-specific cue composition'
)

assert(
  receiverPolicySource.includes('export function composeGeorgeOperationalCueText'),
  'Receiver policy must own operational cue composition'
)

for (const expected of [
  "deliveryStyle === 'continue'",
  "deliveryStyle === 'cue'",
  "deliveryStyle === 'advice'",
  "join('\\n\\n')",
]) {
  assert(
    receiverPolicySource.includes(expected),
    `Receiver policy should preserve explanatory cue behavior: ${expected}`
  )
}

assert(
  routerSource.includes('const operationalAssessment = resolveGeorgeOperationalAssessment'),
  'Delivery router should resolve the canonical operational assessment once'
)

assert(
  routerSource.includes("from './receiver-policy'"),
  'Delivery router should import cue composition from canonical Receiver Policy'
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
