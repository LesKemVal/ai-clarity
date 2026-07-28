'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CONVERSATION_TYPES,
  type ConversationType,
} from '@/lib/george/live-entry/conversation-types'
import {
  loadLivePreparationSignals,
  markLivePreparationPreviewReady,
  saveLivePreparationSignals,
} from '@/lib/george/live-browser/live-preparation-browser-storage'
import {
  LIVE_PREPARATION_QUESTIONS,
  resolveLivePreparationReadiness,
  resolveLivePreparationTransition,
} from '@/lib/george/live-runtime/live-intent-runtime'

type SurfacePhase =
  | 'selection'
  | 'selected'
  | 'introduction'
  | 'questions'
  | 'decision'
  | 'review'

function useTypewriter(text: string, enabled: boolean, speed = 28) {
  const [value, setValue] = useState('')

  useEffect(() => {
    setValue('')
    if (!enabled || !text) return

    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setValue(text.slice(0, index))
      if (index >= text.length) window.clearInterval(timer)
    }, speed)

    return () => window.clearInterval(timer)
  }, [enabled, speed, text])

  return value
}

function ConversationTypeCard({
  conversationType,
  onSelect,
}: {
  conversationType: ConversationType
  onSelect: (conversationType: ConversationType) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(conversationType)}
      className="group flex min-h-[64px] items-center justify-between gap-3 rounded-[14px] border border-white/[0.08] bg-[#08090A] px-4 py-3 text-left transition duration-200 hover:border-[#4E7CFF]/42 hover:bg-[#4E7CFF]/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EA1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <h3 className="font-mono text-[11px] font-semibold uppercase leading-5 tracking-[0.16em] text-white">
        {conversationType.title}
      </h3>
      <span className="shrink-0 text-[14px] text-white/24 transition group-hover:translate-x-0.5 group-hover:text-white/72">
        →
      </span>
    </button>
  )
}

