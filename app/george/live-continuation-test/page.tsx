'use client'

import { useMemo, useState } from 'react'
import { evaluateContinuationCandidate } from '@/lib/george/live-voice/runtime/continuation-intelligence'
import { generateContinuation } from '@/lib/george/live-voice/runtime/continuation-generator'

const samples = [
  'The biggest concern investors have is...',
  'The biggest concern investors have is',
  'The biggest concern investors have is.',
  'What matters most here is',
  'The reason we are doing this is',
  'I agree',
  'That makes sense.',
  'If we look at the data',
  'The difference is',
]

export default function LiveContinuationTestPage() {
  const [transcript, setTranscript] = useState(samples[0])
  const [deliveryStyle, setDeliveryStyle] = useState('continue')

  const result = useMemo(() => {
    return evaluateContinuationCandidate({
      transcript,
      deliveryStyle,
      speakerIntent: null,
    })
  }, [transcript, deliveryStyle])

  const generated = useMemo(() => {
    if (!result.candidate) {
      return {
        continuation: '',
        confidence: 0,
        reason: 'No generation because this is not a continuation candidate.',
      }
    }

    return generateContinuation({
      transcript,
      objective: 'raise capital and show the opportunity can scale',
      room: 'investor conversation',
      audio: false,
    })
  }, [result.candidate, transcript])

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            GEORGE LIVE
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Continuation Intelligence Test
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
            Validate whether a transcript is a legitimate continuation candidate.
            This page only tests detection. It does not generate continuations.
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
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <label className="text-xs uppercase tracking-[0.25em] text-white/40">
            Delivery Style
          </label>
          <select
            value={deliveryStyle}
            onChange={(event) => setDeliveryStyle(event.target.value)}
            className="mt-3 rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white/30"
          >
            <option value="continue">Continuation</option>
            <option value="advice">Cue / Advice</option>
            <option value="response">Response</option>
            <option value="expandedLine">Presentation</option>
          </select>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">
            Result
          </p>

          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/50">Candidate</span>
              <span className={result.candidate ? 'text-[#8FB6C9]' : 'text-white'}>
                {String(result.candidate)}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/50">Confidence</span>
              <span>{result.confidence}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/50">Explicit Trigger</span>
              <span>{String(result.explicitTrigger)}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/50">Incomplete Thought</span>
              <span>{String(result.incompleteThought)}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/50">Punctuation Closed</span>
              <span>{String(result.punctuationClosed)}</span>
            </div>
            <div>
              <span className="text-white/50">Reason</span>
              <p className="mt-2 rounded-xl bg-black p-3 text-white/80">
                {result.reason}
              </p>
            </div>

            <div className="border-t border-white/10 pt-4">
              <span className="text-white/50">Generated Continuation</span>
              <p className="mt-2 rounded-xl bg-black p-3 text-lg text-white">
                {generated.continuation || '—'}
              </p>
              <p className="mt-2 text-xs text-white/40">
                Confidence: {generated.confidence} · {generated.reason}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
