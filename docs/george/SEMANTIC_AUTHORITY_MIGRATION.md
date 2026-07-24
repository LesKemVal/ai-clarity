# GEORGE Semantic Authority Migration

## Purpose

This document tracks the production migration that restores semantic interpretation to the provider while preserving runtime execution authority.

It is an implementation audit, not a new architecture and not a new reasoning lane.

Goals:

- preserve one GEORGE;
- preserve one provider call per response path;
- keep execution state, policy, timing, delivery, activation, safety, and user agency in the runtime;
- keep interpretation of user language, intent, desired outcome, and capability benefit in provider reasoning;
- remove superseded heuristic ownership;
- identify and delete dead code after callers migrate;
- improve portability by reducing page, provider, browser, and environment coupling.

## Authority Boundary

### Provider owns

- semantic interpretation of the current utterance in full conversational context;
- explicit and implied user intent;
- explicit or likely desired outcome;
- whether a capability materially improves the desired outcome;
- whether a capability was directly requested;
- user-facing response realization within runtime policy.

### Runtime owns

- active operating mode;
- execution state and constraints;
- safety and damage boundaries;
- timing and restraint;
- user-agency enforcement;
- activation authority;
- delivery and receiver policy;
- telemetry and qualification.

The runtime may govern provider judgment. It must not recreate semantic understanding through keyword lists, regexes, confidence gates, or duplicated scenario classifiers.

## Migration Status

### Completed

1. `lib/george/runtime/live-recommendation-governor.ts`
   - LIVE recommendation phrase matching removed from canonical recommendation evidence.
   - Status: superseded semantic authority removed; compatibility evidence type remains temporarily.

2. `lib/george/runtime/operational-judgment.ts`
   - LIVE support judgment reduced to presentation and activation policy.
   - Runtime no longer decides LIVE relevance or recommendation strength.
   - Status: canonical execution-policy owner retained.

3. `lib/george/runtime/provider/normal-provider.ts`
   - Existing provider response envelope expanded with `semanticJudgment`.
   - No second provider request introduced.
   - Current fields:
     - `userIntent`
     - `desiredOutcome`
     - `capability`
     - `capabilityBenefit`
     - `capabilityExplicitlyRequested`
     - `capabilityRecommendationMaterial`
   - Status: migration contract implemented; not yet consumed by the route/runtime snapshot.

## Current Integration Gap

`app/api/chat/route.ts` currently consumes only:

- `providerResult.text`
- `providerResult.semanticIntent`

`providerResult.semanticJudgment` is currently discarded.

This makes `semanticJudgment` intentional migration code, not dead code. The immediate next integration must carry it into the canonical response/runtime authority surface before heuristic owners are removed.

The route currently builds the runtime pipeline before provider completion. Therefore, provider semantic judgment cannot become an upstream input without either:

- introducing a second provider call, which is prohibited; or
- restructuring the current single provider interaction so semantic judgment is resolved before final runtime policy and response realization.

No patch should conceal this ordering constraint.

## Semantic Ownership Audit

### Canonical

These responsibilities remain runtime-owned:

- runtime selection and active-mode state;
- execution policy;
- safety and damage arbitration;
- continuity restoration state;
- signal acquisition cost policy;
- delivery policy;
- receiver policy;
- activation control;
- telemetry.

### Migration Compatibility

These remain temporarily because active callers still depend on their shapes:

- `GeorgeIntentState`
- `LiveRecommendationEvidence`
- `GeorgeOutcomeState`
- `providerSemanticIntent`
- `buildPassiveIntentState()`
- `resolveGeorgeOutcomeState()`

Compatibility status does not imply continued semantic ownership. Each field and caller must be reviewed before production freeze.

### Superseded Semantic Logic

The following logic is already identified as semantically duplicative and should be retired after provider metadata is integrated:

#### `lib/george/runtime/intent-state.ts`

