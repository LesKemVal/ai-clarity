export type PressureMemoryInput = {
  text: string
  trajectory?: string
  recovery?: string
  roomPressure?: string
  interruptionRisk?: number
  decisionAction?: string
  memoryWindow?: number
}

export type PressureMemoryState = {
  tensionTurns: number
  interruptionTurns: number
  failedCloseTurns: number
  overexplainTurns: number
  fatigueScore: number
  summary: string
}

class GeorgePressureMemory {
  private tensionTurns = 0
  private interruptionTurns = 0
  private failedCloseTurns = 0
  private overexplainTurns = 0

  update(input: PressureMemoryInput): PressureMemoryState {
    const text = input.text.toLowerCase()
    const decayStep = input.memoryWindow && input.memoryWindow >= 10 ? 0.5 : 1

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
      /wait|hold on|stop|listen|no\b|let me finish/i.test(text) ||
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
      this.failedCloseTurns = Math.max(0, this.failedCloseTurns - decayStep)
    }

    if (
      input.recovery === 'defensive_spiral' ||
      /sorry|i just|let me explain|what i meant/i.test(text)
    ) {
      this.overexplainTurns += 1
    } else {
      this.overexplainTurns = Math.max(0, this.overexplainTurns - decayStep)
    }

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
      summary:
        fatigueScore > 0.72
          ? 'Pressure memory high. Simplify and reduce output.'
          : fatigueScore > 0.42
            ? 'Pressure accumulating. Keep guidance tight.'
            : 'Pressure memory stable.',
    }
  }

  clear() {
    this.tensionTurns = 0
    this.interruptionTurns = 0
    this.failedCloseTurns = 0
    this.overexplainTurns = 0
  }
}

export const georgePressureMemory =
  new GeorgePressureMemory()
