# HOMEPAGE CONVERSATION EXPERIENCE

Status
------
Production Design Authority

Purpose
-------
This document is the authoritative specification for the homepage conversation experience.

It defines:

- user flow
- visual transitions
- interaction sequence
- animation timing
- ownership
- implementation milestones

The Production Tracker tracks implementation status.

The Runtime Architecture document defines ownership.

This document defines the product experience.

======================================================================
MILESTONE 1
HERO → CONVERSATION ENTRY
======================================================================

Objective

The homepage transitions from the Hero into an operational conversation workspace.

The transition should feel continuous.

The user should never feel like they navigated to another page.

----------------------------------------------------------------------
Sequence
----------------------------------------------------------------------

1. Hero completes.

2. Homepage darkens.

3. Conversation surface expands.

4. User selects a conversation.

Example:

Conversation Type

Deliver Difficult News

Communicate a hard decision, change, or truth with clarity, care, and appropriate responsibility.

User choices:

• Select another conversation

• Continue

======================================================================
MILESTONE 2
CONVERSATION PREPARATION
======================================================================

Selecting Continue begins guided preparation.

Render using the typewriter effect:

The structure is ready.

GEORGE will help sequence the facts, impact, explanation, empathy, and next steps.

When complete...

Fade in:

Customize your conversation.

GEORGE will continue the canonical LIVE briefing and preserve any preparation signals already established.

Reveal:

START

======================================================================
MILESTONE 3
MANDATORY QUESTIONS
======================================================================

Selecting START begins the required questions.

Rules

• Typewriter rendering

• One question at a time

• Never show two questions simultaneously

• Previous question leaves before the next appears

• Conversation title remains visible

• Everything else fades away

The active question action row also carries exactly three compact intelligence
controls: S, I, and B. Verified session authority establishes the highest tier
the account may use. A valid account-scoped previously selected tier is restored; otherwise
the verified highest tier becomes active. Available tiers activate immediately
without leaving or clearing the briefing. A locked tier opens the existing
access decision only when intentionally selected. Pointer hover, keyboard
focus, and mobile tap temporarily disclose each tier's concise explanation.
No persistent keep-or-upgrade panel remains, and browser state never grants
access.

======================================================================
MILESTONE 4
LIVE DECISION POINT
======================================================================

After the final mandatory question:

Render:

You can continue directly into LIVE now, or remain here and continue briefing GEORGE.

Allow reading time.

Illuminate:

Continue to LIVE

The user may:

• Continue to LIVE

• Continue briefing

• Skip

OpenAI adaptive briefing begins only after this message has had sufficient reading time.

======================================================================
MILESTONE 5
REVIEW
======================================================================

First tap on Continue to LIVE does not enter LIVE.

Instead present:

Review Answers

User may:

• Edit

• Approve

Approval proceeds into the canonical Popup 3.

======================================================================
OWNERSHIP
======================================================================

Homepage owns

• Hero transition

• Darkening transition

• Conversation selection

• Conversation surface

• Guided preparation

• Mandatory questions

• Review

LIVE owns

• Popup 3

• Readiness

• Room entry

• Runtime

• Runtime adaptation

No duplicate ownership.

======================================================================
CURRENT IMPLEMENTATION STATUS
======================================================================

Milestones 1–5 are implemented as the current Homepage conversation
experience.

Homepage owns outcome-led preparation through approved brief review.

The Homepage preserves one canonical Preparation Session identity through
briefing, Current Understanding revision, review, LIVE Entry handoff, and
return-state continuity.

Approved Homepage preparation enters the existing shared Popup 3 / Ready Room
experience. It does not enter Traditional Popup 1, Traditional Mechanics, or a
duplicate preparation route.

LIVE Entry owns the shared Ready Room / readiness surface. For Homepage-origin
preparation, Popup 3 reviews the current-session support recommendation before
LIVE entry.

The compact S / I / B intelligence-tier interface is implemented within the
Homepage question action row. Entitlement remains subordinate to canonical
session/subscriber authority.

Do not infer a new numbered implementation milestone from this document.
Current production priorities and qualification status are governed by
PRODUCTION_TRACKER.md and NEXT_THREAD_HANDOFF.md.

<!-- GEORGE_HOMEPAGE_DIRECT_LIVE_CONVERGENCE_2026_09_30 -->
## Homepage Preparation → LIVE Convergence — 2026-09-30

This section supersedes earlier Homepage-specific descriptions that require
Popup 3 / Ready Room before LIVE. Historical descriptions remain in this
document as implementation history; they are not the current Homepage
choreography.

### Preparation is a state, not a place

Preparation is part of GEORGE's continuing operational relationship with the
user. It is not a destination the user must navigate through merely because
preparation state exists.

For Homepage-origin preparation, Ask GEORGE is the persistent intelligent
surface. Its content reorganizes as the user's relationship with the current
work progresses:

foundational LIVE intent:
  1. desired outcome — “What should LIVE support help you accomplish, obtain, or clarify?”
  2. LIVE setting — “Ready to use me in a room, over the phone, or somewhere else?”
→ Operational Judgment / adaptive conversational understanding
→ Current Understanding
→ Final Review
→ Formula / operational strategy
→ explicit support and delivery confirmation
→ LIVE

