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
- Current HEAD: `00ba538b Complete conversational preparation and session continuity`
- Ahead/behind `origin/conversation-summary-runtime`: ahead 17, behind 0 at synchronization start
- Production build status: PASS after the required validation for this synchronization
- Worktree status: implementation checkpoint committed; documentation and approved front-page UI remain the next scoped changes
- Commit status: stopped before commit

No recovery tag is declared for this handoff.

## Current Validated Phase

GEORGE is in **Production Completion — conversational preparation and session continuity**.

The Preparation Runtime is the canonical lifecycle authority. `PreparationSessionV1` is the versioned state for one preparation. Routes seed or restore the session while preserving distinct user experiences; they do not create separate runtimes or reasoning authorities.

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

Next implementation milestone: implement an explicit Normal GEORGE handoff and LIVE Entry hydration for the canonical Preparation Session while preserving the current Normal user flow and legacy read compatibility.

Smallest ordered sequence:

1. Add deliberate Normal handoff session identity and current-session preparation knowledge at the existing Normal browser-host integration boundary.
2. Validate both `preparationSessionId` and `normalSessionId` in LIVE Entry before restoring the session; never trust storage-key existence alone.
3. Hydrate the session and derive the existing destination and runtime outputs without changing popup flow.
4. Add focused Normal-to-LIVE qualification.
5. Migrate meaningful Resume eligibility and restoration.
6. Remove legacy preparation paths only after every route migration is qualified.
7. Introduce future Strategy transitions only through the shared Preparation Session workflow.
8. Synchronize all four production authorities whenever these statuses change.

Current product priorities that remain open include structured support-recommendation quality, Formula/Marketplace recommendation and empty states, manual Homepage → Library → Ready Room continuity, and continued progressive-disclosure polish.

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
