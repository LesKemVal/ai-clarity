'use client'

import { useMemo, useState } from 'react'
import { governLiveVoice } from '@/lib/george/live-voice/governor'

const samples = [
  'The biggest concern investors have is...',
  'What matters here is...',
  'The reason this works is...',
  'The biggest concern investors have is.',
  'I agree',
]

export default function LiveGovernorTestPage() {
  const [transcript, setTranscript] = useState(samples[0])
  const [audio, setAudio] = useState(false)

  const packet = useMemo(() => {
    return governLiveVoice({
      transcript,
      contextHint: 'investor conversation',
      lastFiveSeconds: 'Objective: raise capital and show the opportunity can scale',
      audio,
      liveAssistMode: 'cues',
      runtimeSupport: {
        objective: 'raise capital and show the opportunity can scale',
        room: 'investor conversation',
        deliveryStyle: 'continue',
      } as any,
    } as any)
  }, [transcript, audio])

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            GEORGE LIVE
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Governor Continuation Test
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
            Validate the real governor output path. This tests whether explicit
            continuation triggers become usable LIVE packets before delivery.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <label className="text-xs uppercase tracking-[0.25em] text-white/40">
            Transcript
          </label>
          <textarea
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            className="mt-3 min-h-28 w-full rounded-xl border border-white/10 bg-black p-4 text-base text-white outline-none focus:border-white/30"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {samples.map((sample) => (
              <button
                key={sample}
                onClick={() => setTranscript(sample)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:border-white/30 hover:text-white"
              >
                {sample}
              </button>
            ))}
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-white/70">
            <input
              checked={audio}
              onChange={(event) => setAudio(event.target.checked)}
              type="checkbox"
            />
            Audio mode
          </label>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">
            Governor Packet
          </p>

          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/50">Speaker Intent</span>
              <span>{packet.speakerIntent || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/50">Should Speak</span>
              <span>{String(packet.shouldSpeak)}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/50">Confidence</span>
              <span>{packet.confidence}</span>
            </div>
            <div>
              <span className="text-white/50">Volley</span>
              <p className="mt-2 rounded-xl bg-black p-3 text-lg text-white">
                {packet.volley || '—'}
              </p>
            </div>
            <div>
              <span className="text-white/50">Cue</span>
              <p className="mt-2 rounded-xl bg-black p-3 text-white/80">
                {packet.cue || '—'}
              </p>
            </div>
            <div>
              <span className="text-white/50">Status</span>
              <p className="mt-2 rounded-xl bg-black p-3 text-xs leading-5 text-white/60">
                {packet.status || '—'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
