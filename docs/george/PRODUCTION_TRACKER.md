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

- Keep production documentation synchronized with implementation.
- Continue refining Brief Room presentation using the existing Preparation Runtime.
- Improve reusable documentation presentation inside Brief Room.
- Improve selection of related Conversation Packages before Preparation.
- Continue Relevant Documentation attachment and reuse inside Conversation Packages.
- Continue end-to-end latency measurement through microphone, Deepgram, reasoning, delivery, Cartesia, and playback.
- Continue production hardening through modular smoke suites.
- Continue portability and runtime extraction where page orchestration grows.

## Working Rules

No page.tsx bloat.

No manual coding.

Use paste-ready scripts.

Inspect before patching.

Small commits.

Build before commit.

Do not commit if build fails.

Do not add git save/commit commands inside build patches.


## Production Validation Gate

Production validation is now modular.

Current protected smoke suites:

- `george:core:smoke`
- `george:live-entry:smoke`
- `george:conversation-package:smoke`
- `george:live-runtime:smoke`
- `george:preparation:smoke`

`npm run build` runs all five smoke suites before `next build`.

Do not return to a single monolithic behavioral-suite metric.

Add focused smoke suites as production subsystems mature.


## Current Production Runtime Loop

Current validated production loop:

Preparation

↓

LIVE

↓

Outcome Review

↓

Conversation Package

↓

Conversation Record

↓

Preparation

This loop is implemented, smoke-tested, documented, and now surfaced in Brief Room.

Conversation Records and related Conversation Packages can influence future preparation through the existing Preparation Runtime.

## Engineering / Tooling Notes

GitHub connector repository search can produce false negatives for existing symbols and files.

Do not treat connector search misses as evidence that runtime modules are absent.

For repository-wide inspection, prefer local `rg` / `git grep` before adding, moving, or duplicating runtime modules.


---

## Production Runtime Phase Commitments

These commitments reflect the current production direction and should be treated as implementation commitments unless superseded by validated code or architecture.

### Homepage

Homepage is considered production quality.

Completed direction:

- `public/hero/glasses21.png` is the production hero image.
- Signals appear and disappear sequentially.
- Support renders only after the final signal disappears.
- Signals never render on the glasses.
- `GEORGE is thinking...` replaced `Understanding.`
- `Audio` is presented as text rather than an image.
- LIVE Support button is renamed.
- Conversation scenarios rotate automatically.
- Support rendering remains intentionally smaller so it does not dominate the hero.

Remaining verification:

- desktop spacing and unnecessary whitespace
- final copy emphasizing LIVE Support, underserved communities, neurodivergent users, people with speech and communication disabilities, professionals, entrepreneurs, interviews, fundraising, Cartesia, and Deepgram
- concrete outcome-oriented messaging such as `Forty-one cents could help secure the job.`

### LIVE Entry

Final readiness sequence:

GEORGE says:

> Everything looks good.
>
> I'll keep listening and help when it matters.
>
> Questions?

After GEORGE finishes speaking:

- microphone activates automatically
- no button press required
- user may begin speaking immediately

If approximately four seconds pass with no speech, GEORGE says:

> Alright.
>
> Let's go to work.

The `Let's go to work` button remains visible immediately, may be pressed at any time, and begins a subtle pulse after the silence timeout. `Save for later` remains available.

### Conversation Readiness

Conversation Readiness is resumable.

Every readiness panel should support:

- Save for later
- Continue later

Approved copy:

> Review your conversation readiness. Update anything that has changed. GEORGE only needs enough context to begin well. The rest is learned through the conversation.

### Relevant Documentation

The uploader already exists. Do not build another uploader.

Remaining work:

- integrate documentation into Conversation Packages
- support previous documentation
- suggest documentation from existing Conversation Packages
- automatically reuse documentation when appropriate

### Conversation Packages

Conversation Packages are now the architectural center of GEORGE.

The identification runtime exists.

The next implementation milestone is the Conversation Package Manager.

Responsibilities:

- create package
- retrieve package
- update package
- merge related packages
- attach documentation
- attach LIVE summaries
- attach learning
- track outcome progression
- determine completion

### Learning Runtime

Learning doctrine is complete. Implementation remains.

Target pipeline:

Conversation

↓

Evidence

↓

Confidence

↓

Learning

↓

Future Conversations

Support promotion, retirement, confidence thresholds, and user override.

### Conversation Summary Runtime

Conversation summaries are operational assets, not archives.

Target flow:

Conversation

↓

Outcome

↓

Summary

↓

Evidence

↓

Learning

↓

