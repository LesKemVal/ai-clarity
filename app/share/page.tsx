'use client'

import { ShareIcon } from '@/components/icons/ShareIcon'
import { Textarea } from '@/components/ui/Textarea'

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
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#030405] px-5 py-6 text-white">

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

        <div className="border-t border-white/[0.07] pt-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.26em] text-[#8FB6C9]/58">
              Conversation upgrade
            </div>

            <h1 className="mt-4 text-[34px] font-semibold leading-[0.94] tracking-[-0.065em] text-[#F2F4FF]/94">
              Upgrade your conversation.
            </h1>

            <div className="mt-5 border-l border-[#8FB6C9]/20 pl-4">
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                className="resize-none rounded-none border-0 bg-transparent p-0 text-[18px] leading-7 tracking-[-0.03em] text-[#F2F4FF]/88 placeholder:text-white/20 focus:border-transparent"
                placeholder={DEFAULT_SHARE_MESSAGE}
              />
            </div>

            <div className="mt-5 flex items-center gap-2 text-[11px] leading-5 text-white/34">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8FB6C9]/68" />
              Bluetooth. LIVE Mode. Better timing in the room.
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={nativeShare}
              className="george-secondary-action rounded-[0.75rem] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
            >
                <ShareIcon className="h-5 w-5" />
              </button>

            <button
              type="button"
              onClick={copyShare}
              className="george-quiet-action rounded-[0.75rem] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
