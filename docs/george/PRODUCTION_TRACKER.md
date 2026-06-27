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

