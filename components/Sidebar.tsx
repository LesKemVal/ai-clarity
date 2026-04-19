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
  currentTier?: 'smart' | 'intelligent' | 'brilliant'
}

const promptGroups: PromptGroup[] = [
  {
    title: 'Pre-training Courses',
    prompts: [
      {
        label: "Driver's License",
        text: "I need to pass my driver's license test",
        context: 'training_drivers_license',
      },
      {
        label: "CDL",
        text: "I need to pass my CDL test",
        context: 'training_cdl',
      },
      {
        label: "GED",
        text: "I need to complete my GED",
        context: 'training_ged',
      },
      {
        label: "CNA",
        text: "I need to pass my CNA exam",
        context: 'training_cna',
      },
      {
        label: "Interview Prep",
        text: "I need to prepare for a job interview",
        context: 'training_interview',
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
  currentTier = 'smart',
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
    'Pre-training Courses': true,
    'Conversation Modes': false,
    Resources: false,
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

  return (
    <aside
      className={`fixed left-0 top-0 z-[120] flex h-screen w-[280px] flex-col overflow-hidden border-r border-neutral-800 bg-black transition-transform duration-300 ${showSidebar ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'} xl:static xl:z-auto xl:flex xl:flex-col xl:translate-x-0 xl:pointer-events-auto`}
    >
      <div className="border-b border-white/5 px-5 pb-6 pt-7">
        <div className="relative flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={() => setShowSidebar?.(false)}
            className="absolute right-0 top-0 text-white/40 transition hover:text-white xl:hidden"
            aria-label="Close sidebar"
          >
            ×
          </button>

          <div className="text-4xl font-semibold tracking-tight text-[#7C8CFF]">
            B
          </div>

          <div className="mt-2 text-[11px] uppercase tracking-[0.28em] text-neutral-400">
            BRANES
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-8">
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
              Framing
            </p>

            <button
              type="button"
              onClick={() =>
                onPromptSelect({
                  label: 'Guide w/ Scripture (KJV)',
                  text: 'Guide w/ Scripture (KJV)',
                  context: 'bible_decision_lens',
                })
              }
              className="block w-full rounded-xl border border-[#7C8CFF]/20 bg-[#7C8CFF]/8 px-3 py-2 text-left text-sm text-[#7C8CFF] transition hover:border-[#7C8CFF]/35 hover:bg-[#7C8CFF]/12 hover:text-white"
            >
              Guide w/ Scripture (KJV)
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => toggleGroup('Pre-training Courses')}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Pre-training Courses
              </span>
              <span className="text-xs text-neutral-500">
                {openGroups['Pre-training Courses'] ? '▾' : '▸'}
              </span>
            </button>

            {openGroups['Pre-training Courses'] && (
              <div className="mt-4 space-y-2 pl-0">
                {promptGroups
                  .find((group) => group.title === 'Pre-training Courses')
                  ?.prompts.map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => onPromptSelect(prompt)}
                      className="block w-full rounded-xl px-2 py-1 text-left text-sm text-neutral-300 transition hover:text-[#7C8CFF]"
                    >
                      {prompt.label}
                    </button>
                  ))}

                <button
                  type="button"
                  onClick={() =>
                    onPromptSelect({
                      label: 'Ask GEORGE',
                      text: 'Show me other courses not listed here. Tell me plainly what they are, who they help, what they could mean for me, and if some may not matter to me.',
                      context: 'courses_expand',
                    })
                  }
                  className="mt-3 block w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-neutral-400 transition hover:border-[#7C8CFF]/35 hover:text-[#7C8CFF]"
                >
                  Ask GEORGE
                </button>

              </div>
            )}
          </div>

          {currentTier === 'brilliant' && (
            <div>
              <button
                type="button"
                onClick={() => toggleGroup('Conversation Modes')}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Guided Conversation Engine
                </span>
                <span className="text-xs text-neutral-500">
                  {openGroups['Conversation Modes'] ? '▾' : '▸'}
                </span>
              </button>

              {openGroups['Conversation Modes'] && (
                <div className="mt-4 space-y-2 pl-0">
                  {[
                    { label: 'Doctor Visit', text: 'Set GEORGE to doctor visit mode and help me understand, respond, and stay on objective in real time.', context: 'brilliant_doctor' },
                    { label: 'Dealership', text: 'Set GEORGE to dealership mode and help me slow pace, spot pressure, and negotiate clearly.', context: 'brilliant_dealership' },
                    { label: 'Job Interview', text: 'Set GEORGE to interview mode and help me answer strongly and stay composed.', context: 'brilliant_interview' },
                    { label: 'Boss / Workplace', text: 'Set GEORGE to workplace mode and help me navigate this professionally.', context: 'brilliant_workplace' },
                    { label: 'Relationship Talk', text: 'Set GEORGE to relationship mode and help me communicate cleanly.', context: 'brilliant_relationship' },
                    { label: 'Negotiation', text: 'Set GEORGE to negotiation mode and guide me through this in real time.', context: 'brilliant_negotiation' },
                    { label: 'Public Speaking', text: 'Set GEORGE to speech mode and help me deliver this with control and cadence.', context: 'brilliant_speech' },
                    { label: 'Everyday Conversation', text: 'Set GEORGE to everyday conversation mode and guide me through this naturally.', context: 'brilliant_everyday' },
                    { label: 'Tutor Someone Else', text: 'Set GEORGE to tutor mode and guide me while I train someone else.', context: 'brilliant_tutor' },
                    { label: 'Custom Situation', text: 'Help me prepare for a custom real-world conversation and guide me live.', context: 'brilliant_custom' },
                  ].map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => onPromptSelect(prompt)}
                      className="block w-full rounded-xl px-2 py-1 text-left text-sm text-neutral-300 transition hover:text-[#7C8CFF]"
                    >
                      {prompt.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      onPromptSelect({
                        label: 'Ask GEORGE',
                        text: 'Help me prepare for another real-world situation not listed here. Tell me what matters, what to watch for, and how to move well in the room.',
                        context: 'brilliant_everyday',
                      })
                    }
                    className="mt-3 block w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-neutral-400 transition hover:border-[#7C8CFF]/35 hover:text-[#7C8CFF]"
                  >
                    Ask GEORGE about another situation
                  </button>

                
                  <p className="mt-3 px-1 text-[11px] leading-5 text-neutral-500">
                    Walk in prepared. Stay sharp in the room. Bring GEORGE with you.
                  </p>
</div>
              )}
            </div>
          )}

          <div>
            <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Memory
            </p>

            <div className="space-y-2 text-sm">
              {['General','Goals','Business','Personal','Health','Writing','Legal','Credit'].map((folder) => (
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
                .filter((group) => group.title !== 'Pre-training Courses')
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
              Navigation
            </p>

            <div className="space-y-4">
              <a href="/" className={linkClass('/')}>GEORGE</a>
              <a href="/welcome" className={linkClass('/welcome')}>Make GEORGE Yours</a>
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
