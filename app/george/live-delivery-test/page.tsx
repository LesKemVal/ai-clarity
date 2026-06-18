'use client'

import { useEffect, useRef, useState } from 'react'
import { useGeorgeLiveHub } from '@/hooks/george/live-hub/useGeorgeLiveHub'
import { routeGeorgeDeliveryCue } from '@/lib/george/live-delivery/delivery-router'
import type { GeorgeDeliveryCue } from '@/lib/george/live-delivery/types'

export default function LiveDeliveryTestPage() {
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [deliveryCue, setDeliveryCue] = useState<GeorgeDeliveryCue | null>(null)
  const lastSpokenRef = useRef('')

  const hub = useGeorgeLiveHub({
    onActionCue: (actionCue) => {
      const routed = routeGeorgeDeliveryCue({
        actionCue,
        context: {
          voiceEnabled,
          room: 'test room',
          pressure: actionCue.category,
        },
      })

      setDeliveryCue(routed)

      if (routed.mode !== 'voice') return
      if (lastSpokenRef.current === routed.text) return

      lastSpokenRef.current = routed.text

      try {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(routed.text)
        utterance.rate = 1.08
        utterance.pitch = 0.92
        utterance.volume = 0.82
        window.speechSynthesis.speak(utterance)
      } catch {}
    },
  })

  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis.cancel()
      } catch {}
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#030405] px-6 py-8 text-white">
      <section className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-[0.28em] text-[#AEB6FF]/60">
          GEORGE LIVE HUB
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
          Delivery Router Test
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/50">
          ACTION_CUE enters a delivery router before being shown or spoken.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setVoiceEnabled(true)
              try {
                window.speechSynthesis.cancel()
                window.speechSynthesis.speak(new SpeechSynthesisUtterance('Delivery ready.'))
              } catch {}
            }}
            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black"
          >
            Enable Voice
          </button>

          <button
            type="button"
            onClick={() => setVoiceEnabled(false)}
            className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/70"
          >
            Visual Only
          </button>

          <button
            type="button"
            onClick={() =>
              hub.connect({
                room: 'test room',
                chair: 'founder',
                objective: 'close interest',
                knownContext: 'DELIVERY_CUE router test',
              })
            }
            className="rounded-xl border border-[#AEB6FF]/30 px-4 py-3 text-sm font-semibold text-[#D7DBE4]"
          >
            Connect
          </button>

          <button
            type="button"
            onClick={hub.startMic}
            className="rounded-xl border border-[#AEB6FF]/30 px-4 py-3 text-sm font-semibold text-[#D7DBE4]"
          >
            Start Mic
          </button>

          <button
            type="button"
            onClick={hub.stopMic}
            className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/70"
          >
            Stop Mic
          </button>

          <button
            type="button"
            onClick={hub.disconnect}
            className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/70"
          >
            Disconnect
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-white/60">
          Status: {hub.status} / voice {voiceEnabled ? 'enabled' : 'disabled'}
          {hub.error && <div className="mt-2 text-red-200">{hub.error}</div>}
        </div>

        <div className="mt-8 rounded-3xl border border-[#AEB6FF]/15 bg-white/[0.035] p-6">
          <div className="text-xs uppercase tracking-[0.22em] text-[#AEB6FF]/55">
            DELIVERY_CUE
          </div>

          {deliveryCue ? (
            <>
              <div className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                {deliveryCue.text}
              </div>

              <div className="mt-4 text-sm leading-6 text-white/50">
                {deliveryCue.reason}
              </div>

              <div className="mt-4 text-xs leading-5 text-white/35">
                <div>mode: {deliveryCue.mode}</div>
                <div>source: {deliveryCue.source}</div>
                <div>category: {deliveryCue.category}</div>
                <div>priority: {deliveryCue.priority}</div>
              </div>
            </>
          ) : (
            <div className="mt-4 text-lg text-white/38">
              Waiting for delivery cue.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
