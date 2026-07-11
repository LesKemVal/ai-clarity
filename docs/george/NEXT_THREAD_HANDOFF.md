# GEORGE PRODUCTION CONTINUATION — NO DRIFT

## First action

Read, in order:

1. `docs/george/PRODUCTION_TRACKER.md`
2. `docs/george/RUNTIME_ARCHITECTURE.md`
3. `docs/george/OPERATIONAL_PROFILE.md`
4. `docs/george/NEXT_THREAD_HANDOFF.md`

Inspect implementation before changing anything.

## Current branch and validated HEAD

Branch:

`live-hub-runtime`

Current validated local HEAD:

`78e2daf Remove legacy Brilliant LIVE trigger bypass`

Do not run `git pull`.

The local branch and `origin/live-hub-runtime` are diverged. Last observed:

- 135 local-only commits
- 30 remote-only commits

Remote reconciliation is separate work. Inspect remote-only commits individually before any merge, rebase, force push, or branch replacement.

## Production objective

Complete GEORGE for production and portability.

Do not redesign GEORGE.
Do not introduce a second runtime.
Do not create competing authority.
Do not move reasoning into `app/george/page.tsx`.
Do not add page-level behavioral patches when a canonical owner exists.
Do not create a new owner merely because code can be moved.

## Core doctrine

GEORGE is one operational intelligence.

Normal and LIVE are operating modes, not separate intelligences.

Normal GEORGE prepares, clarifies, plans, creates, analyzes, decides, and advances work before execution.

LIVE executes under real-time constraints.

Both modes reason from signals, evidence, user authority, desired outcome, credibility, timing, operational value, and the totality of the user's roles, rooms, conversations, and experience.

The user chooses where to go.

GEORGE chooses the best available path to get there.

GEORGE owns tactical trajectory within the authority the user has temporarily granted.

GEORGE must behave differently when situations require it, but identity, memory, judgment philosophy, and user understanding remain unified.

Support style changes delivery, not intelligence or judgment.

## Working discipline

Always inspect implementation and ownership first. Identify duplicate or competing behavior. Patch only the canonical owner. Keep one operational idea per commit. Build after every substantive change. Do not commit failed builds. Preserve established behavior unless the task explicitly removes verified legacy behavior. Synchronize production documentation after implementation. Keep the working tree clean. Prefer paste-ready terminal patches and do not require manual line editing.

Avoid giant patches, `page.tsx` bloat, duplicate runtimes, duplicate evidence authority, premature architecture, hidden behavior changes, moving logic twice, broad cleanup mixed with production behavior work, `set -e` in the owner's interactive Terminal, heredocs, and `git pull` on the diverged branch.

## Verified file ownership

### `app/george/page.tsx`

Purpose:

- mount surface
- UI and interaction
- transient state
- signal collection
- invoking canonical owners
- applying returned effects
- message rendering and mutation
- provider transport
- bridge mounting
- pass-through of existing runtime identifiers

It must not own reasoning doctrine, training/domain precedence, authoritative override semantics, LIVE support behavior, receiver delivery policy, turn lifecycle, response doctrine, provider-independent operational judgment, or duplicate runtime authority.

### `lib/george/runtime/pre-provider-send-resolution.ts`

Canonical narrow owner for pre-provider Normal send execution.

Composes:

- `lib/george/runtime/domain-router.ts`
- `lib/george/runtime/training-runtime.ts`

Owns training-versus-domain precedence, `provider`, `provider_with_context`, `direct`, and `return` semantics, domain context attachment, guided-line and metadata return, and authoritative direct-response resolution.

### `lib/george/prompts/suggested-prompts.ts`

Canonical owner for message-based suggested prompts, post-response prompt generation, reroute detection, and low-signal prompt filtering.

### `lib/george/live-runtime/live-intent-runtime.ts`

Canonical owner for pre-LIVE intent behavior, including message-bar setup classification and context confirmation copy.

### LIVE canonical owners

Preserve:

