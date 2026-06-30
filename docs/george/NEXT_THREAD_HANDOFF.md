# GEORGE Production Next Thread Handoff

## First Rule

This project is in Production Runtime Phase.

Do not redesign GEORGE.

Do not introduce new philosophy unless implementation exposes a genuine architectural gap.

Do not overload `app/george/page.tsx`.

Inspect before patching.

Small commits only.

One operational idea per commit.

Behavior suite and production build must remain green after every production commit.

## Documentation Status

The production documentation had fallen behind the current implementation.

The codebase and behavioral suite are now ahead of older docs.

Before using documentation as the primary reference, synchronize it with the current runtime.

Primary docs:

- `docs/george/PRODUCTION_TRACKER.md`
- `docs/george/RUNTIME_ARCHITECTURE.md`
- `docs/george/NEXT_THREAD_HANDOFF.md`
- `scripts/george-behavior/README.md`

## Current Branch

`live-hub-runtime`

## Current Validated State

Latest stated validation target:

- Behavioral Suite: 32 / 32 passing
- GEORGE Core Smoke: passing
- LIVE Entry Smoke: passing
- Production Build: passing

Validation commands:

```bash
node scripts/george-behavior-suite.mjs
npm run build
```

Do not mark future work as validated until those commands pass in a real repository runtime.

## Product Philosophy Locked

GEORGE is not a chatbot.

GEORGE is an operational intelligence runtime.

Conversation is the execution surface.

Communication precedes execution.

GEORGE continuously prepares, supports, learns from, and improves conversations so users have a greater probability of achieving their desired outcomes.

Users organize work around outcomes.

GEORGE organizes work around Conversation Packages.

GEORGE reasons from signals, not merely words.

Learning exists to improve future conversations.

Relevant Documentation improves understanding.

User authority remains primary.

## Engineering Discipline Locked

Every production change follows:

Doctrine

↓

Operational Behavior

↓

Runtime

↓

Validation

↓

Commit

Do not skip behavioral validation.

Do not make speculative rewrites.

Do not commit unrelated changes.

## Homepage Status

Homepage is considered production quality.

Completed:

- Hero animation finalized.
- `public/hero/glasses21.png` is the production hero image.
- Signals appear and disappear sequentially.
- Support renders only after the final signal disappears.
- Signals never render on the glasses.
- `GEORGE is thinking...` replaced `Understanding.`
- `Audio` is presented as text rather than an image.
- LIVE Support button renamed.
- Conversation scenarios rotate automatically.
- Support rendering is intentionally smaller so it does not dominate the hero.

Remaining verification:

- Desktop spacing and unnecessary whitespace.
- Final copy emphasis for LIVE Support near the top.
- Low-income and underserved communities.
- Neurodivergent users.
- People with speech and communication disabilities.
- Professionals.
- Entrepreneurs.
- Interviews.
- Fundraising.
- Cartesia speech synthesis.
- Deepgram speech recognition.
- Concrete outcome-oriented messaging such as: `Forty-one cents could help secure the job.`

Do not redesign the homepage unless fixing bugs.

## LIVE Entry Commitments

Final readiness popup sequence:

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

The `Let's go to work` button:

- is visible immediately
- begins a subtle pulse after the silence timeout
- may be pressed at any time
- preserves `Save for later`

Interruption behavior:

If the user interrupts GEORGE before he finishes, permitted acknowledgements are:

- `Go ahead.`
- `Sure.`
- `Okay.`
- `I'm listening.`

No acknowledgement should exceed `I'm listening.`

If acknowledging the interruption would reduce the user's probability of success, GEORGE says nothing and immediately yields the floor.

## Shadow Speaking Doctrine

If the user is speaking GEORGE's words in real time, GEORGE should not compete.

GEORGE should disappear.

Not pause.

Not finish the sentence.

Disappear.

The objective is to maximize the user's success, not complete GEORGE's speech.

## Conversation Readiness

Remaining work is resumability.

Every readiness panel should support:

- Save for later
- Continue later

Users should not repeat preparation unnecessarily.

