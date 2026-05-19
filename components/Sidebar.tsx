'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { deleteSession, safeReadSessions, setActiveMode, setActiveSessionIdForMode, type GeorgeStoredSession } from '@/lib/george/session/store'

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
  liveMode?: boolean
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
  liveMode = false,
}: SidebarProps) {
  const pathname = usePathname()
  const [normalSessions, setNormalSessions] = useState<GeorgeStoredSession[]>([])
  const [goalChecks, setGoalChecks] = useState<GoalCheckItem[]>([])
  const [activeGoalCheck, setActiveGoalCheck] = useState<GoalCheckItem | null>(null)
  const [sessionMenuId, setSessionMenuId] = useState<string | null>(null)
  const [pendingDeleteSessionId, setPendingDeleteSessionId] = useState<string | null>(null)
  const [railPanel, setRailPanel] = useState<'new' | 'search' | 'sessions' | null>(null)

  const loadNormalSessions = () => {
    setNormalSessions(
      safeReadSessions()
        .filter((session) => session.mode === 'normal')
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 12)
    )
  }

  useEffect(() => {
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

  const deleteNormalSession = (sessionId: string) => {
    deleteSession(sessionId)
    setSessionMenuId(null)
    setPendingDeleteSessionId(null)
    loadNormalSessions()
  }

  const createGoalCheck = () => {
    const title = window.prompt('Name this Focus')
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
    const text = window.prompt('New Step')
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
      const proof = window.prompt('What changed operationally?')
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

    const next = window.prompt('Edit Item', targetTodo.text)
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
    Runtime: true,
    Access: true,
    Continuity: false,
  })

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const linkClass = (path: string) =>
    `block rounded-[0.5rem] px-3 py-1.5 text-[13px] transition ${
      pathname === path ? 'bg-white/[0.026] text-white/82' : 'text-white/48 hover:bg-white/[0.012] hover:text-white/68'
    }`

  const currentGoalCheck = activeGoalCheck
    ? goalChecks.find((item) => item.id === activeGoalCheck.id) || activeGoalCheck
    : null

return (
  <>
    {!showSidebar && null}

    <aside
      className={`fixed left-0 top-0 z-[120] flex h-screen w-[258px] flex-col overflow-hidden border-r border-white/[0.035] bg-[#07080B]/90 transition-transform duration-300 ${
        showSidebar ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
      } xl:fixed xl:top-0 xl:z-[95] xl:flex xl:translate-x-0 xl:pointer-events-auto`}
    >
      <div className="border-b border-white/[0.035] px-4 pb-3 pt-3 xl:h-[56px] xl:flex xl:items-center">
        <div className="relative flex items-center justify-between opacity-90">
          <div className="flex items-center gap-2.5 translate-y-[2px]">
            <img
              src="/logofav.png"
              alt="BRANESx"
              className="h-[60px] w-[60px] rounded-[1.1rem] object-contain opacity-94"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowSidebar?.(false)}
            className="text-white/34 transition hover:text-white/62"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
        <div className="space-y-4">
          <section className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                setShowSidebar?.(false)
                onNewSession()
              }}
              className="block w-full rounded-[0.55rem] border border-white/[0.05] bg-white/[0.018] px-3 py-2.5 text-left text-[13px] text-white/82 transition hover:bg-white/[0.032] hover:text-white/90"
            >
              GEORGE
            </button>
          </section>

          <section>
            <div className="px-3 text-[10px] uppercase tracking-[0.22em] text-white/30">
              Pages
            </div>

            <div className="mt-3 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setShowSidebar?.(false)
                  onOpenLiveGate()
                }}
                className={linkClass('/george/live-entry')}
              >
                LIVE
              </button>
              <a href="/images" className={linkClass('/images')}>
                Create Images
              </a>
              <a href="/signal" className={linkClass('/signal')}>
                User Signal
              </a>
              <a href="/help" className={linkClass('/help')}>
                Support
              </a>
              <a href="/top-up" className={linkClass('/top-up')}>
                Access
              </a>
            </div>
          </section>

          {!liveMode && (
          <section>
            <button
              type="button"
              onClick={() => toggleGroup('Progress')}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/34">
                Objectives
              </span>
              <span className="text-[11px] text-white/26">
                {openGroups['Progress'] ? '▾' : '▸'}
              </span>
            </button>

            {openGroups['Progress'] && (
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={createGoalCheck}
                  className="block w-full rounded-[0.55rem] px-3 py-2 text-left text-[13px] text-white/62 transition hover:bg-white/[0.014] hover:text-white/78"
                >
                  + New Objective
                </button>

                {goalChecks.length === 0 ? (
                  null
                ) : (
                  goalChecks.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openGoalCheck(item)}
                      className="block w-full rounded-[0.55rem] px-3 py-2 text-left transition hover:bg-white/[0.018]"
                    >
                      <span className="block truncate text-[13px] text-white/64 hover:text-white/78">
                        {item.title}
                      </span>
                      <span className="mt-1 block truncate text-[11px] text-white/28">
                        Objective
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </section>
          )}

          <section className="border-t border-white/[0.035] pt-3">
            <a href="/legal/toa" className="block rounded-[0.55rem] px-3 py-2 text-[13px] text-white/34 transition hover:bg-white/[0.016] hover:text-white/58">
              Terms
            </a>
          </section>

          <section className="border-t border-white/[0.035] pt-4">
            <div className="px-3 text-[10px] uppercase tracking-[0.22em] text-white/22">
              Public Utility
            </div>

            <div className="mt-3 grid gap-1.5 px-3 text-[11px] leading-5">
              <a target="_blank" rel="noopener noreferrer" href="https://988lifeline.org" className="text-white/30 transition hover:text-white/56">
                988 Lifeline
              </a>
              <a target="_blank" rel="noopener noreferrer" href="https://www.stopbullying.gov" className="text-white/30 transition hover:text-white/56">
                StopBullying.gov
              </a>
              <a target="_blank" rel="noopener noreferrer" href="https://www.rainn.org" className="text-white/30 transition hover:text-white/56">
                RAINN
              </a>
              <a target="_blank" rel="noopener noreferrer" href="https://www.lsc.gov" className="text-white/30 transition hover:text-white/56">
                Legal Aid
              </a>
              <a target="_blank" rel="noopener noreferrer" href="https://brokercheck.finra.org" className="text-white/30 transition hover:text-white/56">
                BrokerCheck
              </a>
            </div>
          </section>

          {!liveMode && (
          <section className="border-t border-white/[0.035] pt-4">
            <button
              type="button"
              onClick={() => toggleGroup('Continuity')}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/26">
                Continuity
              </span>
              <span className="text-[11px] text-white/20">
                {openGroups.Continuity ? '▾' : '▸'}
              </span>
            </button>

            {openGroups.Continuity && normalSessions.length > 0 && (
              <div className="mt-3 space-y-1">
                {normalSessions.map((session) => (
                  <div key={session.id} className="group relative rounded-[0.55rem] hover:bg-white/[0.014]">
                    <button
                      type="button"
                      onClick={() => openNormalSession(session)}
                      className="block w-full rounded-[0.45rem] px-2 py-1.5 pr-8 text-left transition"
                    >
                      <span className="block truncate text-[13px] text-white/48 group-hover:text-white/68">
                        {getSessionTitle(session)}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        setPendingDeleteSessionId(null)
                        setSessionMenuId(sessionMenuId === session.id ? null : session.id)
                      }}
                      className="absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white/28 transition hover:bg-white/[0.035] hover:text-white/72"
                      aria-label="Session options"
                    >
                      ⋯
                    </button>

                    {sessionMenuId === session.id && (
                      <div className="absolute right-1 top-8 z-20 w-32 rounded-xl border border-white/[0.07] bg-[#0B0D12]/96 p-1 shadow-[0_18px_48px_rgba(0,0,0,0.42)]">
                        {pendingDeleteSessionId === session.id ? (
                          <button
                            type="button"
                            onClick={() => deleteNormalSession(session.id)}
                            className="block w-full rounded-lg px-2 py-1.5 text-left text-[11px] text-red-100/82 transition hover:bg-red-400/[0.06]"
                          >
                            Confirm delete
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPendingDeleteSessionId(session.id)}
                            className="block w-full rounded-lg px-2 py-1.5 text-left text-[11px] text-red-100/60 transition hover:bg-white/[0.035] hover:text-red-100/86"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
          )}
        </div>
      </div>

      {currentGoalCheck && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/76"
          onClick={() => setActiveGoalCheck(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[0.9rem] border border-white/[0.055] bg-[#07080B] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.72)]"
          >
            <div className="mb-4 text-[16px] font-semibold text-white/88">
              {currentGoalCheck.title}
            </div>

            <div className="mb-5 max-h-52 overflow-y-auto space-y-2">
              {(!(currentGoalCheck?.todos?.length)) ? (
                <p className="text-xs text-white/34">No steps yet.</p>
              ) : (
                (currentGoalCheck?.todos || []).map((todo) => (
                  <div
                    key={todo.id}
                    className="rounded-[0.55rem] border border-white/[0.055] bg-white/[0.018] px-3 py-2 text-[13px] transition hover:bg-white/[0.02]"
                  >
                    <button
                      type="button"
                      onClick={() => currentGoalCheck && toggleTodo(currentGoalCheck, todo.id)}
                      className="flex w-full items-start gap-2 text-left"
                    >
                      <span className={`mt-0.5 h-4 w-4 shrink-0 rounded-[0.25rem] border ${todo.done ? 'border-white/70 bg-white/80' : 'border-white/24'}`} />
                      <span className="min-w-0">
                        <span className={todo.done ? 'block line-through text-white/34' : 'block text-white/82'}>
                          {todo.text}
                        </span>
                        {todo.done && todo.completionNote && (
                          <span className="mt-1 block text-[11px] leading-4 text-white/32">
                            Proof: {todo.completionNote}
                          </span>
                        )}
                      </span>
                    </button>

                    <div className="mt-2 flex gap-2 pl-6">
                      <button
                        type="button"
                        onClick={() => currentGoalCheck && editTodo(currentGoalCheck, todo.id)}
                        className="text-[11px] text-white/36 transition hover:text-white/62"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => currentGoalCheck && deleteTodo(currentGoalCheck, todo.id)}
                        className="text-[11px] text-red-300/54 transition hover:text-red-200/72"
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
                className="w-full rounded-[0.55rem] px-4 py-2 text-[13px] text-white/66 transition hover:bg-white/[0.014] hover:text-white/82"
              >
                + Add Step
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
                    text: `GOAL CHECK\n\nGoal: ${currentGoalCheck.title}\n\nCompleted:\n${done.length ? done.map(d => `- ${d}`).join('\n') : '- None'}\n\nOpen:\n${open.length ? open.map(o => `- ${o}`).join('\n') : '- None'}`,
                    context: 'goal_check'
                  })
                }}
                className="w-full rounded-[0.55rem] border border-white/[0.05] bg-white/[0.018] px-4 py-2 text-[13px] text-white/72 transition hover:bg-white/[0.032] hover:text-white/88"
              >
                Open with GEORGE
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  </>
)
}
