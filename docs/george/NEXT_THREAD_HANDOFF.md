# GEORGE PRODUCT EXPERIENCE CONTINUATION — NO DRIFT

Branch: `material-language-redesign`

## FIRST

Read completely, in order:

1. `docs/george/PRODUCTION_TRACKER.md`
2. `docs/george/RUNTIME_ARCHITECTURE.md`
3. `docs/george/OPERATIONAL_PROFILE.md`
4. `docs/george/NEXT_THREAD_HANDOFF.md`
5. `docs/george/HOMEPAGE_CONVERSATION_EXPERIENCE.md` when working on homepage-to-LIVE continuity

Inspect implementation before changing anything.

Continuation packets provide operational guidance only. The synchronized implementation, tracker, architecture, and operational profile are authoritative.

## CURRENT PHASE

GEORGE is in **Product Experience and Material Language Refinement**.

The runtime architecture, canonical ownership, portability, and production validation work have reached the point where product refinement is now the primary focus. Future work should improve the product experience rather than redesign the runtime unless implementation reveals a genuine defect.

The objective is to improve clarity, fluidity, consistency, and perceived quality without changing runtime ownership, reasoning authority, receiver policy, delivery authority, or production architecture.

Do not pull the project backward into architecture, portability, qualification reconstruction, or production-system construction unless current implementation evidence proves a concrete defect.

## ACTIVE WORK

Current sequence:

```text
Motion
↓
Materials
↓
Color
↓
Micro-interactions
↓
Visual refinement
```

Fluidity comes first.

The immediate product surface is Popup 3 / Ready Room. Correct its responsibility before the color and material pass.

## POPUP 3 / READY ROOM

Canonical flow:

1. Popup 1 — Operational Briefing
   - outcome;
   - responsibility;
   - participants;
   - conversation/context;
   - additional signals;
   - documents.

2. Popup 2 — Mechanics
   - support style;
   - receiver profile;
   - speaking style;
   - responsibility/privacy acknowledgement.

3. Popup 3 — Ready Room
   - final preparation before LIVE;
   - explains how GEORGE will behave using the already-selected mechanics.

Homepage/front-surface handoff may skip Popup 1 when preparation already occurred. Do not change routing while correcting Popup 3.

Popup 3 must dynamically explain:

- Audio: GEORGE speaks through earbuds or audio glasses;
- Glasses: GEORGE communicates visually, with audio available for immediate steering;
- Desktop / Mobile: GEORGE presents readable guidance on the responsive workspace;
- Adaptive Cue: brief support at the right moment;
- Continuation: support completing a thought when the user begins and pauses;
- Response: concise complete language when useful;
- Presentation: structured support for delivering a complete idea;
- adaptation when the room changes.

Remove the control-card/tutorial interpretation of Ready Room. It is readiness, not configuration or a catalogue of LIVE controls.

## MATERIAL MOTION DOCTRINE

One canonical motion authority should own the shared motion language:

```text
lib/george/ui/material-motion.ts
```

### Fade

Everything entering or leaving fades.

```text
180–250 ms
ease-out
```

No popping.

### Collapse

Size-changing regions animate height, opacity, and slight vertical translation.

```text
opacity: 0 → 1
translateY: 6px → 0
max-height: 0 → resolved height
```

### Workspace slide

Whole workspaces settle away and arrive subtly.

```text
150–220 ms
```

### Machine acknowledgement

No flash, bounce, or aggressive glow. Use a restrained light sweep, then settle.

### Conversation

Streaming intelligence streams. Completed intelligence becomes perfectly still. No idle shimmer on completed thoughts.

### Hover

Use 1–2 px lift, a slightly brighter edge, and a restrained reflection. No dramatic scaling.

### Press

Use approximately 1 px of mechanical travel, like an instrument-panel control.

## ARCHITECTURE GUARDRAILS

Do not create:

- another GEORGE;
- another runtime or reasoning lane;
- another support composer;
- another operational-assessment owner;
- another receiver-policy owner;
- another delivery router;
- page-level runtime intelligence;
- local motion systems that compete with the canonical material-motion authority.

`app/george/page.tsx` remains thin.

Rendering and motion consume approved state. They do not recompute upstream intelligence.

## READINESS REFERENCE

`docs/george/PRODUCTION_TRACKER.md` is the canonical status and readiness authority.

The architecture and operational profile own their respective boundaries; they should not be treated as duplicate project-status trackers.

The tracker records the qualifying evidence that moved GEORGE into product refinement, including portability, ownership, interface-freeze, operational-memory, latency, resilience, and production-build results.

`production-readiness-checklist.md` contains historical qualification material and must not be treated as the active phase without current implementation evidence.

## WORKING STYLE

The owner does not manually edit code or production documentation. Manual coding is less efficient for this workflow.

When the owner asks for the **next terminal command**, provide the complete, immediately runnable command that performs the agreed next action. Do not repeat the plan first. Do not provide placeholders. Do not instruct the owner to run an artifact that has not been generated.

Every local terminal command, patch command, or script-run command must begin exactly with:

```bash
id="031ukw"
id="xtdj16"
id="1dcmvv"
cd ~/ai-clarity
```

Execution requirements:

- include `cd ~/ai-clarity` in every runnable local command;
- prefer generated patches or downloadable Python scripts over manual edits;
- update synchronized authorities together;
- generate the patch or script before giving the run command;
- never use `/path/to/...` or another placeholder path;
- do not use shell heredocs for large changes;
- provide focused validation commands after execution.

Inspect first.

Patch only canonical owners.

Use small commits.

Build and run focused qualification after each implementation change.

Never commit a failed build.

Synchronize documentation after validated implementation changes.

Git is the recovery system. Do not create timestamped source backups, copied page files, `.backup-*` artifacts, or new patch-backup directories.

No drift.