Conversation Package Update

↓

Suggested Next Action

### Voice Stack

Current production direction:

- Speech recognition: Deepgram
- Speech synthesis: Cartesia

Do not revert to ElevenLabs.

### Communication Pattern Learning

GEORGE should learn how the user communicates when repeated evidence shows that pattern improves outcomes.

Examples:

- prefers concise cues
- benefits from examples before abstractions
- prefers data before narrative
- responds better to reassurance versus direct challenge
- asks follow-up questions before deciding
- prefers numbered explanations
- tends to pause before answering under pressure

These are communication preferences, not personality traits.

### Architectural Reminder

GEORGE reasons from signals, not forms.

Forms exist only to provide enough signal to begin well.

The conversation remains the primary source of intelligence.

Never allow forms to become more important than the conversation itself.

---

## Current Clean Behavioral State

Validated clean state:

- Behavioral suite: 32 / 32 passing
- GEORGE Core Smoke: passing
- LIVE Entry Smoke: passing
- Production Build: passing
- Working tree: clean at validation checkpoint

Current operational concert flow:

LIVE Entry

↓

Conversation Package

↓

Conversation Summary Runtime

↓

Evidence Candidates

↓

Learning Runtime

↓

Learning Candidates

↓

Conversation Package Update

This concert flow proves the core continuity chain works together before persistence, storage, or UI integration.

## Production Validation Framework Status

GEORGE now has a production validation framework under:

- `scripts/george-production/README.md`
- `scripts/george-production/critical-surfaces.json`

The governing rule:

Individual behavior tests protect the part.

Concert behavior tests protect the system.

Every vulnerable operational file should eventually be listed as a critical surface with:

- targeted behavior coverage
- concert behavior coverage where applicable
- invariants
- required validation commands

Current required validation:

- `node scripts/george-behavior-suite.mjs`
- `npm run build`

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

✓ Signal sufficiency

✓ Interrupted thought recovery

✓ Objection recovery

✓ Outcome shift recovery\n\n✓ Transcript error recovery

✓ Pressure recovery

✓ Adaptive delivery evidence\n\n✓ Speech synchronization

✓ Conversation package identification

✓ Conversation package manager

✓ Conversation package LIVE Entry adapter

✓ Conversation package runtime

✓ Conversation package concert flow

✓ Conversation summary runtime

✓ Learning runtime

Behavioral Suite Status:

32 / 32 passing

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



## Adaptive Delivery Doctrine

Do not expose full adaptation logic to the user.

The user's selected support style remains authoritative, but support style is a bias, not a separate reasoning engine.

Cue biases toward the smallest useful intervention.

Response biases toward usable wording or a line.

Presentation remains singular and structured.

All non-presentation support styles may compress, expand, hold, or sharpen delivery only when doing so materially increases the probability of the user's highest-priority desired outcome.

Do not create separate adaptive engines for each support style.

One Adaptive Delivery Authority should eventually govern delivery shape across support styles.

Steering phrases are user intent signals.

They request operational assistance but do not override GEORGE's judgment, support style, or desired-outcome priority.

The user should not be shown this full adaptation logic.

User-facing copy should remain simple.



## LIVE Delivery Authority Boundaries

Do not merge or expand delivery authorities casually.

Each authority must answer one question.

Response Policy:
Should GEORGE offer support, and what general form should that support take?

Adaptive Delivery Policy:
How should support style be biased by accumulated user behavior and runtime evidence?

Response Shaper:
How should the selected delivery be expressed in wording, density, tone, and compression?

Silence Intelligence:
Is saying nothing currently the highest-value action?

Delivery Commitment:
Is the pending delivery still worth delivering before the timing window expires?

Cue Depth:
How much cue-level support is appropriate when the selected support style is Cue?

Steering Phrase Routing:
What user intent signal was detected from survivable in-room language?

Rule:
No module should independently own another module's question.

If two modules answer the same question, consolidate after production.

If one module answers multiple questions, split after production.

Behavioral certification remains authoritative.


## Speech Synchronization Doctrine

The user always has authority over the conversation.

When the user and GEORGE speak at the same time, GEORGE must reason from the signal behind the overlap, not the overlap itself.

Overlap alone is never the decision.

### User Taking the Floor

If GEORGE determines the user intends to speak independently, ask a question, redirect the conversation, correct GEORGE, or otherwise take the floor:

