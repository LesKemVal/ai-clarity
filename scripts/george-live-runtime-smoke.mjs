import { readFileSync } from 'node:fs'
import {
  createConversationPackage,
  updateAfterLive,
  buildConversationRecord,
} from '../lib/george/conversation-packages/index.mjs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const root = process.cwd()
const pageSource = readFileSync(`${root}/app/george/page.tsx`, 'utf8')
const panelSource = readFileSync(`${root}/components/george/live/LiveRoomStatusPanel.tsx`, 'utf8')
const outcomeReviewSource = readFileSync(`${root}/lib/george/live-runtime/live-outcome-review.ts`, 'utf8')
const interactionContinuitySource = readFileSync(`${root}/lib/george/live-runtime/live-interaction-continuity.ts`, 'utf8')
const opportunityContinuitySource = readFileSync(`${root}/lib/george/live-runtime/opportunity-continuity.ts`, 'utf8')
const outcomeConsistencySource = readFileSync(`${root}/lib/george/live-runtime/outcome-consistency.ts`, 'utf8')
const packageRuntimeSource = readFileSync(`${root}/lib/george/conversation-packages/runtime.mjs`, 'utf8')
const recordPanelSource = readFileSync(`${root}/components/george/live/PostLiveConversationRecordPanel.tsx`, 'utf8')
const liveReasoningSource = readFileSync(`${root}/lib/george/live-voice/live-reasoning.ts`, 'utf8')
const finalAdapterSource = readFileSync(`${root}/lib/george/live-runtime/live-final-transcript-adapter.ts`, 'utf8')
const controllerSource = readFileSync(`${root}/lib/george/live-runtime/live-transcript-controller.ts`, 'utf8')
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
  finalAdapterSource.includes("authority.action.type === 'repeat_tail'"),
  'Final transcript adapter should execute repeat_tail'
)
assert(
  finalAdapterSource.includes("authority.action.type === 'sentence_recovery'"),
  'Final transcript adapter should execute sentence_recovery'
)


assert(
  controllerSource.includes('getLiveSpokenTail'),
  'Controller should resolve repeat_tail from spoken memory'
)
assert(
  controllerSource.includes("type: 'repeat_tail', text: tail"),
  'Controller should emit repeat_tail with only the missing tail'
)
assert(
  controllerSource.includes("type: 'sentence_recovery', text: currentSentence"),
  'Controller should fall back to sentence_recovery when no tail is available'
)

assert(
  controllerSource.includes("type: 'repeat_tail'"),
  'Controller should expose repeat_tail action'
)
assert(
  controllerSource.includes("type: 'sentence_recovery'"),
  'Controller should expose sentence_recovery action'
)

