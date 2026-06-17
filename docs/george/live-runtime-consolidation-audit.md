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