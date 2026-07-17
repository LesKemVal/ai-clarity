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

export function createAudioPlayback(options: AudioPlaybackOptions): AudioPlaybackHandle {
  const audio = new Audio()
  let started = false
  let settled = false

  const stopRequested = () => options.onStopRequested?.() === true

  const resolveOnce = (resolve: () => void) => {
    if (settled) return
    settled = true
    resolve()
  }

  const rejectOnce = (reject: (error: Error) => void, error: Error) => {
    if (settled) return
    settled = true
    reject(error)
  }

  const stop = () => {
    try {
      audio.pause()
    } catch {}
    audio.onended = null
    audio.onerror = null
    audio.oncanplaythrough = null
    audio.oncanplay = null
    audio.onloadeddata = null
  }

  const play = () => new Promise<void>((resolve, reject) => {
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

    const startAudioPlayback = () => {
      if (started) return
      started = true

      options.onBeforePlay?.()

      setTimeout(() => {
        if (stopRequested()) {
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

          rejectOnce(reject, error instanceof Error ? error : new Error('Audio playback failed'))
        })
      }, options.delayMs ?? 80)
    }

    audio.oncanplaythrough = startAudioPlayback
    audio.oncanplay = startAudioPlayback
    audio.onloadeddata = startAudioPlayback

    audio.load()
    setTimeout(startAudioPlayback, options.fallbackStartMs ?? 450)
  })

  return {
    audio,
    play,
    stop,
  }
}
