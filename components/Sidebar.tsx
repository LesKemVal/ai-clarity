'use client'

import { useState } from 'react'

type SidebarProps = {
  voiceActive: boolean
  onNewSession: () => void
}

export default function Sidebar({ voiceActive, onNewSession }: SidebarProps) {
  const [conversationsOpen, setConversationsOpen] = useState(true)

  return (
    <aside className="hidden h-screen w-[280px] flex-none border-r border-neutral-800 bg-black xl:flex xl:flex-col">
      <div className="border-b border-neutral-800 px-5 pt-8 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 font-bold text-black">
            B
          </div>
          <span className="text-sm tracking-[0.2em] text-neutral-300">
            BRANES
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-8">
        <div className="space-y-10">
          <div>
            <button
              type="button"
              onClick={() => setConversationsOpen((prev) => !prev)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Conversations
              </span>
              <span className="text-xs text-neutral-500">
                {conversationsOpen ? '−' : '+'}
              </span>
            </button>

            {conversationsOpen && (
              <div className="mt-4 space-y-4">
                <button
                  onClick={onNewSession}
                  className="block text-left text-sm text-neutral-100 transition hover:text-amber-300"
                >
                  New session
                </button>

                <button
                  type="button"
                  className="block text-left text-sm text-neutral-400 transition hover:text-amber-300"
                >
                  Today
                </button>

                <button
                  type="button"
                  className="block text-left text-sm text-neutral-500 transition hover:text-amber-300"
                >
                  No saved conversations yet
                </button>
              </div>
            )}
          </div>

          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              System
            </p>

            <div className="space-y-4">
              <button
                type="button"
                className="block text-left text-sm text-neutral-400 transition hover:text-amber-300"
              >
                Sessions
              </button>

              <div className="text-sm">
                <span className="text-neutral-400">Voice</span>{' '}
                <span className={voiceActive ? 'text-amber-300' : 'text-neutral-500'}>
                  {voiceActive ? 'Active' : 'Paused'}
                </span>
              </div>

              <button
                type="button"
                className="block text-left text-sm text-neutral-400 transition hover:text-amber-300"
              >
                Memory
              </button>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Navigation
            </p>

            <div className="space-y-4">
              <a
                href="/landing"
                className="block text-sm text-neutral-400 transition hover:text-amber-300"
              >
                Landing
              </a>

              <a
                href="/roadmap"
                className="block text-sm text-neutral-400 transition hover:text-amber-300"
              >
                Roadmap
              </a>

              <a
                href="/top-up"
                className="block text-sm text-neutral-400 transition hover:text-amber-300"
              >
                Top-Up
              </a>

              <a
                href="/toa"
                className="block text-sm text-neutral-400 transition hover:text-amber-300"
              >
                TOA
              </a>

              <a
                href="/privacy"
                className="block text-sm text-neutral-400 transition hover:text-amber-300"
              >
                Privacy
              </a>

              <a
                href="/contact"
                className="block text-sm text-neutral-400 transition hover:text-amber-300"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
