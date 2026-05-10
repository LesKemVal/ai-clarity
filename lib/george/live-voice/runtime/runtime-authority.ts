import { georgeAdaptiveDeliveryPolicy } from './adaptive-delivery-policy'
import { georgeConversationWindow } from './conversation-window'
import { georgeDeliveryArbitrator } from './delivery-arbitrator'
import { georgeInterruptionEngine } from './interruption-engine'
import { georgeProviderHealth } from './provider-health'
import { georgeTurnManager } from './turn-manager'

export type LiveRuntimeAuthoritySnapshot = {
  roomState: string
  controlOwner: string
  interruptionHot: boolean
  canSpeak: boolean
  shouldInterrupt: boolean
  windowState: string
  arbitrationVerdict: string
  adaptiveProfile: string
  providerStatus: string
  reason: string
  checkedAt: number
}

class GeorgeRuntimeAuthority {
  private snapshot: LiveRuntimeAuthoritySnapshot = {
    roomState: 'idle',
    controlOwner: 'unclear',
    interruptionHot: false,
    canSpeak: false,
    shouldInterrupt: false,
    windowState: 'unknown',
    arbitrationVerdict: 'unknown',
    adaptiveProfile: 'balanced',
    providerStatus: 'unknown',
    reason: 'Runtime authority has not been evaluated yet.',
    checkedAt: 0,
  }

  evaluate() {
    const control = georgeTurnManager.getControlSnapshot()
    const windowState = georgeConversationWindow.evaluate()
    const arbitration = georgeDeliveryArbitrator.getSnapshot()
    const adaptive = georgeAdaptiveDeliveryPolicy.evaluate()
    const provider = georgeProviderHealth.check()

    const snapshot: LiveRuntimeAuthoritySnapshot = {
      roomState: georgeTurnManager.getState(),
      controlOwner: control.owner,
      interruptionHot: georgeInterruptionEngine.isHot(),
      canSpeak: georgeTurnManager.canGeorgeSpeak(),
      shouldInterrupt: georgeTurnManager.shouldInterruptGeorge(),
      windowState: windowState.state,
      arbitrationVerdict: arbitration.verdict,
      adaptiveProfile: adaptive.profile,
      providerStatus: provider.status,
      reason: this.resolveReason({
        controlOwner: control.owner,
        arbitrationVerdict: arbitration.verdict,
        adaptiveProfile: adaptive.profile,
      }),
      checkedAt: Date.now(),
    }

    this.snapshot = snapshot
    return snapshot
  }

  getSnapshot() {
    return this.snapshot
  }

  clear() {
    this.snapshot = {
      roomState: 'idle',
      controlOwner: 'unclear',
      interruptionHot: false,
      canSpeak: false,
      shouldInterrupt: false,
      windowState: 'unknown',
      arbitrationVerdict: 'unknown',
      adaptiveProfile: 'balanced',
      providerStatus: 'unknown',
      reason: 'Runtime authority has been reset.',
      checkedAt: 0,
    }

    return this.snapshot
  }

  private resolveReason(input: {
    controlOwner: string
    arbitrationVerdict: string
    adaptiveProfile: string
  }) {
    return [
      `Control: ${input.controlOwner}`,
      `Arbitration: ${input.arbitrationVerdict}`,
      `Adaptive profile: ${input.adaptiveProfile}`,
    ].join(' | ')
  }
}

export const georgeRuntimeAuthority =
  new GeorgeRuntimeAuthority()
