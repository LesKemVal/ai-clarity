# GEORGE Chat Runtime Governance

This document preserves the current runtime direction while `app/api/chat/route.ts` is gradually modularized.

## Active Product Runtime

GEORGE currently has two active experiences:

1. **Normal GEORGE**
   - Direction
   - Execution
   - Continuity
   - Planning
   - Writing
   - Anti-drift support

2. **LIVE GEORGE**
   - Individual real-time conversational assistance
   - Pressure handling
   - Timing and cadence
   - Speakable next lines
   - Tone and restraint cues
   - Socially invisible runtime steering

## Shelved Runtime

**Pro LIVE / campaign / firm-mode logic is shelved.**

It must not govern the current runtime.

Do not deepen or expand:

- campaign management
- CRM workflows
- firm-mode assumptions
- sales-pipeline governance
- call-center management surfaces
- team-level Pro LIVE execution

Preserve only the reusable primitives:

- pressure handling
- objection detection
- tone calibration
- cadence control
- gatekeeper dynamics
- next-move guidance
- service/operator call assistance
- speakable response shaping

## Current Governance Modules

### `lib/george/chat/runtime-signals.ts`

Owns pure signal interpretation:

- control-state classification
- runtime signal scoring
- bottleneck detection
- builder subtype detection
- cadence avoidance
- live-scenario detection

### `lib/george/chat/current-runtime-policy.ts`

Owns current runtime normalization:

- normal GEORGE vs LIVE GEORGE
- campaign mode normalization while Pro LIVE is shelved
- prevention of legacy campaign context governing current runtime

### `lib/george/chat/live-context.ts`

Owns individual LIVE room context:

- interviews
- workplace pressure
- negotiation
- advocacy
- relationship/family tension
- sales/service conversations
- telephone/service operator calls
- presentations
- learning/explanation contexts

### `lib/george/chat/response-shaping.ts`

Owns current response-shape policy:

- sentence compression
- LIVE vs normal posture
- format preference
- what to avoid
- what to prefer

### `lib/george/chat/continuity-governance.ts`

Owns continuity authority boundaries:

- session signal vs memory
- explicit goal vs inferred goal
- LIVE transcript vs durable continuity
- third-party speech vs user-owned memory

### `lib/george/live-runtime/pro-live-boundary.ts`

Owns the shelved Pro LIVE doctrine:

- future resurrection path
- reusable primitives
- explicit exclusion from current runtime

### `lib/george/chat/orchestration-map.ts`

Owns the high-level runtime map.

## Migration Rules

When touching `app/api/chat/route.ts`:

1. Do not rewrite the full route.
2. Do not change GEORGE's tone or doctrine unless explicitly requested.
3. Do not reactivate Pro LIVE campaign assumptions.
4. Extract one responsibility at a time.
5. Build after every extraction.
6. Preserve current behavior unless a bug is explicitly being fixed.
7. Prefer import-and-replace for pure helpers first.
8. Do not remove legacy campaign types until all callsites are understood.
9. Treat LIVE transcript and third-party speech as room context, not durable memory.
10. Treat explicit user actions as the threshold for goal/memory persistence.

## First Safe Route Integration

The first local patch should import from:

```ts
import {
  classifyControlState,
  scoreRuntimeSignals,
  detectLikelyBottleneck,
  detectBuilderSubtype,
  detectCadenceAvoidance,
  detectLiveScenario,
} from '@/lib/george/chat/runtime-signals'
```

Then remove only the duplicate local helper implementations from `app/api/chat/route.ts`.

Do not change output text, prompt content, or model selection during that patch.

## Second Safe Route Integration

Normalize mode with:

```ts
import {
  normalizeCurrentGeorgeMode,
  getCurrentGeorgeRuntime,
  shouldApplyLegacyCampaignContext,
  getShelvedCampaignRuntimeNote,
} from '@/lib/george/chat/current-runtime-policy'
```

Then ensure:

- `campaign` mode becomes `conversation` while Pro LIVE is shelved
- old activeCampaign blocks are suppressed unless Pro LIVE is deliberately reinstated
- reusable primitives remain available through LIVE context, not campaign governance

## Do Not Drift

The current product is not a generic chatbot and not a campaign CRM.

It is GEORGE:

- operational
- direct
- human
- continuity-aware
- runtime-guided
- useful under pressure

The architecture should serve that identity.
