'use client'

import { useRef, useState } from 'react'

type HubEvent = {
  type: string
  text?: string
  cue?: string
  reason?: string
  error?: string
  category?: string
  confidence?: number
  priority?: number
  source?: string
  localCue?: string
  fastCue?: string
  packet?: Record<string, unknown>
  at?: number
}

export default function LiveHubTestPage() {
  const wsRef = useRef<WebSocket | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [connected, setConnected] = useState(false)
  const [recording, setRecording] = useState(false)
  const [events, setEvents] = useState<HubEvent[]>([])

  const addEvent = (event: HubEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 80))
  }

  const connect = async () => {
    const url = process.env.NEXT_PUBLIC_LIVE_HUB_URL || 'ws://localhost:8080'
    const ws = new WebSocket(url)
    ws.binaryType = 'arraybuffer'

    ws.onopen = () => {
      setConnected(true)
      ws.send(JSON.stringify({
        type: 'SYNC_CONTEXT',
        context: {
          room: 'test room',
          chair: 'founder',
          objective: 'close interest',
          knownContext: 'local browser hub test',
        },
      }))
    }

    ws.onmessage = (message) => {
      try {
        addEvent(JSON.parse(String(message.data)))
      } catch {
        addEvent({ type: 'RAW', text: String(message.data), at: Date.now() })
      }
    }

    ws.onclose = () => {
      setConnected(false)
      setRecording(false)
    }

    ws.onerror = () => {
      addEvent({ type: 'ERROR', error: 'WebSocket error', at: Date.now() })
    }

    wsRef.current = ws
  }

  const startMic = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addEvent({ type: 'ERROR', error: 'Connect first.', at: Date.now() })
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
    setRecording(true)
  }

  const stopMic = () => {
    recorderRef.current?.stop()
    recorderRef.current = null

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    setRecording(false)
  }

  const disconnect = () => {
    stopMic()
    wsRef.current?.close()
    wsRef.current = null
    setConnected(false)
  }

  return (
    <main className="min-h-screen bg-[#030405] px-6 py-8 text-white">
      <section className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[#AEB6FF]/60">GEORGE LIVE HUB</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Hub Test</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
            Isolated browser test for the new stateful LIVE hub. This does not touch the main GEORGE page.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={connect}
            disabled={connected}
            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-40"
          >
            Connect
          </button>

          <button
            type="button"
            onClick={startMic}
            disabled={!connected || recording}
            className="rounded-xl border border-[#AEB6FF]/30 px-4 py-3 text-sm font-semibold text-[#D7DBE4] disabled:opacity-40"
          >
            Start Mic
          </button>

          <button
            type="button"
            onClick={stopMic}
            disabled={!recording}
            className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/70 disabled:opacity-40"
          >
            Stop Mic
          </button>

          <button
            type="button"
            onClick={disconnect}
            disabled={!connected}
            className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/70 disabled:opacity-40"
          >
            Disconnect
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-white/60">
          Status: {connected ? 'connected' : 'disconnected'} / {recording ? 'recording' : 'not recording'}
        </div>

        <div className="mt-6 space-y-3">
          {events.map((event, index) => (
            <div key={`${event.type}-${event.at}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[#AEB6FF]/60">{event.type}</div>
              {event.text && <div className="mt-2 text-white/80">{event.text}</div>}
              {event.cue && <div className="mt-2 text-xl font-semibold text-white">{event.cue}</div>}
              {event.reason && <div className="mt-2 text-white/45">{event.reason}</div>}
              {(event.source || event.localCue || event.fastCue) && (
                <div className="mt-2 text-xs leading-5 text-white/35">
                  {event.source && <div>source: {event.source}</div>}
                  {event.localCue && <div>local: {event.localCue}</div>}
                  {event.fastCue && <div>fast: {event.fastCue}</div>}
                </div>
              )}
              {(event.category || event.confidence || event.priority) && (
                <div className="mt-3 text-xs text-white/35">
                  {event.category && <span>category: {event.category}</span>}
                  {typeof event.confidence === 'number' && <span> · confidence: {event.confidence}</span>}
                  {typeof event.priority === 'number' && <span> · priority: {event.priority}</span>}
                </div>
              )}
              {event.packet && (
                <pre className="mt-3 overflow-x-auto rounded-xl bg-black/30 p-3 text-[11px] leading-5 text-white/45">
                  {JSON.stringify(event.packet, null, 2)}
                </pre>
              )}
              {event.error && <div className="mt-2 text-red-200">{event.error}</div>}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
