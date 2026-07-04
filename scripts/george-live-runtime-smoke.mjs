import { readFileSync } from 'node:fs'
import {
  createConversationPackage,
  updateAfterLive,
} from '../lib/george/conversation-packages/index.mjs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const root = process.cwd()
const pageSource = readFileSync(`${root}/app/george/page.tsx`, 'utf8')
const panelSource = readFileSync(`${root}/components/george/live/LiveRoomStatusPanel.tsx`, 'utf8')
const outcomeReviewSource = readFileSync(`${root}/lib/george/live-runtime/live-outcome-review.ts`, 'utf8')
const recordPanelSource = readFileSync(`${root}/components/george/live/PostLiveConversationRecordPanel.tsx`, 'utf8')
const liveReasoningSource = readFileSync(`${root}/lib/george/live-voice/live-reasoning.ts`, 'utf8')
const deliveryBridgeSource = readFileSync(`${root}/components/george/live/LiveHubDeliveryBridge.tsx`, 'utf8')
const liveHubAdapterSource = readFileSync(`${root}/lib/george/live-hub/live-runtime-adapter.ts`, 'utf8')
const liveFinalTranscriptAdapterSource = readFileSync(`${root}/lib/george/live-runtime/live-final-transcript-adapter.ts`, 'utf8')
const liveHubGroqSource = readFileSync(`${root}/live-hub/src/llm/groq-fast-lane.ts`, 'utf8')
const actionCueAuthoritySource = readFileSync(`${root}/lib/george/core/verification/action-cue-authority.ts`, 'utf8')
const operationalUnderstandingSource = readFileSync(`${root}/lib/george/core/operational-understanding.ts`, 'utf8')
const liveExecutionSource = readFileSync(`${root}/lib/george/core/live-execution.ts`, 'utf8')
const liveFinalTranscriptAdapterSourceText = readFileSync(`${root}/lib/george/live-runtime/live-final-transcript-adapter.ts`, 'utf8')
const liveAwarenessReconciliationSource = readFileSync(`${root}/lib/george/live-runtime/live-awareness-reconciliation.ts`, 'utf8')
const liveHubStreamSource = readFileSync(`${root}/live-hub/src/stt/deepgram-stream.ts`, 'utf8')
const liveHubProtocolSource = readFileSync(`${root}/live-hub/src/types/protocol.ts`, 'utf8')
const runtimePacketSource = readFileSync(`${root}/live-hub/src/george/runtime-packet.ts`, 'utf8')
const cueArbitratorSource = readFileSync(`${root}/live-hub/src/george/cue-arbitrator.ts`, 'utf8')

assert(panelSource.includes('onRoomToggle'), 'LIVE runtime console should expose room on/off control')
assert(panelSource.includes('onVoiceToggle'), 'LIVE runtime console should expose audio on/off control')
assert(panelSource.includes('onSupportPressed'), 'LIVE runtime console should expose Guidance support control')
assert(panelSource.includes('onCommunicationPressed'), 'LIVE runtime console should expose Communication control')
assert(panelSource.includes('onConversationPressed'), 'LIVE runtime console should expose Conversation control')
assert(panelSource.includes('After LIVE'), 'Conversation control should remain post-LIVE only')
assert(!panelSource.includes('{safeObjectiveLabel}'), 'LIVE primary console should not render outcome/objective mirror')
assert(!panelSource.includes('MUTE'), 'LIVE footer audio duplicate should not return to runtime console')

