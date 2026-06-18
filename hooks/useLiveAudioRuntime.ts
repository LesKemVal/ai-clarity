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
  const statusRef = useRef<LiveAudioStatus>('idle')
  const [interimTranscript, setInterimTranscript] = useState('')

  const updateStatus = useCallback((nextStatus: LiveAudioStatus) => {
    statusRef.current = nextStatus
    setStatus(nextStatus)
  }, [])

  useEffect(() => {
    enabledRef.current = enabled
    onPartialTranscriptRef.current = onPartialTranscript
    onFinalTranscriptRef.current = onFinalTranscript
    onErrorRef.current = onError
  }, [enabled, onError, onFinalTranscript, onPartialTranscript])

  const stop = useCallback(() => {
    runtimeRef.current?.stop()
    runtimeRef.current = null
    updateStatus('idle')
  }, [updateStatus])

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
    console.info('[GEORGE LIVE AUDIO HOOK] start called', {
      enabled: enabledRef.current,
      status: statusRef.current,
      hasRuntime: Boolean(runtimeRef.current),
    })

    if (!enabledRef.current) {
      console.warn('[GEORGE LIVE AUDIO HOOK] start blocked: disabled')
      return
    }

    if (
      runtimeRef.current &&
      (statusRef.current === 'starting' || statusRef.current === 'listening')
    ) {
      console.info('[GEORGE LIVE AUDIO HOOK] start ignored: already active', {
        status: statusRef.current,
      })
      return
    }

    runtimeRef.current?.stop()

    runtimeRef.current = createLiveAudioRuntime({
      onStatus: (nextStatus) => {
        console.info('[GEORGE LIVE AUDIO HOOK] status', nextStatus)
        updateStatus(nextStatus === 'starting' || nextStatus === 'listening' ? nextStatus : nextStatus === 'error' ? 'error' : 'idle')
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
        console.error('[GEORGE LIVE AUDIO HOOK] error', error)
        updateStatus('error')
        onErrorRef.current?.(error)
      },
    })

    void runtimeRef.current.start()
  }, [])

  useEffect(() => {
    if (!enabled) {
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
