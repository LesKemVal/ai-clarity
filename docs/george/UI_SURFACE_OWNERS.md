# GEORGE UI Surface Owners

> Generated from the current working tree. Re-run `inspect_george_ui_owners.py` after route ownership changes.

## Repository state

- Branch: `live-hub-runtime`
- HEAD: `d2e28a4 Consolidate browser-scoped session lifecycle`

```text
 M .gitignore
 M app/api/george/live/signal-question/route.ts
 M app/george/live-entry/LiveEntryClient.tsx
 M app/george/page.tsx
 M app/help/page.tsx
 M app/page.tsx
 M app/runtime/page.tsx
 M app/share/page.tsx
 M components/Sidebar.tsx
 M components/george/LiveChooser.tsx
 M components/george/live/LiveRoomStatusPanel.tsx
 M components/home/HomeHeroSequence.tsx
 M components/layout/PageShell.tsx
 M docs/george/NEXT_THREAD_HANDOFF.md
 M docs/george/OPERATIONAL_PROFILE.md
 M docs/george/PRODUCTION_TRACKER.md
 M docs/george/RUNTIME_ARCHITECTURE.md
 M lib/george/capabilities/live-support-panels.ts
 M lib/george/chat/live-context.ts
 M lib/george/chat/orchestration-map.ts
 M lib/george/chat/runtime-invariants.ts
 M lib/george/core/verification/action-cue-authority.ts
 M lib/george/live-runtime/live-action-authority.ts
 M lib/george/live-runtime/live-awareness-reconciliation.ts
 M lib/george/live-runtime/live-intent-runtime.ts
 M lib/george/live-runtime/live-overlap-recovery.ts
 M lib/george/live-runtime/live-room-priorities.ts
 M lib/george/live-runtime/live-room-state.ts
 M lib/george/live-runtime/live-runtime-context.ts
 M lib/george/live-runtime/prep-runtime.ts
 M lib/george/live-runtime/support-behavior-composer.ts
 M lib/george/live-voice/live-reasoning.ts
 M lib/george/live-voice/runtime/room-analyzer.ts
 M lib/george/runtime/trajectory-engine.ts
 M scripts/george-live-entry-smoke.mjs
?? components/icons/
```

## Route `/`

- Entry: `app/page.tsx`
- Reachable source files inspected: 3

### Reachable files

- `app/page.tsx`
- `components/home/HomeHeroSequence.tsx`
- `lib/george/session/store.ts`

### Ownership evidence

#### GEORGE label

- `app/page.tsx:76` — `body: 'GEORGE is designed to extend into discreet wearables, audio glasses, readable glasses, live briefing systems, and enterprise communication tools.',`
- `app/page.tsx:100` — `GEORGE is real-time operational intelligence designed to help`
- `app/page.tsx:105` — `GEORGE supports you before, during, and after important`
- `app/page.tsx:136` — `Typical AI tools summarize meetings after they end. GEORGE`
- `app/page.tsx:212` — `Useful communication guidance cannot be generic. GEORGE adapts`
- `app/page.tsx:283` — `GEORGE is optimized for fast support because guidance that`
- `components/home/HomeHeroSequence.tsx:4` — `import { requestFreshNormalBrowserSession } from '@/lib/george/session/store'`
- `components/home/HomeHeroSequence.tsx:18` — `'GEORGE recognizes useful signals and provides discreet guidance while the conversation is still happening and the outcome can still change.',`
- `components/home/HomeHeroSequence.tsx:25` — `'GEORGE presents the summary first, explains what mattered, and keeps the full transcript immediately available as evidence whenever you request it.',`
- `components/home/HomeHeroSequence.tsx:160` — `window.location.href = '/george'`
- `components/home/HomeHeroSequence.tsx:165` — `window.location.href = '/george/live-entry?source=start'`
- `components/home/HomeHeroSequence.tsx:204` — `aria-label="Open GEORGE"`
- `components/home/HomeHeroSequence.tsx:216` — `GEORGE`
- `components/home/HomeHeroSequence.tsx:285` — `Ask GEORGE{' '}`
- `components/home/HomeHeroSequence.tsx:317` — `(How to use GEORGE)`
- `lib/george/session/store.ts:87` — `const response = await fetch('/api/george/sessions', {`
- `lib/george/session/store.ts:144` — `fetch('/api/george/sessions', {`
- `lib/george/session/store.ts:158` — `fetch(\`/api/george/sessions?id=${encodeURIComponent(id)}\`, {`

#### LIVE SUPPORT hero

- `components/home/HomeHeroSequence.tsx:15` — `title: ['LIVE SUPPORT'],`
- `components/home/HomeHeroSequence.tsx:299` — `LIVE Support{' '}`

#### flip behavior

- `components/home/HomeHeroSequence.tsx:220` — `className={\`relative grid max-w-full [transform-style:preserve-3d] ${`
- `components/home/HomeHeroSequence.tsx:232` — `<div className="col-start-1 row-start-1 w-full max-w-[calc(100vw-48px)] rounded-[18px] border border-[#7EA1FF]/35 bg-[#4E7CFF] px-3.5 py-3 shadow-[0_22px_64px_rgba(20,61,168,0.34)] [backface-visibility:hidden] sm:px-4 sm:py-3.5">`
- `components/home/HomeHeroSequence.tsx:236` — `<div className="col-start-1 row-start-1 w-full max-w-[calc(100vw-48px)] rounded-[18px] border border-[#7EA1FF]/35 bg-[#4E7CFF] px-3.5 py-3 shadow-[0_22px_64px_rgba(20,61,168,0.34)] [backface-visibility:hidden] [transform:rotateX(180deg)] sm:px-4 sm:py-3.5">`

#### blue surface

