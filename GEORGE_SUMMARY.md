# GEORGE — Buyer / Inspector Summary

## What GEORGE is
GEORGE is not a generic chatbot.

GEORGE is a clarity, direction, and execution system built to help users:
- identify what they are actually trying to do
- see the big picture
- structure the work
- keep direction intact
- carry real projects toward completion

GEORGE is designed to feel like a disciplined, high-capability companion rather than a passive assistant.

---

## Core operating model
GEORGE follows this model:

**Direction → Action → Signal**

- **Direction**: define the real objective
- **Action**: reduce it to executable movement
- **Signal**: show the user when direction improved, degraded, or hit a limit

This makes GEORGE more than a conversation interface. It is a guided execution layer.

---

## Tier system
GEORGE is organized into three support levels.

### Smart
Smart is the wide-angle tier.

It gives:
- big-picture understanding
- direction
- structure
- minimal carry

It does **not** carry the full build or project.

Smart is useful when a user needs:
- the lay of the land
- first principles
- the first real move
- broad understanding without friction

### Intelligent
Intelligent adds:
- structured multi-step support
- better continuity
- stronger project detail
- a working grasp of both big picture and nuts-and-bolts planning

This tier can carry a real path forward.

### Brilliant
Brilliant is the highest-support tier.

It adds:
- deeper continuity
- deeper detail
- stronger execution support
- better ability to carry the bulk of a real project

Brilliant is for users who want GEORGE to stay with the work and help hold the weight of it.

---

## Constraint engine
GEORGE does not simply refuse hard work in Smart.

Instead, it degrades intelligently.

When a task exceeds Smart carry, GEORGE responds in first-person with controlled limitation:

> I’ll give you the lay of the land—but I won’t carry the full build or project.  
> That takes more support than this level unlocks.

This preserves:
- usefulness
- authority
- trust
- upgrade clarity

---

## Prompt system
GEORGE generates contextual prompts based on:
- the user’s request
- the recent exchange
- current system limits

Prompts are not filler. They are actionable moves.

Examples include:
- clarify direction
- reduce scope
- define first move
- work around constraints
- route to deeper support

When Smart hits a constraint, GEORGE can surface prompts such as:
- Work around this
- Lighter version
- Smaller first move
- Make G. smarter
- Top up

---

## Signal system
GEORGE uses visual signals to guide user attention.

### Purple prompt signal
Used when new prompts are available.
This appears on:
- the bottom `+` control
- desktop sidebar suggested prompts

### Red support signal
Used under constrained assistant responses.
This indicates the response was not fully carried and requires deeper support.

This creates a closed loop between:
- response
- limitation
- next move
- upgrade path

---

## Voice system
GEORGE includes a live TTS pipeline using the OpenAI audio speech endpoint. The current route is already built around `gpt-4o-mini-tts`, `voice`, `instructions`, and `mp3` output. :contentReference[oaicite:1]{index=1}

Current architecture includes:
- `/api/tts`
- chunked speech playback
- interruption-safe stopping
- synchronized message reveal

Planned upgrades:
- more realistic voice output
- user-controlled speed
- tier-based voice access

---

## Monetization model
GEORGE is monetized through capability tiers, not arbitrary lockout.

- **Smart**: free forever
- **Intelligent**: 30-day free trial, card required up front
- **Brilliant**: premium support tier

Stripe is already integrated for:
- subscription checkout
- webhook handling
- subscription-state updates
- UI-tier truth based on backend subscription truth

This means subscription state is real, not cosmetic.

---

## User flow
Current entry flow is:

- new users land on **Roadmap**
- Roadmap explains:
  - what GEORGE does
  - how GEORGE scales
  - Smart / Intelligent / Brilliant entry options
- Smart entry goes directly into GEORGE
- Intelligent trial routes through Stripe
- upgrade prompts can route to `/top-up`

---

## Core product philosophy
GEORGE is built around these ideas:

- clarity over noise
- execution over conversation
- continuity over novelty
- broad usefulness without unnecessary friction
- deeper support only when the work actually requires it

GEORGE is designed to help users:
- build businesses
- prepare for tests, certifications, or licenses
- organize personal and professional goals
- reduce confusion
- keep moving when the work matters

---

## Why this matters
Most tools either:
- dump information
- or simulate conversation

GEORGE is meant to:
- sharpen direction
- reduce wasted motion
- preserve momentum
- and help users turn possibility into reality

Core statement:

**GEORGE puts real power in your hands.**

