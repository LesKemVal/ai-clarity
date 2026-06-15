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
  const enabledRef = useRef(enabled)
  const onPartialTranscriptRef = useRef(onPartialTranscript)
  const onFinalTranscriptRef = useRef(onFinalTranscript)
  const onErrorRef = useRef(onError)
  const [status, setStatus] = useState<LiveAudioStatus>('idle')
  const [interimTranscript, setInterimTranscript] = useState('')

  useEffect(() => {
    enabledRef.current = enabled
    onPartialTranscriptRef.current = onPartialTranscript
    onFinalTranscriptRef.current = onFinalTranscript
    onErrorRef.current = onError
  }, [enabled, onError, onFinalTranscript, onPartialTranscript])

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
    if (!enabledRef.current) return

    runtimeRef.current?.stop()

    runtimeRef.current = createLiveAudioRuntime({
      onStatus: (nextStatus) => {
        setStatus(nextStatus === 'starting' || nextStatus === 'listening' ? nextStatus : nextStatus === 'error' ? 'error' : 'idle')
      },
      onPartialTranscript: (text) => {
        setInterimTranscript(text)
        onPartialTranscriptRef.current?.(text)
      },
      onFinalTranscript: (text) => {
        const clean = String(text || '').trim()
        if (!clean) return
        setInterimTranscript('')
        onFinalTranscriptRef.current?.(clean)
      },
      onError: (error) => {
        setStatus('error')
        onErrorRef.current?.(error)
      },
    })

    void runtimeRef.current.start()
  }, [])

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
