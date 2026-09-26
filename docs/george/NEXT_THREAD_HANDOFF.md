# GEORGE Production Handoff — No Drift

## Authority

`GEORGE_DOCUMENTATION_SYNC: 2026-09-17-lh3a3e-governed-communication`

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
- Quick LIVE is retired. Its dedicated preparation, UI, runtime setup, and handoff path have been removed and must not be restored.
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
| Quick LIVE | Retired | Dedicated production route removed; do not restore |
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
- Preserve the distinct Traditional, Homepage, Normal, and eventual Resume experiences. Quick LIVE is retired and must not be reintroduced as a separate route.
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

<!-- GEORGE_CONTINUATION_2026_08_19_NORMAL_LIVE_DESIGN_AND_PARTNERSHIP -->
# GEORGE CONTINUATION — NORMAL / LIVE PARTNERSHIP + SITE DESIGN

## FIRST

This project remains in Production Completion & Product Design.

Do not redesign GEORGE.

Do not create another runtime.

Do not create another reasoning authority.

Do not flatten legitimate LIVE entry routes.

Do not move runtime intelligence into presentation.

Inspect implementation before changing anything.

Patch canonical owners only.

Small commits.

Build before commit.

Never commit a failed build.

The current working tree contains intentional uncommitted work from the latest Normal GEORGE / LIVE partnership pass. Inspect it before changing or reverting anything.

---

## READ FIRST

Read completely and in order:

1. docs/george/PRODUCTION_TRACKER.md
2. docs/george/RUNTIME_ARCHITECTURE.md
3. docs/george/OPERATIONAL_PROFILE.md
4. docs/george/NEXT_THREAD_HANDOFF.md

Then inspect:

- git status -sb
- current HEAD / upstream
- complete working-tree diff
- affected canonical owners
- current qualification/build state

Do not assume this handoff is newer than implementation.

Implementation wins when documentation and code differ.

---

## CURRENT BRANCH / LAST CLEAN DESIGN CHECKPOINT

Branch:

conversation-summary-runtime

Last committed/pushed major design checkpoint:

73a83fc9 — Unify GEORGE route and strategy design

Recovery tag:

george-route-strategy-design-20260818-231838

That checkpoint unified:

- homepage route design;
- Library working-set design;
- Marketplace recommendation/strategy design;
- mobile-first density;
- shared strategy/evidence presentation.

The repository later received additional uncommitted Normal GEORGE and LIVE work described below.

---

## LOCKED DESIGN RULE

Mobile first.

Do not waste space.

Desktop may use width to expose more information.

Desktop must not create artificial vertical bulk simply because more space is available.

Space communicates priority.

If a surface consumes substantial screen space, it must materially help the user:

- understand;
- decide;
- prepare;
- execute;
- verify;
- learn;
- or move closer to the desired outcome.

Avoid decorative cards, redundant explanations, persistent controls with low operational value, and large empty regions.

---

# SITE DESIGN DIRECTION

## Homepage

Homepage is primarily a route map.

It should explain:

- what each GEORGE route is for;
- when that route is useful;
- what benefit the route provides.

Current route distinctions remain legitimate.

Do not merge the routes.

Traditional LIVE should retain stronger desktop proportion than other routes where appropriate.

Rendered intelligent headline/copy should feel visually superior to surrounding page content while it is in frame.

The homepage should not become a wall of colored cards.

Color should primarily communicate meaningful actions/states.

---

## Library

Library = user's operational working set.

It is not another Marketplace recommendation surface.

Primary purpose:

- see owned/current formulas and scripts;
- understand operational state;
- inspect execution learning;
- adapt existing operational work;
- manage only when necessary.

Administrative controls should not dominate the initial Library view.

Strategy/evidence state should travel with the formula instead of consuming separate oversized regions.

---

## Marketplace

Marketplace = operational strategy decision surface.

Recommendation remains primary.

Alternatives are secondary and should explain how/when they differ.

Marketplace should not feel like:

