# GEORGE Production Engineering Guide

This repository is in **Production Completion**.

The objective is to complete production systems, not redesign GEORGE.

---

## Core Doctrine

- One operational intelligence.
- One runtime.
- One reasoning authority.
- Normal and LIVE are operating modes, not separate intelligences.
- Do not introduce competing ownership.
- Do not redesign completed architecture.

---

## Engineering Discipline

Always follow this order:

1. Inspect implementation before changing anything.
2. Identify the canonical owner.
3. Detect duplicate ownership.
4. Patch only the canonical owner.
5. Make the smallest change that satisfies the milestone.
6. Build after every change.
7. Never leave the repository in a failing build state.
8. Do not commit unless explicitly instructed.

---

## Scope Control

Do not:

- redesign GEORGE
- introduce another runtime
- move responsibilities between owners
- modify unrelated files
- reopen completed architectural decisions

---

## Implementation Style

- Prefer inspection before implementation.
- Keep commits small.
- One milestone per change.
- Preserve portability.
- Preserve canonical ownership.

---

## Build Validation

Before considering work complete, run:

npm run build

If the build fails:

- stop
- diagnose
- fix only the canonical owner
- rebuild

Never report completion without a successful build.

---

## Response Format

For every implementation task, report:

1. Inspection summary
2. Canonical owner
3. Changes made
4. Validation performed
5. Build result
6. Files modified

Do not commit unless explicitly instructed.
