# GEORGE Production Tracker

Living project document. Update before moving to a new thread.

## Current Branch

`live-hub-runtime`

## Current Phase

Production hardening and portability.

Do not redesign GEORGE.

Prioritize:
- reliability
- portability
- authority
- latency
- maintainability
- correctness

## Product Philosophy

GEORGE is not a chatbot.

GEORGE is operational intelligence.

Normal GEORGE prepares.

LIVE executes.

Same intelligence. Different operating mode.

OpenAI reasons.

GEORGE decides.

Signals inform GEORGE.

GEORGE optimizes for successful outcomes while preserving user agency.

Communication precedes execution.

Conversation is execution.

## Architecture Discipline

Page/UI owns:
- what the user sees
- what the user touches
- interaction
- presentation
- signal collection

Helper modules own:
- deterministic UI support
- reusable option generation
- formatting

LIVE Hub owns:
- operational understanding
- runtime context
- signal interpretation
- decision making
- support selection

Reasoning owns:
- OpenAI prompting
- response construction
- adaptive reasoning
- support optimization

Delivery owns:
- voice delivery
- visual delivery
- silent delivery
- timing
- routing

Do not violate these boundaries.

## LIVE Entry Direction

Mandatory signal:
1. Name
2. Desired conversational outcome
3. Responsibility in this conversation

After mandatory signal, user can enter LIVE.

Additional briefing is optional.

Additional briefing improves support.

Additional briefing never grants permission.

## Responsibility Model

Signal 3 asks:

"What is your responsibility in this conversation?"

Tier behavior:
- Smart: one responsibility
- Intelligent: up to two responsibilities
- Brilliant: multiple responsibilities later

Current files:
- `app/george/live-entry/LiveEntryClient.tsx`
- `lib/george/live-entry/responsibility-options.ts`

## Briefing Direction

After mandatory questions, GEORGE should ask one optional operational question before OpenAI adaptive briefing.

Purpose:

Acquire the single highest-value signal most likely to improve the user's probability of a successful outcome.

Then OpenAI can continue optional adaptive briefing.

## Readiness / Confidence Direction

GEORGE should explain readiness without gating access.

Show:
- what GEORGE understands
- what GEORGE can already help with
- what additional briefing may improve

Enter LIVE must remain available once unlocked.

## Runtime Direction

Briefing knowledge must reach LIVE reasoning.

Relevant files:
- `lib/george/live-voice/live-reasoning.ts`
- `app/api/george/live/govern/route.ts`
- `lib/george/live-hub/types.ts`
- `lib/george/live-runtime/prep-runtime.ts`

## Telemetry Direction

Telemetry currently covers:
- turn start
- mic open
- first audio chunk
- STT timing
- hub queue
- hub flush
- hub receive
- delivery cue
- visual render
- TTS request
- TTS receive
- playback complete

## Current High-Priority Todo

- Test responsibility selector end-to-end.
- Confirm Smart / Intelligent / Brilliant responsibility limits.
- Confirm Other field submits and collapses.
- Add GEORGE’s single highest-value optional question.
- Add readiness/confidence explanation under the answer field.
- Verify Enter LIVE stays available during optional briefing.
- Re-test LIVE memory with an interview scenario.
- Continue runtime latency testing.

## Working Rules

No page.tsx bloat.

No manual coding.

Use paste-ready scripts.

Inspect before patching.

Small commits.

Build before commit.

Do not commit if build fails.

Do not add git save/commit commands inside build patches.


# =====================================================================
# CONTINUITY MEMORY (LOCKED PRODUCT DIRECTION)
# =====================================================================

## Product Principle

Continuity is an internal GEORGE capability.

It is not a user workflow.

Users should never need to manually manage memory.

GEORGE owns continuity.

Normal GEORGE and LIVE share the same continuity system.

There is one GEORGE.

---

## Mission

Every completed session automatically produces a structured continuity object.

Future sessions automatically retrieve relevant continuity whenever the user naturally references:

- a project
- a previous discussion
- a prior decision
- a meeting
- an interview
- a negotiation
- a company
- a customer
- a repository
- a feature
- a runtime
- an architecture discussion

Users should interact naturally.

GEORGE should understand naturally.

---

## Internal Rule

Continuity retrieval happens before reasoning.

Reasoning always operates from:

Current Conversation

+

Relevant Continuity

+

Current User Signal

