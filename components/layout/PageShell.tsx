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

  useEffect(() => {
    try {
      window.localStorage.getItem('george_tier')
    } catch {}
  }, [])

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
    window.location.href = '/george'
  }

  const handleInstallGeorge = () => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const isiPhone = /iPhone|iPad|iPod/i.test(ua)
    const url = typeof window !== 'undefined' ? `${window.location.origin}/george` : '/george'

    if (isiPhone) {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({
          title: 'GEORGE by BRANESx',
          text: 'Want to get something done? GEORGE is your guide.',
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
      navigator.share({ title: 'GEORGE by BRANESx', text: 'Want to get something done? GEORGE is your guide.', url }).catch(() => {})
      return
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {})
    }
  }

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden bg-[#0B0D12] text-neutral-100">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1600px] overflow-x-hidden">
        {withSidebar && showSidebar && (
          <div
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 z-30 bg-black/50 xl:hidden"
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
            <div className="mb-5 border-b border-white/[0.035] pb-3 md:mb-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  {withSidebar && (
                    <button
                      type="button"
                      onClick={() => setShowSidebar(true)}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.55rem] border border-white/[0.045] bg-white/[0.014] text-white/62 transition hover:border-[#AEB6FF]/16 hover:bg-white/[0.02] hover:text-white/80 xl:hidden"
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
                      <span>GEORGE</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleInstallGeorge}
                  className="inline-flex h-8 shrink-0 items-center justify-center rounded-[0.6rem] border border-[#AEB6FF]/16 bg-white/[0.012] px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D9DEFF]/70 transition hover:border-[#AEB6FF]/24 hover:bg-[#AEB6FF]/[0.035] hover:text-white"
                  aria-label="Share G."
                  title="Share G."
                >
                  Share G.
                </button>
              </div>
            </div>

            {(eyebrow || title) && (
              <div className="mb-6 space-y-1.5 md:mb-7">
                {eyebrow && (
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">
                    {eyebrow}
                  </p>
                )}
                {title && (
                  <h1 className="max-w-4xl text-[34px] font-semibold tracking-[-0.05em] text-white/92 md:text-[48px] lg:text-[56px]">
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
