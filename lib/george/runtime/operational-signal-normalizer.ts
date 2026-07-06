import type { ConversationSignalState } from '@/lib/george/live-voice/runtime/conversation-signals'
import type { OperationalSignal, OperationalSignalKind } from './operational-signals'

const CONVERSATION_SIGNAL_MAP: Partial<Record<string, OperationalSignalKind>> = {
  hesitation: 'hesitation',
  interruption_attempt: 'interruption_attempt',
  authority_pressure: 'authority_pressure',
  proof_challenge: 'proof_challenge',
  resistance: 'resistance',
}

export function normalizeConversationSignals(
  state: ConversationSignalState | null | undefined
): OperationalSignal[] {
  if (!state?.signals?.length) return []

  const normalized: OperationalSignal[] = []

  for (const signal of state.signals) {
    const kind = CONVERSATION_SIGNAL_MAP[signal]
    if (!kind) continue

    normalized.push({
      kind,
      strength: 'moderate',
      source: 'conversation',
      confidence: 0.68,
      evidence: signal,
    })
  }

  return normalized
}
