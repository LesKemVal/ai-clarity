import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const root = process.cwd()
const receiverPolicySource = readFileSync(
  `${root}/lib/george/live-delivery/receiver-policy.ts`,
  'utf8'
)
const routerSource = readFileSync(
  `${root}/lib/george/live-delivery/delivery-router.ts`,
  'utf8'
)
const typesSource = readFileSync(
  `${root}/lib/george/live-delivery/types.ts`,
  'utf8'
)
const bridgeSource = readFileSync(
  `${root}/components/george/live/LiveHubDeliveryBridge.tsx`,
  'utf8'
)
const visualBridgeSource = readFileSync(
  `${root}/components/george/live/LiveHubVisualCueBridge.tsx`,
  'utf8'
)
const visualPresentationPolicyPath =
  `${root}/lib/george/live-delivery/visual-presentation-policy.ts`
const receiverPolicyPath =
  `${root}/lib/george/live-delivery/receiver-policy.ts`

function assertOrder(source, first, second, message) {
  const firstIndex = source.indexOf(first)
  const secondIndex = source.indexOf(second)

  assert(firstIndex !== -1, `${message}: missing ${first}`)
  assert(secondIndex !== -1, `${message}: missing ${second}`)
  assert(firstIndex < secondIndex, message)
}

assert(
  typesSource.includes('export type GeorgeLiveReceiverProfile') &&
    typesSource.includes("'visual_only'") &&
    typesSource.includes("'audio_only'") &&
    typesSource.includes("'audio_visual'"),
  'LIVE delivery types must define all three receiver profiles'
)

assert(
  receiverPolicySource.includes("if (input.receiverProfile === 'visual_only') return ['visual']"),
  'visual_only must route exclusively to visual delivery'
)

assert(
  receiverPolicySource.includes(
    "if (input.receiverProfile === 'audio_only') return input.voiceEnabled ? ['voice'] : ['silent']"
  ),
  'audio_only must route to voice when available and fail closed to silent'
)

assert(
  receiverPolicySource.includes(
    "return input.voiceEnabled ? ['voice', 'visual'] : ['visual']"
  ),
  'audio_visual must route one support behavior to both surfaces when voice is enabled'
)

assert(
  receiverPolicySource.includes('shapeAudioText') &&
    receiverPolicySource.includes('shapeVisualOnlyText') &&
    receiverPolicySource.includes('shapeVisualReferenceText'),
  'receiver delivery policy must own separate audio, visual-only, and visual-reference shaping'
)

assert(
  receiverPolicySource.includes("input.receiverProfile === 'visual_only'") &&
    receiverPolicySource.includes('VISUAL_MAX_CHARS') &&
    receiverPolicySource.includes('preserveLines'),
  'visual-only policy must preserve readable structure and allow richer guidance'
)

assert(
  receiverPolicySource.includes('AUDIO_MAX_CHARS') &&
    receiverPolicySource.includes('flattenForAudio') &&
    receiverPolicySource.includes("input.mode === 'voice'"),
  'audio policy must flatten support for sequential spoken delivery'
)

assert(
  receiverPolicySource.includes(
    "? 'Receiver policy routed support as persistent visual reference.'"
  ),
  'audio_visual visual output must be identified as persistent reference'
)

assert(
  receiverPolicySource.includes(
    ": 'Receiver policy routed support as readable visual-only guidance.'"
  ),
  'visual_only output must be identified as readable visual guidance'
)

assert(
  !bridgeSource.includes('AUDIO_MAX_CHARS') &&
    !bridgeSource.includes('VISUAL_MAX_CHARS') &&
    !visualBridgeSource.includes('AUDIO_MAX_CHARS') &&
    !visualBridgeSource.includes('VISUAL_MAX_CHARS'),
  'UI bridges must not own receiver-specific shaping limits'
)

assert(
  routerSource.includes('resolveGeorgeReceiverDeliveryPolicy') &&
    bridgeSource.includes('routeGeorgeDeliveryCues'),
  'delivery bridge must delegate receiver routing to the canonical delivery policy'
)

assert(
  visualBridgeSource.includes('whitespace-pre-line') &&
    visualBridgeSource.includes('break-words') &&
    visualBridgeSource.includes('{visualCue.text}') &&
    !visualBridgeSource.includes('.replace(/\\n+/g'),
  'visual bridge must preserve policy-created line breaks, wrap long text, and avoid reshaping content'
)

const executorStart = visualBridgeSource.indexOf(
  'const executeVisualPresentationPlan = useCallback'
)
const handlerStart = visualBridgeSource.indexOf(
  'const handleVisualCue = useCallback'
)
const voiceHandlerStart = visualBridgeSource.indexOf(
  'const handleVoiceCue = useCallback'
)
const replayStart = visualBridgeSource.indexOf(
  'return subscribeGeorgeApprovedDeliveryReplay'
)
const renderedEffectStart = visualBridgeSource.indexOf(
  "markRuntimeEvent(\n      visualCue.turnId || visualCue.text"
)