- GEORGE immediately stops speaking.
- GEORGE begins listening immediately.
- GEORGE may briefly acknowledge the interruption only when the acknowledgement improves the user's probability of achieving the desired outcome.
- Natural acknowledgements include: "Okay.", "Sure.", "Go ahead.", "Of course.", "I'm listening."
- GEORGE yields silently when even a brief acknowledgement would distract the user, expose support, interrupt timing, or reduce the user's chance of success.

### User Synchronizing With GEORGE

If GEORGE determines the user is repeating GEORGE's words, shadowing GEORGE, using GEORGE as a live continuation, or speaking in cadence with GEORGE's delivery, the overlap is not treated as an interruption.

In that case:

- GEORGE continues delivering support.
- GEORGE does not acknowledge the overlap.
- GEORGE maintains delivery timing so the user can continue speaking naturally.
- GEORGE protects the user's cadence instead of competing for the floor.

### Governing Principle

GEORGE reasons from intent, not mechanical events.

The question is always:

Does this behavior increase the user's probability of achieving the desired outcome?

If continuing improves the outcome, GEORGE continues.

If yielding improves the outcome, GEORGE yields.

If silence improves the outcome, GEORGE remains silent.

No single overlap rule overrides user agency or the desired outcome.


---

# GEORGE Learning Doctrine

GEORGE does not learn to remember.

GEORGE learns to improve future conversations and increase the user's probability of achieving desired outcomes.

Briefing establishes enough context to begin well.

Everything else is acquired through conversation, observation, signals, relevant documentation, runtime reasoning, and continuous adaptation.

Every retained observation must answer one question:

How will remembering this improve future execution?

If it cannot answer that question, GEORGE should not retain it.

---

## Sufficiency Doctrine

GEORGE begins when sufficient context exists, not when complete context exists.

Preparation increases precision.

Preparation does not grant permission.

GEORGE is always capable of beginning support.

More context improves support.

It does not enable support.

This doctrine justifies both Full Briefing and Quick LIVE.

---

## Learning Categories

### Identity

Retain stable information that materially improves future conversations.

Examples:

- preferred name
- pronunciation
- organization
- long-term role

---

### People

GEORGE retains people with whom it has helped the user communicate.

Not because names are important.

Because previous conversations may improve future preparation, briefing, and LIVE support.

GEORGE learns relationships rather than records.

Examples of retained evidence:

Relationship

Projects worked together

Conversation history

Successful communication patterns

Outstanding follow-ups

Recurring questions

Recurring objections

---

### Projects

Projects become operational knowledge containers.

Documentation

Conversation history

LIVE sessions

Follow-ups

Outcome progression

Successful strategies

---

### Relevant Documentation

Retain documentation associated with active conversations and projects whenever it materially improves future support.

---

### Communication Knowledge

Retain only communication patterns supported by evidence.

Examples:

Lead with examples.

Pause before discussing numbers.

Brief cues outperform complete responses.

Executive framing improves investor conversations.

---

### Outcome Knowledge

Retain evidence of strategies that repeatedly improve outcomes.

GEORGE remembers what worked.

Not what was merely discussed.

---

## Learning Confidence

Nothing becomes long-term learning immediately.

Observed once.

↓

Observed repeatedly.

↓

Evidence established.

↓

Trusted learning.

Confidence grows through repeated successful use.

---

## Retirement

Learning is continuously evaluated.

Information that no longer improves future conversations gradually loses priority.

GEORGE optimizes for usefulness, not accumulation.

---

## User Authority

The user always governs long-term learning.

Examples:

Remember this.

Forget this.

Never use this again.

This project is finished.

Do not bring this up again.

User authority overrides learned behavior.

---

## Governing Principle

GEORGE remembers what increases future capability.

Not what increases memory.

Knowledge should become more valuable.

Not merely larger.



---

# GEORGE Production Discipline

Every production change follows the same order.

Doctrine

↓

Operational Behavior

↓

Runtime

↓

Validation

↓

Commit

Doctrine always precedes implementation.

GEORGE is never implemented before its behavior is understood.

---

## Doctrine

Agree on the governing principle.

Answer one question:

What should GEORGE fundamentally do?

---

## Operational Behavior

Translate doctrine into observable user behavior.

Answer:

How should a user experience this?

Behavior must be understandable before code exists.

---

## Runtime

Only after doctrine and behavior are settled should runtime implementation begin.

Implementation serves doctrine.

Doctrine never serves implementation.

---

## Validation

Every production change must successfully complete:

GEORGE behavioral suite

Core smoke

LIVE entry smoke

Production build

Behavior is considered incomplete until validated.

---

## Commit

Keep commits atomic.

One operational idea.

One commit.

Avoid unrelated changes.

---

# Product First

Every decision should answer:

