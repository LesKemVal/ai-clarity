# GEORGE Production Handoff — No Drift

## Authority

`GEORGE_DOCUMENTATION_SYNC: 2026-08-05-conversation-summary-runtime`

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
- Current HEAD: `d2b412f06de4058c6f55fe3c553c008417f9a27f` (`d2b412f0 Qualify staged live visual presentation`)
- Ahead of `origin/conversation-summary-runtime`: 11 commits at synchronization start
- Production build status: PASS after the required validation for this documentation synchronization
- Worktree status: clean at synchronization start; dirty at handoff only for the six approved documentation/qualification files, with no production implementation changes
- Commit status: stopped before commit

No recovery tag is declared for this handoff.

## Current Validated Phase

GEORGE is in **Production Completion — user-directed briefing, route-aware preparation, and receiver-specific LIVE presentation**.

The current implementation preserves one operational intelligence, one runtime, and one reasoning authority. Normal and LIVE remain operating modes, not separate intelligences.

## Recently Completed Milestones

### Adaptive briefing continuity

- Homepage and LIVE Entry construct canonical `priorInteractions` containing key, original question, answer when present, and answered/skipped status.
- The signal-question governor prefers submitted canonical history and preserves legacy `priorAnswers` and `skippedQuestions` without duplicating equivalent interactions.
- Homepage presents the initial Continue Briefing explanation once, then keeps **START LIVE** and **NEXT QUESTION** under user control.
- LIVE Entry requests one additional interaction only after explicit **Continue Briefing** action.
- Answer, skip, and “I don't know” return control to the appropriate decision/readiness surface; no recursive automatic question loop remains.
- Homepage handoff and LIVE Entry hydration preserve optional answers, question history, skipped keys, and canonical interaction history.

Canonical owners:

- `components/home/HomeConversationTypeSurface.tsx`
- `app/api/george/live/signal-question/route.ts`
- `app/george/live-entry/LiveEntryClient.tsx`

### Route-aware preparation and progressive Ready Room

- Traditional/direct routes retain Popup 2 as the mechanics configuration owner.
- Traditional Popup 3 summarizes confirmed mechanics and routes Change back to Popup 2.
- Homepage Popup 3 reviews a current-session support recommendation instead of silently restoring stale prior LIVE setup.
- The Homepage assessment uses two-stage review/agreement and collapses after confirmation.
- Ready Room progressively reveals Formula and final room actions while preserving Formula, Script, Library return, Continue Briefing, and Enter LIVE state.

Canonical owner:

- `app/george/live-entry/LiveEntryClient.tsx`

### ContextFraming for typed/composer LIVE

- `app/george/page.tsx` sends canonical `mode: "conversation"` for typed/composer LIVE requests.
- Visual LIVE responses preserve provider-owned framing-before-guidance ordering.
- Audible LIVE responses retain the compact voice path.
- Normal GEORGE behavior is unchanged.

Canonical owners and consumers:

- `lib/george/runtime/context-framing.ts` — `ContextFraming` selection
- `lib/george/chat/presentation-authority.ts` — framing-before-guidance ordering
- `app/george/page.tsx` — browser-host request and rendering integration

### Evidence-first automatic Hub visual presentation

- Existing `GeorgeOperationalAssessment.action`, `.evidence`, and `.outcomeImpact` feed a pure visual presentation plan.
- Meaningful evidence can render first, followed by the recommended action; absent evidence preserves a single stage.
- Audio remains compact and unchanged while visual delivery may stage evidence first.
- `LiveHubVisualCueBridge` executes plans, cancels replaced sequences, rejects stale callbacks, refreshes timing per stage, and cleans up on deactivation/unmount.
- Approved-delivery replay without an operational assessment remains single-stage.
- Build-gated qualification protects planning, suppression, modality, timing, cancellation, cleanup, and executor-only ownership.

Canonical owners:

- `lib/george/live-runtime/operational-assessment.ts` — action/evidence/outcome-impact reasoning output
- `lib/george/live-delivery/receiver-policy.ts` — receiver composition and modality
- `lib/george/live-delivery/delivery-router.ts` — delivery cue construction
- `lib/george/live-delivery/visual-presentation-policy.ts` — staged presentation planning
- `components/george/live/LiveHubVisualCueBridge.tsx` — plan execution only
- `scripts/george-live-delivery-policy-smoke.mjs` — staged-delivery qualification

No new runtime, reasoning authority, delivery owner, or artifact intelligence was introduced.

## Current Next Work

Recommended next inspection milestone:

Inspect the Homepage current-session support recommendation resolver in `app/george/live-entry/LiveEntryClient.tsx` against structured briefing evidence. Trace conversation type, desired outcome, role, context, optional answers, `priorInteractions`, communication medium, and participant/decision-maker evidence before proposing any patch.

Current unresolved production priorities, in order:

1. Improve current-session support recommendation quality from structured briefing evidence.
2. Ensure desired outcome remains a hard readiness requirement wherever required by the production flow.
3. Finish Formula/Marketplace recommendation and empty-state experience.
4. Manually verify Homepage → Library → Ready Room continuity, including Formula and Script preservation.
5. Continue progressive-disclosure polish, including traditional Popup 1.
6. Inspect no-intervention reason propagation and deliberate visual-only support through existing canonical owners.
7. Preserve staged visual behavior with its build-gated qualification.
8. Synchronize documentation continuously.

Do not mark these priorities complete without implementation evidence and validation.

## No-Drift Discipline

- Inspect implementation before editing.
- Identify the canonical owner and duplicate ownership before patching.
- Patch only the canonical owner unless a multi-owner milestone is explicitly approved.
- Do not create another GEORGE, LIVE runtime, reasoning authority, briefing governor, delivery owner, presentation authority, or artifact intelligence.
- Keep Popup 2 as the traditional mechanics owner and Popup 3 as the route-aware Ready Room convergence surface.
- Keep `LiveHubVisualCueBridge` an executor; evidence ordering belongs to visual presentation policy and evidence meaning belongs upstream.
- Do not claim structured artifact/document delivery or user-visible hold reasons unless implementation proves them.
- Do not commit, push, or open a pull request without explicit user instruction.
- Never leave or hand off a failing production build.

## Documentation Synchronization Rule

A production milestone that changes observable behavior, ownership, runtime flow, qualification, or product doctrine is not complete until either the synchronized authority set is updated in the same milestone, or the change is explicitly recorded as implementation-ahead documentation debt in `PRODUCTION_TRACKER.md` and `NEXT_THREAD_HANDOFF.md`.

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
npm run george:live-delivery-policy:smoke
npm run george:documentation:qualify
```

After validation, inspect `git status --short` and the complete scoped diff. Stop before commit.