The surface may change emphasis and content without creating another
preparation runtime, reasoning owner, or navigation layer.


### Two foundational LIVE signals before adaptive questioning

Homepage preparation begins with two user-owned signals that are required before
adaptive Operational Judgment questioning begins.

The first establishes the user's desired outcome:

`What should LIVE support help you accomplish, obtain, or clarify?`

The answer remains canonical outcome authority. It is preserved as the
PreparationSession objective / desired-outcome evidence. “Accomplish, obtain, or
clarify” broadens the natural expression of the outcome without creating three
different outcome types.

The second establishes the anticipated LIVE communication environment:

`Ready to use me in a room, over the phone, or somewhere else?`

Its answer is preserved canonically as `knowledge.communicationMedium` and as an
answered preparation interaction with LIVE-scope-grounding purpose.

These are foundational inputs to reasoning, not a fixed questionnaire owned by
Operational Judgment. Q1 must not invoke adaptive Operational Judgment before Q2
has been answered. After Q2 is incorporated into the same PreparationSession,
Operational Judgment / OpenAI reasons from both established signals and the rest
of the available evidence.

Only then may GEORGE acquire another user-owned signal. Any subsequent question
must be consequential to the next operational decision and authorized through
the existing Operational Judgment / signal-acquisition boundary. The
signal-question machinery remains the wording/execution owner for such an
authorized adaptive question; it does not become a second sufficiency or
question-selection authority.

The two foundational signals do not declare preparation sufficient. They give
GEORGE enough initial grounding to reason intelligently about what, if anything,
is worth asking next.

Previously answered preparation evidence must not be reacquired merely because
provider reasoning proposes the same evidence need again. A genuinely different
consequential unknown remains eligible for acquisition.

Current Understanding remains editable and evolves from accepted preparation
evidence. It is not a third mandatory questionnaire step. User corrections are
preserved in the same PreparationSession and return to governed reasoning.


### Homepage does not require Ready Room

Homepage Final Review now converges directly on the existing canonical LIVE
launch owner.

When canonical minimum-viable support, required LIVE signal, user
confirmations, and existing LIVE access authority are satisfied, Homepage
delegates to the established `startLive()` path.

Homepage does not require Popup 3 / Ready Room as an intermediate prerequisite.

The canonical Homepage handoff records the existing `strategy` Preparation
checkpoint rather than manufacturing a Homepage `ready_room` checkpoint.

This change is Homepage-specific. Traditional LIVE and Normal LIVE retain
their legitimate route-specific choreography, including Ready Room behavior
where that route requires it. Distinct entry choreography must not be flattened
merely because all routes converge on the same LIVE runtime.

### One LIVE launch and execution authority

`startLive()` remains the sole LIVE launch owner for this convergence.

Homepage does not create a second launch path, LIVE runtime, delivery owner,
reasoning authority, Formula owner, Preparation owner, or receiver-policy
owner.

The execution chain remains:

canonical PreparationSession
→ `startLive()`
→ prepared LIVE setup / runtime support
→ GEORGE LIVE host
→ LIVE Hub
→ governed ACTION_CUE
→ canonical delivery behavior and receiver policy
→ user

Formula identity, support behavior, confirmed speaking style, receiver choice,
relevant preparation evidence, and other authorized runtime context travel
through the existing canonical preparation and LIVE contracts.

### Final Review is convergence, not another application surface

Final Review remains part of the same Ask GEORGE experience.

It presents the consequential understanding and execution choices the user
needs before LIVE. Formula/strategy is visible there when relevant. Brilliant
may expose alternative Formula choices inline. Deeper Formula viewing or
editing may use the established asset UI, but returning preserves the same
PreparationSession and selected strategy.

Final Review must not become a dashboard, wizard, collection of giant cards,
or another primary navigation layer.

### Execution philosophy

GEORGE is always moving from information to understanding to judgment to
execution.

GEORGE should not make the user operate GEORGE when GEORGE already has enough
intelligence to prepare the user to operate in the world.

Accordingly, preparation UI exists only where it improves understanding,
corrects consequential uncertainty, captures user authority, or makes LIVE
support usable. Completed internal mechanics do not justify additional user
steps.

Current Understanding remains a working operational picture rather than a
completion checklist. Formula remains the operational strategy. Cue / Lines
remain user-selectable starting support preferences. Delivery mechanism remains
a user choice. Operational Judgment remains the sole decision authority.

### Qualified implementation state

The current repository qualification establishes that:

- Homepage no longer requires Ready Room before LIVE.
- Homepage handoff uses the canonical `strategy` Preparation checkpoint.
- `startLive()` remains the launch owner.
- existing LIVE access authority remains enforced.
- the required LIVE signal gate remains enforced.
- confirmed receiver and speaking-style state travel into LIVE.
- Traditional and Normal route choreography remains intact.
- canonical PreparationSession evidence is projected into LIVE runtime support.
- LIVE delivery continues through the existing LIVE Hub and canonical receiver
  policy.
- duplicate canonical ownership remains zero.
- the production build passes.

The next release activity is runtime E2E proof of the qualified Homepage
Final Review → LIVE transition. Runtime proof must verify the behavior in the
running product; it must not create another architecture merely to test the
existing one.