- `app/page.tsx:223` — `className="rounded-[24px] border border-[#4E7CFF]/24 bg-[#4E7CFF]/[0.07] p-6"`
- `components/home/HomeHeroSequence.tsx:232` — `<div className="col-start-1 row-start-1 w-full max-w-[calc(100vw-48px)] rounded-[18px] border border-[#7EA1FF]/35 bg-[#4E7CFF] px-3.5 py-3 shadow-[0_22px_64px_rgba(20,61,168,0.34)] [backface-visibility:hidden] sm:px-4 sm:py-3.5">`
- `components/home/HomeHeroSequence.tsx:236` — `<div className="col-start-1 row-start-1 w-full max-w-[calc(100vw-48px)] rounded-[18px] border border-[#7EA1FF]/35 bg-[#4E7CFF] px-3.5 py-3 shadow-[0_22px_64px_rgba(20,61,168,0.34)] [backface-visibility:hidden] [transform:rotateX(180deg)] sm:px-4 sm:py-3.5">`
- `components/home/HomeHeroSequence.tsx:296` — `className="group flex h-[56px] w-full items-center justify-between rounded-[17px] border border-[#7EA1FF]/35 bg-[#4E7CFF] px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(20,61,168,0.22)] transition hover:-translate-y-[1px] hover:bg-[#5B86FF]"`

#### homepage actions

- `app/page.tsx:12` — `body: 'Tailored language that helps you finish your thought clearly.',`
- `app/page.tsx:100` — `GEORGE is real-time operational intelligence designed to help`
- `app/page.tsx:106` — `meetings—helping you prepare for the moment, recognize what is`
- `app/page.tsx:130` — `Help while the outcome can still change.`
- `app/page.tsx:143` — `cue. Sometimes you need help finishing a thought, answering a`
- `app/page.tsx:278` — `Late help is not help.`
- `components/home/HomeHeroSequence.tsx:15` — `title: ['LIVE SUPPORT'],`
- `components/home/HomeHeroSequence.tsx:285` — `Ask GEORGE{' '}`
- `components/home/HomeHeroSequence.tsx:299` — `LIVE Support{' '}`
- `components/home/HomeHeroSequence.tsx:310` — `window.location.href = '/help'`
- `components/home/HomeHeroSequence.tsx:315` — `Help{' '}`

### Source proof

- `app/page.tsx` — `adff6b23810c4c02a0643786d832b19db78ce6d39e52197e0c293a3ee41a0cbd`
- `components/home/HomeHeroSequence.tsx` — `4d94fd62a5e27eac0bc3c5b1f751c47fb0860502a18af9b482c3c9096f9528b0`
- `lib/george/session/store.ts` — `aafdd74108d5df675596cdcde11423778bfa72d35a0591a74e8ef11b0e0d2018`

## Route `/george`

- Entry: `app/george/page.tsx`
- Reachable source files inspected: 130

### Reachable files