GEORGE should reason as though work has been continuous across sessions.

---

## Retrieval Philosophy

Reason from signals.

Not exact words.

Examples:

"Continue GEORGE."

"Resume production."

"Let's work on LIVE."

"Go back to the Amazon interview."

"Continue yesterday."

"Remember the confidence meter."

GEORGE should identify the correct project and retrieve the appropriate continuity automatically.

---

## Continuity Hierarchy

User

↓

Projects

↓

Sessions

↓

Decisions

↓

Artifacts

↓

Files

↓

Commits

↓

Next Actions

Projects own sessions.

Sessions accumulate project knowledge.

Nothing is lost between sessions.

---

## Continuity Object

Each completed session should automatically capture:

• project identity

• session objective

• decisions made

• philosophy changes

• architecture changes

• files modified

• commits created

• testing completed

• runtime changes

• completed work

• unfinished work

• blockers

• risks

• recommended next actions

This object exists for retrieval.

It is not simply a conversation summary.

---

## Project Resolution

One user may have multiple projects.

Each project maintains its own continuity chain.

GEORGE should determine which project the user means through conversational signals.

If ambiguity exists,

GEORGE may ask one clarifying question.

Otherwise,

retrieve automatically.

---

## User Agency

The user remains authoritative.

Users may always request:

• ignore previous work

• compare earlier sessions

• restore an earlier direction

• continue another project

• start a completely new project

Automatic continuity never overrides explicit user intent.

---

## Future Direction

Continuity should eventually support:

• project timelines

• architecture history

• decision history

• milestone tracking

• searchable sessions

• cross-project reasoning

• confidence scoring

• automatic project health reports

• automatic production summaries

Continuity becomes one of GEORGE's core runtime systems.


# Delivery Router / Authority Notes

Current authority replacement is working.

Observed in delivery-router test:

- unsupported high-risk continuation was detected
- authority replacement triggered correctly
- replacement preserved user trajectory instead of inventing facts

Current improvement to make:

- Add `replacementText` to authority replacement logs so debugging shows:
  - original text
  - replacement text
  - reason
  - unsupported terms

Future architecture improvement:

`delivery-router.ts` currently builds continuation evidence locally.

That should eventually move into shared verification ownership:

`lib/george/core/verification/evidence-builder.ts`

Reason:

Delivery should own routing and presentation.

Verification should own evidence construction.

This is not urgent. Runtime behavior should not change during the logging patch.

# =====================================================================
# CONTINUATION DOCTRINE (LOCKED)
# =====================================================================

## Principle

Continuation is not a text completion problem.

Continuation is an operational routing decision.

Before generating a continuation, GEORGE determines which continuation is possible.

---

## Runtime Decision

Question:

"Is there sufficient evidence to continue the user's content?"

If YES:

Evidence Continuation.

If NO:

Structural Continuation.

There are no other continuation modes.

---

## Evidence Continuation

Evidence Continuation is used when the missing thought is already supported by:

- mandatory briefing
- optional briefing
- previous conversation
- LIVE observations
- runtime memory
- established facts

GEORGE may continue the user's thought because sufficient evidence exists.

Optimization:

- preserve intent
- preserve objective
- preserve meaning
- preserve conversational momentum

---

## Structural Continuation

Structural Continuation is used when the missing fact is unknown.

GEORGE does not invent facts.

Instead GEORGE optimizes communication.

Optimization:

- preserve trajectory
- preserve pacing
- preserve articulation
- preserve rhetoric
- preserve conversational control
- preserve confidence
- preserve objective

Structural Continuation never fabricates content simply to finish a sentence.

---

## Operational Rule

GEORGE does not ask:

"What probably comes next?"

GEORGE asks:

"What kind of continuation is supported?"

This is an operational routing decision.

Not a language prediction task.

---

## Product Philosophy

Autocomplete predicts.

GEORGE decides.

Autocomplete optimizes probability.

GEORGE optimizes successful outcomes while remaining faithful to available evidence.

Evidence first.

Communication second.

Hallucination never.

---

## Future Runtime

Continuation pipeline

User pauses

↓

Determine evidence sufficiency

↓

Evidence sufficient?

YES
    ↓
Evidence Continuation

NO
    ↓
Structural Continuation

Both remain Continuation.

The routing decision is internal.

Users should not perceive different modes.


# Production Readiness Status

Architecture is substantially complete.

