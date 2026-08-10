# GEORGE Production Handoff — No Drift

## Authority

`GEORGE_DOCUMENTATION_SYNC: 2026-08-05-preparation-session-routing`

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
- Current HEAD: `2df3d23d Correct live transcript packet qualification`
- Ahead/behind `origin/conversation-summary-runtime`: ahead 65, behind 0 at synchronization start
- Production build status: PASS at the current refinement checkpoint after the full post-synchronization production regression/build chain; focused behavior, ownership, portability, interface-freeze, resilience, and qualification regression guards also PASS
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
