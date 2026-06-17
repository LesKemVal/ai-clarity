'use client'

import { useCallback, useEffect, useRef } from 'react'

type LiveReflexIntent =
  | 'pause'
  | 'repeat_last_line'
  | 'compress_last_line'
  | 'buy_time'

type LiveReflexEvent = {
  intent: LiveReflexIntent
  transcript: string
}

type SpeechRecognitionResultLike = {
  isFinal: boolean
  0: {
    transcript: string
  }
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

type SpeechRecognitionInstance = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

type UseLiveReflexListenerParams = {
  enabled: boolean
  active: boolean
  onReflex: (event: LiveReflexEvent) => void
}

function detectLiveReflexIntent(text: string): LiveReflexIntent | null {
  const clean = String(text || '').trim().toLowerCase()
  if (!clean) return null

  if (/\b(wait|pause|stop|hold on)\b/.test(clean)) return 'pause'
  if (/\b(repeat|say that again|line|give me the line)\b/.test(clean)) return 'repeat_last_line'
  if (/\b(shorter|tighten it|make it shorter|keep it tight)\b/.test(clean)) return 'compress_last_line'
  if (/\b(one second|give me a second|give me a moment|let me think)\b/.test(clean)) return 'buy_time'

  return null
}

export function useLiveReflexListener({
  enabled,
  active,
  onReflex,
}: UseLiveReflexListenerParams) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const onReflexRef = useRef(onReflex)
  const activeRef = useRef(active)

  useEffect(() => {
    onReflexRef.current = onReflex
    activeRef.current = active
  }, [active, onReflex])

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop?.()
    } catch {}

    recognitionRef.current = null
  }, [])

  const start = useCallback(() => {
    if (!enabled || !active) return
    if (typeof window === 'undefined') return

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionCtor) return

    try {
      recognitionRef.current?.stop?.()
    } catch {}

    const recognition = new (SpeechRecognitionCtor as SpeechRecognitionConstructor)()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let transcript = ''

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0]?.transcript || ''
      }

      const intent = detectLiveReflexIntent(transcript)
      if (!intent) return

      onReflexRef.current({
        intent,
        transcript,
      })
    }

    recognition.onerror = () => {}

    recognition.onend = () => {
      if (!enabled || !activeRef.current) return
      window.setTimeout(() => {
        try {
          recognition.start()
        } catch {}
      }, 250)
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch {}
  }, [active, enabled])

  useEffect(() => {
    if (!enabled || !active) {
      stop()
      return
    }

    start()

    return () => {
      stop()
    }
  }, [active, enabled, start, stop])

  return {
    start,
    stop,
  }
}