Current ownership doctrine:

- User owns support style.
- Presentation owns controls.
- LIVE Hub owns runtime state.
- GEORGE Core owns operational judgment.
- Delivery owns execution.

Verified:
- Briefing data reaches LIVE.
- Support style persists into LIVE.
- Cue doctrine is aligned with runtime reasoning.
- Continuation authority guard works.
- Delivery authority replacement logs original and replacement text.
- Mechanics explains what GEORGE can already do with the room signal.

Remaining production cleanup:
1. Move governed cue injection out of page.tsx into runtime orchestration.
2. Move final authority repair fully into GEORGE Core before Delivery.
3. Continue reducing page.tsx toward orchestration-only.
4. Keep reducing duplicate ownership without changing product behavior.

Production estimate:
- Architecture: 98%
- Production hardening: 90–95%
- Portability readiness: ~90%

No redesign. No new philosophy. Finish implementation, reduce duplication, validate runtime.

# Architecture Freeze Milestone

The core LIVE runtime architecture is now considered stable.

Latest completed ownership work:

- Governed LIVE cue memory handling moved out of page.tsx.
- LIVE response form classification extracted into runtime helper.
- ACTION_CUE authority finalization moved into GEORGE Core.
- Delivery no longer owns semantic repair.
- Delivery now tracks cue revisions and suppresses exact duplicates.

Current runtime contract:

- User owns desired outcome, support style, and final judgment.
- Presentation owns controls and visualization.
- LIVE Hub owns runtime state and synchronization.
- GEORGE Core owns operational judgment, evidence, authority, continuation, response shaping, and semantic meaning.
- Delivery owns voice, visual, silent, suppression, timing, modality, and revision execution.
- Delivery may not alter operational meaning.

Acceptance test for every future change:

1. Does this materially improve GEORGE's ability to help the user reach their desired outcome?
2. Does this preserve a single operational GEORGE across every runtime?

Next phase:

- Long-session validation.
- Latency measurement and optimization.
- Continued page.tsx reduction.
- Portability packaging.



# Behavioral Validation Phase (June 2026)

## Principle

Every change to GEORGE must answer one question before it is accepted:

> Does this improve GEORGE's ability to help the user reach their desired outcome?

Architecture alone is insufficient.

Passing builds are insufficient.

Passing smoke tests are insufficient.

Behavior must remain aligned with GEORGE doctrine.

Behavioral tests exist to verify operational judgment rather than implementation details.

If a behavioral test fails, the preferred solution is to improve GEORGE's reasoning—not weaken the test.

---

## Behavioral Validation Pyramid

Level 1
Build

Can the project compile?

Level 2
Production Readiness

Is the architecture in the expected production state?

Level 3
Operational Validation

Do runtime contracts remain intact?

Level 4
Behavioral Validation

Does GEORGE behave according to doctrine?

Level 5
Operational Flow Validation

Can GEORGE successfully move users toward their desired outcome through realistic conversation?

Future levels should extend this pyramid rather than replace it.

---

## Current Behavioral Coverage

Current scenarios:

✓ Continuation authority repair

✓ Cue doctrine boundary

✓ Cue runtime behavior

✓ Cue depth adaptation

✓ Response runtime behavior

✓ Desired outcome preservation

✓ Outcome change detection

✓ Operational investor outcome flow

✓ Delivery meaning preservation

✓ Briefing propagation

✓ Long-session stability

✓ Intervention timing

✓ Delivery commitment

✓ Post-conversation intelligence

✓ Outcome progression

Behavioral Suite Status:

15 / 15 passing

---

## Important Production Discovery

Behavioral testing exposed a real architectural weakness.

GEORGE's response policy originally ignored the user's desired outcome when selecting a response.

The runtime instead optimized for the latest conversational event.

Behavioral testing identified this because the Desired Outcome Preservation scenario failed.

Rather than weakening the test, the runtime was improved.

Desired outcome is now an input to LIVE response policy selection.

This is considered a production milestone.

---

## Production Testing Doctrine

Behavioral tests should verify doctrine.

They should not verify implementation details.

Tests should survive refactoring.

Tests should describe observable behavior.

Future contributors should feel comfortable rewriting implementation provided every behavioral scenario continues to pass.

Behavior is the contract.

---

## Next Behavioral Milestones

Priority 1

Long-session stability

Verify:

• desired outcome remains stable

• support style never changes

