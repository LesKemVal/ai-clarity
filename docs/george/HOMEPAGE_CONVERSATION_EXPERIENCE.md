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
NEXT IMPLEMENTATION
======================================================================

Current milestone:

Milestone 2

Next engineering task:

Inspect the homepage implementation and determine the canonical owners required to implement the conversation preparation sequence without duplicating LIVE preparation.
