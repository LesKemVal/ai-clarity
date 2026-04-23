'use client'

import Brand from '@/components/Brand'

import { useEffect, useMemo, useState } from 'react'
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
        label: "CDL Path",
        text: "I need to pass my CDL test.",
        context: 'training_cdl',
      },
      {
        label: "Interview Win",
        text: "I need to prepare for a job interview.",
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
  currentTier = 'smart',
}: SidebarProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const active = localStorage.getItem('GEORGE_ACTIVE')
    if (active === 'true') setIsSubscribed(true)
  }, [])
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    POWER: false,
    Build: false,
    'Training Lab': false,
    ACCOUNT: false,
    'Conversation Modes': false,
  })

  const pathname = usePathname()

  useEffect(() => {
    setIsSubscribed(true)
  }, [pathname])

  const linkClass = (path: string) =>
    `block text-sm transition button-press ${
      pathname === path
        ? 'text-[#7C8CFF]'
        : 'text-neutral-400 hover:text-[#7C8CFF]'
    }`

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const rerouteAnimationClass = useMemo(
    () => (rerouteSignal > 0 ? 'glow-twice' : ''),
    [rerouteSignal]
  )

  const suggestedAnimationClass = useMemo(
    () => (suggestedSignal > 0 ? 'glow-twice' : ''),
    [suggestedSignal]
  )

  const handlePromptTap = (prompt: PromptItem) => {
    setShowSidebar?.(false)
    onPromptSelect(prompt)
  }


  return (
    <aside
      className={`fixed left-0 top-0 z-[120] flex h-screen w-[280px] flex-col overflow-hidden border-r border-neutral-800 bg-black transition-transform duration-300 ${showSidebar ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'} xl:fixed xl:top-0 xl:h-screen xl:z-[95] xl:flex xl:flex-col xl:translate-x-0 xl:pointer-events-auto`}
    >
      <div className="relative z-[130] border-b border-white/5 px-4 pb-3 pt-3 xl:h-[56px] xl:flex xl:items-center">
        <div className="relative flex items-center justify-start">
          <button
            type="button"
            onClick={() => setShowSidebar?.(false)}
            className="absolute right-0 top-0 text-white/40 transition hover:text-white xl:hidden"
            aria-label="Close sidebar"
          >
            ×
          </button>

          <div className="relative z-[140] flex items-center gap-2.5">
            <div className="text-4xl font-semibold tracking-tight text-[#7C8CFF]">
              B
            </div>

            <div className="text-[11px] uppercase tracking-[0.20em] text-neutral-400">
              BRANESx
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6">
        <div className="space-y-10">
          <div className="space-y-4">
            <button
              onClick={onNewSession}
              className="block w-full rounded-xl border border-[#7C8CFF]/30 bg-[#7C8CFF]/10 px-3 py-2 text-left text-sm text-white transition hover:border-[#7C8CFF]/50 hover:bg-[#7C8CFF]/15"
            >
              New Session
            </button>

            <button
              type="button"
              className="block w-full text-left text-sm text-neutral-400 transition hover:text-[#7C8CFF]"
            >
              Sessions
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={onToggleScripture}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                activePromptContext === 'bible_decision_lens'
                  ? 'border-[#7C8CFF]/40 bg-[#7C8CFF]/10 text-white'
                  : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-[#7C8CFF]/30 hover:text-white'
              }`}
            >
              <span>Guide by Scripture</span>
              <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-400">
                {activePromptContext === 'bible_decision_lens' ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => toggleGroup('POWER')}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Modes
              </span>
              <span className="text-xs text-neutral-500">
                {openGroups['POWER'] ? '▾' : '▸'}
              </span>
            </button>

            {openGroups['POWER'] && (
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() =>
                    onPromptSelect({
                      label: 'Focus',
                      text: 'Show me the better next move and keep me on the strongest path.',
                      context: 'decision_next_move',
                    })
                  }
                  className="block w-full rounded-xl px-2 py-1 text-left text-sm text-neutral-300 transition hover:text-[#7C8CFF]"
                >
                  Focus
                </button>

                {currentTier === 'brilliant' && (
                  <button
                    type="button"
                    onClick={() => toggleGroup('Conversation Modes')}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="text-sm text-neutral-300 transition hover:text-[#7C8CFF]">
                      Live Conversation
                    </span>
                    <span className="text-xs text-neutral-500">
                      {openGroups['Conversation Modes'] ? '▾' : '▸'}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => toggleGroup('Build')}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Build
              </span>
              <span className="text-xs text-neutral-500">
                {openGroups['Build'] ? '▾' : '▸'}
              </span>
            </button>

            {openGroups['Build'] && (
              <div className="mt-4 space-y-2 pl-0">
                {promptGroups
                  .find((group) => group.title === 'Build')
                  ?.prompts.map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => handlePromptTap(prompt)}
                      className="block w-full rounded-xl px-2 py-1 text-left text-sm text-neutral-300 transition hover:text-[#7C8CFF]"
                    >
                      {prompt.label}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => toggleGroup('Training Lab')}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Training Lab
              </span>
              <span className="text-xs text-neutral-500">
                {openGroups['Training Lab'] ? '▾' : '▸'}
              </span>
            </button>

            {openGroups['Training Lab'] && (
              <div className="mt-4 space-y-2 pl-0">
                {promptGroups
                  .find((group) => group.title === 'Training Lab')
                  ?.prompts.map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => handlePromptTap(prompt)}
                      className="block w-full rounded-xl px-2 py-1 text-left text-sm text-neutral-300 transition hover:text-[#7C8CFF]"
                    >
                      {prompt.label}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => toggleGroup('ACCOUNT')}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Account
              </span>
              <span className="text-xs text-neutral-500">
                {openGroups['ACCOUNT'] ? '▾' : '▸'}
              </span>
            </button>

            {openGroups['ACCOUNT'] && (
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => window.open('/top-up','_blank')}
                  className="block w-full text-left text-sm text-neutral-100 transition hover:text-[#7C8CFF]"
                >
                  Upgrade
                </button>

                <button
                  type="button"
                  onClick={() => window.open('/help','_blank')}
                  className="block w-full text-left text-sm text-neutral-300 transition hover:text-[#7C8CFF]"
                >
                  Help
                </button>

                <button
                  type="button"
                  onClick={() => window.open('/roadmap','_blank')}
                  className="block w-full text-left text-sm text-neutral-300 transition hover:text-[#7C8CFF]"
                >
                  Roadmap
                </button>
              </div>
            )}
          </div>

          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Memory
            </p>

            <div className="space-y-2 text-sm">
              {['Business','Legal','Funding','Credit'].map((folder) => (
                <button
                  key={folder}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-memory-folder', { detail: folder }))
                  }}
                  className="block text-left text-neutral-400 transition hover:text-[#7C8CFF]"
                >
                  {folder}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Prompts
            </p>

            <div className="space-y-4">
{reroutePrompt && (
                <div>
                  <button
                    type="button"
                    onClick={() => reroutePrompt && handlePromptTap(reroutePrompt)}
                    className={`block w-full py-1 text-left text-sm text-[#7C8CFF] transition hover:text-white ${rerouteAnimationClass}`}
                  >
                    {reroutePrompt.label}
                  </button>
                </div>
              )}

              {suggestedPrompts.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    Suggested
                  </p>

                  <div className="space-y-2 pl-0">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={`${prompt.context}:${prompt.label}`}
                        type="button"
                        onClick={() => handlePromptTap(prompt)}
                        className={`block w-full rounded-xl px-2 py-1 text-left text-sm text-neutral-300 transition hover:text-[#7C8CFF] ${suggestedAnimationClass} ${
                          suggestedSignal > 0 ? 'shadow-[0_0_12px_rgba(124,140,255,0.18)]' : ''
                        }`}
                      >
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {promptGroups
                .filter((group) => !['Build', 'Training Lab'].includes(group.title))
                .map((group) => {
                const isOpen = openGroups[group.title]

                return (
                  <div key={group.title}>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.title)}
                      className="flex w-full items-center justify-between py-1 text-left text-sm text-neutral-200 transition hover:text-[#7C8CFF]"
                    >
                      <span>{group.title}</span>
                      <span className="text-xs text-neutral-500">{isOpen ? '▾' : '▸'}</span>
                    </button>

                    {isOpen && (
                      <div className="mt-2 space-y-2 pl-3">
                        {group.prompts.map((prompt) => (
                          <button
                            key={prompt.label}
                            type="button"
                            onClick={() => handlePromptTap(prompt)}
                            className="block w-full py-1 text-left text-sm text-neutral-400 transition hover:text-[#7C8CFF]"
                          >
                            {prompt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>


          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Navigation
            </p>

            <div className="space-y-4">
              <a href="/" className={linkClass('/')}>GEORGE</a>
              <a target="_blank" rel="noopener noreferrer" href="/top-up" className={linkClass('/top-up')}>Top-Up</a>
              <a target="_blank" rel="noopener noreferrer" href="/roadmap" className={linkClass('/roadmap')}>Roadmap</a>
              <a target="_blank" rel="noopener noreferrer" href="/help" className={linkClass('/help')}>Help</a>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => toggleGroup('Resources')}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Resources
              </span>
              <span className="text-xs text-neutral-500">
                {openGroups['Resources'] ? '▾' : '▸'}
              </span>
            </button>

            {openGroups['Resources'] && (
              <div className="mt-4 space-y-2 text-sm">
                <a target="_blank" rel="noopener noreferrer" href="/help" className="block text-neutral-400 hover:text-[#7C8CFF]">Help</a>
                <a href="/legal/toa" className="block text-neutral-400 hover:text-[#7C8CFF]">Terms</a>
                <a target="_blank" rel="noopener noreferrer" href="/roadmap" className="block text-neutral-400 hover:text-[#7C8CFF]">Roadmap</a>
              </div>
            )}
          </div>


          <div className="border-t border-neutral-800 pt-4">
            <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Legal
            </p>
            <a href="/legal/toa" className="block text-sm text-neutral-400 transition hover:text-[#7C8CFF]">
              Terms
            </a>
          </div>

        </div>
      </div>
    </aside>
  )
}
