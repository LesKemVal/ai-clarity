# GEORGE Behavioral Suite

The behavioral suite verifies GEORGE's operational doctrine.

It does not exist to test implementation details.

Behavior is the contract.

Architecture serves behavior.

## Run

From the repository root:

```bash
node scripts/george-behavior-suite.mjs
```

Production validation also requires:

```bash
npm run build
```

Do not mark a production change validated until both commands pass in a real repository runtime.

## Current Suite Contract

The suite currently contains 24 scenarios.

Expected status:

```text
GEORGE behavioral suite passed: 24/24
```

The suite entrypoint is:

- `scripts/george-behavior-suite.mjs`

Behavior scenarios live in:

- `scripts/george-behavior/`

## Current Scenarios

The suite currently includes:

1. Continuation authority repair
2. Cue doctrine boundary
3. Cue mode runtime behavior
4. Cue depth adapts within Cue
5. Response mode runtime behavior
6. Desired outcome preservation
7. Outcome change detection
8. Operational investor outcome flow
9. Delivery cannot alter meaning
10. Briefing propagation
11. Long-session stability
12. Intervention timing
13. Delivery commitment
14. Post-conversation intelligence
15. Outcome progression
16. Signal sufficiency
17. Interrupted thought recovery
18. Objection recovery
19. Outcome shift recovery
20. Transcript error recovery
21. Pressure recovery
22. Adaptive delivery evidence
23. Speech synchronization
24. Conversation package identification

## Behavioral Philosophy

Every scenario should answer:

Does this behavior increase the user's probability of achieving the desired outcome?

If the answer is no, the behavior or implementation is incomplete.

Tests should verify observable operational behavior, not internal implementation details.

Refactors are acceptable only when every behavioral scenario continues to pass.

If a behavioral test fails, prefer improving GEORGE's runtime reasoning rather than weakening the test.

## Production Discipline

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

Validation must include:

- GEORGE behavioral suite
- GEORGE Core Smoke when applicable
- LIVE Entry Smoke when applicable
- Production build

## Adding a Scenario

Add a scenario when a new doctrine, runtime behavior, or production commitment needs regression protection.

A good scenario:

- describes user-facing or runtime-observable behavior
- does not depend on UI styling
- does not depend on fragile implementation details
- protects user authority
- protects desired outcome preservation
- protects operational meaning
- survives refactoring

Each scenario should export a `run()` function.

The suite imports each scenario through a temporary TypeScript runner and executes it with `tsx`.

After adding a scenario:

1. Add the file under `scripts/george-behavior/`.
2. Add it to the `scenarios` array in `scripts/george-behavior-suite.mjs`.
3. Run `node scripts/george-behavior-suite.mjs`.
4. Run `npm run build`.
5. Commit only if validation passes.

## Conversation Package Identification Scenario

The current Conversation Package primitive is covered by:

- `scripts/george-behavior/conversation-package-identification.mjs`

It verifies that GEORGE can:

- continue an existing Conversation Package when objective, type, context, and documentation strongly overlap
- ask the user to confirm related work when evidence is incomplete
- create a new Conversation Package when evidence does not support continuity
- prioritize outcome and context continuity over generic recency

Do not redesign the identification primitive casually.

Extend it through runtime integration and the Conversation Package Manager.

## Speech Synchronization Scenario

Speech synchronization is covered by:

- `scripts/george-behavior/speech-synchronization.mjs`

The governing behavior:

- if the user takes the floor, GEORGE yields
- if the user is speaking GEORGE's words in real time, GEORGE disappears rather than competing
- silence may be the correct support

GEORGE reasons from intent and signal, not mechanical overlap alone.

## Future Behavioral Coverage

Upcoming implementation should add or extend scenarios for:

- Conversation Package Manager
- Learning Runtime promotion and retirement
- Conversation Summary Runtime
- Relevant Documentation reuse through Conversation Packages
- Resumable Conversation Readiness
- Quick LIVE sufficiency
- Cartesia voice stack expectations
- end-to-end latency instrumentation
- communication-pattern learning

Do not add broad tests that freeze the wrong implementation shape.

Add tests that protect the doctrine and observable runtime contract.
