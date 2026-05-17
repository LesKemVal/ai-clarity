export type ContinuationDirection =
  | 'idle'
  | 'continue'
  | 'hold'
  | 'reset'

class ContinuationState {
  private direction: ContinuationDirection = 'idle'
  private lastSignal = ''

  set(signal: string, direction: ContinuationDirection) {
    this.lastSignal = signal
    this.direction = direction
  }

  get() {
    return {
      signal: this.lastSignal,
      direction: this.direction,
    }
  }

  clear() {
    this.direction = 'idle'
    this.lastSignal = ''
  }
}

export const continuationState = new ContinuationState()
