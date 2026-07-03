# GEORGE Next Thread Handoff — 2026-07-03

Read first:
1. docs/george/PRODUCTION_TRACKER.md
2. docs/george/RUNTIME_ARCHITECTURE.md

Branch:
live-hub-runtime

Current production state:
- Plumbing is stronger.
- Delivery style now travels with transcripts.
- Response mode local cues are suppressed.
- Evidence authority applies to Response mode.
- Speech normalization is centralized.
- Environmental chatter can be stopped before Hub.

Known failures:
- Local cue engine emits "Ask what changed" for product questions.
- Clarification cue overfires on clear questions.
- Authority fallback is generic and not executive-quality.
- Need Verified Response Builder.

Next task:
Extend lib/george/core/verification/action-cue-authority.ts.
Do not add another runtime.
Do not move reasoning into page.tsx.

First inspection:
cd ~/ai-clarity

sed -n '1,320p' lib/george/core/verification/action-cue-authority.ts
sed -n '1,220p' live-hub/src/george/local-cue-engine.ts
sed -n '1,180p' live-hub/src/george/cue-patterns.ts
sed -n '70,125p' live-hub/src/llm/groq-fast-lane.ts

Validation questions:
- What is GEORGE?
- What business problem does GEORGE solve?
- How is GEORGE different from ChatGPT, Copilot, or Claude?
- Why does the market need GEORGE?
- Why should we choose GEORGE instead of building this ourselves?
- What measurable outcomes should we expect from a pilot?
- How much does BRILLIANT cost?

Expected:
- No invented facts.
- No generic fallback.
- No unrelated environmental output.
- Executive-quality answer grounded in verified product doctrine and briefing.
