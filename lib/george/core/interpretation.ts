export type GeorgeCoreInterpretation = {
  speakerIntent?: unknown
  conversationSignals?: unknown
  roomAnalysis?: unknown
  objective?: unknown
  trajectory?: unknown
  activeOutcome?: string
  outcomeGovernor?: unknown
  source: 'george_core_interpretation'
  createdAt: number
}

export function createGeorgeCoreInterpretation(
  input: Omit<GeorgeCoreInterpretation, 'source' | 'createdAt'>
): GeorgeCoreInterpretation {
  return {
    ...input,
    source: 'george_core_interpretation',
    createdAt: Date.now(),
  }
}
