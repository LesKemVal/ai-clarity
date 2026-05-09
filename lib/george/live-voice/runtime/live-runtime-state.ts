export type LiveRuntimeSnapshot = {
  updatedAt: number
  transcript: string
  speaker: string
  objective: string
  confidence: number
  roomPressure: string
  interruptionRisk: number
  velocity: string
  powerFrame: string
  trajectory: string
  recovery: string
  posture: string
  load: string
  silence: string
  deliveryProfile: string
  shouldSpeak: boolean
  nextMove: string
  cue: string
  status: string
}

const EMPTY_STATE: LiveRuntimeSnapshot = {
  updatedAt: 0,
  transcript: '',
  speaker: 'unclear',
  objective: 'clarify',
  confidence: 0,
  roomPressure: 'low',
  interruptionRisk: 0,
  velocity: 'stable',
  powerFrame: 'balanced',
  trajectory: 'neutral',
  recovery: 'stable',
  posture: 'neutral',
  load: 'low',
  silence: 'unknown',
  deliveryProfile: 'whisperer',
  shouldSpeak: false,
  nextMove: '',
  cue: '',
  status: '',
}

class GeorgeLiveRuntimeState {
  private snapshot: LiveRuntimeSnapshot = { ...EMPTY_STATE }

  update(next: Partial<LiveRuntimeSnapshot>) {
    this.snapshot = {
      ...this.snapshot,
      ...next,
      updatedAt: Date.now(),
    }

    return this.snapshot
  }

  get() {
    return this.snapshot
  }

  clear() {
    this.snapshot = { ...EMPTY_STATE }
    return this.snapshot
  }
}

export const georgeLiveRuntimeState =
  new GeorgeLiveRuntimeState()
