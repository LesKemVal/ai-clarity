# GEORGE Production Handoff — No Drift

## Authority

`GEORGE_DOCUMENTATION_SYNC: 2026-08-15-formula-script-refinement`

`IMPLEMENTATION_AUTHORITY: Implementation is authoritative; these documents are authoritative only while synchronized with the validated local implementation.`

`GEORGE_AUTHORITY_READ_ORDER: PRODUCTION_TRACKER.md -> RUNTIME_ARCHITECTURE.md -> OPERATIONAL_PROFILE.md -> NEXT_THREAD_HANDOFF.md`

Read completely, in order:

1. `docs/george/PRODUCTION_TRACKER.md`
2. `docs/george/RUNTIME_ARCHITECTURE.md`
3. `docs/george/OPERATIONAL_PROFILE.md`
4. `docs/george/NEXT_THREAD_HANDOFF.md`

Inspect the local implementation before changing anything. This handoff records validated operating context; it does not override implementation or the synchronized authorities.

## Current Repository State

- Current branch: `conversation-summary-runtime`
- Current implementation HEAD: `0deaca7e Expose optional Formula scripts`
- Ahead/behind `origin/conversation-summary-runtime`: ahead 65, behind 0 at synchronization start
- Production build status: PASS for the implementation through `0deaca7e` before this authority synchronization; the synchronized four-document authority state must be qualified again before commit
- Worktree status: clean at synchronization start
- Commit status: stopped before documentation synchronization commit

No recovery tag is declared for this handoff.

## Current Validated Phase

GEORGE is in **Production Completion — product refinement over the established production and portability baseline**.

The production runtime, portability boundary, canonical ownership model, Preparation Runtime, operational-learning path, and Formula execution identity are established. Current work refines the existing product and its qualification surface. It is not a new production/portability trek and must not reopen completed architecture without new implementation evidence.

## Completed Preparation Runtime Milestones

- `lib/george/live-runtime/live-preparation-controller.ts` owns the versioned Preparation Session contract, construction, normalization, interaction history, semantic workflow checkpoints, and derived readiness resolution.
- `lib/george/live-runtime/live-preparation-storage.ts` owns portable canonical session persistence and legacy preparation-key compatibility.
- `lib/george/live-browser/live-preparation-browser-storage.ts` owns browser storage access.
- Fresh Traditional preparation creates and persists a canonical session without implicitly restoring stale prior preparation.
- Quick LIVE creates and persists the same session with its narrow desired-outcome gate and current-session support recommendation.
- Homepage creates and preserves the same stable session through briefing, LIVE Entry handoff, Continue Briefing, Popup 3 / Ready Room, Library or Marketplace return, and LIVE entry.
- Canonical `priorInteractions` preserve question text and answered, skipped, or unknown status without duplicate synthesis.
- GEORGE recommendations and user overrides remain distinct.
- Formula, Script, customized Script, documents, confirmations, semantic workflow checkpoints, and valid related-session identities may be carried by the session.
- Readiness, missing evidence, confidence, and recommended next step are recomputed results rather than persisted canonical truth.
- Existing `LivePrepSetup` and runtime-support contracts remain unchanged outputs.

Canonical route adapters:

- `app/george/live-entry/LiveEntryClient.tsx`
- `components/home/HomeConversationTypeSurface.tsx`

## Route Migration Status

| Route | Status | Current experience |
| --- | --- | --- |
| Traditional | Complete | Questions → Popup 1 → Popup 2 → Popup 3 → LIVE |
| Quick LIVE | Complete | Minimum outcome-first setup → LIVE |
| Homepage | Complete | Adaptive briefing → Popup 3 / Ready Room → LIVE |
| Normal GEORGE | Linked / pending full migration | Parent GEORGE session identity is preserved; full route migration remains pending |
| Resume | Pending | Meaningful eligibility and canonical restoration are not implemented |

Legacy preparation contracts remain read-compatible until all route migrations are complete. Strategy must wait until Normal and Resume share the canonical lifecycle.

## Session Continuity and Operational Doctrine

`GeorgeStoredSession` is the parent working-session identity/linkage boundary. It preserves session ID, validated preparation linkage, mode, and surface across Normal, Library/Marketplace, Preparation, LIVE, Post-LIVE, Ask GEORGE, and Next Call without forcing user navigation. Preparation, LIVE, Conversation Package, Conversation Record, Formula, Script, and authentication remain separate canonical owners.

Validated identity isolates unrelated sessions; compatibility/latest storage is recovery material only. Normal and Preparation retrieve materially relevant Operational Memory, while LIVE prioritizes current execution context and consults historical memory only when necessary or explicitly requested. Signals accumulate into evidence, evidence supports recommendations, and the user decides whether to adopt them.

