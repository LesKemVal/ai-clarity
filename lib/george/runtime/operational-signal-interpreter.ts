import type { OperationalSignal } from './operational-signals'
import { hasOperationalSignal } from './operational-signals'
import type { RuntimeSignalArbitrationInput } from './runtime-signal-arbitrator'

export function interpretOperationalSignalsForArbitration(
  signals: OperationalSignal[] | null | undefined
): Partial<RuntimeSignalArbitrationInput> {
  return {
    livePressure:
      hasOperationalSignal(signals, 'authority_pressure') ||
      hasOperationalSignal(signals, 'pressure_rising'),

    objectiveRisk:
      hasOperationalSignal(signals, 'interruption_attempt') ||
      hasOperationalSignal(signals, 'proof_challenge') ||
      hasOperationalSignal(signals, 'objective_threatened'),

    shouldNarrow:
      hasOperationalSignal(signals, 'information_missing'),
  }
}