assert(
  executorStart !== -1 &&
    handlerStart > executorStart &&
    voiceHandlerStart > handlerStart &&
    replayStart !== -1 &&
    renderedEffectStart > replayStart,
  'visual bridge qualification blocks must remain discoverable'
)

const executorSource = visualBridgeSource.slice(executorStart, handlerStart)
const handlerSource = visualBridgeSource.slice(handlerStart, voiceHandlerStart)
const replaySource = visualBridgeSource.slice(replayStart, renderedEffectStart)

assertOrder(
  executorSource,
  "plan.decision.action !== 'present'",
  'cancelVisualSequence()',
  'accepted visual plans must pass admission before cancelling the active sequence'
)
assertOrder(
  handlerSource,
  "if (plan.decision.action === 'suppress')",
  'executeVisualPresentationPlan(cue, plan)',
  'suppressed visual plans must return before the executor can cancel the active sequence'
)
assert(
  !handlerSource
    .slice(
      handlerSource.indexOf("if (plan.decision.action === 'suppress')"),
      handlerSource.indexOf('executeVisualPresentationPlan(cue, plan)')
    )
    .includes('cancelVisualSequence()'),
  'suppressed visual plans must not cancel the active sequence'
)
assert(
  visualBridgeSource.includes('sequenceTokenRef.current += 1') &&
    executorSource.includes(
      'sequenceTokenRef.current !== sequenceToken'
    ),
  'visual sequence callbacks must be invalidated through the canonical sequence token'
)
assert(
  executorSource.includes(
    "stageIndex === 0 ? plan.decision.now : Date.now()"
  ) &&
    executorSource.includes('lastRenderedAtRef.current = renderedAt'),
  'every visual stage, including stage two, must refresh the interruption timestamp'
)
assert(
  /if \(!active\) \{[\s\S]*?cancelVisualSequence\(\)[\s\S]*?setVisualCue\(null\)/.test(
    visualBridgeSource
  ),
  'deactivating LIVE must cancel visual timers and clear rendered state'
)
assert(
  /\(\) => \(\) => \{[\s\S]*?activeRef\.current = false[\s\S]*?cancelVisualSequence\(\)/.test(
    visualBridgeSource
  ),
  'visual bridge unmount must invalidate callbacks and clear the active timer'
)
assert(
  replaySource.includes('resolveGeorgeVisualPresentationPlan({') &&
    replaySource.includes('hasCurrentCue: false') &&
    replaySource.includes('executeVisualPresentationPlan(delivery, plan)') &&
    !replaySource.includes('operationalAssessment:'),
  'approved-delivery replay must remain a single-stage fallback plan without reconstructed assessment data'
)
assert(
  visualBridgeSource.includes('resolveGeorgeVisualPresentationPlan') &&
    visualBridgeSource.includes(
      'operationalAssessment: cue.operationalAssessment'
    ) &&
    !visualBridgeSource.includes('resolveEvidenceStageText') &&
    !visualBridgeSource.includes('outcomeImpact') &&
    !visualBridgeSource.includes("kind: 'evidence'"),
  'visual bridge must delegate evidence ordering to visual presentation policy'
)

const qualificationDirectory = mkdtempSync(
  join(tmpdir(), 'george-live-delivery-policy-')
)
const qualificationFile = join(
  qualificationDirectory,
  'visual-presentation-qualification.ts'
)
const visualPresentationPolicyUrl = pathToFileURL(
  visualPresentationPolicyPath
).href
const receiverPolicyUrl = pathToFileURL(receiverPolicyPath).href

writeFileSync(
  qualificationFile,
  `
import assert from 'node:assert/strict'
import { resolveGeorgeVisualPresentationPlan } from ${JSON.stringify(visualPresentationPolicyUrl)}
import { resolveGeorgeReceiverDeliveryPolicy } from ${JSON.stringify(receiverPolicyUrl)}

const action = 'Show the renewal data.'
const evidence = 'The buyer asked for proof.'
const outcomeImpact = 'This makes the recommendation credible.'
const fallbackText = [action, evidence, outcomeImpact].join(' ')
const basePlanInput = {
  fallbackText,
  candidatePriority: 40,
  hasCurrentCue: false,
  now: 10000,
}
const assessment = {
  action,
  evidence,
  outcomeImpact,
  confidence: 0.9,
}

const audioVisualPlan = resolveGeorgeVisualPresentationPlan({
  ...basePlanInput,
  receiverProfile: 'audio_visual',
  operationalAssessment: assessment,
})

assert.equal(audioVisualPlan.decision.action, 'present')
assert.deepEqual(
  audioVisualPlan.stages.map((stage) => stage.kind),
  ['evidence', 'action'],
  'meaningful evidence must be presented before the recommended action'
)
assert.equal(
  audioVisualPlan.stages[0]?.text,
  evidence + '\\n\\n' + outcomeImpact,
  'distinct outcome impact should clarify the evidence stage'
)
assert.equal(audioVisualPlan.stages[1]?.text, action)
assert.equal(
  audioVisualPlan.stages[0]?.durationMs,
  2600,
  'evidence stage must reuse the existing visual interruption window'
)
assert.equal(
  audioVisualPlan.stages[1]?.durationMs,
  12000,
  'audio-visual action stage must reuse the existing hold window'
)

const visualOnlyPlan = resolveGeorgeVisualPresentationPlan({
  ...basePlanInput,
  receiverProfile: 'visual_only',
  operationalAssessment: assessment,
})
assert.equal(visualOnlyPlan.stages.length, 2)
assert.equal(
  visualOnlyPlan.stages[1]?.durationMs,
  20000,
  'visual-only action stage must reuse the existing hold window'
)

const singleStagePlan = resolveGeorgeVisualPresentationPlan({
  ...basePlanInput,
  fallbackText: action,
  receiverProfile: 'visual_only',
  operationalAssessment: {
    action,
    confidence: 0.9,
  },
})
assert.deepEqual(
  singleStagePlan.stages.map((stage) => [stage.kind, stage.text]),
  [['action', action]],
  'missing evidence must preserve the existing single-stage cue'
)

for (const repeatedOutcomeImpact of [evidence, action]) {
  const repeatedOutcomePlan = resolveGeorgeVisualPresentationPlan({
    ...basePlanInput,
    receiverProfile: 'visual_only',
    operationalAssessment: {
      action,
      evidence,
      outcomeImpact: repeatedOutcomeImpact,
      confidence: 0.9,
    },
  })

  assert.equal(
    repeatedOutcomePlan.stages[0]?.text,
    evidence,
    'outcome impact must be omitted when it duplicates evidence or action'
  )
}

const routedAudioVisual = resolveGeorgeReceiverDeliveryPolicy({
  text: [action, evidence, outcomeImpact].join('\\n\\n'),
  voiceEnabled: true,
  deliveryStyle: 'advice',
  receiverProfile: 'audio_visual',
})
assert.deepEqual(
  routedAudioVisual.map((delivery) => delivery.mode),
  ['voice', 'visual'],
  'audio-visual delivery must preserve both receiver surfaces'
)
assert.equal(
  routedAudioVisual[0]?.text,
  fallbackText,
  'visual staging must not change compact spoken delivery'
)
assert.equal(audioVisualPlan.stages.length, 2)

const voiceDisabledAudioVisual = resolveGeorgeReceiverDeliveryPolicy({
  text: fallbackText,
  voiceEnabled: false,
  deliveryStyle: 'advice',
  receiverProfile: 'audio_visual',
})
assert.deepEqual(
  voiceDisabledAudioVisual.map((delivery) => delivery.mode),
  ['visual'],
  'voice-disabled audio-visual delivery must fall back to visual'
)
const voiceDisabledPlan = resolveGeorgeVisualPresentationPlan({
  ...basePlanInput,
  fallbackText: voiceDisabledAudioVisual[0]?.text,
  receiverProfile: 'audio_visual',
  operationalAssessment: assessment,
})
assert.equal(voiceDisabledPlan.stages.length, 2)

const duplicatePlan = resolveGeorgeVisualPresentationPlan({
  ...basePlanInput,
  receiverProfile: 'visual_only',
  operationalAssessment: assessment,
  currentText: fallbackText,
  currentPriority: 40,
  hasCurrentCue: true,
  lastRenderedAt: 9000,
})
assert.equal(duplicatePlan.decision.action, 'suppress')
assert.equal(duplicatePlan.decision.reason, 'duplicate')
assert.equal(duplicatePlan.stages.length, 0)

const heldPlan = resolveGeorgeVisualPresentationPlan({
  ...basePlanInput,
  receiverProfile: 'visual_only',
  operationalAssessment: assessment,
  currentText: 'Current visual cue.',
  currentPriority: 40,
  hasCurrentCue: true,
  lastRenderedAt: 9000,
})
assert.equal(heldPlan.decision.action, 'suppress')
assert.equal(heldPlan.decision.reason, 'current_cue_hold')

const lowerPriorityPlan = resolveGeorgeVisualPresentationPlan({
  ...basePlanInput,
  candidatePriority: 20,
  receiverProfile: 'visual_only',
  operationalAssessment: assessment,
  currentText: 'Current visual cue.',
  currentPriority: 40,
  hasCurrentCue: true,
  lastRenderedAt: 7000,
})
assert.equal(lowerPriorityPlan.decision.action, 'suppress')
assert.equal(lowerPriorityPlan.decision.reason, 'lower_priority')

const priorityInterruptPlan = resolveGeorgeVisualPresentationPlan({
  ...basePlanInput,
  candidatePriority: 60,
  receiverProfile: 'visual_only',
  operationalAssessment: assessment,
  currentText: 'Current visual cue.',
  currentPriority: 40,
  hasCurrentCue: true,
  lastRenderedAt: 9000,
})
assert.equal(
  priorityInterruptPlan.decision.action,
  'present',
  'existing priority delta must remain authoritative during the interruption window'
)

console.log('GEORGE staged visual presentation planner qualification passed')
`
)

try {
  execFileSync('npx', ['tsx', qualificationFile], {
    cwd: root,
    stdio: 'inherit',
  })
} finally {
  rmSync(qualificationDirectory, { recursive: true, force: true })
}

console.log('GEORGE LIVE delivery policy smoke passed')
