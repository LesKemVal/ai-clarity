# GEORGE LIVE Runtime Consolidation Audit

## Branch

live-runtime-consolidation

## Core Rule

No system becomes authority until we prove its state is being updated by the active LIVE path.

## Current Finding

The old runtime under lib/george/live-voice/runtime/ is not proven active production authority.

It is also not worthless dead code.

It is valuable reference architecture.

## Classification

- orchestrator.ts = capability map
- runtime-authority.ts = authority model
- runtime-events.ts = telemetry model
- intervention-effectiveness.ts = learning seed
- turn-manager.ts = room-control state model
- transcript-buffer.ts = speaker/role memory model
- provider-health.ts = delivery/provider health model
- silence-detector.ts = speech-timing model

## Proven Active Path

The currently proven active LIVE path is app/george/page.tsx.

It actively uses:

- LIVE transcript routing
- appendLiveContextSignal
- appendLiveAwarenessFragment
- reconcileLiveAwareness
- recoverLiveOverlapContext
- deriveActiveOutcome
- georgeOutcomeGovernor.evaluate

## Removed Duplicate Active Chain

Commit 0607f8e removed active page-level calls to:

- deriveLiveRoomState
- deriveLiveRoomPriorities
- deriveLiveAttentionState
- deriveLiveSpeakerPersistence
- deriveLiveInfluenceState
- deriveLiveOutcomeDrift
- composeLiveRuntimeState
- deriveLiveBehaviorDecision
- planLiveBehaviorExecution

This reduced competing decision logic in app/george/page.tsx.

## Orphaned / Underfed Runtime Systems

Inspection found no production caller for:

- orchestrateLiveTurn
- georgeRuntimeAuthority.evaluate
- runtime decision engine

Runtime events are emitted inside the orphaned orchestrator only.

Subscribers exist:

- haptic-intelligence.ts
- runtime-memory.ts
- whisper-priority.ts

but those subscribers receive nothing unless the orchestrator emits events.

## Signal Plumbing Status

The old runtime exposes live-state producer methods:

- georgeTurnManager.update(...)
- transcriptBuffer.add(...)
- georgeSilenceDetector.markSpeech()
- georgeProviderHealth.check(...)

However, inspection did not prove these are being fed by the active LIVE path.

Therefore they must not be treated as truthful runtime state yet.

## Corrected Runtime Assessment

1. The old runtime is not proven active.
2. The old runtime is not safe to wire directly.
3. The old runtime is still a reference architecture.
4. Current app/george/page.tsx LIVE path is the only proven active path.
5. Consolidation should begin by mapping active producers and active consumers.
6. No runtime system should be promoted until its inputs are proven live.
7. Any orphaned system must either be fed, wrapped, or removed.
8. The goal is not use old runtime.
9. The goal is one truthful runtime.

## Required Next Inspection Command

cd ~/ai-clarity

grep -R "markSpeech\|append\|transcriptBuffer\|providerHealth\|setStatus\|record\|update.*Provider\|georgeSilenceDetector\|georgeTurnManager\|georgeDeliveryArbitrator" app lib hooks -n | sed -n '1,320p'

## Next Safe Technical Direction

Do not promote the old runtime.

Do not delete it blindly.

Next work should be:

1. map active LIVE producers
2. map active LIVE consumers
3. decide which dormant runtime components should be fed, wrapped, or removed
4. introduce a safe adapter only after input truth is proven
5. route toward one truthful runtime

## Consolidation Principle

Dormant systems may be valuable design assets.

Active systems may be incomplete.

Promotion requires proof.
## Backend Artifact Classification

### app/api/chat/route.ts.tmp

Status: legacy artifact.

Finding:
- Not routable by Next.js because the filename is `route.ts.tmp`, not `route.ts`.
- Not imported by active code.
- Much smaller than the active `app/api/chat/route.ts`.
- Contains shell-substitution artifact text.
- Appears to be abandoned April 2026 migration/patch output.

Classification:
- Not active runtime.
- Not current GEORGE brain.
- Safe deletion candidate after backend audit completes.

Do not delete until final cleanup pass.

## Legacy LIVE Governor Classification

### app/api/george/live/govern/route.ts

Status: legacy active route, currently quarantined from primary LIVE authority.

Finding:
- Route is reachable only through `injectGovernedLiveCue()` in `app/george/page.tsx`.
- `injectGovernedLiveCue()` belongs to the older page-level LIVE cue path.
- The major browser-STT callers are disabled by `LEGACY_BROWSER_STT_LIVE_DECISIONS_ENABLED = false`.
- The route still preserves useful design logic and should not be deleted yet.

Classification:
- Legacy governor / shelved Pro LIVE candidate.
- Not the current primary LIVE authority.
- Preserve until Pro LIVE and delivery architecture are fully classified.

### lib/george/live-voice/governor.ts

Status: legacy reasoning/governance module.

Finding:
- Performs room analysis, speaker inference, speaker intent, response policy selection, runtime support overlays, memory overlays, agency override, and steering continuation.
- Returns a `LiveVoicePacket`.
- Does not directly execute speech or mutate UI.

Classification:
- Reference architecture / legacy governor logic.
- Potential migration source for future runtime modules.
- Not current execution authority.

### lib/george/live-voice/live-reasoning.ts

Status: legacy OpenAI tactical reasoning module.

Finding:
- Uses OpenAI to reason over transcript, room, outcome, shadow map, signal sufficiency, and carry-turn delegation.
- Returns a packet.
- Does not directly execute speech or mutate UI.