- operational/exploratory classification from word lists;
- objective clarity from word count and question words;
- actionability from deadline, meeting, call, interview, and execution terms;
- continuity dependency from surface phrases;
- emotional load from keyword lists;
- LIVE scenario propagation as semantic intent.

#### `lib/george/live-voice/runtime/active-outcome.ts`

- immediate-outcome selection from scenario keyword lists;
- primary-outcome inference from regex categories;
- supporting-outcome generation from scenario categories;
- execution/recovery/closing phase inference from phrase matching.

#### `lib/george/runtime/operational-judgment.ts`

- `resolveOperationalPosture()` still infers execution imminence from phrases such as `about to`, `walking into`, `on the call`, and time expressions.

#### `lib/george/chat/runtime-signals.ts`

- scenario and control classifiers feeding semantic conclusions must be audited field by field.
- Non-semantic signal measurement may remain when it represents observable execution evidence rather than language understanding.

### Dead-Code Candidates

No candidate is deleted until all callers are migrated and qualification passes.

Track these as potential removals:

- phrase lists used only for LIVE capability recommendation;
- `executionImminent`, `conversationPressure`, `pressureHigh`, and `trajectorySignal` fields in `LiveRecommendationEvidence` if no longer used outside legacy presentation paths;
- helper functions whose only purpose is populating superseded semantic fields;
- imports and note builders that expose fields no longer consumed;
- duplicate prompt blocks that tell the provider to recreate decisions already supplied in structured metadata;
- provider semantic fields added to response surfaces but never consumed;
- compatibility adapters with zero production callers;
- tests that validate obsolete keyword behavior rather than canonical authority.

## Required Removal Discipline

For every migration:

```text
Introduce or confirm canonical replacement
↓
Migrate all production callers
↓
Build and run focused qualification
↓
Search all remaining symbol and field references
↓
Delete superseded code, imports, tests, and notes
↓
Build and run full production qualification
↓
Synchronize production documentation
```

Do not leave inactive alternate ownership in the repository. Dead semantic machinery harms portability even when it is no longer called because it obscures the canonical boundary and invites future reuse.

## Portability Audit

Each patch must also check for:

- direct `process.env` access outside provider/configuration boundaries;
- browser globals in shared runtime modules;
- Next.js route or component types leaking into canonical runtime contracts;
- OpenAI- or Groq-specific response shapes leaking beyond provider adapters;
- page-level runtime decisions;
- duplicated Normal and LIVE reasoning contracts;
- receiver-specific behavior inside semantic or support-behavior owners;
- logging or telemetry coupled to one host environment;
- provider fallback behavior that drops semantic metadata silently;
- image and text paths returning incompatible authority snapshots.

## Next Canonical Work

1. Carry `semanticJudgment` through `app/api/chat/route.ts` into an inspectable runtime authority/result surface.
2. Make image and text provider paths expose a compatible semantic-result contract or explicitly mark semantic metadata unavailable.
3. Add qualification for:
   - valid structured semantic judgment;
   - plain-text fallback;
   - Groq-to-OpenAI fallback;
   - no automatic LIVE activation;
   - explicit LIVE requests preserved;
   - provider capability recommendation preserved without runtime keyword reconstruction.
4. Audit all `GeorgeIntentState`, `GeorgeOutcomeState`, `LiveRecommendationEvidence`, and `semanticIntent` consumers.
5. Migrate one semantic responsibility at a time.
6. Delete dead fields and functions immediately after the last caller is removed.

## Production Freeze Gate

Semantic migration is complete only when:

- the provider is the sole owner of language meaning;
- the runtime is the sole owner of execution policy;
- no active keyword or regex subsystem independently decides user intent, desired outcome, or capability relevance;
- compatibility fields are either justified and documented or removed;
- dead-code search is clean;
- text, image, Normal, and LIVE paths preserve one compatible authority contract;
- production build and qualification suites pass;
- `PRODUCTION_TRACKER.md` and `RUNTIME_ARCHITECTURE.md` are synchronized with validated implementation.
