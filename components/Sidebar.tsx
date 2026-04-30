'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

export type PromptItem = {
  label: string
  text: string
  context: string
}

type PromptGroup = {
  title: string
  prompts: PromptItem[]
}

type SidebarProps = {
  showSidebar?: boolean
  setShowSidebar?: (v: boolean) => void
  voiceActive: boolean
  onNewSession: () => void
  onPromptSelect: (prompt: PromptItem) => void
  reroutePrompt?: PromptItem | null
  rerouteSignal?: number
  suggestedPrompts?: PromptItem[]
  suggestedSignal?: number
  activePromptLabel?: string | null
  activePromptContext?: string | null
  onToggleScripture?: () => void
  onOpenLiveGate?: () => void
  currentTier?: 'smart' | 'intelligent' | 'brilliant'
}

const promptGroups: PromptGroup[] = [
  {
    title: 'Build',
    prompts: [
      {
        label: 'Build a Business',
        text: 'Help me build a business that fits my situation and goals.',
        context: 'build_start',
      },
      {
        label: 'Improve Money',
        text: 'Show me the strongest move to improve my money situation.',
        context: 'money_this_week',
      },
      {
        label: 'Improve Credit',
        text: 'Help me improve my credit and approvals with the strongest path.',
        context: 'problem_step_by_step',
      },
      {
        label: 'Solve a Problem',
        text: 'Help me solve the real problem here and show me the strongest next move.',
        context: 'problem_untangle',
      },
    ],
  },
  {
    title: 'Training Lab',
    prompts: [
      {
        label: "Pass Driver's Test",
        text: "I need to pass my driver's license test.",
        context: 'training_drivers_license',
      },
      {
        label: 'CDL Path',
        text: 'I need to pass my CDL test.',
        context: 'training_cdl',
      },
      {
        label: 'Interview Win',
        text: 'I need to prepare for a job interview.',
        context: 'training_interview',
      },
    ],
  },
]

export default function Sidebar({
  showSidebar = false,
  setShowSidebar,
  voiceActive,
  onNewSession,
  onPromptSelect,
  reroutePrompt = null,
  rerouteSignal = 0,
  suggestedPrompts = [],
  suggestedSignal = 0,
  activePromptLabel = null,
  activePromptContext = null,
  onToggleScripture = () => {},
  onOpenLiveGate = () => {},
  currentTier = 'smart',
}: SidebarProps) {
  const pathname = usePathname()

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Modes: true,
    Build: false,
    'Training Lab': false,
    Account: false,
  })

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const handlePromptTap = (prompt: PromptItem) => {
    setShowSidebar?.(false)
    onPromptSelect(prompt)
  }

  const linkClass = (path: string) =>
    `block text-sm transition ${
      pathname === path ? 'text-[#7C8CFF]' : 'text-neutral-400 hover:text-[#7C8CFF]'
    }`

  const rerouteAnimationClass = useMemo(
    () => (rerouteSignal > 0 ? 'glow-twice' : ''),
    [rerouteSignal]
  )

  const suggestedAnimationClass = useMemo(
    () => (suggestedSignal > 0 ? 'glow-twice' : ''),
    [suggestedSignal]
  )

  
      {/* Collapsed Rail (desktop only) */}
      {!showSidebar && (
        <div className="hidden xl:flex fixed left-0 top-0 z-[110] h-screen w-[72px] flex-col items-center gap-6 border-r border-white/10 bg-black/90 pt-4">
          <img src="/branding/logo.png" className="h-10 w-10 rounded-full mt-[3px]" />

          <button className="text-white/60 hover:text-white">✎</button>
          <button className="text-white/60 hover:text-white">🔍</button>
          <button className="text-white/60 hover:text-white">💬</button>
        </div>
      )}

