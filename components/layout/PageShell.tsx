'use client'

import { ReactNode, useState } from 'react'
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
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/george'
    }
  }

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden bg-gradient-to-b from-black via-neutral-950 to-black text-neutral-100">
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
            suggestedPrompts={[]}
            suggestedSignal={0}
            reroutePrompt={null}
            rerouteSignal={0}
            activePromptLabel={null}
          />
        )}

        <div className="flex min-w-0 w-full flex-1 flex-col overflow-x-hidden">
          <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 md:px-6 md:pt-12 xl:px-10">
            <div className="mb-8 md:mb-10">
              <div className="flex items-start gap-2 md:gap-3">
                {withSidebar && (
                  <button
                    type="button"
                    onClick={() => setShowSidebar(true)}
                    className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/85 transition hover:border-[#7C8CFF]/30 hover:bg-[#7C8CFF]/8 xl:hidden"
                    aria-label="Open menu"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 fill-none stroke-current"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                  </button>
                )}

                <div className="min-w-0 flex-1">
                  {/* MOBILE */}
                  <div className="flex items-center gap-2 md:hidden">
                    <Brand compact subtitle={eyebrow || 'GEORGE'} />

                    {backToGeorge && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="ml-1 group inline-flex items-center gap-1 text-sm text-neutral-500 transition duration-200 hover:text-[#7C8CFF]"
                      >
                        <span className="text-base leading-none group-hover:-translate-x-0.5 transition">
                          ←
                        </span>
                        <span className="group-hover:translate-x-0.5 transition">
                          Back
                        </span>
                      </button>
                    )}
                  </div>

                  {/* DESKTOP */}
                  <div className="hidden items-center gap-2 md:flex">
                    <Brand subtitle={eyebrow || 'GEORGE'} showCore={false} />

                    {backToGeorge && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="ml-1 group inline-flex items-center gap-1.5 text-sm text-neutral-500 transition duration-200 hover:text-[#7C8CFF]"
                      >
                        <span className="text-lg leading-none group-hover:-translate-x-0.5 transition">
                          ←
                        </span>
                        <span className="group-hover:translate-x-0.5 transition">
                          Back
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {(eyebrow || title) && (
              <div className="mb-8 space-y-2">
                {eyebrow && (
                  <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                    {eyebrow}
                  </p>
                )}
                {title && (
                  <h1 className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                    {title}
                  </h1>
                )}
              </div>
            )}

            <div className="space-y-6">{children}</div>
          </div>
        </div>
      </div>
    </main>
  )
}