Does this increase the user's probability of achieving the desired outcome?

If not, it does not belong in GEORGE.

---

# Runtime Second

Every runtime behavior should answer:

Does this faithfully implement the governing doctrine?

Not:

Is this technically clever?

---

# Interface Third

The interface should reveal doctrine.

It should never invent doctrine.

The UI exists to expose operational intelligence, not replace it.

---

# GEORGE Hierarchy

Desired Outcome

↓

Conversation

↓

Preparation

↓

Execution

↓

Learning

↓

Future Conversations

Learning exists to improve future conversations.

Preparation exists to improve execution.

Execution exists to improve outcomes.

Conversation is the execution surface.

---

# Product Statement

GEORGE continuously prepares, supports, learns from, and improves conversations so users have a greater probability of achieving their desired outcomes.



---

# Conversation Package Doctrine

GEORGE should organize work around conversations with desired outcomes.

Not chats.

Not isolated sessions.

Not folders the user has to manage.

A Conversation Package is the operational container for preparation, relevant documentation, LIVE support, learning, follow-up, and future continuation.

---

## Conversation Package Contents

A Conversation Package is the operational container for a larger objective.

It may contain one or many related conversations.

Everything that materially improves future execution belongs to the Conversation Package.

A Conversation Package may contain:

Desired outcome

Project

Organizations

People GEORGE has helped the user communicate with

Relevant documentation

Conversation readiness

Support preferences

Conversation history

Conversation summaries

LIVE sessions

Learning evidence

Outcome progression

Follow-ups

Future next actions

Conversation relationships

Associated projects

---

## Conversation Lifecycle

Conversation Package

↓

Conversation

↓

Briefing

↓

Relevant Documentation

↓

Conversation Readiness

↓

LIVE Support

↓

Conversation Summary

↓

Learning

↓

Future Conversation

↓

Conversation Package

---

## Continuity Principle

The user should not have to organize GEORGE.

GEORGE should organize the work around outcomes and conversations.

When the user states what they want to accomplish, GEORGE should determine whether this appears to continue an existing Conversation Package or requires a new one.

GEORGE should not ask:

Start a new conversation?

GEORGE should ask:

What would you like to accomplish?

If the answer appears related to existing work, GEORGE may say:

I found a related conversation. Continue where we left off?

If not, GEORGE begins a new Conversation Package automatically.

---

## Sufficiency and Continuation

A Conversation Package does not require complete information.

It begins when there is enough context to help.

It becomes more useful as GEORGE acquires:

conversation signals

relevant documentation

LIVE history

user corrections

outcome evidence

follow-up results

future context

---

## User Benefit

The user is not resuming a chat.

The user is continuing work toward an outcome.

GEORGE should make continuity feel natural, useful, and low-friction.

---

## Governing Principle

Conversation Packages exist to reduce cognitive load and improve future execution.

If storing something in a Conversation Package does not improve preparation, support, learning, follow-up, or future outcome probability, it should not be retained there.



## Conversation Package Identification Runtime

Implemented the first runtime primitive for Conversation Packages.

GEORGE can now score whether a new objective appears to continue an existing Conversation Package, needs user confirmation, or should begin as a new Conversation Package.

This supports the doctrine that the user should not manage folders, chats, or sessions. GEORGE should organize work around outcomes and conversations.


---

## Conversation Hierarchy

Users organize work around outcomes.

GEORGE organizes work around Conversation Packages.

A Conversation Package may contain multiple conversations.

Example

Conversation Package

Acme Series A

↓

Conversation

Initial Investor Meeting

↓

Conversation

Partner Follow-up

↓

Conversation

Due Diligence

↓

Conversation

Term Sheet Negotiation

↓

Conversation

Board Approval

Every conversation contributes evidence, learning, documentation, and outcome progression back into the same Conversation Package.

The user is never responsible for organizing chats, folders, or sessions.

GEORGE maintains continuity automatically.

---

## Governing Principle

Conversations are events.

Conversation Packages are operational containers.

Packages exist to improve preparation, continuity, learning, and future execution.


## Current Operational Improvement Loop

Validated clean state:

- Behavioral Suite: 32 / 32 passing
- GEORGE Core Smoke: passing
- LIVE Entry Smoke: passing
- Production Build: passing

Current protected loop:

Preparation Runtime

↓

Conversation Package Runtime

↓

Conversation Summary Runtime

↓

Learning Runtime

↓

Conversation Package Update

↓

Next Preparation

This proves GEORGE can use prior conversation evidence and learning to improve the next conversation without persistence, UI changes, or page-level logic.


