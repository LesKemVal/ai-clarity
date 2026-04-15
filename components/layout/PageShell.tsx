'use client'

import { ReactNode } from 'react'
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

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden bg-gradient-to-b from-black via-neutral-950 to-black text-neutral-100">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1600px] overflow-x-hidden">
        {withSidebar && (
          <Sidebar
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
            <div className="mb-10 flex items-start justify-between gap-4">
              <Brand subtitle={eyebrow || 'GEORGE'} />

              {backToGeorge && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.history.length > 1) {
                      window.history.back()
                    } else {
                      window.location.href = '/george'
                    }
                  }}
                  className="group inline-flex items-center gap-2 text-sm text-neutral-500 transition duration-200 hover:text-[#7C8CFF] button-press"
                >
                  <span className="text-lg leading-none transition duration-200 group-hover:-translate-x-0.5">←</span>
                  <span className="transition duration-200 group-hover:translate-x-0.5">
                    Back
                  </span>
                </button>
              )}
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

            <div className="space-y-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
