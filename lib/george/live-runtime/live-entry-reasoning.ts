export type LiveEntryReasoningInput = {
  objective?: string
  position?: string
  audience?: string
  roomSignal?: string
  secondaryPosition?: string
  userName?: string
  proofTranscript?: string
}

export type LiveEntryReasoningOutput = {
  roomObservation: string
  supportSummary: string
  commitmentStatement: string
}

export function fallbackLiveEntryReasoning(
  input: LiveEntryReasoningInput,
): LiveEntryReasoningOutput {
  return {
    roomObservation:
      input.roomSignal?.trim() ||
      "There may be more happening in this room than what is said directly.",

    supportSummary:
      "I'll adapt support to this room while preserving your agency and your voice.",

    commitmentStatement:
      "I'll keep that in mind.",
  }
}
