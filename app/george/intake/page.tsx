'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function GeorgeIntakePage() {
  const [intent, setIntent] = useState('')
  const [room, setRoom] = useState('')
  const [support, setSupport] = useState('')

  const continueToGeorge = () => {
    const payload = {
      intent: intent.trim(),
      room: room.trim(),
      support: support.trim(),
      createdAt: Date.now(),
    }

    window.localStorage.setItem('george_intake_pending', JSON.stringify(payload))
    window.location.href = '/george'
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#040507] px-6 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(140,155,180,0.08),transparent_30%),linear-gradient(180deg,rgba(4,5,7,0.88),rgba(4,5,7,1))]" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[820px] flex-col justify-center">
        <Link
          href="/"
          className="mb-10 inline-flex w-fit text-[10px] uppercase tracking-[0.24em] text-white/28 transition hover:text-white/58"
        >
          Back
        </Link>

        <div className="mb-10">
          <img src="/logofav.png" alt="Bx" className="h-16 w-16 object-contain opacity-95" />
          <div className="mt-5 text-[11px] uppercase tracking-[0.36em] text-white/34">
            Bx Intake
          </div>
          <h1 className="mt-4 max-w-[640px] text-[38px] font-semibold leading-[1] tracking-[-0.06em] text-white/92 md:text-[58px]">
            Give GEORGE the room before you enter it.
          </h1>
          <p className="mt-5 max-w-[560px] text-[14px] leading-7 text-white/46">
            Add only what matters. GEORGE uses this to set posture, cue style, and conversational support before the runtime begins.
          </p>
        </div>

        <div className="rounded-[1.45rem] border border-white/[0.045] bg-black/24 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl md:p-6">
          <div className="grid gap-4">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.26em] text-white/28">
                Objective
              </span>
              <textarea
                value={intent}
                onChange={(event) => setIntent(event.target.value)}
                rows={3}
                placeholder="What are you trying to accomplish?"
                className="mt-2 w-full resize-none rounded-[1rem] border border-white/[0.045] bg-black/28 px-4 py-3 text-[14px] leading-6 text-white/78 outline-none placeholder:text-white/20 focus:border-white/[0.12]"
              />
            </label>

            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.26em] text-white/28">
                Room
              </span>
              <input
                value={room}
                onChange={(event) => setRoom(event.target.value)}
                placeholder="Meeting, interview, call, negotiation, doctor visit..."
                className="mt-2 w-full rounded-[1rem] border border-white/[0.045] bg-black/28 px-4 py-3 text-[14px] text-white/78 outline-none placeholder:text-white/20 focus:border-white/[0.12]"
              />
            </label>

            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.26em] text-white/28">
                Support
              </span>
              <input
                value={support}
                onChange={(event) => setSupport(event.target.value)}
                placeholder="Exact lines, short cues, calm guidance, stronger posture..."
                className="mt-2 w-full rounded-[1rem] border border-white/[0.045] bg-black/28 px-4 py-3 text-[14px] text-white/78 outline-none placeholder:text-white/20 focus:border-white/[0.12]"
              />
            </label>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/[0.04] pt-4">
            <p className="text-[11px] leading-5 text-white/28">
              Keep it light. GEORGE can infer more once the conversation starts.
            </p>

            <button
              type="button"
              onClick={continueToGeorge}
              className="px-1 py-1 text-[11px] uppercase tracking-[0.22em] text-white/54 transition hover:text-white active:scale-[0.96]"
            >
              Continue
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
