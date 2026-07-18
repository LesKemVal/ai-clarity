export type AudioPlaybackHandle = {
  audio: HTMLAudioElement
  play: () => Promise<void>
  stop: () => void
}

export type AudioPlaybackOptions = {
  url: string
  delayMs?: number
  fallbackStartMs?: number
  onBeforePlay?: () => void
  onPlaybackStart?: () => void
  onPlaybackEnd?: () => void
  onStopRequested?: () => boolean
  onError?: (event: Event | string, audio: HTMLAudioElement) => void
}

const DEFAULT_AUDIO_START_DELAY_MS = 0
const DEFAULT_AUDIO_FALLBACK_START_MS = 180

export function createAudioPlayback(options: AudioPlaybackOptions): AudioPlaybackHandle {
  const audio = new Audio()
  let started = false
  let settled = false
  let startTimer: ReturnType<typeof setTimeout> | null = null
  let fallbackTimer: ReturnType<typeof setTimeout> | null = null
  let resolvePlayback: (() => void) | null = null

  const stopRequested = () => options.onStopRequested?.() === true

  const clearPlaybackTimers = () => {
    if (startTimer) {
      clearTimeout(startTimer)
      startTimer = null
    }

    if (fallbackTimer) {
      clearTimeout(fallbackTimer)
      fallbackTimer = null
    }
  }

  const detachPlaybackListeners = () => {
    audio.onended = null
    audio.onerror = null
    audio.oncanplaythrough = null
    audio.oncanplay = null
    audio.onloadeddata = null
  }

  const resolveOnce = (resolve: () => void) => {
    if (settled) return
    settled = true
    clearPlaybackTimers()
    detachPlaybackListeners()
    resolvePlayback = null
    resolve()
  }

  const rejectOnce = (reject: (error: Error) => void, error: Error) => {
    if (settled) return
    settled = true
    clearPlaybackTimers()
    detachPlaybackListeners()
    resolvePlayback = null
    reject(error)
  }

  const stop = () => {
    clearPlaybackTimers()

    try {
      audio.pause()
    } catch {}

    detachPlaybackListeners()

    if (!settled) {
      settled = true
      const resolve = resolvePlayback
      resolvePlayback = null
      resolve?.()
    }
  }

  const play = () => new Promise<void>((resolve, reject) => {
    resolvePlayback = resolve
    audio.preload = 'auto'
    audio.setAttribute('playsinline', 'true')
    audio.src = options.url

    audio.onended = () => {
      options.onPlaybackEnd?.()
      resolveOnce(resolve)
    }

    audio.onerror = (event) => {
      if (stopRequested()) {
        resolveOnce(resolve)
        return
      }

      options.onError?.(event, audio)
      rejectOnce(reject, new Error('Audio playback failed'))
    }

    const beginAudioPlayback = () => {
      if (settled || stopRequested()) {
        resolveOnce(resolve)
        return
      }

      audio.play().then(() => {
        options.onPlaybackStart?.()
      }).catch((error) => {
        if (stopRequested()) {
          resolveOnce(resolve)
          return
        }

        rejectOnce(
          reject,
          error instanceof Error ? error : new Error('Audio playback failed')
        )
      })
    }

    const startAudioPlayback = () => {
      if (started || settled) return
      started = true
      clearPlaybackTimers()
      options.onBeforePlay?.()

      const delayMs = Math.max(
        0,
        options.delayMs ?? DEFAULT_AUDIO_START_DELAY_MS
      )

      if (delayMs === 0) {
        beginAudioPlayback()
        return
      }

      startTimer = setTimeout(beginAudioPlayback, delayMs)
    }

    audio.oncanplaythrough = startAudioPlayback
    audio.oncanplay = startAudioPlayback
    audio.onloadeddata = startAudioPlayback

    audio.load()
    fallbackTimer = setTimeout(
      startAudioPlayback,
      Math.max(0, options.fallbackStartMs ?? DEFAULT_AUDIO_FALLBACK_START_MS)
    )
  })

  return {
    audio,
    play,
    stop,
  }
}
