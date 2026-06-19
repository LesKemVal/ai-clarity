'use client'

import { useCallback, useRef, useState } from 'react'
import type {
  GeorgeActionCue,
  GeorgeLiveHubContext,
} from '@/lib/george/live-hub/types'
import type { GeorgeLiveHubTransport } from '@/lib/george/live-hub/transport'
import { createGeorgeLiveHubWebSocketTransport } from '@/lib/george/live-hub/websocket-transport'

export type { GeorgeActionCue }

export type GeorgeLiveHubStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'recording'
  | 'error'

export function useGeorgeLiveHub(params?: {
  url?: string
  onActionCue?: (cue: GeorgeActionCue) => void
}) {
  const transportRef = useRef<GeorgeLiveHubTransport | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [status, setStatus] = useState<GeorgeLiveHubStatus>('idle')
  const [lastActionCue, setLastActionCue] = useState<GeorgeActionCue | null>(null)
  const [error, setError] = useState('')

  const connect = useCallback((context?: GeorgeLiveHubContext) => {
    setError('')
    setStatus('connecting')

    const url =
      params?.url ||
      process.env.NEXT_PUBLIC_LIVE_HUB_URL ||
      'ws://localhost:8080'

    const transport = createGeorgeLiveHubWebSocketTransport({
      url,
      handlers: {
        onOpen: () => setStatus('connected'),
        onClose: () => setStatus('idle'),
        onError: (message) => {
          setStatus('error')
          setError(message)
        },
        onEvent: (event) => {
          if (event?.type !== 'ACTION_CUE') return

          const cue = event as GeorgeActionCue
          setLastActionCue(cue)
          params?.onActionCue?.(cue)
        },
      },
    })

    transportRef.current = transport
    transport.connect(context)
  }, [params])

  const startMic = useCallback(async () => {
    if (!transportRef.current) {
      setError('Connect LIVE hub first.')
      return
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    const recorder = new MediaRecorder(stream, { mimeType })
    recorderRef.current = recorder

    recorder.ondataavailable = async (event) => {
      if (!event.data?.size) return
      transportRef.current?.sendAudio(await event.data.arrayBuffer())
    }

    recorder.start(250)
    setStatus('recording')
  }, [])

  const stopMic = useCallback(() => {
    recorderRef.current?.stop()
    recorderRef.current = null

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    setStatus(transportRef.current ? 'connected' : 'idle')
  }, [])

  const disconnect = useCallback(() => {
    stopMic()
    transportRef.current?.close()
    transportRef.current = null
    setStatus('idle')
  }, [stopMic])

  const sendTranscript = useCallback((text: string, isFinal = true) => {
    const clean = String(text || '').trim()

    if (!clean) return

    if (!transportRef.current) {
      setError('Connect LIVE hub first.')
      return
    }

    transportRef.current.sendJson?.({
      type: 'TRANSCRIPT_INPUT',
      text: clean,
      isFinal,
    })
  }, [])

  return {
    status,
    error,
    lastActionCue,
    connect,
    startMic,
    stopMic,
    disconnect,
    sendTranscript,
  }
}
