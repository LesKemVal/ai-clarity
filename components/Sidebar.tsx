'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { safeReadSessions, setActiveMode, setActiveSessionIdForMode, type GeorgeStoredSession } from '@/lib/george/session/store'

export type PromptItem = {
  label: string
  text: string
  context: string
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
  activePromptLabel?: string | null
  activePromptContext?: string | null
  onToggleScripture?: () => void
  onOpenLiveGate?: () => void
  currentTier?: 'smart' | 'intelligent' | 'brilliant'
}

export default function Sidebar({
  showSidebar = false,
  setShowSidebar,
  voiceActive,
  onNewSession,
  onPromptSelect,
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
    'Intelligent Utility': true,
    Account: true,
    'Goal Check': false,
    Sessions: false,
  })

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const linkClass = (path: string) =>
    `block text-sm transition ${
      pathname === path ? 'text-[#7C8CFF]' : 'text-white/52 hover:text-[#7C8CFF]'
    }`

  const currentGoalCheck = activeGoalCheck
    ? goalChecks.find((item) => item.id === activeGoalCheck.id) || activeGoalCheck
    : null

  return (
    <aside
      className={`fixed left-0 top-0 z-[120] flex h-screen w-[280px] flex-col overflow-hidden border-r border-white/[0.045] bg-[#08080B]/88 transition-transform duration-300 ${
        showSidebar ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
      } xl:fixed xl:top-0 xl:z-[95] xl:flex xl:translate-x-0 xl:pointer-events-auto`}
    >
      <div className="border-b border-white/[0.04] px-4 pb-3 pt-3 xl:h-[64px] xl:flex xl:items-center">
        <div className="relative flex items-center justify-between opacity-92">
          <div className="flex items-center gap-2.5 translate-y-[2px]">
            <img
              src="/bxx34.png"
              alt="BRANESx"
              className="h-8 w-auto object-contain opacity-95"
            />
            <div className="leading-none">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/34">Intelligent</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#7C8CFF]/70">Utility</p>
            </div>
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
              className="block w-full rounded-xl border border-white/[0.06] bg-white/[0.035] px-3 py-2.5 text-left text-sm font-medium text-white/90 transition hover:border-[#7C8CFF]/30 hover:bg-[#7C8CFF]/10 hover:text-white"
            >
              Normal GEORGE
              <span className="mt-1 block text-[11px] font-normal text-white/38">One tap back to direction.</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSidebar?.(false)
                window.location.href = '/welcome'
              }}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-white/52 transition duration-150 hover:bg-white/[0.03] hover:text-white"
            >
              Make GEORGE Yours
            </button>
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

                {goalChecks.map((item) => (
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
                ))}
              </div>
            )}
          </section>

          <section>
            <button
              type="button"
              onClick={() => toggleGroup('Intelligent Utility')}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/38">
                Intelligent Utility
              </span>
              <span className="text-[11px] text-white/32">
                {openGroups['Intelligent Utility'] ? '▾' : '▸'}
              </span>
            </button>

            {openGroups['Intelligent Utility'] && (
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSidebar?.(false)

                    if (currentTier !== 'brilliant') {
                      window.location.href = '/top-up?intent=conversation'
                      return
                    }

                    onOpenLiveGate?.()
                  }}
                  className="w-full rounded-xl border border-[#7C8CFF]/18 bg-[#7C8CFF]/[0.07] px-3 py-2.5 text-left transition hover:border-[#7C8CFF]/35 hover:bg-[#7C8CFF]/[0.12]"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-white/88">
                    <span className="text-[#7C8CFF]">◉</span>
                    GEORGE LIVE
                  </span>
                  <span className="mt-1 block text-[11px] leading-4 text-white/42">
                    Real-time cues, timing, and response shaping.
                  </span>
                </button>
              </div>
            )}
          </section>

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

          <section className="border-t border-white/[0.04] pt-4">
            <button
              type="button"
              onClick={() => toggleGroup('Sessions')}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/30">
                Recent
              </span>
              <span className="text-[11px] text-white/24">
                {openGroups.Sessions ? '▾' : '▸'}
              </span>
            </button>

            {openGroups.Sessions && normalSessions.length > 0 && (
              <div className="mt-3 space-y-1">
                {normalSessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => openNormalSession(session)}
                    className="block w-full rounded-md px-2 py-1.5 text-left transition hover:bg-white/[0.03]"
                  >
                    <span className="block truncate text-[13px] text-white/54 hover:text-white/80">
                      {getSessionTitle(session)}
                    </span>
                  </button>
                ))}
              </div>
            )}
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
                    text: `GOAL CHECK\n\nGoal: ${currentGoalCheck.title}\n\nCompleted:\n${done.length ? done.map(d => `- ${d}`).join('\n') : '- None'}\n\nOpen:\n${open.length ? open.map(o => `- ${o}`).join('\n') : '- None'}\n\nRule: Do not let me cheat myself. If a completed item looks vague, weak, unproven, or contradicted by the open items, challenge it directly and tell me what would count as real completion.\n\nWhat is the strongest next move based on this?`,
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