Conversation Readiness is resumable.

Approved copy:

> Review your conversation readiness. Update anything that has changed. GEORGE only needs enough context to begin well. The rest is learned through the conversation.

This reflects the Sufficiency Doctrine.

## Relevant Documentation

Completed:

- Intelligent recommendations.
- Upload capability.
- Lightweight presentation.
- Conversation-specific recommendations.

Remaining:

- Integrate documentation into Conversation Packages.
- Support previous documentation.
- Suggest documentation from existing Conversation Packages.
- Reuse documentation automatically when appropriate.

Uploader already exists. Do not build another uploader.

## Conversation Packages

Conversation Packages are now the architectural center of GEORGE.

The identification runtime exists.

Remaining implementation is the Conversation Package Manager.

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

Conversation Packages become the operational source of continuity.

## Learning Runtime

Doctrine is complete. Implementation remains.

Implement:

Conversation

↓

Evidence

↓

Confidence

↓

Learning

↓

Future Conversations

Support:

- promotion
- retirement
- confidence thresholds
- user override

## Conversation Summary Runtime

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

## Conversation Package Identification

Primitive exists.

Do not redesign it.

Extend it.

Remaining work:

- runtime integration
- automatic package detection
- Conversation Package Manager integration

## Voice Stack

Current production direction:

- Speech recognition: Deepgram
- Speech synthesis: Cartesia

Do not revert to ElevenLabs.

## Latency

Latency remains a production priority.

Continue measuring:

Microphone

↓

Deepgram

↓

Signal acquisition

↓

Reasoning

↓

Delivery

↓

Cartesia

↓

Playback

Optimize end-to-end response time without compromising correctness.

## Conversation Terminology

Preferred terminology:

- Conversation
- Conversation Readiness
- Conversation Context
- Relevant Documentation
- Desired Outcome
- Your Role
- Conversation With

Avoid unnecessary references to `room`.

Use `room` only when it has literal operational meaning, for example:

- Read the room.
- The room became tense.

Otherwise, conversation is the preferred abstraction.

## Product Positioning

GEORGE exists to improve conversations that determine meaningful outcomes.

Examples:

- Interviews
- Fundraising
- Negotiations
- Presentations
- Healthcare conversations
- Difficult conversations
- Sales
- Conflict resolution
- Government
- Enterprise

These are not market categories. They are examples of situations where success depends on communication.

## Communication Pattern Learning

GEORGE should learn how the user communicates, not merely what the user works on.

Examples:

- prefers concise cues
- benefits from examples before abstractions
- prefers data before narrative
- responds better to reassurance versus direct challenge
- asks follow-up questions before deciding
- prefers numbered explanations
- tends to pause before answering under pressure

These are communication preferences, not personality traits.

They exist only because they repeatedly improve the user's outcomes.

Learning principle:

GEORGE learns communication patterns that repeatedly improve the user's probability of success.

## Architectural Reminder

GEORGE reasons from signals, not forms.

Forms exist only to provide enough signal to begin well.

The conversation remains the primary source of intelligence.

Everything else is acquired through:

- observation
- conversation
- relevant documentation
- runtime reasoning
- learning

Never allow forms to become more important than the conversation itself.

## Next Major Implementation Milestone

Conversation Package Manager.

Long-term runtime:

Conversation Package

↓

Conversation

↓

Preparation

↓

LIVE

↓

Conversation Summary

↓

Learning

↓

Future Conversation

Conversation Packages are now the primary operational container for continuity.


## Current Runtime Milestone

The current clean behavioral state is:

- Behavioral Suite: 32 / 32 passing
- GEORGE Core Smoke: passing
- LIVE Entry Smoke: passing
- Production Build: passing

Implemented runtime chain:

LIVE Entry

↓

Conversation Package identification

↓

Conversation Package manager

↓

Conversation Package runtime orchestration

↓

Conversation Summary Runtime

↓

Learning Runtime

↓

Conversation Package update

This is protected by both targeted behavior contracts and the Conversation Package concert flow.


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