export function HomeConversationTypeSurface() {
  const [selectedType, setSelectedType] = useState<ConversationType | null>(null)
  const [phase, setPhase] = useState<SurfacePhase>('selection')
  const [introStage, setIntroStage] = useState(0)
  const [decisionReady, setDecisionReady] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [editingQuestionKey, setEditingQuestionKey] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const visibleTypes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return CONVERSATION_TYPES

    return CONVERSATION_TYPES.filter((item) =>
      [item.title, item.description, item.initialization]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [searchQuery])

  const preparationTransition = useMemo(
    () => resolveLivePreparationTransition(answers),
    [answers],
  )
  const readiness = useMemo(
    () => resolveLivePreparationReadiness(answers),
    [answers],
  )
  const activeQuestion = editingQuestionKey
    ? LIVE_PREPARATION_QUESTIONS.find(
        (question) => question.key === editingQuestionKey,
      ) || null
    : preparationTransition.question
  const activeQuestionIndex = activeQuestion
    ? LIVE_PREPARATION_QUESTIONS.findIndex(
        (question) => question.key === activeQuestion.key,
      )
    : LIVE_PREPARATION_QUESTIONS.length

  useEffect(() => {
    if (phase !== 'introduction') return

    setIntroStage(0)
    const structureTimer = window.setTimeout(() => setIntroStage(1), 180)
    const customizeTimer = window.setTimeout(() => setIntroStage(2), 1150)
    const buttonTimer = window.setTimeout(() => setIntroStage(3), 1750)

    return () => {
      window.clearTimeout(structureTimer)
      window.clearTimeout(customizeTimer)
      window.clearTimeout(buttonTimer)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'decision') return

    setDecisionReady(false)
    const timer = window.setTimeout(() => setDecisionReady(true), 2450)
    return () => window.clearTimeout(timer)
  }, [phase])

  const structureText = useTypewriter(
    'The structure is ready.',
    phase === 'introduction' && introStage >= 1,
    34,
  )
  const questionText = useTypewriter(
    activeQuestion?.question || '',
    phase === 'questions' && Boolean(activeQuestion),
    24,
  )
  const decisionText = useTypewriter(
    'You can continue directly into LIVE now, or remain here and continue briefing GEORGE.',
    phase === 'decision',
    24,
  )

  function selectConversation(conversationType: ConversationType) {
    setSelectedType(conversationType)
    setPhase('selected')
    setIntroStage(0)
    setDecisionReady(false)
    setEditingQuestionKey(null)
  }

  function resetSelection() {
    setSelectedType(null)
    setPhase('selection')
    setIntroStage(0)
    setDecisionReady(false)
    setEditingQuestionKey(null)
    setAnswers({})
  }

  function beginPreparation() {
    setPhase('introduction')
  }

  function beginQuestions() {
    setAnswers(loadLivePreparationSignals())
    setEditingQuestionKey(null)
    setPhase('questions')
  }

  function saveCurrentAnswer() {
    if (!activeQuestion) return

    const answer = String(answers[activeQuestion.key] || '').trim()
    if (!answer) return

    const nextSignals = {
      ...answers,
      [activeQuestion.key]: answer,
    }

    setAnswers(nextSignals)
    saveLivePreparationSignals(nextSignals)

    if (editingQuestionKey) {
      setEditingQuestionKey(null)
      setPhase('review')
      return
    }

    const nextTransition = resolveLivePreparationTransition(nextSignals)
    if (!nextTransition.question) {
      window.setTimeout(() => setPhase('decision'), 260)
    }
  }

  function preserveHomepageHandoff() {
    if (!selectedType || !readiness.thresholdMet) return false

    const signals = Object.fromEntries(
      Object.entries(answers)
        .map(([key, value]) => [key, String(value || '').trim()])
        .filter(([, value]) => Boolean(value)),
    )

    saveLivePreparationSignals(signals)
    markLivePreparationPreviewReady()

    try {
      window.localStorage.setItem(
        'GEORGE_HOMEPAGE_LIVE_HANDOFF',
        JSON.stringify({
          conversationTypeId: selectedType.id,
          conversationType: selectedType.title,
          conversationGroup: selectedType.group,
          signals,
          readiness: resolveLivePreparationReadiness(signals),
          createdAt: Date.now(),
        }),
      )
    } catch {}

    return true
  }

  function approveAndContinueToLive() {
    if (!preserveHomepageHandoff()) return
    window.location.href = '/george/live-entry?source=homepage&stage=final-check'
  }

  function continueBriefing() {
    if (!preserveHomepageHandoff()) return
    window.location.href = '/george?source=homepage-briefing'
  }

  return (
    <section
      className={`relative min-h-[100dvh] border-t border-white/10 px-5 py-14 transition-colors duration-700 sm:px-8 sm:py-20 ${
        selectedType ? 'bg-[#020304]' : 'bg-black'
      }`}
    >
      <div className="mx-auto w-full max-w-[1700px]">
        {phase === 'selection' ? (
          <div className="animate-[fadeIn_420ms_ease-out]">
            <div className="max-w-5xl">
              <p className="inline-flex rounded-full border border-[#3657A8]/55 bg-[#172347] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F4F8FF]/88 shadow-[0_8px_26px_rgba(12,27,68,0.28)]">
                Conversation types
              </p>
              <h1 className="mt-4 font-mono text-[34px] font-black uppercase leading-[0.94] tracking-[-0.065em] sm:text-[54px]">
                What do you want GEORGE to help you do?
              </h1>
              <p className="mt-6 max-w-3xl text-[16px] leading-8 text-white/68">
                Choose the closest conversation type, or describe what you want to accomplish.
              </p>

              <label className="mt-8 block max-w-3xl">
                <span className="sr-only">Search conversation types</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Describe what you want to accomplish"
                  className="w-full rounded-[16px] border border-white/[0.1] bg-[#08090A] px-5 py-4 text-[15px] text-white outline-none transition placeholder:text-white/28 focus:border-[#7EA1FF]/55"
                />
              </label>
            </div>

            <div className="mt-9">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
                  {visibleTypes.length} conversation {visibleTypes.length === 1 ? 'type' : 'types'}
                </p>
                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/38 transition hover:text-white/78"
                  >
                    Clear search
                  </button>
                )}
              </div>

              {visibleTypes.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {visibleTypes.map((conversationType) => (
                    <ConversationTypeCard
                      key={conversationType.id}
                      conversationType={conversationType}
                      onSelect={selectConversation}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[18px] border border-white/[0.08] bg-[#08090A] px-5 py-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/48">
                    No close match yet. Try a broader description.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-5xl animate-[fadeIn_420ms_ease-out]">
            <div className="rounded-[30px] border border-white/[0.1] bg-[#08090A] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.56)] sm:p-9">
              <div className="border-b border-white/[0.08] pb-7">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#AEB6FF]/56">
                  Conversation type
                </div>
                <h2 className="mt-3 font-mono text-[22px] font-semibold uppercase tracking-[-0.025em] text-white sm:text-[28px]">
                  {selectedType?.title}
                </h2>
              </div>

              {phase === 'selected' && (
                <div className="pt-7">
                  <p className="max-w-3xl text-[15px] leading-7 text-white/62">
                    {selectedType?.description}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={beginPreparation}
                      className="rounded-full border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-[#AEB6FF]/75 hover:bg-[#203268]"
                    >
                      Continue
                    </button>
                    <button
                      type="button"
                      onClick={resetSelection}
                      className="rounded-full border border-white/[0.14] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/66 transition hover:border-white/30 hover:text-white"
                    >
                      Select another conversation
                    </button>
                  </div>
                </div>
              )}

              {phase === 'introduction' && (
                <div className="pt-7">
                  <div className="min-h-[48px] font-mono text-[22px] leading-8 tracking-[-0.035em] text-white sm:text-[28px] sm:leading-10">
                    {structureText}
                  </div>
                  <h3
                    className={`mt-7 font-mono text-[18px] font-semibold tracking-[-0.02em] text-white transition-opacity duration-500 ${
                      introStage >= 2 ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    Customize your conversation.
                  </h3>
                  <button
                    type="button"
                    onClick={beginQuestions}
                    className={`mt-6 rounded-full border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition duration-500 hover:border-[#AEB6FF]/75 hover:bg-[#203268] ${
                      introStage >= 3 ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
                    }`}
                  >
                    Start
                  </button>
                </div>
              )}

              {phase === 'questions' && activeQuestion && (
                <div key={activeQuestion.key} className="pt-7 animate-[fadeIn_420ms_ease-out]">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#AEB6FF]/56">
                    {activeQuestion.kicker}
                  </div>
                  <h3 className="mt-3 min-h-[58px] font-mono text-[18px] leading-7 tracking-[-0.025em] text-white sm:text-[22px]">
                    {questionText}
                  </h3>
                  <p className="mt-3 text-[13px] leading-6 text-white/42">
                    {activeQuestion.examples}
                  </p>
                  <textarea
                    autoFocus
                    value={answers[activeQuestion.key] || ''}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [activeQuestion.key]: event.target.value,
                      }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        saveCurrentAnswer()
                      }
                    }}
                    rows={3}
                    className="mt-5 w-full resize-none rounded-[16px] border border-white/[0.1] bg-white/[0.025] px-4 py-3 text-[15px] leading-6 text-white outline-none transition focus:border-[#7EA1FF]/55"
                  />
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28">
                      {activeQuestionIndex + 1} of {LIVE_PREPARATION_QUESTIONS.length}
                    </span>
                    <button
                      type="button"
                      onClick={saveCurrentAnswer}
                      disabled={!String(answers[activeQuestion.key] || '').trim()}
                      className="rounded-full border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-[#AEB6FF]/75 hover:bg-[#203268] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {phase === 'decision' && (
                <div className="pt-7 animate-[fadeIn_420ms_ease-out]">
                  <h3 className="min-h-[96px] max-w-4xl font-mono text-[20px] leading-8 tracking-[-0.025em] text-white sm:text-[24px] sm:leading-9">
                    {decisionText}
                  </h3>
                  <div
                    className={`mt-7 flex flex-wrap gap-3 transition-all duration-500 ${
                      decisionReady ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setPhase('review')}
                      disabled={!readiness.thresholdMet}
                      className="rounded-full border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-[#AEB6FF]/75 hover:bg-[#203268] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Continue to LIVE
                    </button>
                    <button
                      type="button"
                      onClick={continueBriefing}
                      className="rounded-full border border-white/[0.14] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/72 transition hover:border-white/30 hover:text-white"
                    >
                      Continue briefing
                    </button>
                  </div>
                </div>
              )}

              {phase === 'review' && (
                <div className="pt-7 animate-[fadeIn_420ms_ease-out]">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#AEB6FF]/56">
                    Review answers
                  </div>
                  <div className="mt-5 space-y-3">
                    {LIVE_PREPARATION_QUESTIONS.map((question) => (
                      <div
                        key={question.key}
                        className="rounded-[16px] border border-white/[0.08] bg-white/[0.02] p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/38">
                              {question.question}
                            </p>
                            <p className="mt-2 text-[14px] leading-6 text-white/76">
                              {answers[question.key]}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingQuestionKey(question.key)
                              setPhase('questions')
                            }}
                            className="shrink-0 font-mono text-[9px] uppercase tracking-[0.18em] text-[#AEB6FF]/72 transition hover:text-white"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={approveAndContinueToLive}
                      disabled={!readiness.thresholdMet}
                      className="rounded-full border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-[#AEB6FF]/75 hover:bg-[#203268] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      Approve and continue
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhase('decision')}
                      className="rounded-full border border-white/[0.14] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/72 transition hover:border-white/30 hover:text-white"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
