'use client'

import { ReactNode, useEffect, useState } from 'react'
import Sidebar, { PromptItem } from '@/components/Sidebar'
import Brand from '@/components/Brand'

type PageShellProps = {
  children: ReactNode
  title?: string
  eyebrow?: string
  backToGeorge?: boolean
  withSidebar?: boolean
}

export default function PageShell({
  children,
  title,
  eyebrow,
  backToGeorge = false,
  withSidebar = true,
}: PageShellProps) {
  const [showSidebar, setShowSidebar] = useState(false)

  const goToGeorge = (prompt?: PromptItem) => {
    if (!prompt) {
      window.location.href = '/george'
      return
    }

    const params = new URLSearchParams({
      prompt: prompt.text,
      context: prompt.context,
      label: prompt.label,
    })

    window.location.href = `/george?${params.toString()}`
  }

  const handleBack = () => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.removeItem('george_restore_normal_session_id')
      window.localStorage.removeItem('george_return_to_last_active_session')
    } catch {}

    if (window.history.length > 1) {
      window.history.back()
      return
    }

    window.location.href = '/george'
  }

  const handleInstallGeorge = () => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const isiPhone = /iPhone|iPad|iPod/i.test(ua)
    const url = typeof window !== 'undefined' ? `${window.location.origin}/` : '/'

    if (isiPhone) {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({
          title: 'GEORGE by BRANESx',
          text: 'Some conversations change everything, so be...  More knowledgeable.  More centered.  More persuasive.  More expansive.  with GEORGE in any room.',
          url,
        }).catch(() => {})
        return
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).catch(() => {})
      }
      return
    }

    if (typeof window !== 'undefined' && (window as any).__branesInstallPrompt) {
      const promptEvent = (window as any).__branesInstallPrompt
      promptEvent.prompt()
      promptEvent.userChoice.finally(() => {
        ;(window as any).__branesInstallPrompt = null
      })
      return
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'GEORGE by BRANESx', text: 'Some conversations change everything, so be...  More knowledgeable.  More centered.  More persuasive.  More expansive.  with GEORGE in any room.', url }).catch(() => {})
      return
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {})
    }
  }

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden bg-black text-neutral-100">

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1600px] overflow-x-hidden">
        {withSidebar && showSidebar && (
          <div
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 z-30 bg-black/58 backdrop-blur-[8px] xl:hidden"
          />
        )}

        {withSidebar && (
          <Sidebar
            showSidebar={showSidebar}
            setShowSidebar={setShowSidebar}
            voiceActive={false}
            onNewSession={() => {
              window.location.href = '/george'
            }}
            onPromptSelect={(prompt) => goToGeorge(prompt)}
            activePromptLabel={null}
          />
        )}

        <div className="flex min-w-0 w-full flex-1 flex-col overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-4 md:px-6 md:pt-6 xl:px-8">
            <div className="mb-5 border-b border-white/[0.04] pb-3 md:mb-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  {withSidebar && (
                    <button
                      type="button"
                      onClick={() => setShowSidebar(true)}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.55rem] border border-white/[0.05] bg-white/[0.014] text-white/60 transition hover:border-white/[0.12] hover:bg-white/[0.024] hover:text-white/82 xl:hidden"
                      aria-label="Open menu"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 fill-none stroke-current"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M4 7h16M4 12h16M4 17h16" />
                      </svg>
                    </button>
                  )}

                  <Brand compact subtitle={eyebrow || 'GEORGE'} />

                  {backToGeorge && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="ml-1 inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.14em] text-white/34 transition hover:text-white/64"
                    >
                      <span>←</span>
                      <span>Back</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleInstallGeorge}
                  className="inline-flex h-5 shrink-0 items-center justify-center rounded-[0.5rem] border border-white/[0.04] bg-white/[0.01] px-1.5 text-[6px] font-semibold uppercase tracking-[0.08em] text-white/38 transition hover:border-white/[0.08] hover:bg-white/[0.02] hover:text-white/62"
                  aria-label="Share G."
                  title="Share G."
                >
                  Share G.
                </button>
              </div>
            </div>

            {(eyebrow || title) && (
              <div className="mb-8 border-b border-white/[0.06] pb-8 md:mb-10 md:pb-10">
                {eyebrow && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#8FB6C9]/72">
                    {eyebrow}
                  </p>
                )}
                {title && (
                  <h1 className="mt-4 max-w-5xl font-mono text-[42px] font-black uppercase leading-[0.9] tracking-[-0.075em] text-white/94 md:text-[68px] lg:text-[86px]">
                    {title}
                  </h1>
                )}
              </div>
            )}

            <div className="space-y-5">{children}</div>

            <footer className="mt-10 border-t border-white/[0.04] pt-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-xs leading-6 text-neutral-500">
                  BRANESx / GEORGE is operated by R. Block Share Holdings, LLC.
                </p>

                <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
                  <a href="/privacy" className="transition hover:text-white">Privacy</a>
                  <a href="/legal/toa" className="transition hover:text-white">Access</a>
                  <a href="/legal/tos" className="transition hover:text-white">Terms</a>
                  <a href="/contact" className="transition hover:text-white">Contact</a>
                </div>
              </div>
            </footer>

          </div>
        </div>
      </div>
    </main>
  )
}
