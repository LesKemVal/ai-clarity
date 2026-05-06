'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { safeReadSessions, setActiveMode, setActiveSessionIdForMode, type GeorgeStoredSession } from '@/lib/george/session/store'

export type PromptItem = {
  label: string
  text: string
  context: string
}

type PromptGroup = {
  title: string
  prompts: PromptItem[]
}

type GoalCheckItem = {
  id: string
  title: string
  todos: { id: string; text: string; done: boolean; completionNote?: string }[]
  updatedAt: number
}

const GEORGE_GOAL_CHECKS_KEY = 'GEORGE_GOAL_CHECKS'

function safeReadGoalChecks(): GoalCheckItem[] {
  if (typeof window === 'undefined') return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(GEORGE_GOAL_CHECKS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function safeWriteGoalChecks(items: GoalCheckItem[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(GEORGE_GOAL_CHECKS_KEY, JSON.stringify(items.slice(0, 30)))
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
  const [normalSessions, setNormalSessions] = useState<GeorgeStoredSession[]>([])
  const [goalChecks, setGoalChecks] = useState<GoalCheckItem[]>([])
  const [activeGoalCheck, setActiveGoalCheck] = useState<GoalCheckItem | null>(null)


  useEffect(() => {
    const loadNormalSessions = () => {
      setNormalSessions(
        safeReadSessions()
          .filter((session) => session.mode === 'normal')
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 12)
      )
    }

    loadNormalSessions()
    window.addEventListener('storage', loadNormalSessions)
    return () => window.removeEventListener('storage', loadNormalSessions)
  }, [])

  useEffect(() => {
    const loadGoalChecks = () => {
      setGoalChecks(
        safeReadGoalChecks()
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 12)
      )
    }

    loadGoalChecks()
    window.addEventListener('storage', loadGoalChecks)
    return () => window.removeEventListener('storage', loadGoalChecks)
  }, [])


  const getSessionTitle = (session: GeorgeStoredSession) => {
    const firstUserMessage = session.messages?.find((message) => message.role === 'user')?.content?.trim()
    const firstAssistantMessage = session.messages?.find((message) => message.role === 'assistant')?.content?.trim()
    const rawTitle = session.title?.trim()

    const source =
      rawTitle && rawTitle.toLowerCase() !== 'george' && rawTitle.toLowerCase() !== 'new session'
        ? rawTitle
        : firstUserMessage || firstAssistantMessage || 'Untitled session'

    return source.replace(/\s+/g, ' ').slice(0, 42)
  }

  const getSessionPreview = (session: GeorgeStoredSession) => {
    const preview =
      session.messages?.find((message) => message.role === 'user')?.content?.trim() ||
      session.messages?.find((message) => message.role === 'assistant')?.content?.trim() ||
      'Saved normal session'

    return preview.replace(/\s+/g, ' ').slice(0, 64)
  }

  const openNormalSession = (session: GeorgeStoredSession) => {
    setActiveSessionIdForMode('normal', session.id)
    setActiveMode('normal')
    setShowSidebar?.(false)
    window.location.href = '/george'
  }

  const createGoalCheck = () => {
    const title = window.prompt('Name this Goal Check')
    const cleanTitle = title?.trim()

    if (!cleanTitle) return

    const next: GoalCheckItem = {
      id: `goal_${Date.now()}`,
      title: cleanTitle,
      todos: [],
      updatedAt: Date.now(),
    }

    const updated = [next, ...goalChecks].slice(0, 30)
    setGoalChecks(updated)
    safeWriteGoalChecks(updated)
  }

  
  const addTodo = (goal: GoalCheckItem) => {
    const text = window.prompt('New To-Do')
    if (!text?.trim()) return

    const updated = goalChecks.map((g) =>
      g.id === goal.id
        ? {
            ...g,
            todos: [
              { id: `todo_${Date.now()}`, text: text.trim(), done: false },
              ...(g.todos || [])
            ],
            updatedAt: Date.now(),
          }
        : g
    )

    setGoalChecks(updated)
    localStorage.setItem('GEORGE_GOAL_CHECKS', JSON.stringify(updated))
  }

  const toggleTodo = (goal: GoalCheckItem, todoId: string) => {
    const targetTodo = goal.todos.find((todo) => todo.id === todoId)
    if (!targetTodo) return

    let completionNote = targetTodo.completionNote || ''

    if (!targetTodo.done) {
      const proof = window.prompt('What changed?')
      const cleanProof = proof?.trim()

      if (!cleanProof || cleanProof.length < 4) {
        window.alert('Do not cheat yourself. Describe what actually changed before marking this done.')
        return
      }

      completionNote = cleanProof
    }

    const updated = goalChecks.map((g) =>
      g.id === goal.id
        ? {
            ...g,
            todos: g.todos.map((t) =>
              t.id === todoId
                ? {
                    ...t,
                    done: !t.done,
                    completionNote: !t.done ? completionNote : '',
                  }
                : t
            ),
            updatedAt: Date.now(),
          }
        : g
    )

    setGoalChecks(updated)
    localStorage.setItem('GEORGE_GOAL_CHECKS', JSON.stringify(updated))
  }

  const editTodo = (goal: GoalCheckItem, todoId: string) => {
    const targetTodo = goal.todos.find((todo) => todo.id === todoId)
    if (!targetTodo) return

    const next = window.prompt('Edit To-Do', targetTodo.text)
    const cleanNext = next?.trim()

    if (!cleanNext) return

    const updated = goalChecks.map((g) =>
      g.id === goal.id
        ? {
            ...g,
            todos: g.todos.map((todo) =>
              todo.id === todoId
                ? {
                    ...todo,
                    text: cleanNext,
                    done: false,
                    completionNote: '',
                  }
                : todo
            ),
            updatedAt: Date.now(),
          }
        : g
    )

    setGoalChecks(updated)
    localStorage.setItem('GEORGE_GOAL_CHECKS', JSON.stringify(updated))
  }

  const deleteTodo = (goal: GoalCheckItem, todoId: string) => {
    const updated = goalChecks.map((g) =>
      g.id === goal.id
        ? {
            ...g,
            todos: g.todos.filter((todo) => todo.id !== todoId),
            updatedAt: Date.now(),
          }
        : g
    )

    setGoalChecks(updated)
    localStorage.setItem('GEORGE_GOAL_CHECKS', JSON.stringify(updated))
  }

  const openGoalCheck = (item: GoalCheckItem) => {
    setActiveGoalCheck(item)
  }

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Sessions: true,
    'Goal Check': true,
    Modes: true,
    Build: true,
    'Training Lab': true,
    Account: true,
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
      pathname === path ? 'text-[#7C8CFF]' : 'text-white/52 hover:text-[#7C8CFF]'
    }`

  const rerouteAnimationClass = useMemo(
    () => (rerouteSignal > 0 ? 'glow-twice' : ''),
    [rerouteSignal]
  )

  const suggestedAnimationClass = useMemo(
    () => (suggestedSignal > 0 ? 'glow-twice' : ''),
    [suggestedSignal]
  )


  const currentGoalCheck = activeGoalCheck
    ? goalChecks.find((item) => item.id === activeGoalCheck.id) || activeGoalCheck
    : null

return (
    <aside
      className={`fixed left-0 top-0 z-[120] flex h-screen w-[280px] flex-col overflow-hidden border-r border-white/[0.045] bg-[#08080B]/88 transition-transform duration-300 ${
        showSidebar ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
      } xl:fixed xl:top-0 xl:z-[95] xl:flex xl:translate-x-0 xl:pointer-events-auto`}
    >
      <div className="border-b border-white/[0.04] px-4 pb-3 pt-3 xl:h-[56px] xl:flex xl:items-center">
        <div className="relative flex items-center justify-between opacity-92">
          <div className="flex items-center gap-2.5 translate-y-[4px]">
            <img
              src="/logo900.png"
              alt="BRANESx"
              className="h-10 w-[72px] object-contain"
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

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5">
        <div className="space-y-5">
          <section className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                setShowSidebar?.(false)
                onNewSession()
              }}
              className="block w-full rounded-lg bg-[#7C8CFF]/8 px-3 py-2 text-left text-sm text-white/90 transition hover:bg-[#7C8CFF]/15 hover:text-white"
            >
              New Session
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSidebar?.(false)
                window.location.href = '/welcome'
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white/52 transition duration-150 hover:bg-white/[0.03] hover:text-white"
            >
              Make GEORGE Yours
            </button>
          </section>

          <section>
            <button
              type="button"
              onClick={() => toggleGroup('Sessions')}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/38">
                Sessions
              </span>
              <span className="text-[11px] text-white/32">
                {openGroups.Sessions ? '▾' : '▸'}
              </span>
            </button>

            {openGroups.Sessions && (
              <div className="mt-4 space-y-2">
                {normalSessions.length === 0 ? (
                  <p className="px-2 text-xs leading-5 text-white/32">
                    Normal GEORGE sessions will appear here.
                  </p>
                ) : (
                  normalSessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => openNormalSession(session)}
                      className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-white/[0.04]"
                    >
                      <span className="block truncate text-sm text-white/72 hover:text-white">
                        {getSessionTitle(session)}
                      </span>
                      <span className="mt-1 block truncate text-[11px] text-white/32">
                        {getSessionPreview(session)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </section>

          <section>
            <button
              type="button"
              onClick={() => toggleGroup('Goal Check')}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/38">
                Goal Check
              </span>
              <span className="text-[11px] text-white/32">
                {openGroups['Goal Check'] ? '▾' : '▸'}
              </span>
            </button>

            {openGroups['Goal Check'] && (
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={createGoalCheck}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white/72 transition hover:border-white/20 hover:bg-white/[0.035] hover:text-white"
                >
                  + New Goal Check
                </button>

                {goalChecks.length === 0 ? (
                  <p className="px-2 text-xs leading-5 text-white/32">
                    Manually saved goals and checks will appear here.
                  </p>
                ) : (
                  goalChecks.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openGoalCheck(item)}
                      className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-white/[0.04]"
                    >
                      <span className="block truncate text-sm text-white/72 hover:text-white">
                        {item.title}
                      </span>
                      <span className="mt-1 block truncate text-[11px] text-white/32">
                        Manual goal check
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </section>


          <section>
            <button
              type="button"
              onClick={() => toggleGroup('Modes')}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/38">
                Modes
              </span>
              <span className="text-[11px] text-white/32">
                {openGroups.Modes ? '▾' : '▸'}
              </span>
            </button>

            {openGroups.Modes && (
              <div className="mt-3 space-y-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowSidebar?.(false)

                    if (currentTier !== 'brilliant') {
                      onPromptSelect({
                        label: 'Conversation Mode',
                        text: `Conversation Mode is where GEORGE works with you in real time.

Brilliant gives you live guidance.
Pro turns GEORGE into a full execution system:
- scripts
- cues
- objection handling
- campaign memory
- performance tracking

Upgrade to continue.`,
                        context: 'conversation_mode_info'
                      })
                      return
                    }

                    onOpenLiveGate?.()
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-white/72 transition hover:bg-white/[0.04] hover:text-white"
                >
                  <span className="text-[#7C8CFF]">⚡</span>
                  <span>Conversation Assistant</span>
                </button>

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
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/38">
                  {group.title}
                </span>
                <span className="text-[11px] text-white/32">
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
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                        activePromptLabel === prompt.label
                          ? 'bg-[#7C8CFF]/8 text-white'
                          : 'text-white/52 hover:bg-white/[0.035] hover:text-white'
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
              <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-white/38">
                Signal
              </p>

              <div className="space-y-2.5">
                {reroutePrompt && (
                  <button
                    type="button"
                    onClick={() => handlePromptTap(reroutePrompt)}
                    className={`block w-full rounded-lg bg-[#7C8CFF]/8 px-3 py-2 text-left text-sm text-[#AEB6FF] transition hover:bg-[#7C8CFF]/15 hover:text-white ${rerouteAnimationClass}`}
                  >
                    {reroutePrompt.label}
                  </button>
                )}

                {suggestedPrompts.map((prompt) => (
                  <button
                    key={`${prompt.context}:${prompt.label}`}
                    type="button"
                    onClick={() => handlePromptTap(prompt)}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm text-white/72 transition duration-150 hover:bg-white/[0.03] hover:text-white ${suggestedAnimationClass}`}
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
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/38">
                Account
              </span>
              <span className="text-[11px] text-white/32">
                {openGroups.Account ? '▾' : '▸'}
              </span>
            </button>

            {openGroups.Account && (
              <div className="mt-4 space-y-2.5">
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

          <section className="border-t border-white/[0.04] pt-3">
            <a href="/legal/toa" className="block rounded-lg px-3 py-2 text-sm text-white/38 transition hover:bg-white/[0.04] hover:text-white">
              Terms
            </a>
          </section>
        </div>
      </div>
    
{currentGoalCheck && (
  <div
    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
    onClick={() => setActiveGoalCheck(null)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-sm rounded-2xl bg-black p-6 shadow-[0_30px_120px_rgba(0,0,0,0.8)]"
    >
      <div className="mb-4 text-lg text-white font-semibold">
        {currentGoalCheck.title}
      </div>

      <div className="mb-5 max-h-52 overflow-y-auto space-y-2">
        {(!(currentGoalCheck?.todos?.length)) ? (
          <p className="text-xs text-white/40">No to-dos yet.</p>
        ) : (
          (currentGoalCheck?.todos || []).map((todo) => (
            <div
              key={todo.id}
              className="rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2 text-sm transition hover:bg-white/[0.04]"
            >
              <button
                type="button"
                onClick={() => currentGoalCheck && toggleTodo(currentGoalCheck, todo.id)}
                className="flex w-full items-start gap-2 text-left"
              >
                <span className={`mt-0.5 h-4 w-4 shrink-0 rounded border ${todo.done ? 'bg-white' : 'border-white/30'}`} />
                <span className="min-w-0">
                  <span className={todo.done ? 'block line-through text-white/40' : 'block text-white'}>
                    {todo.text}
                  </span>
                  {todo.done && todo.completionNote && (
                    <span className="mt-1 block text-[11px] leading-4 text-white/35">
                      Completion: {todo.completionNote}
                    </span>
                  )}
                </span>
              </button>

              <div className="mt-2 flex gap-2 pl-6">
                <button
                  type="button"
                  onClick={() => currentGoalCheck && editTodo(currentGoalCheck, todo.id)}
                  className="text-[11px] text-white/40 transition hover:text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => currentGoalCheck && deleteTodo(currentGoalCheck, todo.id)}
                  className="text-[11px] text-red-400/70 transition hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2.5">
        <button
          onClick={() => currentGoalCheck && addTodo(currentGoalCheck)}
          className="w-full rounded-lg px-4 py-2 text-sm text-white/80"
        >
          + Add To-Do
        </button>

        <button
          onClick={() => {
            setActiveGoalCheck(null)
            setShowSidebar?.(false)
            const todos = currentGoalCheck.todos || []
const done = todos
  .filter(t => t.done)
  .map(t => `${t.text}${t.completionNote ? ` — Completion: ${t.completionNote}` : ''}`)
const open = todos.filter(t => !t.done).map(t => t.text)

onPromptSelect({
  label: currentGoalCheck.title,
  text: `GOAL CHECK

Goal: ${currentGoalCheck.title}

Completed:
${done.length ? done.map(d => `- ${d}`).join('\n') : '- None'}

Open:
${open.length ? open.map(o => `- ${o}`).join('\n') : '- None'}

Rule: Do not let me cheat myself. If a completed item looks vague, weak, unproven, or contradicted by the open items, challenge it directly and tell me what would count as real completion.

What is the strongest next move based on this?`,
  context: 'goal_check_structured',
})
          }}
          className="w-full rounded-lg bg-white text-black px-4 py-2 text-sm"
        >
          Review with GEORGE
        </button>

        <button
          onClick={() => {
            const next = window.prompt('Rename Goal Check', currentGoalCheck.title)
            if (!next?.trim()) return

            const updated = goalChecks.map((g) =>
              g.id === currentGoalCheck.id
                ? { ...g, title: next.trim(), updatedAt: Date.now() }
                : g
            )

            setGoalChecks(updated)
            localStorage.setItem('GEORGE_GOAL_CHECKS', JSON.stringify(updated))
            setActiveGoalCheck(null)
          }}
          className="w-full rounded-lg px-4 py-2 text-sm text-white/80"
        >
          Rename
        </button>

        <button
          onClick={() => {
            const updated = goalChecks.filter((g) => g.id !== currentGoalCheck.id)
            setGoalChecks(updated)
            localStorage.setItem('GEORGE_GOAL_CHECKS', JSON.stringify(updated))
            setActiveGoalCheck(null)
          }}
          className="w-full rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400"
        >
          Delete
        </button>

      </div>
    </div>
  </div>
)}

</aside>
  )
}