• cue depth adapts correctly

• no conversational drift

• no repetitive degradation

Priority 2

Intervention timing

Verify:

• cue

• continuation

• response

• presentation

• silence

occur only when operationally appropriate.

Priority 3

Signal sufficiency

Verify GEORGE advances using available evidence whenever reasonable and requests additional signal only when it materially improves the next move.

Priority 4

Recovery behavior

Verify GEORGE successfully recovers from:

interruptions

forgotten thoughts

objections

room changes

corrections

noisy transcripts

while preserving user objective.

---



## Intervention Timing Doctrine

Timing is part of correctness.

Cue is the default/adaptive support style.

Cue means GEORGE chooses the smallest effective intervention needed to move the user toward the desired outcome.

Cue depth is GEORGE's adaptive decision inside Cue.

Support style does not change.

Depth may change.

Least possible words remains the optimization.

Continuation occurs only after a genuine continuation opportunity.

Response occurs only when a complete response is warranted or selected.

Presentation occurs only when the user selected Presentation.

Silence occurs when intervention would not improve the outcome or user agency requires GEORGE to hold.

## Core Testing Philosophy

GEORGE is not tested because code changed.

GEORGE is tested because user outcomes matter.

Every behavioral scenario should answer:

Did this increase the probability that the user reaches their desired outcome?

If the answer is no,

the implementation is incomplete.



---

# Post-Production Architectural Consolidation (Do Not Perform Before Production)

Purpose:

Reduce architectural duplication.

Improve portability.

Do **not** change externally observable behavior.

Behavioral certification remains authoritative.

---

## Outcome Priority Authority

Current outcome reasoning is intentionally distributed while production hardening continues.

After production:

Extract a single Outcome Priority Authority.

Target flow:

Highest-Priority Desired Outcome

↓

Operational Intervention

↓

Response Policy

↓

Delivery Authority

↓

Delivery

Every runtime subsystem should consume the active prioritized desired outcome from this authority instead of independently inferring outcomes.

---

## Bridge Selection Authority

Current bridge behavior spans several runtime components.

Do not introduce additional bridge libraries.

After production:

• consolidate bridge selection into one authority

• preserve existing wording

• remove duplicated bridge logic

• maintain one operational source of truth

Bridge selection remains behavioral.

Bridge wording remains portable.

---

## Intent Classification Authority

Intent recognition currently exists in multiple runtime modules.

Examples include:

• "what do I say"

• "help me"

• "jump in"

• "say something"

After production:

Extract one shared runtime intent classifier.

All runtime systems should consume identical intent classifications.

---

## Response Policy Evolution

Current response policy is event-oriented.

Long-term target:

Highest-Priority Desired Outcome

↓

Operational Intervention

↓

Response Form

↓

Delivery

rather than event-first reasoning.

This is an architectural simplification only.

Behavior must remain identical.

---

## Runtime Philosophy

Every runtime decision should eventually answer one question before execution:

Does this measurably increase the probability of achieving the user's highest-priority desired outcome?

If not,

GEORGE should not do it.

This doctrine governs:

• reasoning

• cue depth

• response

• presentation

• silence

• delivery timing

• bridges

• commitment

• post-conversation intelligence

• portability

Everything else is implementation.

---

Production First.

Refactor Later.

Behavior is the contract.

Architecture serves behavior.



---

## Post-Production Removal Candidates

These appear to be remnants of earlier scenario-specific runtime iterations rather than the current outcome-first architecture.

Do not remove until production certification is complete and behavioral validation confirms no dependency.

### Candidate removals

Objective templates

- LIVE_OBJECTIVES
- LiveObjectiveId

Scenario objectives

- secure_raise
- book_appointment
- stay_safe
- deescalate
- hold_frame

Scenario inference

- inferObjectiveHypothesis()
- inferObjectiveFromText()

Scenario reinforcement

- reinforceObjective()

### Removal criteria

Before deleting any candidate:

✓ no production runtime dependency

✓ no behavioral test dependency

✓ no delivery dependency

✓ no portability dependency

✓ no regression in behavioral certification

### Replacement doctrine

GEORGE no longer reasons from predefined scenarios.

GEORGE reasons from:

Prioritized Desired Outcomes

↓

Operational Signals

↓

Probability of Success

↓

Operational Intervention

↓

Delivery

No scenario-specific objective tables should remain in the production runtime once migration is complete.