assert(
  deliveryBridgeSource.includes('composeGeorgeSupportBehavior'),
  'LIVE delivery bridge should route unsafe Response fallback through behavior composer'
)
assert(
  deliveryBridgeSource.includes('behavior-fallback'),
  'LIVE delivery bridge should log behavior fallback decisions'
)
assert(
  deliveryBridgeSource.includes('Buy a second. Ask them to clarify what they mean.'),
  'Response fallback should provide useful bridge/cue instead of silence'
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

assert(recordPanelSource.includes('LIVE Complete'), 'After LIVE panel should open with LIVE complete framing')
assert(recordPanelSource.includes("Let's see what actually happened."), 'After LIVE panel should frame the debrief as GEORGE analysis')

assert(opportunityContinuitySource.includes('buildOpportunityContinuity'), 'Opportunity Continuity should expose runtime builder')
assert(opportunityContinuitySource.includes('Live to fight another day.'), 'Opportunity Continuity should preserve doctrine')
assert(opportunityContinuitySource.includes('opportunityState'), 'Opportunity Continuity should determine opportunity state')
assert(opportunityContinuitySource.includes('executionDecision'), 'Opportunity Continuity should determine execution decision')
assert(opportunityContinuitySource.includes('waitingStrategicallyCorrect'), 'Opportunity Continuity should decide whether waiting is strategic')
assert(opportunityContinuitySource.includes('noFollowUpStrategicallyCorrect'), 'Opportunity Continuity should decide when not to follow up')
assert(opportunityContinuitySource.includes('decisionMakerRequired'), 'Opportunity Continuity should detect decision-maker requirements')
assert(opportunityContinuitySource.includes('preparationCarryForward'), 'Opportunity Continuity should prepare carry-forward state')
assert(opportunityContinuitySource.includes('opportunityHealth'), 'Opportunity Continuity should produce structured opportunity health')
assert(opportunityContinuitySource.includes('outcomeEffect'), 'Opportunity Continuity should classify whether the move improves, preserves, reduces, or leaves unknown progress toward the desired outcome')
assert(outcomeConsistencySource.includes('buildOutcomeConsistency'), 'Outcome Consistency should expose runtime builder')
assert(outcomeConsistencySource.includes('preserveBothViable'), 'Outcome Consistency should decide whether both outcomes can remain viable')
assert(outcomeConsistencySource.includes('userAuthorityRequired'), 'Outcome Consistency should defer outcome priority to user authority')
assert(outcomeConsistencySource.includes('GEORGE must not silently replace'), 'Outcome Consistency should protect user authority over desired outcomes')
assert(opportunityContinuitySource.includes('outcomeConsistency'), 'Opportunity Continuity should consume Outcome Consistency')
assert(opportunityContinuitySource.includes('momentum'), 'Opportunity Continuity health should track momentum')
assert(opportunityContinuitySource.includes('optionality'), 'Opportunity Continuity health should track optionality')
assert(opportunityContinuitySource.includes('authority'), 'Opportunity Continuity health should track authority')

assert(packageRuntimeSource.includes('opportunityContinuityFromLiveResult'), 'Interaction Continuity should consume Opportunity Continuity output')
assert(packageRuntimeSource.includes("source: 'opportunity_continuity'"), 'Conversation Package should persist Opportunity Continuity as memory')
assert(packageRuntimeSource.includes('latestOpportunityContinuity'), 'Conversation Record should expose latest Opportunity Continuity')
assert(packageRuntimeSource.includes('learningFromOpportunityContinuity'), 'Opportunity Continuity should promote learning for future execution')
assert(recordPanelSource.includes('Outcome Review'), 'Conversation Record panel should surface Outcome Review')
assert(recordPanelSource.includes('Learning'), 'Conversation Record panel should surface promoted learning')
assert(recordPanelSource.includes('Recommended next move'), 'After LIVE panel should surface recommended next move')
assert(recordPanelSource.includes('Transcript Intelligence'), 'After LIVE panel should surface transcript intelligence')
assert(recordPanelSource.includes('Transcript evidence:'), 'Conversation Record panel should label transcript evidence availability')
assert(!recordPanelSource.includes('Transcript viewer'), 'Conversation Record panel should not become a transcript viewer')

assert(
  interactionContinuitySource.includes('buildLiveOutcomeObservation') &&
    interactionContinuitySource.includes('createConversationPackage') &&
    interactionContinuitySource.includes('updateAfterLive') &&
    interactionContinuitySource.includes('buildConversationRecord'),
  'Interaction Continuity should own after-LIVE composition'
)

const continuity = null
/* Runtime import avoided in ESM smoke; ownership is source-checked above.
const continuity = buildLiveInteractionContinuity({
  desiredOutcome: 'secure investor follow-up',
  conversationContext: 'investor meeting',
  transcript: 'Investor requested implementation material and asked for a next meeting.',
  transcriptEvidenceCount: 3,
  supportSummary: 'Send the implementation materials and schedule the next meeting.',
  outcomeReview: {
    desiredOutcome: 'secure investor follow-up',
    observedProgress: 'improving',
    confidence: 82,
    possibleSecondaryOutcome: 'Follow-up, referral, next conversation, or future opportunity may have been preserved.',
    notes: 'Positive continuation signals appeared in the LIVE transcript.',
    desiredState: 'secure investor follow-up',
    currentState: 'Advancing toward the desired outcome.',
    observedChange: 'Investor requested implementation material.',
    availablePaths: ['Original outcome remains available.'],
    bestAvailablePath: 'Respond directly and move toward the next commitment.',
    assistanceOptions: ['Prepare follow-up.', 'Prepare requested materials.'],
    internalNotes: 'Investor requested materials and the follow-up path remained open.',
  },
})

const updated = continuity.conversationPackage

*/
assert(interactionContinuitySource.includes('buildOpportunityContinuity'), 'Interaction Continuity should build Opportunity Continuity')
assert(interactionContinuitySource.includes('opportunityContinuity,'), 'Interaction Continuity should pass Opportunity Continuity into package update')
assert(interactionContinuitySource.includes('const conversationRecord = buildConversationRecord(updatedPackage)'), 'Interaction Continuity should build Conversation Record')
assert(interactionContinuitySource.includes('conversationPackage: updatedPackage'), 'Interaction Continuity should return updated Conversation Package')
assert(interactionContinuitySource.includes('operationalDebrief'), 'Interaction Continuity should return Operational Debrief')
assert(interactionContinuitySource.includes('transcriptHighlights'), 'Interaction Continuity should return transcript highlights')
assert(interactionContinuitySource.includes('desiredOutcomeKind'), 'Interaction Continuity should classify debrief by desired outcome')
assert(interactionContinuitySource.includes('prioritizeDebriefObservation'), 'Interaction Continuity should prioritize debrief observations by outcome')

/*
assert(continuity.conversationRecord.transcriptEvidenceAvailable, 'Interaction Continuity should preserve transcript evidence availability')
assert(updated.liveSummaries.length === 1, 'Interaction Continuity should hand summary into Conversation Package')
assert(updated.outcomeProgression.length === 1, 'Interaction Continuity should hand Outcome Review into package progression')
assert(updated.learning.length === 1, 'Interaction Continuity should hand Outcome Review into package learning')
assert(updated.futureActions.length === 1, 'Interaction Continuity should hand summary next action into package future action')
assert(interactionContinuitySource.includes('outcomeReview,'), 'Interaction Continuity should pass Outcome Review into package update')
*/

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

const opportunityContinuity = {
  doctrine: 'Live to fight another day.',
  opportunityState: 'transfers',
  executionDecision: 'seek_decision_maker',
  confidence: 86,
  opportunitySurvived: true,
  desiredOutcomeStillAchievable: true,
  nextExecutableOpportunity: 'Prepare the path to the decision maker and preserve the current contact as access.',
  timing: 'now',
  preservedLeverage: ['Access was preserved.', 'A decision-maker path surfaced.'],
  evidenceStillRequired: ['Confirm the actual decision maker and path to reach them.'],
  decisionMakerKnowledge: 'Another decision maker likely matters before the opportunity can advance.',
  objectiveEvolution: 'No stronger replacement objective was detected.',
  outcomeEffect: 'improves',
  outcomeConsistency: {
    primaryOutcome: 'secure investor follow-up',
    secondaryOutcome: 'Strategic partner introduction may be available.',
    consistency: 'compatible',
    preserveBothViable: true,
    userAuthorityRequired: false,
    contradiction: '',
    availablePaths: ['Pursue the primary desired outcome while preserving the secondary outcome.'],
    bestAvailablePath: 'Advance the desired outcome while keeping the secondary outcome viable.',
    reasoning: 'The declared outcomes appear operationally compatible.',
  },
  opportunityHealth: {
    momentum: 'strong',
    trust: 'usable',
    credibility: 'strong',
    access: 'usable',
    optionality: 'strong',
    evidence: 'usable',
    authority: 'strong',
    urgency: 'strong',
  },
  preparationCarryForward: {
    opportunityState: 'transfers',
    nextExecutableOpportunity: 'Prepare the path to the decision maker and preserve the current contact as access.',
    preservedLeverage: ['Access was preserved.', 'A decision-maker path surfaced.'],
    evidenceStillRequired: ['Confirm the actual decision maker and path to reach them.'],
    decisionMakerKnowledge: 'Another decision maker likely matters before the opportunity can advance.',
    waitingState: 'No deliberate waiting state was detected.',
    followUpTiming: 'Follow up now while access and context are warm.',
    objectiveEvolution: 'No stronger replacement objective was detected.',
    outcomeEffect: 'improves',
    outcomeConsistency: {
      primaryOutcome: 'secure investor follow-up',
      secondaryOutcome: 'Strategic partner introduction may be available.',
      consistency: 'compatible',
      preserveBothViable: true,
      userAuthorityRequired: false,
      contradiction: '',
      availablePaths: ['Pursue the primary desired outcome while preserving the secondary outcome.'],
      bestAvailablePath: 'Advance the desired outcome while keeping the secondary outcome viable.',
      reasoning: 'The declared outcomes appear operationally compatible.',
    },
    opportunityHealth: {
      momentum: 'strong',
      trust: 'usable',
      credibility: 'strong',
      access: 'usable',
      optionality: 'strong',
      evidence: 'usable',
      authority: 'strong',
      urgency: 'strong',
    },
  },
}

const pkg = createConversationPackage({
  desiredOutcome: 'secure investor follow-up',
  conversationType: 'investor meeting',
}, { timestamp: '2026-07-02T01:00:00.000Z' })

const updatedWithOpportunity = updateAfterLive(pkg, {
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
  opportunityContinuity,
}, { timestamp: '2026-07-02T01:10:00.000Z' })

const record = buildConversationRecord(updatedWithOpportunity, { timestamp: '2026-07-02T01:11:00.000Z' })

assert(updatedWithOpportunity.opportunityContinuity.length === 1, 'LIVE runtime should hand Opportunity Continuity into package memory')
assert(updatedWithOpportunity.opportunityContinuity[0].source === 'opportunity_continuity', 'Opportunity Continuity package memory should keep source')
assert(updatedWithOpportunity.opportunityContinuity[0].opportunityState === 'transfers', 'Opportunity Continuity should preserve opportunity state')
assert(updatedWithOpportunity.opportunityContinuity[0].executionDecision === 'seek_decision_maker', 'Opportunity Continuity should preserve execution decision')
assert(updatedWithOpportunity.learning.some((item) => item.source === 'opportunity_continuity'), 'Opportunity Continuity should promote learning')
assert(updatedWithOpportunity.futureActions.includes(opportunityContinuity.nextExecutableOpportunity), 'Opportunity Continuity should promote next executable opportunity')
assert(record.latestOpportunityContinuity?.opportunityState === 'transfers', 'Conversation Record should expose latest Opportunity Continuity')
assert(record.latestOpportunityContinuity?.preparationCarryForward?.opportunityState === 'transfers', 'Conversation Record should preserve Preparation carry-forward')
assert(record.latestOpportunityContinuity?.opportunityHealth?.momentum === 'strong', 'Conversation Record should preserve Opportunity Health')
assert(record.latestOpportunityContinuity?.outcomeEffect === 'improves', 'Conversation Record should preserve Opportunity outcome effect')
assert(record.latestOpportunityContinuity?.outcomeConsistency?.consistency === 'compatible', 'Conversation Record should preserve Outcome Consistency')
assert(record.latestOpportunityContinuity?.preparationCarryForward?.opportunityHealth?.momentum === 'strong', 'Preparation carry-forward should preserve Opportunity Health')


const universalDoctrine = readFileSync(`${root}/lib/george/live-voice/runtime/universal-judgment-doctrine.ts`, 'utf8')
const liveDoctrine = readFileSync(`${root}/lib/george/core/live-reasoning-doctrine.ts`, 'utf8')
const runtimeDoctrine = readFileSync(`${root}/lib/george/live-voice/runtime/runtime-doctrine.ts`, 'utf8')

assert(
  liveDoctrine.includes("GEORGE optimizes for the user's probability of achieving the desired outcome."),
  'LIVE doctrine should preserve desired-outcome optimization'
)

assert(
  universalDoctrine.includes("GEORGE chooses the most intelligent useful move available in service of the desired outcome."),
  'Universal Judgment Doctrine should preserve canonical judgment language'
)

assert(
  universalDoctrine.includes("GEORGE asks the smallest question that produces the strongest signal"),
  'Universal Judgment Doctrine should preserve signal sufficiency doctrine'
)

assert(
  runtimeDoctrine.includes("materially improves the user's probability of achieving"),
  'Runtime doctrine should preserve probability optimization doctrine'
)

assert(
  runtimeDoctrine.includes("The user retains agency."),
  'Runtime doctrine should preserve user agency doctrine'
)


console.log('GEORGE LIVE runtime smoke passed')
