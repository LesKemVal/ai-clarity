'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createLiveAudioRuntime,
  type LiveAudioRuntime,
} from '@/lib/george/live-voice/audio/live-audio-runtime'

type LiveAudioStatus = 'idle' | 'starting' | 'listening' | 'error'

type UseLiveAudioRuntimeParams = {
  enabled: boolean
  onPartialTranscript?: (text: string) => void
  onFinalTranscript?: (text: string) => void
  onError?: (error: unknown) => void
}

export function useLiveAudioRuntime({
  enabled,
  onPartialTranscript,
  onFinalTranscript,
  onError,
}: UseLiveAudioRuntimeParams) {
  const runtimeRef = useRef<LiveAudioRuntime | null>(null)
  const [status, setStatus] = useState<LiveAudioStatus>('idle')
  const [interimTranscript, setInterimTranscript] = useState('')

  const stop = useCallback(() => {
    runtimeRef.current?.stop()
    runtimeRef.current = null
    setStatus('idle')
  }, [])

  const emergencyStop = useCallback(() => {
    try {
      const stoppers = (window as any).__GEORGE_DEEPGRAM_STOPPERS__
      if (Array.isArray(stoppers)) {
        stoppers.slice().forEach((stopper: unknown) => {
          if (typeof stopper === 'function') stopper()
        })
      }
    } catch {}

    stop()
  }, [stop])

  const start = useCallback(() => {
    if (!enabled) return

    runtimeRef.current?.stop()

    runtimeRef.current = createLiveAudioRuntime({
      onStatus: (nextStatus) => {
        setStatus(nextStatus === 'starting' || nextStatus === 'listening' ? nextStatus : nextStatus === 'error' ? 'error' : 'idle')
      },
      onPartialTranscript: (text) => {
        setInterimTranscript(text)
        onPartialTranscript?.(text)
      },
      onFinalTranscript: (text) => {
        const clean = String(text || '').trim()
        if (!clean) return
        setInterimTranscript('')
        onFinalTranscript?.(clean)
      },
      onError: (error) => {
        setStatus('error')
        onError?.(error)
      },
    })

    void runtimeRef.current.start()
  }, [enabled, onError, onFinalTranscript, onPartialTranscript])

  useEffect(() => {
    if (!enabled) {
      stop()
    }

    return () => {
      stop()
    }
  }, [enabled, stop])

  return {
    status,
    isListening: status === 'starting' || status === 'listening',
    interimTranscript,
    start,
    stop,
    emergencyStop,
  }
}
