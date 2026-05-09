'use client'

import { useRef, useState } from 'react'

type LivePacket = {
  speaker: 'other_party' | 'user' | 'george_instruction' | 'unclear'
  shouldSpeak: boolean
  volley: string
  cue: string
  status: string
  confidence: number
}

export default function LiveVoicePage() {
  const [running, setRunning] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [packet, setPacket] = useState<LivePacket | null>(null)
  const [log, setLog] = useState<string[]>([])
  const [error, setError] = useState('')

  const socketRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastGovernedRef = useRef('')

  function pushLog(line: string) {
    setLog((prev) => [`${new Date().toLocaleTimeString()} — ${line}`, ...prev].slice(0, 12))
  }

  async function govern(text: string, audio = false) {
    const clean = text.trim()
    if (!clean || clean === lastGovernedRef.current) return

    lastGovernedRef.current = clean

    const res = await fetch('/api/george/live/govern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: clean,
        mode: 'voice_live',
        audio,
      }),
    })

    const nextPacket = await res.json()
    setPacket(nextPacket)

    if (nextPacket?.shouldSpeak && nextPacket?.volley) {
      pushLog(`GEORGE: ${nextPacket.volley}`)
    }

    return nextPacket as LivePacket
  }

  async function speak(text: string) {
    if (!text.trim()) return

    const res = await fetch('/api/george/live/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    if (!res.ok) {
      pushLog('TTS unavailable. Check ElevenLabs env vars.')
      return
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)

    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    audioRef.current.src = url
    audioRef.current.volume = 0.7
    await audioRef.current.play().catch(() => {
      pushLog('Audio blocked until user interaction.')
    })
  }

  async function start() {
    setError('')
    setTranscript('')
    setPacket(null)
    lastGovernedRef.current = ''

    try {
      const tokenCheck = await fetch('/api/george/live/stt-token')
      if (!tokenCheck.ok) {
        setError('Deepgram key missing. Add DEEPGRAM_API_KEY before live mic testing.')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const tokenRes = await fetch('/api/george/live/stt-token')

      if (!tokenRes.ok) {
        setError('Failed to obtain temporary Deepgram token.')
        return
      }

      const tokenData = await tokenRes.json()

      const socket = new WebSocket(
        'wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true&endpointing=250',
        ['token', tokenData.token]
      )

      socketRef.current = socket

      socket.onopen = () => {
        pushLog('Deepgram socket opened.')
        setRunning(true)

        const recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm',
        })

        recorderRef.current = recorder

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data)
          }
        }

        recorder.start(250)
      }

      socket.onmessage = async (message) => {
        const data = JSON.parse(message.data)
        const text = data?.channel?.alternatives?.[0]?.transcript || ''
        const isFinal = Boolean(data?.is_final)

        if (!text.trim()) return

        setTranscript((prev) => {
          if (isFinal) return `${prev} ${text}`.trim()
          return prev
        })

        if (isFinal) {
          pushLog(`Heard: ${text}`)
          const nextPacket = await govern(text, true)

          if (nextPacket?.shouldSpeak && nextPacket.volley) {
            await speak(nextPacket.volley)
          }
        }
      }

      socket.onerror = () => {
        setError('Deepgram socket error.')
        pushLog('Deepgram socket error.')
      }

      socket.onclose = () => {
        setRunning(false)
        pushLog('Deepgram socket closed.')
      }
    } catch (err) {
      setError('Mic start failed. Check browser mic permission.')
      pushLog('Mic start failed.')
      stop()
    }
  }

  function stop() {
    recorderRef.current?.stop()
    recorderRef.current = null

    socketRef.current?.close()
    socketRef.current = null

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    setRunning(false)
    pushLog('Stopped.')
  }

  async function testText(value: string) {
    setTranscript(value)
    const nextPacket = await govern(value, false)
    if (nextPacket?.volley) pushLog(`Test packet: ${nextPacket.volley}`)
  }

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/35">BRANESx / GEORGE</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">LIVE Voice Sandbox</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            This page tests mic capture, transcript interpretation, GEORGE&apos;s LIVE governor, and optional earbud playback without touching normal GEORGE chat.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl">
          <div className="flex flex-wrap gap-3">
            {!running ? (
              <button
                type="button"
                onClick={start}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/85"
              >
                Start LIVE mic
              </button>
            ) : (
              <button
                type="button"
                onClick={stop}
                className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Stop
              </button>
            )}

            <button
              type="button"
              onClick={() => testText('do you have an ID?')}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-white/75 transition hover:bg-white/10"
            >
              Test: ID question
            </button>

            <button
              type="button"
              onClick={() => testText("sir, let's discuss a raise")}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-white/75 transition hover:bg-white/10"
            >
              Test: raise opener
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          )}
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35">Transcript</p>
          <p className="mt-3 min-h-20 whitespace-pre-wrap text-lg leading-8 text-white/80">
            {transcript || 'No transcript yet.'}
          </p>
        </section>

        <section className="rounded-3xl border border-purple-400/20 bg-purple-400/[0.06] p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-purple-100/45">Governor Packet</p>

          {packet ? (
            <div className="mt-4 grid gap-3 text-sm">
              <p><span className="text-white/35">Speaker:</span> {packet.speaker}</p>
              <p><span className="text-white/35">Should speak:</span> {String(packet.shouldSpeak)}</p>
              <p><span className="text-white/35">Volley:</span> {packet.volley || '—'}</p>
              <p><span className="text-white/35">Cue:</span> {packet.cue || '—'}</p>
              <p><span className="text-white/35">Status:</span> {packet.status || '—'}</p>
              <p><span className="text-white/35">Confidence:</span> {packet.confidence}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/45">No packet yet.</p>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35">Runtime Log</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-white/55">
            {log.length ? log.map((line, index) => <p key={index}>{line}</p>) : <p>No events yet.</p>}
          </div>
        </section>
      </div>
    </main>
  )
}
