import { readFileSync } from 'node:fs'
import {
  createConversationPackage,
  updateAfterLive,
} from '../lib/george/conversation-packages/index.mjs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const root = process.cwd()
const panelSource = readFileSync(`${root}/components/george/live/LiveRoomStatusPanel.tsx`, 'utf8')
const outcomeReviewSource = readFileSync(`${root}/lib/george/live-runtime/live-outcome-review.ts`, 'utf8')
const recordPanelSource = readFileSync(`${root}/components/george/live/PostLiveConversationRecordPanel.tsx`, 'utf8')
const liveReasoningSource = readFileSync(`${root}/lib/george/live-voice/live-reasoning.ts`, 'utf8')
const deliveryBridgeSource = readFileSync(`${root}/components/george/live/LiveHubDeliveryBridge.tsx`, 'utf8')
const liveHubGroqSource = readFileSync(`${root}/live-hub/src/llm/groq-fast-lane.ts`, 'utf8')
const actionCueAuthoritySource = readFileSync(`${root}/lib/george/core/verification/action-cue-authority.ts`, 'utf8')
const liveHubStreamSource = readFileSync(`${root}/live-hub/src/stt/deepgram-stream.ts`, 'utf8')

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
  liveReasoningSource.includes('GEORGE is operational intelligence'),
  'LIVE Response mode should preserve GEORGE positioning as operational intelligence'
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
  liveHubGroqSource.includes('violatesResponseOutcomeContract'),
  'LIVE hub Groq response mode should have deterministic outcome guard'
)
assert(
  liveHubGroqSource.includes('GEORGE is operational intelligence'),
  'LIVE hub response repair should preserve GEORGE operational intelligence doctrine'
)
assert(
  liveHubGroqSource.includes('repaired: Boolean(rawCue && cue && cue !== rawCue)'),
  'LIVE hub Groq guard should report repaired response candidates'
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

console.log('GEORGE LIVE runtime smoke passed')