- `lib/george/live-runtime/support-behavior-composer.ts`
- `lib/george/live-runtime/live-support-behavior-pipeline.ts`
- `lib/george/live-runtime/live-final-transcript-adapter.ts`
- `lib/george/live-runtime/live-transcript-controller.ts`
- `lib/george/live-runtime/live-fast-path.ts`
- `lib/george/live-voice/runtime/response-shaper.ts`
- `lib/george/live-runtime/live-runtime-context.ts`
- `lib/george/live-delivery/*`
- `components/george/live/LiveHubDeliveryBridge.tsx`
- `components/george/live/LiveHubVisualCueBridge.tsx`

Do not absorb these into Normal send resolution or a page-level helper.

### `app/api/chat/route.ts`

Current model-call orchestration surface.

It may assemble canonical runtime outputs.

It must not become the owner of runtime doctrine, Operational Profile, preparation, memory policy, LIVE authority, operational judgment, or capability governance.

## Validated portability work

Recent validated commits:

- `51c783c` — Add portable pre-provider send resolution
- `e08a46e` — Route Normal sends through portable resolution
- `377079a` — Remove legacy direct-response provider fallback
- `37cd9c4` — Move LIVE message-bar behavior into runtime
- `4685175` — Move Normal prompt generation into canonical owner
- `6538ced` — Remove legacy Smart response degradation
- `00bfd04` — Remove unused page steering and goal state
- `0552364` — Remove legacy page response transforms
- `78e2daf` — Remove legacy Brilliant LIVE trigger bypass

Removed legacy behavior must not be reintroduced through another helper or compatibility path.

## Current validated tests

At HEAD `78e2daf`:

- GEORGE Core Smoke: PASS
- LIVE Entry Smoke: PASS
- Conversation Package Smoke: PASS
- LIVE Runtime Smoke: PASS
- Preparation Smoke: PASS
- Next.js production build: PASS
- `live-hub` TypeScript build: PASS
- `git diff --check`: PASS
- working tree: clean

## Next production direction — preserve this order

### 1. Finish the remaining `page.tsx` ownership audit

Inspect remaining `handleSend()` and nearby branches.

Classify each block as legitimate UI/effect/transport wiring, canonical runtime consumption, duplicate behavior, legacy behavior, or unowned behavior requiring a narrow existing-owner extraction.

Likely audit areas:

- LIVE identity execution
- prompt-context clearing
- campaign-context detection
- local-storage-derived runtime setup
- direct-response effect application
- hard-coded assistant copy
- post-response UI lifecycle
- any page branch that changes behavioral precedence or response authority

Do not extract code merely because it exists in the page.

### 2. Confirm the full portability boundary

Target:

Page gathers inputs
↓
Canonical runtime owners decide
↓
Portable result defines execution
↓
Page applies UI effects and transport.

Confirm no duplicate Normal runtime, no duplicate LIVE runtime, no response doctrine in the page, no independent evidence producer directly controls output, canonical owners are reusable outside the current page, and providers receive already-governed operational context.

### 3. Introduce Operational Judgment only after portability is clean

Future principle:

One operational judgment. Many evidence producers. One governing owner.

Candidate evidence producers:

- Passive Intent
- Runtime Interpretation
- Judgment Surface
- Trajectory
- Outcome Learning
- Continuity Restoration
- Adaptive User Profile

They produce evidence. They must not independently decide behavior.

The future Operational Judgment owner synthesizes evidence into one operational decision.

It must not become a second reasoning engine, another prompt architecture, another runtime, a replacement for LIVE authority, a UI helper, or a provider-specific layer.

### 4. Simplify model-call context and prompt assembly

After Operational Judgment exists:

- response shape consumes the judgment
- output governance consumes the judgment
- provider selection remains governed by the reasoning lane/provider owner
- provider executes rather than independently choosing posture
- current model-call context stops concatenating semi-independent behavioral instructions that can conflict

Preserve Preparation Runtime, Conversation Package, Operational Profile, LIVE authority, and provider boundaries.

## Immediate next action

Read the synchronized production documents.

Then inspect the remaining behavioral branches in `app/george/page.tsx`, especially `handleSend()`, without patching until ownership is verified.

One scope per commit.

No drift.