assert(
  liveReasoningSource.includes('produce the answer as user-ready language'),
  'LIVE Response mode should produce user-ready language rather than GEORGE self-description'
)
assert(
  liveReasoningSource.includes('Do not answer as GEORGE when the other party asks about GEORGE'),
  'LIVE Response mode should prevent GEORGE from answering as itself in investor-style questions'
)
assert(
  liveReasoningSource.includes('GEORGE_LIVE_DOCTRINE') &&
    actionCueAuthoritySource.includes('GEORGE is an operational intelligence runtime'),
  'LIVE Response mode should preserve GEORGE positioning through canonical doctrine and authority'
)
assert(
  liveReasoningSource.includes('max_tokens: mode === \'response\' ? 220'),
  'LIVE Response mode should allow enough tokens for a complete answer'
)
assert(
  deliveryBridgeSource.includes('turnId: event.turnId || deliveryCue.turnId'),
  'Delivery bridge should preserve ACTION_CUE turnId into delivery cue'
)
assert(
  deliveryBridgeSource.includes("markRuntimeEvent(resolvedDeliveryCue.turnId || deliveryKey, 'delivery_cue')"),
  'Delivery metrics should use preserved delivery turnId when available'
)
assert(
  !liveHubGroqSource.includes('repairResponseCandidate') &&
    !liveHubGroqSource.includes('violatesResponseOutcomeContract'),
  'LIVE hub Groq should generate candidates only; response repair belongs to core authority'
)
assert(
  actionCueAuthoritySource.includes('buildVerifiedResponse') &&
    actionCueAuthoritySource.includes('violatesResponseQuality'),
  'Core authority should own verified response repair and quality gating'
)
assert(
  actionCueAuthoritySource.includes('violatesResponseAuthority'),
  'Response authority should reject generic AI assistant identity'
)
assert(
  actionCueAuthoritySource.includes('[GEORGE][core][response-authority-check]'),
  'Response authority should trace response authority decisions'
)
assert(
  actionCueAuthoritySource.includes('It is an operational intelligence runtime'),
  'Response authority should repair investor objection with operational intelligence doctrine'
)
assert(
  liveHubStreamSource.includes("packet.deliveryStyle !== 'response'"),
  'Response mode should not emit local generic cue before fast response authority'
)
assert(
  liveHubProtocolSource.includes('briefingKnowledge?: string'),
  'LIVE hub protocol should carry briefingKnowledge'
)
assert(
  runtimePacketSource.includes('briefingKnowledge: input.context.briefingKnowledge'),
  'LIVE runtime packet should preserve briefingKnowledge'
)
assert(
  cueArbitratorSource.includes('briefingKnowledge: packet.briefingKnowledge'),
  'ACTION_CUE evidence should include briefingKnowledge'
)
assert(
  liveHubGroqSource.includes('briefingKnowledge: packet.briefingKnowledge'),
  'Groq fast lane should receive briefingKnowledge'
)
assert(
  actionCueAuthoritySource.includes('input.context?.briefingKnowledge'),
  'Response authority should include briefingKnowledge in authority evidence'
)

assert(outcomeReviewSource.includes('buildLiveOutcomeObservation'), 'LIVE runtime should expose Outcome Review builder')
assert(outcomeReviewSource.includes('observedProgress'), 'Outcome Review should produce observed progress')
assert(outcomeReviewSource.includes('availablePaths'), 'Outcome Review should produce available paths')
assert(outcomeReviewSource.includes('bestAvailablePath'), 'Outcome Review should produce best available path')
assert(outcomeReviewSource.includes('assistanceOptions'), 'Outcome Review should produce post-LIVE assistance options')
assert(outcomeReviewSource.includes('internalNotes'), 'Outcome Review should preserve operational notes for package learning')

assert(recordPanelSource.includes('Post-LIVE operational memory'), 'Conversation Record panel should be post-LIVE operational memory')
assert(recordPanelSource.includes('Outcome Review'), 'Conversation Record panel should surface Outcome Review')
assert(recordPanelSource.includes('Learning'), 'Conversation Record panel should surface promoted learning')
assert(recordPanelSource.includes('Future actions'), 'Conversation Record panel should surface future actions')
assert(recordPanelSource.includes('Transcript evidence:'), 'Conversation Record panel should label transcript evidence availability')
assert(!recordPanelSource.includes('Transcript viewer'), 'Conversation Record panel should not become a transcript viewer')