Classification:
- Valuable reasoning reference.
- Potential future advisor behind current `authorizeLiveTranscriptAction` path.
- Not current execution authority.

## GEORGE Brain Lease-Ready Classification

### PORTABLE_BRAIN

- lib/george/live-voice/runtime/speaker-intent.ts
- lib/george/live-voice/runtime/steering-continuation.ts
- lib/george/runtime/signal-sufficiency.ts
- lib/george/runtime/signal-ranking.ts
- lib/george/live-voice/runtime/outcome-governor.ts
- lib/george/live-voice/runtime/active-outcome.ts
- lib/george/live-runtime/live-action-authority.ts
- lib/george/live-runtime/transcript-routing.ts
- lib/george/live-runtime/live-transcript-controller.ts

Reason:
These modules express GEORGE’s portable runtime intelligence: speaker intent, steering phrases, signal sufficiency, signal ranking, active outcome, outcome governance, transcript routing, action control, and authority gating. They are not app UI.

### PORTABLE_BRAIN_CANDIDATE

- lib/george/live-voice/runtime/room-analyzer.ts
- lib/george/live-voice/runtime/conversation-signals.ts
- lib/george/live-voice/runtime/response-policy.ts
- lib/george/conversation-engine.ts
- lib/george/live-voice/governor.ts
- lib/george/live-voice/live-reasoning.ts
- lib/george/live-runtime/live-fast-path.ts

Reason:
These modules contain valuable GEORGE reasoning or heuristics, but need review before being promoted into the clean leasable brain package.

### APP_CLIENT_ONLY

- app/george/page.tsx
- components/george/live/*
- Prep Room UI
- billing/subscription UI
- session restoration UI

Reason:
These belong to the BRANESx app client, not the portable GEORGE brain.

### DELETE_CANDIDATE

- app/api/chat/route.ts.tmp

Reason:
Legacy artifact; not routable; not imported; appears to be abandoned patch output.

### UNKNOWN

- lib/george/conversation-engine.ts.bak-chair-aware

Reason:
Backup file may contain chair/role intelligence. Inspect diff before deletion.

## Outcome Engine Assessment

### lib/george/live-voice/runtime/active-outcome.ts

Classification: PORTABLE_BRAIN, early heuristic implementation.

Finding:
- Identifies the active outcome created by the current room signal.
- Distinguishes desired outcome from active outcome.
- Independent of UI and browser state.
- Current implementation is hardcoded pattern matching and is strongest around interview, negotiation, credibility, leadership, board/executive, and objection contexts.

Assessment:
- Concept is core GEORGE brain.
- Implementation should mature from keyword mapping into signal-driven outcome inference.

### lib/george/live-voice/runtime/outcome-governor.ts

Classification: PORTABLE_BRAIN.

Finding:
- Produces movement state, next move, missing signal, reason, and doctrine.
- Models advancing, stalled, blocked, escalating, and closing states.
- Models direct response, signal acquisition, context recovery, buy time, protect position, clarify, summarize, observe, and hold moves.
- Does not generate words.
- Does not own UI.
- Does not execute speech.
- Depends on upstream signal truth.

Assessment:
- Strong candidate for GEORGE Brain core.
- Current weakness is not the governor itself; it is that upstream signals are fragmented.
- To become lease-ready, the signal layer feeding it must be unified and tested.

## Runtime Authority Naming Audit

### lib/george/live-runtime/live-runtime-authority.ts

Classification: ACTIVE_SUPPORT_RESOLVER.

Finding:
- Called by prep-runtime.
- Resolves authoritative LIVE setup/support data from prepared, active, last, and existing support.
- Does not decide whether GEORGE speaks.
- Does not execute speech.
- Name is confusing because it uses "authority", but it is context/support authority, not action authority.

### lib/george/live-voice/runtime/runtime-authority.ts

Classification: DORMANT_DELIVERY_WINDOW_AUTHORITY.

Finding:
- Produces a runtime delivery/silence/window snapshot.
- Not called by app/page.
- Only direct dependency found is runtime-decision-engine.
- Does not execute speech.
- Not the primary LIVE action authority.

### lib/george/live-voice/runtime/runtime-decision-engine.ts

Classification: DORMANT_DELIVERY_DECISION_ENGINE.

Finding:
- Converts runtime-authority snapshot into speak/whisper/interrupt/suppress/hold/yield/queue.
- No active app/page caller found.
- Should not be treated as production authority unless explicitly wired later.
- Potential future delivery-policy module.

### lib/george/live-voice/runtime/signal-authority.ts

Classification: DORMANT_SIGNAL_POSTURE_AUTHORITY.

Finding:
- Produces signal priority, dominant signal, suggested posture, reveal mode.
- No active caller found.
- Does not execute speech.
- Useful GEORGE Core candidate for posture/continuity intelligence.

### lib/george/live-voice/runtime/orchestrator.ts

Classification: LEGACY_RUNTIME_SYNTHESIS / PORTABLE_BRAIN_CANDIDATE.

Finding:
- Synthesizes confidence, power dynamics, trajectory, recovery, salvage objective, perceived positioning, pressure memory, load, posture, silence, opportunity state, runtime events, and queue text.
- Emits runtime events.
- Returns packet/snapshot/silence/queueText.
- No active caller found in app/lib/hooks/components search except its export.
- Valuable intelligence, but not current production authority.

### lib/george/live-voice/runtime/runtime-doctrine.ts

Classification: DOCTRINE_REFERENCE.

Finding:
- Constant string doctrine.
- Non-executing.
- Useful as product/behavior reference.