return (
    <aside
      className={`fixed left-0 top-0 z-[120] flex h-screen w-[280px] flex-col overflow-hidden border-r border-neutral-800 bg-black transition-transform duration-300 ${
        showSidebar ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
      } xl:fixed xl:top-0 xl:z-[95] xl:flex xl:translate-x-0 xl:pointer-events-auto`}
    >
      <div className="border-b border-white/5 px-4 pb-3 pt-3 xl:h-[56px] xl:flex xl:items-center">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2.5 translate-y-[4px]">
            <img
              src="/branding/logo.png"
              alt="BRANESx"
              className="h-9 w-9  rounded-full object-cover shadow-[0_0_18px_rgba(124,140,255,0.35)]"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowSidebar?.(false)}
            className="text-white/40 transition hover:text-white"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6">
        <div className="space-y-8">
          <section className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setShowSidebar?.(false)
                onNewSession()
              }}
              className="block w-full rounded-xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 px-3 py-2 text-left text-sm text-white transition-all duration-200 ease-out hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_8px_22px_rgba(0,0,0,0.32)]"
            >
              New Session
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSidebar?.(false)
                window.location.href = '/welcome'
              }}
              className="block w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-neutral-300 transition-all duration-200 ease-out hover:border-white/20 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_8px_22px_rgba(0,0,0,0.32)]"
            >
              Make GEORGE Yours
            </button>
          </section>

          <section>
            <button
              type="button"
              onClick={() => toggleGroup('Modes')}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Modes
              </span>
              <span className="text-xs text-neutral-500">
                {openGroups.Modes ? '▾' : '▸'}
              </span>
            </button>

            {openGroups.Modes && (
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() =>
                    handlePromptTap({
                      label: 'Focus',
                      text: 'Show me the better next move and keep me on the strongest path.',
                      context: 'decision_next_move',
                    })
                  }
                  className="block w-full rounded-xl px-2 py-1 text-left text-sm text-neutral-300 transition-all duration-200 ease-out hover:rounded-xl hover:bg-white/[0.06] hover:px-3 hover:py-2 hover:text-white hover:shadow-[0_8px_22px_rgba(0,0,0,0.32)]"
                >
                  Focus
                </button>

                <button
                  type="button"
                  onClick={onToggleScripture}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                    activePromptContext === 'bible_decision_lens'
                      ? 'border-[#7C8CFF]/40 bg-[#7C8CFF]/10 text-white'
                      : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-[#7C8CFF]/30 hover:text-white'
                  }`}
                >
                  <span>Be as Christ</span>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-400">
                    {activePromptContext === 'bible_decision_lens' ? 'ON' : 'OFF'}
                  </span>
                </button>

                <div className="space-y-2">
                  {currentTier === 'brilliant' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowSidebar?.(false)
                        onOpenLiveGate()
                      }}
                      title="Live personal guidance, cues, timing, and exact lines."
                      className="block w-full rounded-xl border border-[#7C8CFF]/25 bg-[#7C8CFF]/10 px-3 py-2 text-left text-sm text-white transition hover:border-[#7C8CFF]/45"
                    >
                      Conversation Assistance
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => window.open('/top-up', '_blank')}
                      title="Buy Conversation Engine and unlock Brilliant automatically."
                      className="block w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-neutral-300 transition-all duration-200 ease-out hover:border-white/20 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_8px_22px_rgba(0,0,0,0.32)]"
                    >
                      Conversation Assistance
                      <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-[#7C8CFF]">
                        Upgrade
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowSidebar?.(false)
                      onOpenLiveGate()
                    }}
                    title="For sales reps, firms, callers, campaigns, live scripts, analytics, and team use. Purchase auto-upgrades access."
                    className="block w-full rounded-xl border border-[#7C8CFF]/18 bg-[#7C8CFF]/8 px-3 py-2 text-left text-sm text-white/88 transition hover:border-[#7C8CFF]/40 hover:text-white"
                  >
                    Pro Conversation Partner
                    <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-[#7C8CFF]">
                      Any Tier
                    </span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {promptGroups.map((group) => (
            <section key={group.title}>
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  {group.title}
                </span>
                <span className="text-xs text-neutral-500">
                  {openGroups[group.title] ? '▾' : '▸'}
                </span>
              </button>

              {openGroups[group.title] && (
                <div className="mt-4 space-y-2">
                  {group.prompts.map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => handlePromptTap(prompt)}
                      className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition-all duration-200 ease-out ${
                        activePromptLabel === prompt.label
                          ? 'bg-[#7C8CFF]/10 text-white shadow-[0_0_14px_rgba(124,140,255,0.18)]'
                          : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_8px_22px_rgba(0,0,0,0.35)]'
                      }`}
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              )}
            </section>
          ))}

          {(reroutePrompt || suggestedPrompts.length > 0) && (
            <section>
              <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Signal
              </p>

              <div className="space-y-3">
                {reroutePrompt && (
                  <button
                    type="button"
                    onClick={() => handlePromptTap(reroutePrompt)}
                    className={`block w-full rounded-xl border border-[#7C8CFF]/20 bg-[#7C8CFF]/10 px-3 py-2 text-left text-sm text-[#7C8CFF] transition hover:text-white ${rerouteAnimationClass}`}
                  >
                    {reroutePrompt.label}
                  </button>
                )}

                {suggestedPrompts.map((prompt) => (
                  <button
                    key={`${prompt.context}:${prompt.label}`}
                    type="button"
                    onClick={() => handlePromptTap(prompt)}
                    className={`block w-full rounded-xl px-2 py-1 text-left text-sm text-neutral-300 transition-all duration-200 ease-out hover:rounded-xl hover:bg-white/[0.06] hover:px-3 hover:py-2 hover:text-white hover:shadow-[0_8px_22px_rgba(0,0,0,0.32)] ${suggestedAnimationClass}`}
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <button
              type="button"
              onClick={() => toggleGroup('Account')}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Account
              </span>
              <span className="text-xs text-neutral-500">
                {openGroups.Account ? '▾' : '▸'}
              </span>
            </button>

            {openGroups.Account && (
              <div className="mt-4 space-y-3">
                <a target="_blank" rel="noopener noreferrer" href="/top-up" className={linkClass('/top-up')}>
                  Upgrade
                </a>
                <a target="_blank" rel="noopener noreferrer" href="/help" className={linkClass('/help')}>
                  Help
                </a>
                <a target="_blank" rel="noopener noreferrer" href="/roadmap" className={linkClass('/roadmap')}>
                  Roadmap
                </a>
              </div>
            )}
          </section>

          <section className="border-t border-neutral-800 pt-4">
            <a href="/legal/toa" className="block text-sm text-neutral-500 transition-all duration-200 ease-out hover:rounded-xl hover:bg-white/[0.06] hover:px-3 hover:py-2 hover:text-white hover:shadow-[0_8px_22px_rgba(0,0,0,0.32)]">
              Terms
            </a>
          </section>
        </div>
      </div>
    </aside>
  )
}
