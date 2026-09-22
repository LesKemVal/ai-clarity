# GEORGE Dead Code Ledger

## Purpose

Track code that is unreferenced, superseded, duplicated, partially integrated, or retained temporarily during production work.

This ledger prevents unfinished contracts and transitional files from silently becoming permanent dead code.

## Rules

- Inspect references before adding a new owner or contract.
- Record newly introduced but unconsumed code immediately.
- Distinguish pending integration from confirmed dead code.
- Do not keep compatibility code without an identified consumer and removal condition.
- Remove superseded code after the replacement path is validated.
- Update this ledger in the same commit that wires, supersedes, or removes a tracked item.

## Open Items

### LH-3A3e candidate: `DEFAULT_GEORGE_POSTURES`

- Declaration: `lib/george/posture/default-posture.ts`.
- Imports: none found in production, qualification, or presentation code.
- Callers: none.
- Runtime reachability: unreachable from the inspected production graph.
- Canonical replacement: active momentary posture selection is owned by
  `lib/george/live-voice/runtime/posture-engine.ts` and the LIVE orchestrator.
- Recommendation: **quarantine** and consider removal in a later one-owner
  dead-code milestone after interface/reference proof.

### LH-3A3e candidate: `applyGovernedLiveCueRuntimeMemory()`

- Declaration: `lib/george/live-runtime/governed-live-cue.ts`.
- Imports: no module import found; production-readiness scripts mention the
  declaration by source string only.
- Callers: none.
- Runtime reachability: unreachable in the inspected production graph.
- Canonical replacement: current communication-change acceptance belongs to
  Operational Judgment; bounded session tendency belongs to Adaptive User
  Profile; LIVE timing/support remains with existing LIVE governance. The
  similarly named governor `runtimeMemory` consumer is not evidence that this
  mutator is connected.
- Recommendation: **retain/quarantine** until a later milestone either proves a
  correct downstream consumer or removes the uncalled path. Do not connect it
  directly to transcript text because that would bypass accepted scope.

### LH-3A3e candidate: `getPreferredLiveSupportTags()`

- Declaration: `lib/george/live-host/live-support-preferences.ts`.
- Imports: none found. `recordLiveSupportPreference()` is imported by
  `app/george/page.tsx`, but the getter is not.
- Callers: none.
- Runtime reachability: saved like/dislike counts are reachable through the UI;
  preferred-tag retrieval is not.
- Canonical replacement: current support behavior is selected by canonical
  support behavior/preparation owners. No authorized preference-evidence
  replacement was proven for browser-local tag scores.
- Recommendation: **quarantine** and evaluate removal later. Do not promote
  local tag counts into behavioral authority in this milestone.

### LH-3A3e candidate: duplicate/disconnected communication-style paths

- Declarations: `LiveRuntimeMemory.communicationBaseline` in
  `lib/george/live-voice/types.ts` and
  `lib/george/live-runtime/prep-runtime.ts`;
  `applyPreparedRuntimeMemory()` in `prep-runtime.ts`; UI helper
  `getActiveLiveCommunicationStyle()` in `app/george/page.tsx`.
- Imports: the governor imports the runtime-memory type; the page helper is
  local; no production import/caller of `applyPreparedRuntimeMemory()` was
  found.
- Callers: the page helper supplies status/details display. The governor can
  consume `runtimeMemory.communicationBaseline`, but no inspected production
  caller supplies that baseline. `applyPreparedRuntimeMemory()` has no caller.
- Runtime reachability: display is reachable. The duplicate governor baseline
  producer path is disconnected. The canonical confirmed style is now
  connected separately from Preparation Session → `LivePrepSetup` →
  `buildLiveRuntimeContext()` → shared reasoning.
- Canonical replacement: the confirmed preparation style in the canonical LIVE
  runtime context, subordinate to current direction and execution constraints.
- Recommendation: **retain** the display path; **quarantine** the disconnected
  duplicate baseline/memory path and consider removal only after a separate
  one-owner proof.

## Resolved Items

### Expression Milestone 1 disconnected speech-composition boundary

Resolution: **Connected without replacement or deletion**

Prior state:

- `ProviderSpeechCompositionProposal` and
  `resolveSpeechCompositionJudgment()` existed in
  `lib/george/runtime/operational-judgment.ts`;
- the boundary was exercised by governed-communication qualification;
- no production Normal provider → route → runtime pipeline caller supplied a
  proposal, so the acceptance boundary was qualification-reachable but
  production-disconnected.

Milestone 2 disposition:

- the existing Normal semantic parser now normalizes the nullable proposal;
- `/api/chat` and the runtime pipeline transport it without deciding;
- the existing Operational Judgment resolver remains the sole acceptance and
  scope owner;
- only its accepted bounded judgment reaches governed realization.

No implementation was superseded and no newly orphaned runtime code was
created. The former disconnected boundary is now active; rejected,
clarification-required, malformed, and null proposals remain excluded from
realization, and no durable persistence path was introduced.

### `lib/george/runtime/provider-semantic-intent.ts`

Resolution: **Removed before integration**

History:

```text
951e77b Add shared provider semantic intent contract
b268833 Remove unintegrated semantic intent contract
```

Reason:

- the file had no consumer;
- it introduced a future contract outside the active provider boundary;
- retaining it would have created silent dead code.

Replacement rule:

- extend the existing canonical provider result directly;
- wire provider output, runtime consumption, response payload, and qualification coverage in the same implementation sequence;
- do not reintroduce a standalone semantic-intent owner unless an active consumer exists in the same change.

## Confirmed Dead Code

None recorded.