Preparation is objective-first and conversational: required operational signals are identified before relevant assets are searched; voice and typing share the same runtime; missing information is acquired without fabrication; assessment resolves operational action and then communication behavior. LIVE behavior composition remains execution-specific.

## Current Next Work

Continue **product refinement** from the established production runtime.

Current synchronized implementation checkpoint for this authority pass:

- branch: `conversation-summary-runtime`;
- implementation HEAD before documentation synchronization commit: `0deaca7e`;
- Formula Script browser wiring checkpoint: `aca649da`;
- optional Formula Script affordance checkpoint: `0deaca7e`;
- all four production authorities are being synchronized together;
- final production/documentation qualification must pass before the synchronization commit.


Recent validated refinement includes:

- explicit working Formula synthesis after a genuine recommendation miss;
- preservation of the distinction between pre-execution working Formula hypotheses and post-execution derived Formula Candidates;
- recommendation status semantics distinguishing initial, confirmed, and refined;
- distinct conversational framing for newly synthesized working Formula hypotheses;
- removal of obsolete LIVE Entry Formula decision wiring, unused recognition/presentation state, and a redundant legacy assist calculation;
- removal of the premature Homepage recommendation trigger while preserving the canonical mechanics-to-readiness recommendation trigger;
- correction of optional-signal state ordering;
- contextual-ambiguity qualification aligned with the established classifier contract without changing its runtime owner;
- LIVE transcript-packet qualification aligned with current queued delivery-style ownership without changing its runtime owner;
- `aca649da` wired the LIVE Formula Script browser to the existing canonical Script API using exact Formula ID/version;
- `0deaca7e` exposed optional `View scripts` progressive disclosure from the recommended Formula presentation;
- direct `Use formula` → Ready Room behavior remains preserved;
- Script selection remains optional and downstream rather than becoming a preparation gate;
- existing Formula, Script, customization, preparation, and recommendation ownership remains unchanged;
- Formula/session identity, execution/learning, Marketplace/publication, LIVE reasoning, provider degradation, reconnect ownership, runtime interface freeze, portability, and duplicate-ownership regression guards passing in the refinement review.

Current refinement discipline:

1. Inspect the complete affected owner set before changing implementation.
2. Verify one canonical owner before moving, deleting, or relocating behavior.
3. Preserve specialized host boundaries such as `app/george/page.tsx`; do not convert host integration into runtime reasoning ownership.
4. Prefer existing behavior qualifications when they already cover the behavior; add focused tests when genuinely new behavior requires them.
5. Treat production, portability, interface-freeze, resilience, and ownership qualifications as regression guards for the established baseline.
6. Remove stale or dead code only when current ownership and reference evidence prove it obsolete.
7. Keep Normal GEORGE full route migration and meaningful Resume restoration as known lifecycle work without falsely declaring them the current refinement milestone.
8. Synchronize all four production authorities as one authority set when the validated checkpoint materially changes.

Current product refinement remains centered on recommendation quality, Formula/Script/Marketplace experience, preparation continuity, progressive disclosure, and removal of proven stale paths without architectural drift.

## No-Drift Discipline

- Inspect implementation before editing.
- Keep one Preparation Runtime and one versioned Preparation Session contract.
- Routes seed or restore preparation; they do not own preparation state.
- Preserve the distinct Traditional, Quick LIVE, Homepage, Normal, and eventual Resume experiences.
- Keep explicit objective authority; never replace it silently with inferred direction.
- Keep recommendations and user overrides distinct.
- Recompute readiness and uncertainty; do not persist them as canonical session truth.
- Treat runtime setup and runtime-support payloads as outputs, not canonical preparation state.
- Do not introduce “Operational Preparation” or another semantic layer.
- Do not migrate Normal, Resume, or Strategy by trusting a storage key or unrelated prior LIVE state.
- Do not commit, push, or open a pull request without explicit user instruction.
- Never leave or hand off a failing production build.

## Documentation Synchronization Rule

A production milestone that changes observable behavior, ownership, runtime flow, qualification, product doctrine, canonical preparation ownership, route migration status, session contract, persistence, or workflow semantics is not complete until either the synchronized authority set is updated in the same milestone, or the change is explicitly recorded as implementation-ahead documentation debt in `PRODUCTION_TRACKER.md` and `NEXT_THREAD_HANDOFF.md`.

Documentation debt must not survive a production checkpoint or branch push intended as a validated handoff.

## Build and Qualification Commands

Required production validation:

```bash
git diff --check
node scripts/george-documentation-qualification.mjs
npm run build
```

Relevant focused qualifications:

```bash
npm run george:documentation:qualify
npm run george:preparation:smoke
npm run george:live-entry:smoke
```

After validation, inspect `git status --short` and the complete scoped diff. Stop before commit.

## Working Formula Hypothesis — Completed

