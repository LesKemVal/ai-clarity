import { detectConversationSignals } from './conversation-signals'

export type PressureMemoryInput = {
  text: string
  trajectory?: string
  recovery?: string
  roomPressure?: string
  interruptionRisk?: number
  decisionAction?: string
  memoryWindow?: number
  dominantRole?: string | null
}

export type PressureMemoryState = {
  tensionTurns: number
  interruptionTurns: number
  failedCloseTurns: number
  overexplainTurns: number
  fatigueScore: number
  rolePressure: Record<string, number>
  summary: string
}

class GeorgePressureMemory {
  private tensionTurns = 0
  private interruptionTurns = 0
  private failedCloseTurns = 0
  private overexplainTurns = 0
  private rolePressure: Record<string, number> = {
    authority: 0,
    skeptic: 0,
    gatekeeper: 0,
    ally: 0,
  }

  private updateRolePressure(input: PressureMemoryInput) {
    const role = input.dominantRole

    Object.keys(this.rolePressure).forEach((key) => {
      this.rolePressure[key] = Math.max(0, this.rolePressure[key] - 0.25)
    })

    if (!role || role === 'neutral' || role === 'unclear' || role === 'user') return
    if (!(role in this.rolePressure)) return

    const pressure =
      input.trajectory === 'escalating_conflict' ||
      input.trajectory === 'resistance_hardening' ||
      input.decisionAction === 'redirect' ||
      (input.interruptionRisk || 0) > 0.72 ||
      input.roomPressure === 'high' ||
      input.roomPressure === 'authority'

    const support =
      role === 'ally' &&
      (
        input.trajectory === 'positive' ||
        input.trajectory === 'decision_ready'
      )

    if (pressure || support) {
      this.rolePressure[role] = Math.min(5, this.rolePressure[role] + (support ? 0.7 : 1))
    }
  }

  update(input: PressureMemoryInput): PressureMemoryState {
    const text = input.text.toLowerCase()
    const signals = detectConversationSignals(text)
    const persistentMemory =
      input.memoryWindow && input.memoryWindow >= 10

    const decayStep = persistentMemory ? 0.5 : 1
    const failedCloseDecay = persistentMemory ? 0.35 : 1

    if (
      input.roomPressure === 'high' ||
      input.roomPressure === 'authority' ||
      input.trajectory === 'escalating_conflict' ||
      (input.interruptionRisk || 0) > 0.7
    ) {
      this.tensionTurns += 1
    } else {
      this.tensionTurns = Math.max(0, this.tensionTurns - decayStep)
    }

    if (
      signals.has('interruption_attempt') ||
      (input.interruptionRisk || 0) > 0.78
    ) {
      this.interruptionTurns += 1
    } else {
      this.interruptionTurns = Math.max(0, this.interruptionTurns - decayStep)
    }

    if (
      input.trajectory === 'resistance_hardening' ||
      input.decisionAction === 'redirect'
    ) {
      this.failedCloseTurns += 1
    } else {
      this.failedCloseTurns = Math.max(0, this.failedCloseTurns - failedCloseDecay)
    }

    if (
      input.recovery === 'defensive_spiral' ||
      signals.has('defensive_language')
    ) {
      this.overexplainTurns += 1
    } else {
      this.overexplainTurns = Math.max(0, this.overexplainTurns - decayStep)
    }

    this.updateRolePressure(input)

    const fatigueScore = Math.min(
      1,
      Number(
        (
          this.tensionTurns * 0.18 +
          this.interruptionTurns * 0.22 +
          this.failedCloseTurns * 0.18 +
          this.overexplainTurns * 0.2
        ).toFixed(2)
      )
    )

    return {
      tensionTurns: this.tensionTurns,
      interruptionTurns: this.interruptionTurns,
      failedCloseTurns: this.failedCloseTurns,
      overexplainTurns: this.overexplainTurns,
      fatigueScore,
      rolePressure: { ...this.rolePressure },
      summary:
        fatigueScore > 0.72
          ? 'Pressure memory high. Stabilize cadence and reduce cognitive load.'
          : fatigueScore > 0.42
            ? 'Pressure accumulating. Keep guidance clean and synchronized.'
            : 'Pressure memory stable.',
    }
  }

  clear() {
    this.tensionTurns = 0
    this.interruptionTurns = 0
    this.failedCloseTurns = 0
    this.overexplainTurns = 0
    this.rolePressure = {
      authority: 0,
      skeptic: 0,
      gatekeeper: 0,
      ally: 0,
    }
  }
}

export const georgePressureMemory =
  new GeorgePressureMemory()
