'use client'

import { useEffect, useState } from 'react'

type LiveChooserProps = {
  open: boolean
  hasAccess?: boolean
  hasLiveSession?: boolean
  onClose: () => void
  onStartLiveConversation: () => void
  onResumeLiveConversation: () => void
  onUpgrade?: () => void
  onEnterCode?: () => void
  onPrepRoom?: () => void
}

const lineOne = 'Take advantage of advanced runtime logic, real-time conversational awareness, and live response shaping — and take GEORGE LIVE anywhere.'
const lineTwo = 'Interviews · Boardrooms · Sales · Negotiations · Classrooms · Everyday conversation'
const lineThree = 'Upload your résumé. Prepare for the room. Adapt in real time.'

export default function LiveChooser({
  open,
  hasAccess = false,
  hasLiveSession = false,
  onClose,
  onStartLiveConversation,
  onResumeLiveConversation,
  onUpgrade,
  onEnterCode,
  onPrepRoom,
}: LiveChooserProps) {
  const [typed, setTyped] = useState('')
  const [showActions, setShowActions] = useState(false)

  useEffect(() => {
    if (!open) {
      setTyped('')
      setShowActions(false)
      return
    }

    const full = `${lineOne}\n\n${lineTwo}\n\n${lineThree}`
    let index = 0

    const timer = window.setInterval(() => {
      index += 1
      setTyped(full.slice(0, index))

      if (index >= full.length) {
        window.clearInterval(timer)
        window.setTimeout(() => setShowActions(true), 180)
      }
    }, 16)

    return () => window.clearInterval(timer)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[220] flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#06070A] px-5 py-8 text-white">

      <img
        src="/landing/city02.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.24]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,10,0.74)_0%,rgba(6,7,10,0.90)_52%,rgba(6,7,10,0.98)_100%)]" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-220px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[760px] flex-col items-center px-6 text-center">

        <img
          src="/bxnew20.png"
          alt="BRANESx"
          className="mb-6 h-8 w-auto object-contain opacity-75"
        />

        <div className="mb-2 text-[10px] font-medium tracking-[0.24em] text-white/34">
          OPERATIONAL FLUENCY
        </div>

        <h2 className="text-[30px] font-semibold tracking-[-0.05em] text-white md:text-[52px]">
          GEORGE LIVE
        </h2>

        <div className="mt-5 min-h-[164px] max-w-[700px] whitespace-pre-line text-[15px] leading-7 text-white/62 md:text-[17px]">
          {typed}
        </div>

        <div className={`mt-7 flex w-full max-w-[420px] flex-col gap-2.5 transition duration-300 ${showActions ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'}`}>
          {hasAccess ? (
            <>
              <button
                type="button"
                onClick={onStartLiveConversation}
                className="rounded-[1.15rem] bg-white px-6 py-4 text-[15px] font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7]"
              >
                Start LIVE
              </button>

              <button
                type="button"
                onClick={onPrepRoom}
                className="rounded-[1.15rem] border border-white/[0.075] bg-white/[0.025] px-6 py-4 text-[15px] font-semibold text-white/76 transition hover:border-white/[0.14] hover:bg-white/[0.045] hover:text-white"
              >
                Prep Room
              </button>

              {hasLiveSession && (
                <button
                  type="button"
                  onClick={onResumeLiveConversation}
                  className="rounded-[1.15rem] border border-white/[0.075] bg-white/[0.025] px-6 py-4 text-[15px] font-semibold text-white/76 transition hover:border-white/[0.14] hover:bg-white/[0.045] hover:text-white"
                >
                  Resume LIVE
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onUpgrade}
                className="rounded-[1.15rem] bg-white px-6 py-4 text-[15px] font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7]"
              >
                Upgrade — $10
              </button>

              <button
                type="button"
                onClick={onEnterCode}
                className="rounded-[1.15rem] border border-white/[0.075] bg-white/[0.025] px-6 py-4 text-[15px] font-semibold text-white/76 transition hover:border-white/[0.14] hover:bg-white/[0.045] hover:text-white"
              >
                Enter Access Code
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 text-[11px] tracking-[0.18em] text-white/34 transition hover:text-white/62"
        >
          CLOSE
        </button>

      </div>
    </div>
  )
}
