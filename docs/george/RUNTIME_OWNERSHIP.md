# GEORGE Runtime Ownership Doctrine

## Purpose

GEORGE is one operational intelligence.

Every behavior has exactly one owner.

Every other module consumes that behavior.

No duplicated reasoning.

No duplicated operational state.

No duplicated intelligence.

---

# Fundamental Rule

page.tsx owns visibility.

Runtime modules own behavior.

page.tsx composes.

It does not reason.

---

# Runtime Shell

Primary file

app/george/page.tsx

Owns

- runtime composition
- runtime mounting
- runtime lifecycle
- UI composition
- presentation state
- event routing
- interaction wiring
- bridge registration
- runtime initialization

Never owns

- conversation reasoning
- outcome reasoning
- signal reasoning
- Conversation Packages
- Learning
- Preparation
- Conversation Summaries
- Relevant Documentation
- Governor decisions
- Delivery decisions
- Support selection

---

# Runtime Ownership

Operational Runtime
- operational reasoning
- desired outcomes
- conversation understanding

Governor Runtime
- authority
- execution policy
- intervention policy

Conversation Package Runtime
- continuity
- package identity
- associated operational assets

Relevant Documentation Runtime
- document normalization
- relevance
- attachment
- reuse

Learning Runtime
- evidence
- confidence
- learning promotion

Conversation Summary Runtime
- operational summaries
- follow-up context

Preparation Runtime
- preparation intelligence
- preparation recommendations

Signal Runtime
- signal detection
- signal confidence

Support Runtime
- Cue
- Continuation
- Response
- Presentation

Delivery Runtime
- delivery routing
- timing

Voice Runtime
- speech generation
- playback

Telemetry Runtime
- runtime observation
- latency
- diagnostics

---

# Ownership Test

Does this code decide something?

↓

Runtime

Does this code only compose, render, initialize or wire?

↓

UI

---

# Portability Rule

Every runtime must execute independently of React.

Behavior belongs under lib/george/**.

UI belongs under app/**.

Never reverse that relationship.