- an app store;
- social discovery;
- a generic content catalog.

Evidence/status belongs with the strategy.

Do not recreate standalone Emerging/Proven catalog sections unless implementation proves they materially help decision quality.

---

# NORMAL GEORGE DESIGN WORK

The latest Normal design pass intentionally moved toward:

GEORGE speaks.
Controls recede.

Changes made during the current working-tree phase include or may include:

- quieter user-message presentation;
- preserved blue briefing treatment;
- reduced persistent assistant action clutter;
- permanent DECK action removed from every response;
- Copy / Share visually quieted;
- Remember interaction reduced from a miniature folder manager to a fast save decision;
- Moment Marker redesigned as a visible milestone at the beginning of qualifying GEORGE responses;
- Moment Marker retains recognition glyphs:
  - 🔥 Momentum
  - 🎯 Alignment
  - 🏃 Movement
  - 🙌 Interaction
  - 🏁 Outcome
  - BX Deft execution
- Moment assessment expands inline rather than taking over the screen with a modal;
- ordinary Normal composer was visually quieted while preserving:
  - blue Normal briefing state;
  - LIVE composer behavior;
  - shared canonical composer ownership.

Do not remove the blue briefing treatment.

Blue communicates active briefing / context acquisition.

Do not flatten Normal, briefing, and LIVE composer states into one visual treatment.

---

# MOMENT MARKER

Moment Marker was originally conceived as recognition of significant milestones.

Its semantics have expanded toward operationally significant moments.

Do not exhaustively redesign or reclassify it during unrelated work.

Current product intent:

- important milestone/significant moment is acknowledged at the beginning of the GEORGE response;
- recognition should feel meaningful;
- flame/target/etc. are intentional, not accidental decoration;
- deeper assessment may expose:
  - observed;
  - evidence;
  - why it matters;
  - focus.

A future bounded pass should clarify whether Moment Marker represents:

1. milestones only;
2. broader consequential operational moments;
3. a hierarchy containing both.

Do not block remaining production/design work on exhaustive Moment Marker testing.

---

# NORMAL → LIVE PARTNERSHIP

This behavior is now product doctrine.

## First LIVE tap

First tap does NOT begin briefing immediately.

It explains LIVE and asks the user which context should become the basis for LIVE.

Core framing:

LIVE lets me support you while another conversation is happening.

We can continue with what we're discussing, or you can use LIVE for something else.

Preferred active execution language:

While LIVE, you use your voice as I analyze the conversation for openings, behavior tells, risk, leverage, and changes in direction.

I discreetly send high-impact lines and cues to your screen or audio device — earbuds, phone, laptop, or compatible glasses.

Tap LIVE again to continue with this conversation.

Or choose Something else.

Avoid passive language such as:

"I can listen with you."

LIVE is execution support, not passive observation.

---

## Second LIVE tap

Second tap means:

Use the current Normal conversation as the starting context for evaluating and preparing LIVE.

It does NOT mean:

LIVE has already been judged appropriate.

It does NOT mean:

GEORGE must immediately reject LIVE if current evidence is incomplete.

After the second tap:

- current Normal objective/context/evidence carry forward;
- blue adaptive briefing begins;
- GEORGE acquires only consequential missing signal;
- the existing Normal response must remain visually stable;
- no already-delivered GEORGE response should replay/re-render.

The briefing determines whether LIVE is ultimately useful.

---

## End-of-briefing judgment

Only after sufficient briefing evidence exists should GEORGE judge whether:

1. LIVE materially improves execution;
2. Normal work is the stronger next move;
3. another interaction would create more value;
4. a verification conversation with a related party would resolve consequential uncertainty.

Do not make the final "LIVE is not materially useful" judgment at the beginning of briefing merely because evidence is incomplete.

---

# GEORGE-INITIATED VERIFICATION CALL

This is a major product / marketing behavior.

GEORGE may identify that advice, strategy, or user assumptions depend on consequential information held by another real person.