Validated production implementation now supports creation of a working Formula hypothesis after a genuine recommendation miss.

Current behavior:

- canonical retrieval and retrieval policy run first;
- an eligible existing Formula remains preferred;
- hypothesis synthesis requires a completed briefing and desired outcome;
- provider reasoning returns a structured operational strategy;
- Operational Memory materializes and persists the private candidate Formula;
- the new Formula becomes the current working recommendation;
- incomplete briefing does not persist a hypothesis;
- no Script is created by the hypothesis path;
- provider reasoning owns no Formula asset or persistence lifecycle.

Validated commit:

fd05d1c5 Create working formula on recommendation miss

Production build and behavioral/core qualifications passed.

Continue production refinement from this implementation. Inspect nearby stale branches and dead code as affected owners are touched, but remove only code proven obsolete by current ownership and reference evidence.

### Candidate lifecycle distinction

Do not conflate the new recommendation-miss working hypothesis with post-execution Formula derivation.

The working hypothesis is created pre-execution when no existing Formula qualifies and is persisted private/candidate so execution has an exact Formula identity.

A derived Formula Candidate remains a post-execution learning artifact produced through the canonical derivation path and remains subject to existing lineage and user-retention approval rules.

These are complementary paths, not competing Formula owners.

## Recommendation Status Semantics — Completed

Validated production refinement corrected recommendation status semantics.

Current meaning:

- initial: no recommended Formula is currently established;
- confirmed: an actual Formula is selected without replacing the prior strategy, including preservation of the same prior Formula;
- refined: a prior Formula existed and a different Formula is now recommended.

Completed briefing alone no longer produces confirmed status when no Formula exists.

Null strategy synthesis remains a valid degradation state and leaves recommendation status initial.

Validated commit:

f447b69b Correct recommendation strategy status

## Working Formula Recommendation Summary — Completed

Validated production refinement now gives newly synthesized working Formula hypotheses distinct conversational framing.

Current behavior:

- working hypothesis: "Here's how I'd approach this conversation based on what I know now.";
- confirmed Formula: retains current-strategy support language;
- refined Formula: retains refined-strategy recommendation language;
- completed briefing with no usable Formula: retains degradation language;
- incomplete briefing with no Formula: retains initial-strategy preparation language.

No new recommendation status, presentation owner, Formula lifecycle state, or Script behavior was introduced.

Validated commit:

3edd3454 Clarify working formula recommendation summary
<!-- GEORGE_CODEX_LAUNCH_COMPLETION_2026_08_11 -->
## Production Continuation — Launch Completion Audit

The next thread begins with inspection of the synchronized authorities and current repository state, not architectural redesign.

Historical synchronized implementation checkpoint — 2026-08-11:

- branch: conversation-summary-runtime;
- implementation HEAD before documentation synchronization commit: cf261fa4;
- qualified reasoning/session checkpoint: 888eb420;
- qualified Normal LIVE preparation-answer checkpoint: 285d80fe;
- qualified conversation-presentation checkpoint: 16d2bab7;
- qualified top-up continuity checkpoint: 37dd706e;
- qualified LIVE orientation presentation checkpoint: cf261fa4;
- implementation work is settled for this synchronization pass;
- only the four GEORGE production authorities should remain modified while documentation synchronization is in progress;
- inspect current git status and implementation again at the start of the next thread.

### Read first

Read completely and in order:

1. docs/george/PRODUCTION_TRACKER.md
2. docs/george/RUNTIME_ARCHITECTURE.md
3. docs/george/OPERATIONAL_PROFILE.md
4. docs/george/NEXT_THREAD_HANDOFF.md

Then inspect git status, HEAD/upstream, changed files, complete scoped diffs, and canonical owners before asking Codex to change anything.

### Product direction established before Codex

Normal is the primary conversational strategy/briefing surface.

Normal may carry useful current-session context into LIVE.

Traditional provides intentional clean-context separation when the user wants the new LIVE interaction kept apart from the current conversation.

GEORGE may adapt inside Normal LIVE when the conversation changes. A context change does not require leaving LIVE.

GEORGE does not manufacture a reason for LIVE. If strategy reveals a useful real-world interaction, GEORGE may recommend executing it. If not, continue building strategy in Normal.

LIVE should be explained as execution: lines, cues, responses, positioning, signal/leverage recognition, recovery, next moves, and post-interaction assessment.

Before LIVE, GEORGE should use briefing evidence to recommend an appropriate receiver/support method and help the user technically prepare for the actual environment: in-person, telephone, video, desktop/mobile, earbuds, audio glasses, or supported text-capable smart/AR glasses.

After LIVE, GEORGE should identify what changed and let the user decide whether the result joins the current strategy, starts a new conversation, remains separate, produces follow-up/email, or leads to another execution.