- `app/george/page.tsx`
- `lib/george/runtime/conversation-strategy.ts`
- `lib/george/live-runtime/governed-live-cue.ts`
- `lib/george/live-metrics/runtime-metrics.ts`
- `lib/george/live-runtime/live-tts-metrics.ts`
- `lib/george/live-voice/spoken-text.ts`
- `lib/george/live-voice/runtime/response-shaper.ts`
- `lib/george/live-host/audio-playback.ts`
- `lib/george/live-delivery/voice-speed-policy.ts`
- `lib/george/live-runtime/speech-queue.ts`
- `lib/george/ui/operational-motion.ts`
- `components/Sidebar.tsx`
- `components/icons/ShareIcon.tsx`
- `components/george/ContinuityCapsule.tsx`
- `components/george/settings/MemoryContinuityPanel.tsx`
- `components/george/TypingPrescriptionSurface.tsx`
- `components/george/DesktopOperationalSurface.tsx`
- `components/george/checkout/GeorgePaymentElement.tsx`
- `components/george/HeadsetOperatorIcon.tsx`
- `components/george/LiveChooser.tsx`
- `lib/george/live-runtime/live-guidance.ts`
- `lib/george/session/store.ts`
- `lib/george/session-authority.ts`
- `lib/george/live-runtime/session-controller.ts`
- `lib/george/live-runtime/live-outcome-observation.ts`
- `lib/george/live-host/draft-restoration.ts`
- `lib/george/training/training-helpers.ts`
- `lib/george/prompts/suggested-prompts.ts`
- `lib/george/operator/load-runtime-overlay.ts`
- `lib/george/live-runtime/prep-runtime.ts`
- `lib/george/live-runtime/live-entry-briefing.ts`
- `lib/george/core/build-interpretation.ts`
- `lib/george/live-runtime/outcome-reassessment.ts`
- `lib/george/live-runtime/live-fast-path.ts`
- `lib/george/live-runtime/live-support-preferences.ts`
- `lib/george/live-runtime/live-runtime-context.ts`
- `lib/george/live-runtime/live-outcome-review.ts`
- `lib/george/live-runtime/live-interaction-continuity.ts`
- `components/george/live/PostLiveConversationRecordPanel.tsx`
- `components/george/live/LiveFooterControls.tsx`
- `components/george/live/LiveRoomStatusPanel.tsx`
- `components/george/live/LiveHubShadowBridge.tsx`
- `components/george/live/LiveHubVisualCueBridge.tsx`
- `hooks/useLiveAudioRuntime.ts`
- `hooks/useLiveReflexListener.ts`
- `lib/george/live-runtime/transcript-routing.ts`
- `lib/george/live-runtime/live-final-transcript-adapter.ts`
- `lib/george/live-runtime/live-transcript-controller.ts`
- `lib/george/live-runtime/spoken-memory.ts`
- `lib/george/live-runtime/live-awareness-buffer.ts`
- `lib/george/live-runtime/live-awareness-pipeline.ts`
- `lib/george/identity/live-self-description.ts`
- `lib/george/live-runtime/live-intent-runtime.ts`
- `lib/george/runtime/pre-provider-send-resolution.ts`
- `lib/george/runtime/training-runtime.ts`
- `lib/george/live-runtime/live-friction.ts`
- `lib/george/runtime/operational-resource-monitor.ts`
- `lib/george/chat/current-runtime-policy.ts`
- `lib/george/live-voice/runtime/active-outcome.ts`
- `lib/george/runtime/judgment-surface.ts`
- `lib/george/runtime/trajectory-engine.ts`
- `lib/george/runtime/conversation-move-library.ts`
- `lib/george/live-metrics/latency-contract.mjs`
- `lib/george/live-voice/runtime/conversation-signals.ts`
- `lib/george/live-delivery/types.ts`
- `lib/george/runtime/runtime-user-controls.ts`
- `lib/george/operator/runtime-overlays.ts`
- `lib/george/live-runtime/live-runtime-authority.ts`
- `lib/george/live-runtime/support-style.ts`
- `lib/george/live-voice/runtime/speaker-intent.ts`
- `lib/george/live-voice/runtime/room-analyzer.ts`
- `lib/george/live-voice/runtime/objective-engine.ts`
- `lib/george/live-voice/runtime/trajectory-engine.ts`
- `lib/george/live-voice/runtime/outcome-governor.ts`
- `lib/george/core/interpretation.ts`
- `lib/george/runtime/signal-sufficiency.ts`
- `lib/george/runtime/signal-ranking.ts`
- `lib/george/runtime/runtime-signal-arbitrator.ts`
- `lib/george/core/operational-understanding.ts`
- `lib/george/runtime/operational-signal-normalizer.ts`
- `lib/george/runtime/operational-signal-interpreter.ts`
- `lib/george/live-runtime/opportunity-continuity.ts`
- `lib/george/live-runtime/opportunity-continuity.mjs`
- `lib/george/conversation-packages/index.mjs`
- `lib/george/learning/runtime.mjs`
- `lib/george/live-hub/feature-flag.ts`
- `lib/george/live-hub/live-runtime-adapter.ts`
- `lib/george/live-hub/types.ts`
- `components/george/live/LiveHubDeliveryBridge.tsx`
- `lib/george/live-voice/audio/live-audio-runtime.ts`
- `lib/george/core/live-execution.ts`
- `lib/george/live-runtime/line-transforms.ts`
- `lib/george/live-runtime/live-awareness-reconciliation.ts`
- `lib/george/live-runtime/live-overlap-recovery.ts`
- `lib/george/runtime/domain-router.ts`
- `lib/george/runtime/operational-judgment.ts`
- `lib/george/chat/presentation-authority.ts`
- `lib/george/behavior/mode.ts`
- `lib/george/live-runtime/pro-live-boundary.ts`
- `lib/george/live-voice/runtime/conversation-target.ts`
- `lib/george/runtime/operational-signals.ts`
- `lib/george/live-runtime/outcome-consistency.ts`
- `lib/george/live-runtime/outcome-consistency.mjs`
- `lib/george/conversation-packages/identity.mjs`
- `lib/george/conversation-packages/manager.mjs`
- `lib/george/conversation-packages/types.mjs`
- `lib/george/conversation-packages/live-entry-package.mjs`
- `lib/george/conversation-packages/runtime.mjs`
- `lib/george/live-hub/websocket-transport.ts`
- `lib/george/live-hub/transport.ts`
- `lib/george/core/verification/action-cue-authority.ts`
- `lib/george/live-delivery/delivery-router.ts`
- `lib/george/live-delivery/delivery-commitment.ts`
- `lib/george/live-runtime/support-behavior-composer.ts`
- `lib/george/live-voice/stt/deepgram-live-client.ts`
- `lib/george/live-runtime/live-action-authority.ts`
- `lib/george/core/live-speaker-intent.ts`
- `lib/george/runtime/adaptive-user-profile.ts`
- `lib/george/runtime/continuity-restoration.ts`
- `lib/george/runtime/intent-state.ts`
- `lib/george/runtime/live-recommendation-governor.ts`
- `lib/george/runtime/outcome-learning.ts`
- `lib/george/runtime/runtime-adapter.ts`
- `lib/george/runtime/context-framing.ts`
- `lib/george/core/verification/evidence-gate.ts`
- `lib/george/core/verification/continuation-replacement.ts`
- `lib/george/live-voice/runtime/runtime-events.ts`
- `lib/george/chat/runtime-signals.ts`
- `lib/george/runtime/runtime-interpretation.ts`
- `lib/george/chat/live-context.ts`

### Ownership evidence

#### BX render

- `app/george/page.tsx:655` — `title: 'GEORGE by BRANESx',`
- `app/george/page.tsx:2042` — `liveSetup.objective ? \`BRANESx: ${liveSetup.objective}\` : null,`
- `app/george/page.tsx:2057` — `const liveBRANESx = String(liveSetup?.objective || '').trim()`
- `app/george/page.tsx:5392` — `@keyframes georgeBxBreathe {`
- `app/george/page.tsx:5651` — `src="/logofav.png"`
- `app/george/page.tsx:5652` — `alt="Bx"`
- `app/george/page.tsx:5653` — `className="h-8 w-8 rounded-[0.8rem] object-contain opacity-95 [animation:georgeBxBreathe_10s_ease-in-out_infinite] group-hover:brightness-110"`
- `app/george/page.tsx:5947` — `src="/logofav.png"`
- `app/george/page.tsx:5951` — `<div className="sr-only">BRANESx</div>`
- `app/george/page.tsx:6264` — `<div className="relative bx-command-shimmer">`
- `app/george/page.tsx:6394` — `title: 'GEORGE by BRANESx',`
- `lib/george/live-voice/spoken-text.ts:3` — `BRANESx: 'Brains',`
- `components/Sidebar.tsx:419` — `src="/logofav.png"`
- `components/Sidebar.tsx:420` — `alt="BRANESx"`
- `lib/george/core/live-execution.ts:74` — `if (/\b(george|branesx|enterprise|adopt|adoption|deploy|deployment|pilot|roi|business value|productivity|privacy|security|integration|scale|scalability|investment|partnership|licensing|objection|concern|risk|proof|evidence|metrics|outcome|decision)\b/i.test(text)) {`
- `lib/george/core/verification/action-cue-authority.ts:227` — `return /\b(smart|intelligent|brilliant|george|branesx|tier|plan|subscription|product|platform|agent)\b/i.test(text)`