GEORGE may then recommend a legitimate verification interaction.

GEORGE must not manufacture a call merely to demonstrate LIVE.

The interaction must independently advance the user's desired outcome.

GEORGE may test:

- the user's assumptions;
- stale facts;
- another party's current position;
- an interpretation;
- GEORGE's own prior recommendation.

Representative framing:

"I suggest we verify this."

"I'll set up a call with you and help determine whether those assumptions still hold."

"Pay attention to your screen or audio device as I deliberately determine whether [X] is still [Y]."

"If what we learn changes the strategy, we'll adjust."

Locked partnership line:

**Intelligent communication doesn't work without your voice.**

Do not replace this with language implying competition between the user's voice and GEORGE's advice.

---

# GEORGE-PREPARED VERIFICATION LIVE ENTRY

When GEORGE already knows:

- objective;
- participant / related party;
- current evidence;
- consequential uncertainty;
- verification target;
- intended result;

the user should not be forced through redundant Traditional briefing.

GEORGE may prepare the interaction and enter at Popup 3 / Ready Room.

For this GEORGE-prepared verification route, the user's primary remaining setup decision is receiver:

VISUAL

Best when the user can glance discreetly and may need to compare details as they emerge.

Guidance remains visible.

AUDIO

Best when eye contact, rapport, or attention to the other person matters most.

Guidance must remain short, sequential, repeatable, and low-cognitive-load.

GEORGE may recommend the receiver based on the interaction.

Traditional LIVE remains its own full route.

Homepage preparation begins with the user's exact desired outcome. Role and conversation type are optional evidence rather than entry gates.

Do not flatten these routes.

---

# LIVE ENTRY ROUTES — PRESERVE

GEORGE has multiple legitimate LIVE entry routes with different choreography over one shared LIVE runtime.

Preserve:

Normal GEORGE
→ LIVE orientation
→ current conversation or something else
→ adaptive briefing
→ readiness
→ LIVE

Traditional LIVE
→ Popups 1 → 2 → 3

Homepage preparation / GEORGE-prepared context
→ may enter later in choreography when preceding information is already established

Homepage outcome-led preparation
→ exact desired outcome → same-surface adaptive question → editable confirmed understanding

LH-3A1 generalizes the existing Operational Preparation Judgment ingress to accept validated `normal` or `homepage` provenance through the same semantic-proposal and Operational Judgment path. Homepage retains its canonical Preparation Session identity without a manufactured Normal-session relationship. The Homepage surface does not invoke that ingress yet; that connection remains the next controlled dependency.

`/george/live-home` no longer inserts a role-selection or briefing-launch surface after outcome capture. Its active question remains primary; compact authorized S / I / B controls and editable Current Understanding remain beneath it. Role and conversation type are optional evidence, and an understanding revision is preserved in the same Preparation Session before the unresolved question returns.

These are presentation/entry differences.

They do not create separate intelligences or runtimes.

---

# FEEDBACK / THUMBS — LATEST REQUEST

Latest requested behavior:

- add 👍 / 👎 under user messages as well as GEORGE messages;
- both start neutral;
- tap 👍 selects;
- tap selected 👍 again returns to neutral;
- tap 👎 switches;
- tap selected 👎 again returns to neutral;
- no thumb should arrive pre-checked;
- user-message feedback should remain visually quiet.

Important:

The final patch for neutral/toggleable feedback, user-message thumbs, Normal brevity, and updated LIVE orientation/second-tap doctrine was provided at the end of the previous thread.

Its validation result was NOT shown before handoff.

NEXT THREAD MUST INSPECT WHETHER THAT PATCH EXISTS IN THE WORKING TREE BEFORE REAPPLYING IT.

Do not blindly rerun it.

---

# NORMAL RESPONSE LENGTH — LATEST DIRECTION

GEORGE has become somewhat too long-winded in low-pressure, narrow-intent Normal conversations.

Desired behavior:

When the user's intent is narrow and pressure is low, answer in one compact useful thought.

