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
}

const promptGroups: PromptGroup[] = [
  {
    title: 'Bible',
    prompts: [
      {
        label: 'Guide with scripture',
        text: 'Guide with scripture',
        context: 'bible_decision_lens',
      },
    ],
  },
  {
    title: 'Decisions',
    prompts: [
      {
        label: 'Make a decision',
        text: 'Help me make a decision.',
        context: 'decision_support',
      },
      {
        label: 'Compare options',
        text: 'Compare these options and tell me which is stronger.',
        context: 'decision_comparison',
      },
      {
        label: 'Next move',
        text: 'What is the smartest next move here?',
        context: 'decision_next_move',
      },
    ],
  },
  {
    title: 'Money',
    prompts: [
      {
        label: 'Make money this week',
        text: 'Give me one way to make money this week.',
        context: 'money_this_week',
      },
      {
        label: 'Make $500 fast',
        text: 'How can I make $500 fast without doing anything illegal or reckless?',
        context: 'money_fast_safe',
      },
      {
        label: 'Skill to income',
        text: 'Help me turn one skill into income.',
        context: 'money_skill_to_income',
      },
    ],
  },
  {
    title: 'Build',
    prompts: [
      {
        label: 'Start building',
        text: 'Help me start building this.',
        context: 'build_start',
      },
      {
        label: '1-week plan',
        text: 'Build me a small plan I can execute this week.',
        context: 'build_week_plan',
      },
      {
        label: 'First steps',
        text: 'Break this into the first real steps.',
        context: 'build_first_steps',
      },
    ],
  },
  {
    title: 'Writing',
    prompts: [
      {
        label: 'Fix message',
        text: 'Fix this message.',
        context: 'writing_fix_message',
      },
      {
        label: 'Make it stronger',
        text: 'Rewrite this so it sounds stronger and clearer.',
        context: 'writing_stronger_clearer',
      },
      {
        label: 'Say it better',
        text: 'Help me say this better without changing the meaning.',
        context: 'writing_preserve_meaning',
      },
    ],
  },
  {
    title: 'Problems',
    prompts: [
      {
        label: 'Untangle',
        text: 'Help me untangle this problem.',
        context: 'problem_untangle',
      },
      {
        label: 'Step by step',
        text: 'Break this down step by step.',
        context: 'problem_step_by_step',
      },
      {
        label: 'Blind spots',
        text: 'Tell me what I am not seeing here.',
        context: 'problem_blind_spots',
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
}: SidebarProps) {
  const [conversationsOpen, setConversationsOpen] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const active = localStorage.getItem('GEORGE_ACTIVE')
    if (active === 'true') setIsSubscribed(true)
  }, [])
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Bible: true,
    Decisions: false,
    Money: false,
    Build: false,
    Writing: false,
    Problems: false,
    Resources: false,
  })

  const pathname = usePathname()

  useEffect(() => {
    const stored = window.localStorage.getItem('george_subscription_active')
    setIsSubscribed(stored === 'true')
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

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen w-[280px] border-r border-neutral-800 bg-black transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'} xl:static xl:flex xl:flex-col xl:translate-x-0`}
    >
      <div className="border-b border-neutral-800 px-5 pb-5 pt-8">
        <div className="flex items-start justify-between gap-3">
          <Brand subtitle={isSubscribed ? 'GEORGE Core active' : 'Standard access'} />
          <button
            type="button"
            onClick={() => setShowSidebar?.(false)}
            className="text-white/40 transition hover:text-white xl:hidden"
            aria-label="Close sidebar"
          >
            ×
          </button>
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
                {conversationsOpen ? '▾' : '▸'}
              </span>
            </button>

            {conversationsOpen && (
              <div className="mt-4 space-y-4">
                <button
                  onClick={onNewSession}
                  className="block text-left text-sm text-neutral-100 transition hover:text-[#7C8CFF]"
                >
                  New session
                </button>

                <span className="block text-sm text-neutral-500">
                  No saved conversations yet
                </span>
              </div>
            )}
          </div>


          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Memory
            </p>

            <div className="space-y-2 text-sm">
              {['General','Goals','Business','Personal','Health','Writing','Legal'].map((folder) => (
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
              Memory
            </p>

            <div className="space-y-2 text-sm">
              {['General','Goals','Business','Legal','Personal','Health','Writing'].map((folder) => (
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
                    onClick={() => onPromptSelect(reroutePrompt)}
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
                        onClick={() => onPromptSelect(prompt)}
                        className={`block w-full py-1 text-left text-sm text-neutral-300 transition hover:text-[#7C8CFF] ${suggestedAnimationClass}`}
                      >
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {promptGroups.map((group) => {
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
                            onClick={() => onPromptSelect(prompt)}
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
              System
            </p>

            <div className="space-y-4">
              <span className="block text-sm text-neutral-400">Sessions</span>

              <div className="text-sm">
                <span className="text-neutral-400">Voice</span>{' '}
                <span className={voiceActive ? 'text-[#7C8CFF]' : 'text-neutral-500'}>
                  {voiceActive ? 'On' : 'Off'}
                </span>
              </div>

              <span className="block text-sm text-neutral-400">
                Subscription: {isSubscribed ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Navigation
            </p>

            <div className="space-y-4">
              <a href="/" className={linkClass('/')}>GEORGE</a>
              <a href="/top-up" className={linkClass('/top-up')}>Top-Up</a>
              <a href="/roadmap" className={linkClass('/roadmap')}>Roadmap</a>
              <a href="/help" className={linkClass('/help')}>Help</a>
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
                <a href="/help" className="block text-neutral-400 hover:text-[#7C8CFF]">Help</a>
                <a href="/legal/toa" className="block text-neutral-400 hover:text-[#7C8CFF]">Terms</a>
                <a href="/roadmap" className="block text-neutral-400 hover:text-[#7C8CFF]">Roadmap</a>
              </div>
            )}
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
                <a href="/help" className="block text-neutral-400 hover:text-[#7C8CFF]">Help</a>
                <a href="/legal/toa" className="block text-neutral-400 hover:text-[#7C8CFF]">Terms</a>
                <a href="/roadmap" className="block text-neutral-400 hover:text-[#7C8CFF]">Roadmap</a>
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