#### sidebar trigger

- `app/george/page.tsx:5453` — `aria-label="Close GEORGE sidebar"`
- `app/george/page.tsx:5647` — `aria-label="Open GEORGE sidebar"`
- `components/Sidebar.tsx:414` — `aria-label="Close GEORGE sidebar"`

#### sidecar

- No match found.

#### first-message state

- `app/george/page.tsx:1202` — `const lastMessage = existingMessages[existingMessages.length - 1]`
- `app/george/page.tsx:1734` — `if (messages.length === 0) setOperationalResourceMonitor(null)`
- `app/george/page.tsx:1735` — `}, [messages.length])`
- `app/george/page.tsx:1741` — `if (!liveBarMessages.length) return`
- `app/george/page.tsx:1743` — `setLiveBarMessageIndex((prev) => (prev + 1) % liveBarMessages.length)`
- `app/george/page.tsx:1746` — `}, [liveBarMessages.length])`
- `app/george/page.tsx:1749` — `const message = liveBarMessages[liveBarMessageIndex % liveBarMessages.length] || ''`
- `app/george/page.tsx:1973` — `existingNormalMessages.length > 0 &&`
- `app/george/page.tsx:2594` — `if (!messages.length) return`
- `app/george/page.tsx:2603` — `const lastIndex = messages.length - 1`
- `app/george/page.tsx:2895` — `if (normalMessages.length > 0 && hasUserMessage) {`
- `app/george/page.tsx:3095` — `if (!draftMessages.length) return false`
- `app/george/page.tsx:3545` — `if (!Array.isArray(messages) || messages.length === 0) return`
- `app/george/page.tsx:3571` — `if (!messages.length) return`
- `app/george/page.tsx:3581` — `if (!messages.length) return`
- `app/george/page.tsx:4706` — `isFirstSession: updatedMessages.length <= 2,`
- `app/george/page.tsx:5110` — `const normalConversationStarted = messages.some((message) => {`
- `app/george/page.tsx:5115` — `const hasVisibleThread = normalConversationStarted`
- `app/george/page.tsx:5143` — `(normalConversationStarted && !isPreLiveSignalAcquisition)`
- `app/george/page.tsx:5147` — `!normalConversationStarted`
- `app/george/page.tsx:5150` — `const showGeorgeHeroTagline = !normalConversationStarted`
- `app/george/page.tsx:5151` — `const showGeorgeSupportCopy = !normalConversationStarted`
- `app/george/page.tsx:5152` — `const hasUserMessageForSurface = normalConversationStarted`
- `app/george/page.tsx:5155` — `!normalConversationStarted`
- `app/george/page.tsx:6121` — `}) : (normalConversationStarted ? messages : []))`
- `app/george/page.tsx:6635` — `{showLiveEntrySequence && (forceLive || liveMode) && (forceLive || messages.length === 0) && (`
- `lib/george/live-runtime/session-controller.ts:90` — `candidate.messages.length === 0`
- `lib/george/live-host/draft-restoration.ts:37` — `if (!draft || !Array.isArray(draft.messages) || draft.messages.length === 0) {`
- `lib/george/runtime/operational-judgment.ts:186` — `evidence.hasConversationOutcome`
- `lib/george/runtime/intent-state.ts:92` — `(input.messages.length > 10 ? 0.25 : 0)`
- `lib/george/runtime/live-recommendation-governor.ts:17` — `hasConversationOutcome: boolean`
- `lib/george/runtime/live-recommendation-governor.ts:99` — `const hasConversationOutcome =`
- `lib/george/runtime/live-recommendation-governor.ts:108` — `hasConversationOutcome,`

#### arrow control

- `app/george/page.tsx:1369` — `// if silence for 1.2s → other person stopped`
- `app/george/page.tsx:1374` — `// if both talking → interruption`
- `app/george/page.tsx:3307` — `const handleArrowScroll = (event: globalThis.KeyboardEvent) => {`
- `app/george/page.tsx:3309` — `if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return`
- `app/george/page.tsx:3323` — `top: event.key === 'ArrowDown' ? 120 : -120,`
- `app/george/page.tsx:3328` — `window.addEventListener('keydown', handleArrowScroll)`
- `app/george/page.tsx:3329` — `return () => window.removeEventListener('keydown', handleArrowScroll)`
- `app/george/page.tsx:3675` — `if (typing && event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return`
- `app/george/page.tsx:3682` — `if (event.key === 'ArrowDown') {`
- `app/george/page.tsx:3691` — `if (event.key === 'ArrowUp') {`
- `app/george/page.tsx:4889` — `if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {`
- `app/george/page.tsx:4895` — `(event.key === 'ArrowUp' && atTop) ||`
- `app/george/page.tsx:4896` — `(event.key === 'ArrowDown' && atBottom)`
- `app/george/page.tsx:4901` — `top: event.key === 'ArrowDown' ? 120 : -120,`
- `app/george/page.tsx:5912` — `if (e.key === 'ArrowDown') {`
- `app/george/page.tsx:5917` — `if (e.key === 'ArrowUp') {`
- `app/george/page.tsx:6687` — `Continue →`
- `lib/george/runtime/conversation-strategy.ts:112` — `purpose = 'Narrow the issue before the user commits to an answer or concession.'`
- `lib/george/live-voice/runtime/response-shaper.ts:420` — `return 'Let’s narrow this to the next real issue.'`
- `lib/george/core/build-interpretation.ts:137` — `shouldNarrow: !signalSufficiency.sufficient,`
- `lib/george/runtime/conversation-move-library.ts:107` — `purpose: 'Narrow the operative issue before the user answers, defends, commits, or concedes.',`
- `lib/george/runtime/runtime-signal-arbitrator.ts:20` — `shouldNarrow?: boolean`
- `lib/george/runtime/runtime-signal-arbitrator.ts:52` — `: input.shouldNarrow`
- `lib/george/runtime/operational-signal-interpreter.ts:18` — `shouldNarrow:`
- `lib/george/runtime/domain-router.ts:121` — `- If utilization is the issue → focus on paydown timing and balance strategy`
- `lib/george/runtime/domain-router.ts:122` — `- If derogatories → focus on removal, not score tricks`
- `lib/george/runtime/domain-router.ts:123` — `- If thin file → tradelines may be relevant`
- `lib/george/runtime/domain-router.ts:124` — `- If tradelines mentioned → evaluate if they actually help or are a distraction`
- `lib/george/runtime/operational-judgment.ts:288` — `rationale.push('outcome evidence: narrow toward action')`
- `lib/george/behavior/mode.ts:59` — `- Narrow quickly.`
- `lib/george/runtime/intent-state.ts:18` — `narrowingReadiness: number`
- `lib/george/runtime/intent-state.ts:83` — `const narrowingReadiness = clamp01(`
- `lib/george/runtime/intent-state.ts:107` — `narrowingReadiness,`
- `lib/george/runtime/outcome-learning.ts:109` — `narrow toward action.`
- `lib/george/runtime/runtime-adapter.ts:5` — `shouldNarrow: boolean`
- `lib/george/runtime/runtime-adapter.ts:30` — `interpretation.narrowingPressure >= 0.75`
- `lib/george/runtime/runtime-adapter.ts:32` — `const shouldNarrow =`
- `lib/george/runtime/runtime-adapter.ts:33` — `interpretation.narrowingPressure >= 0.6 &&`
- `lib/george/runtime/runtime-adapter.ts:44` — `: shouldNarrow`
- `lib/george/runtime/runtime-adapter.ts:51` — `: shouldNarrow || continuitySensitive || interpretation.emotionalWeight >= 0.42`
- … 10 additional matches omitted.

