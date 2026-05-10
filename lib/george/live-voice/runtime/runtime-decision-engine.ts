import type { LiveRuntimeAuthoritySnapshot } from './runtime-authority'
import { georgeRuntimeAuthority } from './runtime-authority'

export type LiveRuntimeDecision =
  | 'speak'
  | 'whisper'
  | 'interrupt'
  | 'suppress'
  | 'hold'
  | 'yield'
  | 'queue'

export type LiveRuntimeDecisionSnapshot = {
  decision: LiveRuntimeDecision
  confidence: number
  reason: string
  authority: LiveRuntimeAuthoritySnapshot
  checkedAt: number
}

class GeorgeRuntimeDecisionEngine {
  private snapshot: LiveRuntimeDecisionSnapshot | null = null

  decide(authority: LiveRuntimeAuthoritySnapshot = georgeRuntimeAuthority.evaluate()) {
    const decision = this.resolveDecision(authority)
    const confidence = this.resolveConfidence(authority, decision)

    this.snapshot = {
      decision,
      confidence,
      reason: this.resolveReason(authority, decision),
      authority,
      checkedAt: Date.now(),
    }

    return this.snapshot
  }

  getSnapshot() {
    return this.snapshot
  }

  clear() {
    this.snapshot = null
  }

  private resolveDecision(
    authority: LiveRuntimeAuthoritySnapshot
  ): LiveRuntimeDecision {
    if (authority.shouldInterrupt) return 'interrupt'
    if (authority.controlOwner === 'other_party' && !authority.canSpeak) return 'yield'
    if (authority.windowState === 'closed') return 'hold'
    if (authority.arbitrationVerdict === 'suppress') return 'suppress'
    if (authority.arbitrationVerdict === 'delay') return 'queue'
    if (authority.arbitrationVerdict === 'interrupt') return 'interrupt'
    if (authority.adaptiveProfile === 'silent') return 'hold'
    if (authority.adaptiveProfile === 'cautious') return 'whisper'

    if (
      authority.canSpeak &&
      !authority.silenceWindowOpen
    ) {
      return 'queue'
    }

    if (authority.canSpeak) return 'speak'

    return 'hold'
  }

  private resolveConfidence(
    authority: LiveRuntimeAuthoritySnapshot,
    decision: LiveRuntimeDecision
  ) {
    if (decision === 'interrupt' && authority.shouldInterrupt) return 0.9
    if (decision === 'yield' && authority.controlOwner === 'other_party') return 0.86
    if (decision === 'hold' && authority.windowState === 'closed') return 0.84
    if (decision === 'suppress' && authority.arbitrationVerdict === 'suppress') return 0.82
    if (decision === 'queue' && authority.arbitrationVerdict === 'delay') return 0.74
    if (decision === 'speak' && authority.canSpeak) return 0.72
    return 0.58
  }

  private resolveReason(
    authority: LiveRuntimeAuthoritySnapshot,
    decision: LiveRuntimeDecision
  ) {
    return `Decision: ${decision}. ${authority.reason}`
  }
}

export const georgeRuntimeDecisionEngine =
  new GeorgeRuntimeDecisionEngine()