Email is a future/continuing execution surface over the same session and intelligence boundaries, not another intelligence.

### Shared-agency language

Do not over-explain temporary/shared agency.

Communicate it through concrete execution.

Representative framing:

"My role: Get a commitment to [desired action/outcome] from [person/organization]. I will follow the conversation and use your voice to position the request, respond to resistance, recognize leverage and signals, and move toward a clear commitment or next step. I will respond quickly and deliberately. Just monitor the screen or audio device. We will make it work."

Existing user-agency doctrine remains authoritative.

### Codex mission

Use Codex to finish the product/portability/launch audit without redesigning GEORGE.

Codex is an implementation accelerator, not architectural authority.

Prompt Codex in bounded inspection-first passes.

For each pass tell Codex:

"Read the four GEORGE production authorities first. Inspect implementation before proposing changes. Identify the complete affected owner set and the canonical owner for each responsibility. Search for duplicate ownership. Do not redesign GEORGE, create another runtime or reasoning authority, flatten entry routes, or move runtime intelligence into presentation. Report findings before patching. Make the smallest production-grade change justified by implementation. Run focused qualifications and build. Stop before commit unless explicitly instructed."

### Codex audit sequence

Pass 1 — Presentation and asset inventory

Ask Codex to inventory:

- BX branding;
- logos;
- imagery;
- icons;
- premium/tier buttons and treatments;
- shared controls;
- LIVE-specific presentation;
- Homepage presentation;
- Marketplace/Library presentation;
- animation;
- typography treatments;
- route-specific CSS;
- global CSS;
- large mixed-responsibility components.

Goal: determine which presentation assets should become independently maintainable modules/files so branding and premium presentation can be changed later without disturbing runtime behavior.

Do not patch during the inventory pass.

Pass 2 — Presentation decomposition

Using Pass 1 evidence, extract only presentation concerns with proven boundaries.

Do not move reasoning, preparation authority, receiver policy, routing, delivery policy, Formula/Script logic, learning, or session ownership.

Do not decompose merely to make files shorter.

Pass 3 — Receiver and hardware portability

Inspect the canonical receiver contract and prove realization for:

- desktop/mobile visual;
- audio;
- visual-only;
- audio-visual;
- audio glasses;
- supported text-capable smart/AR glasses.

Identify the smallest adapter boundary required for hardware-specific APIs.

No glasses-specific GEORGE or glasses-specific reasoning runtime.

Pass 4 — Interaction lifecycle

Qualify:

Normal strategy
→ optional LIVE execution opportunity
→ briefing/context adoption or separation
→ technical readiness
→ LIVE
→ post-interaction assessment
→ strategy/new conversation/separate/follow-up
→ next execution.

Include context changes while already LIVE.

Pass 5 — Email continuity

Inspect the correct integration boundary for reading, summarizing, drafting, user review, and authorized sending of interaction-related email.

Do not create duplicate memory or strategy ownership.

Pass 6 — Launch quality

Audit:

- responsive behavior;
- accessibility;
- keyboard/focus semantics;
- touch behavior;
- reduced motion;
- asset loading;
- image optimization;
- client bundle/payload;
- render churn;
- browser/device compatibility;
- refresh/reconnect;
- microphone denial/loss;
- voice degradation;
- visual fallback;
- provider degradation;
- stale state;
- session isolation;
- privacy/security boundaries;
- sensitive logging;
- production observability.

Pass 7 — Ownership and dead-code audit

Search for duplicate owners, obsolete compatibility paths, unused presentation state, dead CSS, stale assets, and unreachable branches.

Remove only what implementation/reference evidence proves obsolete.

Pass 8 — Final production qualification

Run the established focused qualification suite, documentation qualification, production build, scoped diff inspection, and launch acceptance scenarios.

Do not declare launch-ready merely because the build passes.

### Launch acceptance direction

Before launch, demonstrate at minimum:

- Normal can develop strategy and enter LIVE without losing useful context;
- Traditional can intentionally isolate a new LIVE interaction;
- LIVE can adapt when the user changes topic/context;
- GEORGE can identify a useful execution opportunity without inventing one;
- receiver recommendation reflects briefing and environment;
- visual can provide a low-friction starting demonstration;
- phone/in-person/video preparation is understandable;
- supported smart/AR glasses can consume canonical delivery through adapters;
- LIVE support remains outcome-oriented;
- post-LIVE assessment identifies facts, unresolved issues, commitments, and next action;
- results can return to strategy or remain separate by user choice;
- email/follow-up integration respects user authority;
- branding/premium/presentation assets can be changed without disturbing operational intelligence;
- session isolation, recovery, privacy, accessibility, performance, and production qualifications pass.

The objective of the Codex phase is not another architecture.

The objective is to finish GEORGE as a launch-grade, maintainable, portable product while preserving the operational intelligence already built.