const pkg = createConversationPackage({
  desiredOutcome: 'secure investor follow-up',
  conversationType: 'investor meeting',
}, { timestamp: '2026-07-02T01:00:00.000Z' })

const updated = updateAfterLive(pkg, {
  summary: {
    id: 'runtime-summary-1',
    type: 'live_summary',
    suggestedNextAction: 'Send the implementation materials and schedule the next meeting.',
  },
  outcomeReview: {
    desiredOutcome: 'secure investor follow-up',
    observedProgress: 'improving',
    confidence: 82,
    currentState: 'Advancing toward the desired outcome.',
    observedChange: 'Investor requested implementation material.',
    availablePaths: ['Original outcome remains available.'],
    bestAvailablePath: 'Respond directly and move toward the next commitment.',
    assistanceOptions: ['Prepare follow-up.', 'Prepare requested materials.'],
    internalNotes: 'Investor requested materials and the follow-up path remained open.',
  },
}, { timestamp: '2026-07-02T01:05:00.000Z' })

assert(updated.liveSummaries.length === 1, 'LIVE runtime should hand summary into Conversation Package')
assert(updated.outcomeProgression.length === 1, 'LIVE runtime should hand Outcome Review into package progression')
assert(updated.learning.length === 1, 'LIVE runtime should hand Outcome Review into package learning')
assert(updated.futureActions.length === 1, 'LIVE runtime should hand summary next action into package future action')
assert(updated.learning[0].learning.startsWith('We can '), 'LIVE runtime learning should preserve memory doctrine wording')

assert(
  liveFinalTranscriptAdapterSource.includes("input.deliveryStyle === 'continue'") &&
    liveFinalTranscriptAdapterSource.includes("input.deliveryStyle === 'response'") &&
    liveFinalTranscriptAdapterSource.includes('shouldSuppressLegacy'),
  'LIVE Response should route through hub only and suppress legacy chat path'
)
assert(
  liveHubAdapterSource.includes('fallbackEvidence'),
  'LIVE hub adapter should synthesize fallback evidence when hub payload is incomplete'
)
assert(
  liveHubAdapterSource.includes('lastTranscriptRef') &&
    liveHubAdapterSource.includes('recentTranscript: lastTranscriptRef'),
  'LIVE hub adapter should preserve recent transcript for authority fallback'
)
assert(
  operationalUnderstandingSource.includes('operationalObjective') &&
    operationalUnderstandingSource.includes('objectiveSource') &&
    operationalUnderstandingSource.includes('credibility') &&
    operationalUnderstandingSource.includes('optionality') &&
    operationalUnderstandingSource.includes('accumulating signals'),
  'Operational Understanding should own default/live operational objective synthesis'
)
assert(
  liveExecutionSource.includes('buildGeorgeOperationalUnderstanding') &&
    liveExecutionSource.includes('understanding.operationalObjective'),
  'LIVE execution should use synthesized operational objective'
)

assert(
  liveAwarenessReconciliationSource.includes('persistentSignals') &&
    liveAwarenessReconciliationSource.includes('signalCounts'),
  'LIVE awareness reconciliation should produce persistent signals'
)
assert(
  liveFinalTranscriptAdapterSourceText.includes('persistentSignals?: string[]') &&
    liveFinalTranscriptAdapterSourceText.includes('persistentSignals: input.persistentSignals'),
  'LIVE final transcript adapter should pass persistent signals into core execution'
)
assert(
  liveExecutionSource.includes('persistentSignals?: string[]') &&
    liveExecutionSource.includes('persistentSignals: input.persistentSignals'),
  'LIVE core execution should pass persistent signals into operational understanding'
)
assert(
  actionCueAuthoritySource.includes("category: 'operational_answer'") &&
    actionCueAuthoritySource.includes('Verified from operational understanding.'),
  'Verified Response replacements should be marked as operational answers'
)

console.log('GEORGE LIVE runtime smoke passed')
