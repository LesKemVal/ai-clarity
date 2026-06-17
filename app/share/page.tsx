'use client'

import { useMemo, useState } from 'react'

const DEFAULT_SHARE_MESSAGE =
  'connect your device to bluetooth and upgrade your conversation'

export default function SharePage() {
  const [message, setMessage] = useState(DEFAULT_SHARE_MESSAGE)
  const [copied, setCopied] = useState(false)

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'https://www.branesx.com'
    return window.location.origin
  }, [])

  const cleanMessage = message.trim() || DEFAULT_SHARE_MESSAGE

  const shareText = `${cleanMessage}\n\n${shareUrl}`

  const copyShare = async () => {
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const nativeShare = async () => {
    if (!navigator.share) {
      await copyShare()
      return
    }

    await navigator.share({
      title: 'BRANESx GEORGE',
      text: cleanMessage,
      url: shareUrl,
    })
  }

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#030405] px-5 py-6 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(143,182,201,0.11),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_22%,rgba(174,182,255,0.035))]" />

      <section className="relative z-10 w-full max-w-[430px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logofav.png" alt="Bx" className="h-8 w-8 object-contain opacity-[0.94]" />
            <div>
              <div className="text-[9px] uppercase tracking-[0.34em] text-white/36">BRANESx</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#8FB6C9]/60">Share GEORGE</div>
            </div>
          </div>

          <a
            href="/"
            className="rounded-full border border-white/[0.08] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/38 transition hover:border-[#8FB6C9]/30 hover:text-white/72"
          >
            Home
          </a>
        </div>

        <div className="rounded-[1.5rem] border border-[#8FB6C9]/[0.14] bg-white/[0.025] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.46)]">
          <div className="rounded-[1.15rem] border border-white/[0.06] bg-[#070A10]/88 p-5">
            <div className="text-[10px] uppercase tracking-[0.26em] text-[#8FB6C9]/58">
              Conversation upgrade
            </div>

            <h1 className="mt-4 text-[34px] font-semibold leading-[0.94] tracking-[-0.065em] text-[#F2F4FF]/94">
              Upgrade your conversation.
            </h1>

            <div className="mt-5 rounded-[1rem] border border-[#8FB6C9]/[0.11] bg-[#8FB6C9]/[0.045] p-4">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                className="w-full resize-none border-0 bg-transparent text-[18px] leading-7 tracking-[-0.03em] text-[#F2F4FF]/88 outline-none placeholder:text-white/20"
                placeholder={DEFAULT_SHARE_MESSAGE}
              />
            </div>

            <div className="mt-5 flex items-center gap-2 text-[11px] leading-5 text-white/38">
              <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.38)]" />
              Bluetooth. LIVE Mode. Better timing in the room.
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={nativeShare}
              className="rounded-[1rem] border border-[#8FB6C9]/28 bg-[#8FB6C9]/[0.09] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D7DCFF]/86 transition hover:border-[#8FB6C9]/42 hover:bg-[#8FB6C9]/[0.14] hover:text-white active:scale-[0.98]"
            >
              Share
            </button>

            <button
              type="button"
              onClick={copyShare}
              className="rounded-[1rem] border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50 transition hover:border-white/[0.16] hover:bg-white/[0.045] hover:text-white/78 active:scale-[0.98]"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
