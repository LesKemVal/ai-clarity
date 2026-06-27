export type SpeechQueueState = {
  queue: string[]
  stopped: boolean
}

export type SpeechQueueOptions = {
  getQueue: () => string[]
  setQueue: (queue: string[]) => void
  isStopped: () => boolean
  setStopped: (stopped: boolean) => void
  beforeStart?: () => void
  afterStop?: () => void
  pauseMs: (chunk: string) => number
  wait: (ms: number) => Promise<unknown>
  playChunk: (chunk: string) => Promise<void>
}

export async function drainSpeechQueue(options: SpeechQueueOptions) {
  options.beforeStart?.()
  options.setStopped(false)

  try {
    while (options.getQueue().length && !options.isStopped()) {
      const [chunk, ...remaining] = options.getQueue()
      options.setQueue(remaining)

      if (!chunk) continue

      await options.playChunk(chunk)

      if (!options.isStopped()) {
        await options.wait(options.pauseMs(chunk))
      }
    }
  } finally {
    options.afterStop?.()
  }
}

export function replaceSpeechQueue(
  options: Pick<SpeechQueueOptions, 'setQueue'>,
  chunks: string[]
) {
  options.setQueue([...chunks])
}

export function clearSpeechQueue(options: Pick<SpeechQueueOptions, 'setQueue' | 'setStopped'>) {
  options.setStopped(true)
  options.setQueue([])
}