Add another sentence or paragraph only when it materially changes:

- understanding;
- decision;
- next action;
- or probability of reaching the desired outcome.

Do not append generic consequences, summaries, restatements, or closing abstractions after the useful operational point has already been established.

Example preferred response:

"It's essential to assess the specifics of this re-issuance, such as the number of shares to be issued and the purpose behind the move. These details will influence the strategic decision and help predict both immediate and long-term effects on shareholder value and company performance."

Do not add another generic paragraph unless it changes what the user should understand or do.

---

# CORRECTNESS BUGS DISCOVERED DURING NORMAL/LIVE TESTING

## Startup greeting

Observed bug:

after the user's first Normal message, the startup greeting appeared above the user's message.

Desired behavior:

startup greeting is orientation, not transcript history.

It should not suddenly become visible above the first user message once Normal conversation starts.

Inspect current working tree to verify whether the greeting filtering correction is present.

---

## Existing response replay on LIVE transition

Observed bug:

after tapping LIVE, the already-rendered GEORGE response replayed/re-rendered before new blue briefing context appeared.

Desired behavior:

existing delivered messages are immutable presentation history.

LIVE/preparation state changes must not replay an existing assistant response.

Only a genuinely new assistant delivery should animate/type.

Inspect current typewriter/message-delivery logic before changing it.

---

# QUALIFICATION DOCTRINE CHANGE

Historical adaptive sequencing qualification previously enforced:

first Normal LIVE click immediately enters adaptive preparation.

That doctrine is obsolete.

New doctrine:

Tap 1
→ LIVE orientation / context choice

Tap 2
→ authorize current Normal context as starting point for adaptive LIVE briefing

Then adaptive sequencing continues.

The adaptive sequencing qualification was being updated accordingly during the previous thread.

Inspect:

scripts/george-adaptive-sequencing-qualification.mjs

Also inspect:

scripts/george-normal-live-partnership-qualification.mjs

Do not restore obsolete one-tap behavior merely to satisfy a stale qualification.

---

# RECENT BUILD / COMPILER STATUS

During the Normal/LIVE partnership implementation, several compiler/qualification issues were corrected one at a time:

- stale one-tap adaptive sequencing qualification;
- receiver-profile ternary syntax;
- verification Ready Room back-owner declaration ordering.

After those corrections, a full production build completed successfully.

Then a final requested patch was supplied for:

- neutral/toggleable thumbs;
- thumbs under user messages;
- tighter Normal brevity;
- stronger active LIVE orientation language;
- second-tap briefing authority.

No subsequent build output for that final patch was shown before handoff.

Therefore:

**Do not assume the current working tree is green.**

First inspect.

Then run focused qualifications and production build.

---

# IMMEDIATE NEXT THREAD PROCEDURE

1. cd ~/ai-clarity

2. Inspect:

git status -sb
git diff --check
git diff --stat

3. Inspect complete diffs for all modified files.

4. Determine whether the final feedback/brevity/LIVE correction patch is already present.

5. Do NOT reapply any patch that is already present.

6. Run focused qualifications:

node scripts/george-adaptive-sequencing-qualification.mjs
node scripts/george-normal-live-partnership-qualification.mjs

7. Run:

npm run build

8. Resolve failures one at a time.

9. Perform the shortest behavior test:

- fresh Normal conversation;
- startup greeting does not enter transcript;
- user thumbs neutral/toggleable;
- GEORGE thumbs neutral/toggleable;
- narrow Normal response is concise;
- LIVE first tap explains active support;
- existing response remains static;
- second tap begins blue adaptive briefing;
- no premature final "LIVE not useful" judgment;
- Something else preserves Traditional LIVE route;
- verification route reaches Popup 3 when legitimately prepared;
- Popup 3 receiver choice explains Visual vs Audio;
- "Intelligent communication doesn't work without your voice." remains present.

10. Only after behavior and build are green:

