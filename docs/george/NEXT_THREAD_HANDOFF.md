# GEORGE PRODUCTION CONTINUATION — NO DRIFT

Branch: `live-hub-runtime`

Current validated HEAD:

```text
53ebf32 Compact Normal provider execution boundary
0061367 Constrain outcome advancement to the smallest move
7a6a0c8 Consolidate provider execution authority
0c0b10e Add Normal execution posture
4cc90b1 Add contextual conversation move variants
55d69cd Evaluate signal value before acquisition
ecddc12 Route opportunity questions through conversation strategy
89522e0 Link opportunity preparation to active sessions
9330392 Make opportunity card a generic registry consumer
621cfe2 Register opportunity readiness capabilities
4087527 Add opportunity readiness and shared preparation flow
```

## FIRST

Read, in order:

1. `docs/george/PRODUCTION_TRACKER.md`
2. `docs/george/RUNTIME_ARCHITECTURE.md`
3. `docs/george/OPERATIONAL_PROFILE.md`
4. `docs/george/NEXT_THREAD_HANDOFF.md`

These documents are the production authorities after this synchronization.

Do not redesign GEORGE.

Do not add another runtime, coordinator, reasoning layer, preparation system, authority block, or prompt architecture.

Do not move reasoning into `app/george/page.tsx`.

Do not confuse Normal and LIVE realization.

Normal speaks to the user.

LIVE supports the user in the room through the existing LIVE runtime, support-style, receiver, timing, response-shaping, and delivery owners.

## PRODUCT DOCTRINE

GEORGE is one operational intelligence.

Normal prepares, reasons, plans, learns, and talks directly with the user.

LIVE executes in the room.

Preparation is continuous and may happen naturally in Normal, through standalone LIVE Entry, or through another registered opportunity.

Execution is intentional and remains owned by the existing execution gateway.

The user remains the final authority.

The selected conversational move defines the maximum response scope for the current turn.

Advancement means the smallest move that improves the operational state, not completing the entire likely project on every turn.

## CURRENT CANONICAL OWNERSHIP

### Opportunity readiness

Canonical owner:

`lib/george/runtime/operational-resource-monitor.ts`

The Opportunity Registry supports LIVE support, Pitch Deck, and Brief. The Normal bottom card remains a generic registry consumer. Preparation remains conversational and links to the active session.

### Signal economy and conversation realization

- `operational-judgment.ts` decides whether another signal is worth the conversational cost.
- `conversation-strategy.ts` decides how to earn the signal.
- `conversation-move-library.ts` owns contextual wording variants.
- `execution-policy.ts` owns mode-specific realization.
- `runtime-context-composer.ts` owns the consolidated provider-boundary authority.
- `runtime-pipeline.ts` coordinates the canonical sequence and provider request.
- `page.tsx` renders and routes only.

A signal may have many conversational realizations but one semantic meaning.

Do not ask merely to complete fields.

### Normal execution posture

Normal has a transient, derived execution posture:

- planning
- preparing
- execution_imminent
- recovering

This is not a new runtime or persistent phase machine.

It changes only how Normal prepares the user.

It must never alter LIVE room-facing behavior, receiver realization, cue compression, timing, support behavior, or delivery policy.

## COMPACT NORMAL PROVIDER BOUNDARY

Validated commit:

`53ebf32 Compact Normal provider execution boundary`

`buildGeorgeProviderRequest()` now receives `currentRuntime` explicitly.

When a Normal turn already contains consolidated `PROVIDER EXECUTION AUTHORITY`, the provider request omits duplicated legacy base, operational, steering, dynamic, and conversation-engine guidance.

The compact Normal request preserves:

- language requirements;
- the Normal mode boundary;
- applicable preparation-time LIVE availability/opening or discipline;
- consolidated provider execution authority as the final block.

LIVE provider assembly is unchanged.

Do not infer LIVE mode from `includeLiveDiscipline`; LIVE availability may surface during Normal preparation.

Do not add another provider authority block.

Do not restore removed legacy guidance merely to make the provider appear more comprehensive.

## CURRENT VALIDATION

Implementation commit `53ebf32` passed:

- `npm run george:core:smoke`
- `npm run build`
- `cd ~/ai-clarity/live-hub && npm run build`
- `git diff --check`

The documentation recovery must also pass `git diff --check` and GEORGE Core Smoke before commit.

`docs/george/OPERATIONAL_PROFILE.md` remains unchanged because this implementation did not alter Operational Profile doctrine.

## IMMEDIATE NEXT QUALIFICATION

Run the real Normal scenario:

```text
I need to prepare for an investor meeting.
```

Expected behavior:

GEORGE makes the smallest useful move that improves the operational state, such as narrowing the intended outcome.

It should not automatically create the deck, diligence pack, narrative, objections, and close.

Also compare response latency against the pre-compaction behavior.

If behavior still fails:

1. inspect the actual compact provider request;
2. confirm the selected move and execution policy reaching the provider;
3. inspect provider realization;
4. do not add another reasoning stage;
5. do not add investor-specific rules;
6. do not re-expand the provider prompt without evidence.

## ENGINEERING WORKFLOW

The owner does not manually edit code.

Use downloadable Python audit or patch bundles.

Every terminal command must begin from or explicitly return to:

```bash
cd ~/ai-clarity
```

Inspect ownership before patching.

Measure before removing.

Patch only canonical owners.

Keep one operational idea per commit.

Do not commit failed builds.

After every implementation patch:

```bash
cd ~/ai-clarity
npm run george:core:smoke
npm run build

cd ~/ai-clarity/live-hub
npm run build

cd ~/ai-clarity
git diff --check
git status --short
git diff --stat
```

Documentation is synchronized only after implementation is validated.

Audit and validation scripts should place exactly one clearly named ZIP on Desktop and should not leave an output folder beside it.

## PRODUCTION DIRECTION

Priorities:

1. Qualify the compact provider boundary behaviorally.
2. Confirm whether prompt compaction recovered latency.
3. Preserve universal reasoning.
4. Preserve Normal/LIVE separation.
5. Qualify behavior across domains one scenario at a time.
6. Keep builds green.
7. Keep production authority synchronized.
8. Continue portability hardening only after provider realization is reliable.

No drift.


---

## Behavioral Qualification Phase

Current production branch:

live-hub-runtime

Current production commits:

96cdaee Add behavioral qualification framework

fcc2883 Qualify shared preparation signal reasoning

Behavioral qualification is now mandatory.

Before changing shared reasoning:

Run:

npm run george:behavior:qualify

npm run george:shared-reasoning:qualify

Then:

npm run build

cd live-hub
npm run build

Engineering doctrine:

Inspect first.

Patch one canonical owner.

Build.

Qualify behavior.

Synchronize documentation.

Normal and LIVE share one operational reasoning runtime.

Execution may compress.

Judgment may not.

LIVE is the behavioral reference implementation whenever shared reasoning appears to diverge outside authorized execution differences.
