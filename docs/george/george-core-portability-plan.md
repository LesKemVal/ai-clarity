# GEORGE Core Portability Plan

## Goal

Separate GEORGE's portable brain from the BRANESx application so GEORGE can be reused, licensed, embedded, or leased without depending on app/george/page.tsx.

## Product Principle

GEORGE Core is not the UI.

GEORGE Core is the reasoning/runtime system that determines:

- what is happening
- who is speaking
- what outcome is active
- what signal is missing
- whether GEORGE should speak, hold, clarify, protect, or move
- what delivery instruction is safest and most useful

## Production Boundary

GEORGE Core must not depend on:

- React
- page.tsx
- browser APIs
- window
- localStorage
- DOM
- Stripe
- visual components
- app-specific session UI

GEORGE Core may depend on:

- plain TypeScript
- structured inputs
- memory snapshots
- runtime configuration
- model adapters
- telemetry interfaces

## Proposed Core Structure

lib/george/core/
  signals/
  intent/
  outcome/
  authority/
  policy/
  memory/
  telemetry/
  adapters/

## PORTABLE_BRAIN Candidates

### Signal Layer

- speaker-intent.ts
- conversation-signals.ts
- signal-ranking.ts
- signal-sufficiency.ts
- room-analyzer.ts

### Outcome Layer

- active-outcome.ts
- outcome-governor.ts
- objective-engine.ts
- trajectory-engine.ts

### Authority Layer

- transcript-routing.ts
- live-transcript-controller.ts
- live-action-authority.ts

### Policy Layer

- response-policy.ts
- steering-continuation.ts
- live-fast-path.ts

### Reasoning Reference

- governor.ts
- live-reasoning.ts
- conversation-engine.ts

## APP_CLIENT_ONLY

- app/george/page.tsx
- components/george/live/*
- Prep Room UI
- billing/subscription UI
- session restoration UI
- Stripe/payment flows

## Core Runtime Contract

Input:

- transcript
- room
- desiredOutcome
- knownContext
- userPosition
- memory
- mode
- capability flags

Output:

- action
- move
- movementState
- activeOutcome
- missingSignal
- confidence
- reason
- deliveryInstruction
- telemetry

## Migration Rule

Do not move files just because they look portable.

For each module:

1. prove active callers
2. prove no UI/browser dependency
3. create tests
4. wrap with stable input/output type
5. then move into core

## Production Requirement

Before GEORGE Core is lease-ready, it must have:

- deterministic tests for core modules
- stable public runtime contract
- versioned API surface
- telemetry events
- tenant/licensing boundary
- usage metering boundary
- model/provider adapter boundary
- safety/agency rules enforced outside UI

## Working Goal

One truthful runtime:

Transcript
→ Signal Layer
→ Intent Layer
→ Outcome Layer
→ Authority Layer
→ Policy/Delivery Layer
→ Execution Adapter