### Source proof

- `app/george/page.tsx` — `105f9d4411448362908508cce26c650e49175bd48f7ad60120379d73ac9d36b7`
- `lib/george/runtime/conversation-strategy.ts` — `27e954354901d24568e0a0ddddc88adcdbbfafd0c6d60a88cb0b7ddccf4f4050`
- `lib/george/live-runtime/governed-live-cue.ts` — `100b36176a75d3dbc70977b1ce0ed3026707a1580bb74a94020231016286343c`
- `lib/george/live-metrics/runtime-metrics.ts` — `56206b68d96f2abe9274879c1022b9178d0cb077ed0103bf6b4a5ba8b3b83f07`
- `lib/george/live-runtime/live-tts-metrics.ts` — `488619bc82edad145abf07e1d55b27ee98427de4e68b343117a98dcf001f7684`
- `lib/george/live-voice/spoken-text.ts` — `0988e460281df08f0bf8a9b1c38462bd5eacf08d11aa3fc61c5ea4c9fb6f91eb`
- `lib/george/live-voice/runtime/response-shaper.ts` — `eb4ca37335f575e1d9fec7352a9161aacc13d14131da0f0f450bc734048a0e4d`
- `lib/george/live-host/audio-playback.ts` — `863372469f5285abeffe0dd84db617dabd6aeeb016e2f1098159019fed760a76`
- `lib/george/live-delivery/voice-speed-policy.ts` — `a03ed1e3fbb0a34519e132dd7f0abb5af3051ac25b9ca5e5a27e1434f845cf45`
- `lib/george/live-runtime/speech-queue.ts` — `79d77bbeaf6e7f648b3fa524f069f91ed39b6ec2ac9c2d5ea847de16ed5245a4`
- `lib/george/ui/operational-motion.ts` — `dd8bbd286a2dd11a9979bfc64254a60763880abd4f7014cea0b8788faa411c29`
- `components/Sidebar.tsx` — `a8291c51b9b2cd3b286cd25cdf23eb06f0e956362cf7be7126820f8eb07c9c44`
- `components/icons/ShareIcon.tsx` — `86c663e14f02be4040ffad6ae9d131b7eb67de8b2325e322aa4b6ab49e4f6931`
- `components/george/ContinuityCapsule.tsx` — `f78372e757b1188cf149596b29bc01381c7ad83b8c5d314636567520cc1b7d88`
- `components/george/settings/MemoryContinuityPanel.tsx` — `426bd7bb16a85f84a3f9b48aa87fabb9684273251ceee2cf5bfb09149bbc8523`
- `components/george/TypingPrescriptionSurface.tsx` — `95137819bb3fe50424be193eb9fe903a81bc9df9f817ddfc592a4c99348403da`
- `components/george/DesktopOperationalSurface.tsx` — `a2c5d7eeccf8f905766e7f9919483cfec419b24592163593a59d13c35b24d514`
- `components/george/checkout/GeorgePaymentElement.tsx` — `9092b1348f4ee2b73504942f303099b1b0082796fbff5f8f0560409e5cea6121`
- `components/george/HeadsetOperatorIcon.tsx` — `ad06bd6159fc767dbe1f396b7bd9bb1ec056823ec2f302d8e639547da782bfe0`
- `components/george/LiveChooser.tsx` — `d7477059b4ed69d167a949e0411a4a20b78bc3977e03281b7e743e2cdea91692`
- `lib/george/live-runtime/live-guidance.ts` — `7d4a7f073e785050808078922877c3ed45d6280278d6e4c8fa279e374189be70`
- `lib/george/session/store.ts` — `aafdd74108d5df675596cdcde11423778bfa72d35a0591a74e8ef11b0e0d2018`
- `lib/george/session-authority.ts` — `6b403e7b423debc1c3ef1edaa0c7a221e87379350dff789c4d436ff36b3db73b`
- `lib/george/live-runtime/session-controller.ts` — `2c4f7eb0dd3c47e834b5b89d59274e7e2aca1bcec06a70e50e558f61abbccf15`
- `lib/george/live-runtime/live-outcome-observation.ts` — `3a9b3462ccf5b2a701ff83e4493e77100be16d8381e84c43873d72cba39b07e4`
- `lib/george/live-host/draft-restoration.ts` — `42c3c9be1521f3f87cf6444cecd1db77e8ac2cfcb23af70f236e0018e460ae9d`
- `lib/george/training/training-helpers.ts` — `a9e5bad758276ed22a06014080fe9ca54c651ee6de7954a75e575e7e5977c85a`
- `lib/george/prompts/suggested-prompts.ts` — `bdf23a1995137ad4166fa9d090e3049dcd2aaf2193df0641e93921d06e3b38ae`
- `lib/george/operator/load-runtime-overlay.ts` — `992aa6c9bedb85ec83679700062e9faf4965daa3f9fc4a2f6fa46748a3e46683`
- `lib/george/live-runtime/prep-runtime.ts` — `6f4cfd02f69b75bdc5a80d3b9019ec02659bda98f402684480ac5c82f7df03cc`
- `lib/george/live-runtime/live-entry-briefing.ts` — `ac49049f298b76b6d2b78817e6c754965bee4fcf6fbb7a2182ed18b58b38b9a9`
- `lib/george/core/build-interpretation.ts` — `65d26254da2552abbcb4dd699db088a0ea35ae1d48ddcbd1f03f0cf7cac14113`
- `lib/george/live-runtime/outcome-reassessment.ts` — `7b90682bc3a9ca5c1d365cb15a15343c84c6538597bdb9a9c41f062b92f0697b`
- `lib/george/live-runtime/live-fast-path.ts` — `287400316fcf40cf3fa48af2408b2e802e1d1a3080d2cf5c4899e244b5696f6c`
- `lib/george/live-runtime/live-support-preferences.ts` — `ad1d01375ef1d2df6f789a2b4b76f62a7a768adc17e5d986162f85dd1ac3d5cd`
- `lib/george/live-runtime/live-runtime-context.ts` — `04e3055cc21b11bc917a62aeffe5b77418b41f21dc85f3323b4e5c5ab7764c6f`
- `lib/george/live-runtime/live-outcome-review.ts` — `5f892d34b17f98f186a27ea6425a50c8df38a796203be7786d567e66d4592408`
- `lib/george/live-runtime/live-interaction-continuity.ts` — `45f0bbea4b5b92b3bed9f133d75a0c19d4b452572b34f196377d23958ff78cb7`
- `components/george/live/PostLiveConversationRecordPanel.tsx` — `afa32537765091ddb71fcd658d70a1dc00f7003a41274ce38006bcce9f914022`
- `components/george/live/LiveFooterControls.tsx` — `d6211c21863b201fd84744f7ace84b01c9569a54f96fbf5ea9a66846885b2162`
- `components/george/live/LiveRoomStatusPanel.tsx` — `0b744fe2c63884d1dfb8da75e4df3a43d74586fbbc02696f0df78ea4bd1d55cd`
- `components/george/live/LiveHubShadowBridge.tsx` — `2fac30608a16d3b9c6b35b237612e36168f6ebec66403039c62d30e04b37ddda`
- `components/george/live/LiveHubVisualCueBridge.tsx` — `fa81f9ea27b60f96da61ff779fa61afd9f3317f96e2dfb16a9a54aeed9e266da`
- `hooks/useLiveAudioRuntime.ts` — `e6db2708355aede94c0f258fd5aad90e465a88659b3de549dd5e062cbbf1f3bf`
- `hooks/useLiveReflexListener.ts` — `970604e4fbbb18286e2a23b01ca072f1c3cf5a6d87f691456caefedd1c5b495e`
- `lib/george/live-runtime/transcript-routing.ts` — `70b7d3524a7d613da86592dfcb9ca9745698b9eafadc2da29894d834f9dcf1fd`
- `lib/george/live-runtime/live-final-transcript-adapter.ts` — `5a0f4070c5d69e49bc7cd042ac4df4a1ed20d08493e62cdac0bec6137dd3e3ff`
- `lib/george/live-runtime/live-transcript-controller.ts` — `d458adbab8193162d4cfb9aeac0990f7216f09413fb9c0d23a2c4278a0885023`
- `lib/george/live-runtime/spoken-memory.ts` — `4257423ff039fadb63d9854053b21dbc579c17b19db12a3bc02f71b53d08709c`
- `lib/george/live-runtime/live-awareness-buffer.ts` — `a85832812abc0386e89221b4ad3ac1d7eab4c95475d17d5cea5f0ae96f3c4e54`
- `lib/george/live-runtime/live-awareness-pipeline.ts` — `dcff1b808587e682d5fa5545c8d9fef856a02da59d68e12235da376e7c697da8`
- `lib/george/identity/live-self-description.ts` — `d7ba6957e5dff700d9e919fa7952736dd15e81e29ab09d177e299eb68add2cd7`
- `lib/george/live-runtime/live-intent-runtime.ts` — `842767365ef25a5f243d3762a5c7442cb1e46d8cd72000e4101ee2a270ab0bcb`
- `lib/george/runtime/pre-provider-send-resolution.ts` — `ee0470520641aa07c9cf39b6582720c1c4bef09c78632bf3a36cd95a4b930eb3`
- `lib/george/runtime/training-runtime.ts` — `cd60cfc39fbceca409fb0df103fb7465562e96200a5c0bdf8052bddfe8163f18`
- `lib/george/live-runtime/live-friction.ts` — `a626db4138eb5001774bda3897edc86fd67ebb90b99260872547c401d57ae8d5`
- `lib/george/runtime/operational-resource-monitor.ts` — `cc6146e9d9799c7d3a97c929afa082159c69d7c86528045b279bef69ae225295`
- `lib/george/chat/current-runtime-policy.ts` — `45ab6b67ab2bc50899d609090a6742b24619ff045e9a4d47e62168bfd0fc5e2a`
- `lib/george/live-voice/runtime/active-outcome.ts` — `d1ad2bce7b1b11c41a9468b3a8145e53ba68c2c1effdd9a6948ab4af64fa1df9`
- `lib/george/runtime/judgment-surface.ts` — `80198cb1a7e09b43cd0c8c5ff7b2081258d2c8b69459b137c18f967b67dc3319`
- `lib/george/runtime/trajectory-engine.ts` — `36f727129eef2ef7321d63bd308a6a82d68798aad9c924b7740f82a9915f356b`
- `lib/george/runtime/conversation-move-library.ts` — `d6915a1c93e8204bdcbcc402cbe04400dd491c45034f5fbfbb6190f3c4c983d2`
- `lib/george/live-metrics/latency-contract.mjs` — `6a043f90645a10234e037dc484b460332ff3319550a74d4f3eb7c0af1036a272`
- `lib/george/live-voice/runtime/conversation-signals.ts` — `20f49b51d1e2aaea798e331fbcf60f35526395039eab7592bbff989ef67ab1e5`
- `lib/george/live-delivery/types.ts` — `adbffb7e664a89050a8647b3ffc572dcfee9e491ec56c5b1d3289281d4dc050b`
- `lib/george/runtime/runtime-user-controls.ts` — `cd8b25a7fc63cf90100b3888fd597ea030b5891d1a6e3ddb8177b4bb4da2b0f2`
- `lib/george/operator/runtime-overlays.ts` — `2bf452b66df007120d167d6cacb6c83d00cd2323d82f6f59b05d404b501fafb6`
- `lib/george/live-runtime/live-runtime-authority.ts` — `416784d009f3240ba8541add1c51cac57efb0c9d9959fa1bdc230cfd7ea035d5`
- `lib/george/live-runtime/support-style.ts` — `f3897f5947713b4f1ba5be81dd26b3ff81d066178ee8ebf59853a1b10d13a97d`
- `lib/george/live-voice/runtime/speaker-intent.ts` — `306758e931b505b751afae0cbcb1d81e2ca7817a8c8e61b99d58d1d71417ff60`
- `lib/george/live-voice/runtime/room-analyzer.ts` — `d269d9ce120a90b5e96c232896fd5a1d8827dad4c922ee8550ae70947ab4b293`
- `lib/george/live-voice/runtime/objective-engine.ts` — `69a5a80c517439aa2c3b4756a63a596846a9af20f4e0dcb375afb6c560a2d2ff`
- `lib/george/live-voice/runtime/trajectory-engine.ts` — `ae26d95d6f3f51ed77de0940bb2bf029d7b3a573914b50bab86a87fa9e687b4b`
- `lib/george/live-voice/runtime/outcome-governor.ts` — `fc1e95d03dfd9dba01243c91b711313ccd10ad575381d708955fad4dbdfce5a0`
- `lib/george/core/interpretation.ts` — `9a4829bd0850c7245c006043cc4e4ea13c7cd8364f3985f169d26ff0ec75d1de`
- `lib/george/runtime/signal-sufficiency.ts` — `78eedddf77d4f7da207365b841680d77384f56d22dbdcdc6cb964909c867b932`
- `lib/george/runtime/signal-ranking.ts` — `3bc055a66b1382811882db8dd8d3d74c8ee37dd1b843b79ae91064d721bd1def`
- `lib/george/runtime/runtime-signal-arbitrator.ts` — `c38fcc23bbb46e93abb7af3b173f0f86433394cefd7ebc7550808cfc994b2ee4`
- `lib/george/core/operational-understanding.ts` — `834d85bd0ce47ba401a33b153d44b12c7f1928bd09bbad9d1d0c0d5f18950a8f`
- `lib/george/runtime/operational-signal-normalizer.ts` — `bef8b9c2d3be2620bbbabb671b1b8893a782201d62955c8bab3e93bb2fc1c899`
- `lib/george/runtime/operational-signal-interpreter.ts` — `f0ccc1dd04376ef508b965be7ed56ff455a4cc42f1690715912df3f0c9948683`
- `lib/george/live-runtime/opportunity-continuity.ts` — `38af795a3e7a1bfeb32d66dc4d3346cbf58f45549ef4f2e728aef99f8e590b1e`
- `lib/george/live-runtime/opportunity-continuity.mjs` — `12b03806d49b9d7205424737c8585d3871b8c97bf04e01b364884d179c752f72`
- `lib/george/conversation-packages/index.mjs` — `310a5825c503e0a93bc52756d8014fb6553c40b5f0fe66e3d6607cbbffadb910`
- `lib/george/learning/runtime.mjs` — `8e41cda42a3195558b7f70b32e5fc37e3f09b3ea242ec4d485ea4915d090b577`
- `lib/george/live-hub/feature-flag.ts` — `3d35d883ab056b8b9c4bfe0809848829aa404ed86e60323d10308120292b6264`
- `lib/george/live-hub/live-runtime-adapter.ts` — `0dba7d83bf450a25bb1fdd4e06a6a058d65ebc9a4ef78c40d6cc6290f78802af`
- `lib/george/live-hub/types.ts` — `52cc6d5ad8b8587d1bd2db238b123ad342c298cf63d5f01ec3322cb16a88113c`
- `components/george/live/LiveHubDeliveryBridge.tsx` — `b07f6f66477eceb366896f990109f3ca6472114939dc0f1f4524c80b8c2e3cd1`
- `lib/george/live-voice/audio/live-audio-runtime.ts` — `11d2c4ea2eedd0792959750b4ab9e74a22c1e0f71bf2b4267a53ad7c06a40fd7`
- `lib/george/core/live-execution.ts` — `582c02b23a87ed1be043f29900dbb5bbc5ee5a02fe96d2556aae79e10b9fa061`
- `lib/george/live-runtime/line-transforms.ts` — `371a7649c078af593605ccf299215a64e5e9d4e77ad8c42761c9564cb48c495a`
- `lib/george/live-runtime/live-awareness-reconciliation.ts` — `d534b8f139e499eaeba24448cef70fe839e01149e1d568b8d8a36f118f553dcc`
- `lib/george/live-runtime/live-overlap-recovery.ts` — `1cda35ad16f3490e3e0d06a35c101dca81b1244415a040c507272d9dc05806ca`
- `lib/george/runtime/domain-router.ts` — `17064c1843278e4cdb62907271c530c326c1c28c494be4da2e2ba065c2ad98a8`
- `lib/george/runtime/operational-judgment.ts` — `d88feae572be210b0e5d826abd35f2f18925c37f619bbc070b585db60248ec98`
- `lib/george/chat/presentation-authority.ts` — `a8a11de8e5d33ac78d454fff0ebaf67d68932e645ec9345b03194d21c8724959`
- `lib/george/behavior/mode.ts` — `96c89182fbab49c065650fa38672e9f6509d127928e5d5b253c87f2acb107f21`
- `lib/george/live-runtime/pro-live-boundary.ts` — `6355bd1b21b638022ff32f0f6a1e5a0f87e292581140e1e1aa09771336cfef73`
- `lib/george/live-voice/runtime/conversation-target.ts` — `22d22d99e8f33f7e5dbecec8c6b1db7502a3a70567a211091d32b98825bcc881`
- `lib/george/runtime/operational-signals.ts` — `88d1242d6679c0ae30c9405c128fe275cccc37cae23ed8c16ce02d111cf27805`
- `lib/george/live-runtime/outcome-consistency.ts` — `3c59df109dc860fd5358443a40ebc45c9c0adc20cc5f1a4c6a4c7a07d9363f13`
- `lib/george/live-runtime/outcome-consistency.mjs` — `e55a7448be72b2bf854408293548fc2bce03a6fcaaede7cdf930558e6768c776`
- `lib/george/conversation-packages/identity.mjs` — `c21f6c7e7a01fc841c498a4587c68cad3292676ad065a64afa2ed431ccf917ed`
- `lib/george/conversation-packages/manager.mjs` — `538eede6ecfcb4652d60378f42ef3515cbf93387600d4d0563ee4aa43d75b2ce`
- `lib/george/conversation-packages/types.mjs` — `07bf7e498f1c5624840ae96105471aa313eaed360d708c359c956c5575db1efe`
- `lib/george/conversation-packages/live-entry-package.mjs` — `9353a7d210c902ad48654883ac36be55647e0bb2b08a177c0c8977c340207304`
- `lib/george/conversation-packages/runtime.mjs` — `18437205261bd3ce0feabdee6022094e09626e65f9bae2c438123fc297e1264b`
- `lib/george/live-hub/websocket-transport.ts` — `b87049011d384a6165ec5e9584bf23d4f35e3c68340dd59b4f93c670532817c0`
- `lib/george/live-hub/transport.ts` — `9948add3d1c9548da568ed44651235bea34b36de32373d49410107f5819698b1`
- `lib/george/core/verification/action-cue-authority.ts` — `f0454018035dc1dcfa80b6c06b0a66c57ad8397c94437efe98233316bb4615e4`
- `lib/george/live-delivery/delivery-router.ts` — `c1fc51cf9aeecaf025f31522845ff93b92db497933109260b626fa768028c639`
- `lib/george/live-delivery/delivery-commitment.ts` — `064270ca26bed85f97b8f7e579760cae20a7d3d0197d9c806c924d70caa37f7c`
- `lib/george/live-runtime/support-behavior-composer.ts` — `59bde9a93744150ee2249293ee3fc7bfbdf52648c8b0dc501587b0375da2aa2b`
- `lib/george/live-voice/stt/deepgram-live-client.ts` — `00013d06de1391d2e5bb5969395c0b9430bb9854e126d9d3574a07b1b7bad895`
- `lib/george/live-runtime/live-action-authority.ts` — `ebf756f448b70504d00cd629f897e21e820092236b001bf0f5ec83b47b6d4ebc`
- `lib/george/core/live-speaker-intent.ts` — `e779b3dec495ade9f43d7704b6dc9e92197c6e316e92bd743cde62e17b97e81b`
- `lib/george/runtime/adaptive-user-profile.ts` — `62385de0c9c3f496875472b69ea5fe068829eceab4e2694e3e0c697ea1dd4124`
- `lib/george/runtime/continuity-restoration.ts` — `3c2cabb0e45825343974a281d14f4b833769eaeaa69c55c818af67322c4f0fa8`
- `lib/george/runtime/intent-state.ts` — `923abb89d26e8341bbb7f2f2a086c74cd904de2dcaad3eb0eef0d7de84501508`
- `lib/george/runtime/live-recommendation-governor.ts` — `18801253d5a21d2fbc02b8b972cd4daa9476eba7da2dd17ab2c1e88c83a2c471`
- `lib/george/runtime/outcome-learning.ts` — `5946e3c76ef3f7def6b74ef9783447cffc533fb2f2676d939e3523447f866909`
- `lib/george/runtime/runtime-adapter.ts` — `20ec84b6e02b8549e75a256a1f9dcc088bec9872e775fec7a64c2d85dcbc630b`
- `lib/george/runtime/context-framing.ts` — `8043a71d47c1b5cdda1539ad8f19189f9a7ad3535990169da62b7e01e16a5f83`
- `lib/george/core/verification/evidence-gate.ts` — `e04ebc40ac45e8fd28a1fec5718eae8ceced579736b836afc47854b70c141d15`
- `lib/george/core/verification/continuation-replacement.ts` — `2979f65f8a74f7fc389e63af474ec138a52ddad82bc32b757808f3db40f2bd53`
- `lib/george/live-voice/runtime/runtime-events.ts` — `54e0b585d8b665c8839d6b2e44c9e49cca194cf462f137961bf8c91138809778`
- `lib/george/chat/runtime-signals.ts` — `937090f439499abe8ca7089708828999813041967fdb906051486b55e2c6a7ec`
- `lib/george/runtime/runtime-interpretation.ts` — `bf177208f1dd3382f10c6a8d08011eb6ef45b55939877c5bdbca57af496aca38`
- `lib/george/chat/live-context.ts` — `280f27da3b9f708ed5fd3b1ea7e6480c57956fa885a7c836b49d4b5c026e8c0d`
