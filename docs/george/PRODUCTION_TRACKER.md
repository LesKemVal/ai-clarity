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
- Build the Conversation Package Manager under `lib/george/conversation-packages/`.
- Integrate Conversation Package identification into runtime flow.
- Attach Relevant Documentation to Conversation Packages instead of duplicating operational state.
- Implement Conversation Summary Runtime as an operational asset, not an archive.
- Implement Learning Runtime through Evidence → Confidence → Learning → Future Conversations.
- Add behavioral coverage for Conversation Package Manager behavior.
- Continue end-to-end latency measurement through microphone, Deepgram, reasoning, delivery, Cartesia, and playback.

## Working Rules

No page.tsx bloat.

No manual coding.

Use paste-ready scripts.

Inspect before patching.

Small commits.

Build before commit.

Do not commit if build fails.

Do not add git save/commit commands inside build patches.

## Engineering / Tooling Notes

GitHub connector code search produced false negatives during runtime inspection. Symbols and files known to exist may not appear in connector search results.

Do not treat connector search misses as evidence that runtime modules are absent.

When inspecting architecture, prefer direct file inspection or local repository search (`git grep`, `rg`, or equivalent) before introducing or relocating runtime modules.

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