- remove current temporary `.pre-*` backups associated with this phase;
- inspect final diff;
- synchronize production documentation if behavior/doctrine changed;
- commit in a bounded production checkpoint;
- push;
- create a recovery tag if appropriate.

---

# DO NOT DRIFT

Do not:

- redesign the runtime;
- introduce a new LIVE recommendation engine;
- create a verification-call runtime;
- create a second Normal intelligence;
- move Operational Judgment into presentation;
- turn LIVE into passive listening;
- make GEORGE promote LIVE merely to demonstrate the feature;
- require full Traditional briefing when GEORGE already possesses the necessary preparation evidence;
- flatten legitimate LIVE routes;
- remove blue briefing-state meaning;
- remove milestone recognition from Moment Marker;
- waste mobile space;
- restore persistent low-value response controls;
- commit a failed build.

The product objective remains:

**One operational intelligence that reasons, prepares, executes with the user, tests reality when necessary, learns from execution, and moves the user toward the desired outcome.**

--------------------------------------------------
LH-3A2 — AUTHORIZED HOMEPAGE QUESTION TRANSPORT
--------------------------------------------------

Homepage preparation now preserves the user’s exact answer or Current
Understanding revision before submitting the same canonical Homepage
Preparation Session to the shared Operational Preparation Judgment ingress.

Operational Judgment remains the sole authority that determines whether another
material signal should be acquired. When acquisition is authorized, the exact
requested signal and authorization provenance are passed unchanged to the
signal-question formulation owner. Homepage requests without that authorization
cannot enter independent evidence selection.

The absence of an authorized question does not establish LIVE readiness.
ENTER LIVE remains inactive until the later canonical minimum-viable-support
judgment is implemented. Normal preparation behavior, shared runtime ownership,
and Patch 4 preparation-evidence transport remain unchanged.

--------------------------------------------------
LH-3A3d1 — CLASSIFICATION CONTRACT CHECKPOINT
--------------------------------------------------

The canonical preparation-turn classification gate is now implemented in
Operational Judgment and transported through the existing `/api/chat` runtime
response. The Normal provider remains a non-authoritative semantic proposal
source. Explicit `live_briefing` or `preparation` intent is authoritative;
inferred proposals are validated, and missing, malformed, or contradictory data
fails closed to `clarification_required` without mutating prior accepted state or
resolving the pending question.

Do not reimplement this classification in the homepage, controller, or
signal-question route. Do not remove `ask_george` as part of this checkpoint.
The next smallest patch is the bounded homepage consumer/UI conversion to the
visible `LIVE briefing | Preparation` control using the accepted metadata
already returned by `/api/chat`.

--------------------------------------------------
LH-3A3d2a — REALIZATION PREREQUISITE
--------------------------------------------------

The canonical post-classification conversational-realization boundary is now
implemented. Operational Judgment distinguishes Preparation response,
clarification, and LIVE-briefing assessment; `/api/chat` invokes the existing
Normal provider execution path only after a Preparation classification is
accepted and returns the response through the existing Operational Judgment
result message.

Preparation remains unable to mutate accepted evidence, Current Understanding,
readiness, outcome potential, pending-question satisfaction, Formula, story,
mechanics, or LIVE behavior. Clarification invokes no substantive provider
execution. The homepage has not yet consumed this boundary. Its UI migration is
the next smallest patch. The Homepage and LIVE Entry `ask_george` callers and the
signal-question response branch remain intact pending a separately authorized
dead-code milestone.

--------------------------------------------------
LH-3A3d2b — HOMEPAGE CONSUMER CHECKPOINT
--------------------------------------------------

The homepage now consumes the d1 classification gate and d2a realization
boundary through `/api/chat`. It presents `LIVE briefing | Preparation`, sends
null explicit intent for inferred turns, scopes manual intent to one
submission, and updates the visible mode only from the accepted Operational
Judgment classification.