## Page and UI Boundary Rule

`app/george/page.tsx` and `app/george/live-entry/LiveEntryClient.tsx` are UI surfaces.

They may:

- render interface
- collect user actions
- call runtime modules
- route user actions
- coordinate display state

They must not own:

- operational doctrine
- Conversation Package logic
- document intelligence
- learning promotion
- summary generation
- relevance scoring
- package attachment decisions
- LIVE reasoning or delivery meaning

Operational behavior belongs under `lib/george/**` and must be protected by behavior coverage.



## Production Modification Rule

No manual coding.

Ever.

Production modifications are applied through deterministic scripts.

Workflow

Inspect

↓

Generate deterministic script

↓

Apply script

↓

Behavior tests

↓

Concert tests

↓

Behavioral suite

↓

Smoke tests

↓

Production build

↓

Inspect git diff

↓

Commit

↓

Push

---

# LIVE Console + Conversation Record Update — July 1, 2026

## LIVE Console Direction

LIVE is moving from dashboard to operational console.

Configuration belongs in Brief Room.

Execution belongs in LIVE.

During LIVE, visible controls should either:

- show operational state
- directly control GEORGE in the room
- improve the user's probability of success

Top console cards are becoming primary runtime controls.

Bottom controls are becoming readable mirrors of runtime state, especially for real-room use.

Menus and popups should be minimized during LIVE.

## Current LIVE Console Decisions

GEORGE tile:

- status only
- READY / LISTENING / THINKING / SPEAKING / WAITING

LIVE tile:

- primary runtime on/off control
- controls room listening/runtime participation
- displays ON / OFF

AUDIO tile:

- controls voice delivery only
- does not control listening
- displays ON / OFF

GUIDANCE tile:

- replaces old support popup behavior
- tap cycles support style
- bottom guidance mirrors active support state
- GEORGE-driven changes render with typewriter transition
- user-driven changes render immediately

COMMUNICATION tile:

- displays active communication style
- future behavior may cycle or open lightweight controls

CONVERSATION tile:

- does not surface transcript during LIVE
- becomes gateway after Post Brief and Outcome Review

## Conversation Record Sequence

LIVE does not surface Conversation Records during execution.

After LIVE:

1. Post Brief
2. Outcome Review
3. Conversation Record

The transcript is evidence.

The outcome report is the product.

Never:

Conversation → Transcript → User figures it out

Always:

Execution → Reflection → Evidence


## Conversation Record Implementation Status

Current implementation:

- `buildConversationRecord()` projects Conversation Records from the existing Conversation Package runtime.
- `PostLiveConversationRecordPanel` renders post-LIVE operational memory.
- The panel is wired after Outcome Review and does not open transcript during LIVE.
- Conversation Record currently surfaces summary, latest outcome, promoted learning, future actions, documentation count, and transcript evidence availability.
- Conversation Record remains a projection of operational memory, not a separate runtime or transcript viewer.


## Preparation Runtime Implementation Status

Current implementation:

- Preparation consumes Conversation Packages through `prepareConversationFromPackage()`.
- Preparation now consumes Conversation Record projections as operational evidence.
- Conversation Record summaries, promoted learning, future actions, relevant documentation, and context can influence future preparation.
- Preparation also accepts related Conversation Packages and conservatively aggregates summaries, promoted learning, relevant documentation, future actions, and context.
- Brief Room now consumes Preparation Runtime output.
- Brief Room surfaces Preparation memory including opportunity, risk, reusable documentation count, and confidence.
- Preparation Runtime output is also included in LIVE setup/runtime support so LIVE can receive the same preparation context.
- Related packages are not merged, ranked, or scored yet.
- No separate operational memory runtime was created.
- `george:preparation:smoke` protects Conversation Record and related-package evidence feeding Preparation.

## Language Assist Update

Language is operational signal.

GEORGE may detect, translate, interpret, and reason from other languages.

Translation is not the product.

GEORGE surfaces language only when it materially improves the user's probability of success.

Otherwise, GEORGE uses what he understands to improve guidance silently.

## Cross-Conversation Reasoning Update

GEORGE is one intelligence.

Normal and LIVE share operational memory.

Conversation Packages preserve outcome boundaries.

GEORGE may reason across conversations and outcomes when transferable evidence improves the user's probability of success.

GEORGE should identify recurring friction and propose possible fixes, not merely report patterns.

Example:

"Three previous investor conversations point to implementation planning as the recurring hesitation. We can prepare a one-page implementation roadmap before the next meeting."

GEORGE works with the user during execution.

Success belongs to the user.

