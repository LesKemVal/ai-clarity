'use client'

import { useCallback, useRef, useState } from 'react'

export type GeorgeActionCue = {
  cue: string
  reason: string
  source: 'local' | 'groq'
  localCue: string
  fastCue?: string
  category: string
  confidence: number
  priority: number
  at: number
}

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
  const wsRef = useRef<WebSocket | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [status, setStatus] = useState<GeorgeLiveHubStatus>('idle')
  const [lastActionCue, setLastActionCue] = useState<GeorgeActionCue | null>(null)
  const [error, setError] = useState('')

  const connect = useCallback((context?: Record<string, unknown>) => {
    setError('')
    setStatus('connecting')

    const url =
      params?.url ||
      process.env.NEXT_PUBLIC_LIVE_HUB_URL ||
      'ws://localhost:8080'

    const ws = new WebSocket(url)
    ws.binaryType = 'arraybuffer'

    ws.onopen = () => {
      setStatus('connected')
      ws.send(JSON.stringify({
        type: 'SYNC_CONTEXT',
        context: context || {},
      }))
    }

    ws.onmessage = (message) => {
      try {
        const event = JSON.parse(String(message.data))

        if (event?.type === 'ACTION_CUE') {
          const cue = event as GeorgeActionCue
          setLastActionCue(cue)
          params?.onActionCue?.(cue)
        }
      } catch {}
    }

    ws.onerror = () => {
      setStatus('error')
      setError('LIVE hub connection failed.')
    }

    ws.onclose = () => {
      setStatus('idle')
    }

    wsRef.current = ws
  }, [params])

  const startMic = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
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
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

      wsRef.current.send(await event.data.arrayBuffer())
    }

    recorder.start(250)
    setStatus('recording')
  }, [])

  const stopMic = useCallback(() => {
    recorderRef.current?.stop()
    recorderRef.current = null

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    setStatus(wsRef.current?.readyState === WebSocket.OPEN ? 'connected' : 'idle')
  }, [])

  const disconnect = useCallback(() => {
    stopMic()
    wsRef.current?.close()
    wsRef.current = null
    setStatus('idle')
  }, [stopMic])

  return {
    status,
    error,
    lastActionCue,
    connect,
    startMic,
    stopMic,
    disconnect,
  }
}