Preparation leaves the Preparation Session and pending operational question
unchanged. Clarification holds and automatically resubmits the original turn
without retyping or an extra submit action. The homepage no longer calls the
signal-question `ask_george` branch. Traditional/LIVE Entry still does, so the
branch is reachable and must remain until a later separately authorized
dead-code milestone proves otherwise. Do not begin review, mechanics, final
story, or LIVE-room redesign from this checkpoint.

--------------------------------------------------
LH-3A3e — GOVERNED COMMUNICATION CHECKPOINT
--------------------------------------------------

Implemented ownership:

- the existing provider semantic pass proposes communication-change meaning;
- Operational Judgment alone accepts, rejects, narrows, or requests
  clarification and records affected state;
- Execution Policy realizes accepted effects without reopening scope;
- recent conversation context produces a bounded Adaptive User Profile with
  repetition, recency, and contradiction handling;
- Durable Behavioral Memory identifies candidates but does not persist them;
- confirmed speaking style reaches the existing LIVE runtime context;
- LIVE role etiquette requires repeated weighted role evidence;
- Receiver Policy and presentation retain shaping/display-only authority.

No ordinary-turn provider call, tone engine, memory system, style picker,
reasoning lane, or LIVE intelligence was added. Room- and session-scoped
changes remain non-durable. The existing authorized persistence boundary was
not modified.

Remaining dependency: `transcriptBuffer.getDominantRole()` is consumed by the
LIVE orchestrator, but no production `transcriptBuffer.add()` caller was found.
The evidence threshold is qualified, while production role ingestion remains
unconnected and must not be replaced by a new role system.

The dead-code ledger records unused posture definitions, uncalled governed cue
memory, unused preferred-support-tag retrieval, and disconnected duplicate
communication-baseline paths. Removal is not authorized in LH-3A3e.

--------------------------------------------------
LH-3A3k2 — OUTCOME INTELLIGENCE HANDOFF
--------------------------------------------------

Desired-outcome sufficiency and adaptive candidate discovery remain in
`lib/george/runtime/provider/normal-provider.ts`. Clear user-stated preferred
outcomes now anchor preparation without a redundant request for the outcome or
for a reliably implied conversation type. Reasonable interaction inference is
carried separately from confirmed evidence.

After each answer, the provider reassesses the complete record, compares the
strongest supported action with the single highest-value unresolved user-owned
fact, and supplies a plain-language consequence for that fact. Operational
Judgment alone authorizes acquisition; the signal-question layer only realizes
the authorized wording.

The fixed direct-outcome question in
`lib/george/live-runtime/authorized-signal-question.ts` remains reachable for a
genuinely ambiguous missing outcome. It is not a duplicate selection owner and
was not changed. No suspected new dead code was found. Run
`npm run george:outcome-intelligence:qualify`, `npx tsc --noEmit`, and
`npm run build` before any commit. Do not commit without explicit approval.

--------------------------------------------------
LH-3A3k3 — HOMEPAGE INTELLIGENCE TIER INTERFACE HANDOFF
--------------------------------------------------

The compact S / I / B tier interface on `/george/live-home` is implemented and
qualified.

Preserve these boundaries:

- Smart, Intelligent, and Brilliant are the three Homepage intelligence-tier
  choices.
- entitlement comes from canonical session/subscriber authority;
- available-tier selection persists locally without clearing the briefing;
- an intentional locked-tier selection routes to `/activate`;
- no persistent Keep Smart / Upgrade panel is part of the approved surface;
- hover, keyboard focus, and temporary mobile-tap disclosure remain supported;
- semantic pressed state, focus treatment, touch targets, and mobile overflow
  protection remain qualified;
- the tier controls remain in the existing action row with the single
  SKIP / SUBMIT control;
- `/george/live-home` continues to use `HomeConversationTypeSurface`;
- no new route, reasoning authority, preparation owner, or LIVE runtime was
  introduced.

Focused qualification:
`npm run george:live-home-tier-interface:qualify`.

Do not invent LH-3A3k4 from this checkpoint. Determine the next product
milestone from current implementation evidence and owner direction.
