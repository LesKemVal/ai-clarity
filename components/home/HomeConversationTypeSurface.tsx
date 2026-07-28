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
  const [introStage, setIntroStage] = useState(0)
  const [customizing, setCustomizing] = useState(false)
  const [transitioningToBriefing, setTransitioningToBriefing] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
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
  const activeQuestion = preparationTransition.question
  const activeQuestionIndex = activeQuestion
    ? LIVE_PREPARATION_QUESTIONS.findIndex(
        (question) => question.key === activeQuestion.key,
      )
    : LIVE_PREPARATION_QUESTIONS.length

  useEffect(() => {
    if (!selectedType) {
      setIntroStage(0)
      setCustomizing(false)
      setTransitioningToBriefing(false)
      setAnswers({})
      return
    }

    const structureTimer = window.setTimeout(() => setIntroStage(1), 220)
    const initializationTimer = window.setTimeout(() => setIntroStage(2), 1050)
    const customizePromptTimer = window.setTimeout(() => setIntroStage(3), 1550)
    const buttonTimer = window.setTimeout(() => setIntroStage(4), 1850)

    return () => {
      window.clearTimeout(structureTimer)
      window.clearTimeout(initializationTimer)
      window.clearTimeout(customizePromptTimer)
      window.clearTimeout(buttonTimer)
    }
  }, [selectedType])

  const structureText = useTypewriter(
    'The structure is ready.',
    introStage >= 1,
    34,
  )
  const initializationText = useTypewriter(
    selectedType?.initialization || '',
    introStage >= 2,
    18,
  )
  const customizeText = useTypewriter(
    'Would you like to customize it?',
    introStage >= 3,
    28,
  )
  const questionText = useTypewriter(
    activeQuestion?.question || '',
    customizing && Boolean(activeQuestion),
    24,
  )

  function resetSelection() {
    setSelectedType(null)
  }

  function beginCustomization() {
    const existingSignals = loadLivePreparationSignals()
    setAnswers(existingSignals)
    setTransitioningToBriefing(true)

    window.setTimeout(() => {
      setCustomizing(true)
      setTransitioningToBriefing(false)
    }, 420)
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
  }

  function continueToLiveFinalCheck() {
    if (!selectedType || !readiness.thresholdMet) return

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

    window.location.href =
      '/george/live-entry?source=homepage&stage=final-check'
  }

  return (
    <section className="relative border-t border-white/10 bg-black px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-[1700px]">
        <div className="max-w-5xl">
          <p className="inline-flex rounded-full border border-[#3657A8]/55 bg-[#172347] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F4F8FF]/88 shadow-[0_8px_26px_rgba(12,27,68,0.28)]">
            Conversation types
          </p>
          <h1 className="mt-4 font-mono text-[34px] font-black uppercase leading-[0.94] tracking-[-0.065em] sm:text-[54px]">
            What do you want GEORGE to help you do?
          </h1>
          <p className="mt-6 max-w-3xl text-[16px] leading-8 text-white/68">
            Choose the closest conversation type, or describe what you want to
            accomplish.
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
              {visibleTypes.length} conversation{' '}
              {visibleTypes.length === 1 ? 'type' : 'types'}
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
                  onSelect={setSelectedType}
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

      {selectedType && (
        <div className="relative z-10 border-t border-white/[0.08] bg-black px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto w-full max-w-5xl">
            <button
              type="button"
              onClick={resetSelection}
              className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/38 transition hover:text-white/78"
            >
              ← Choose another conversation type
            </button>

            <div className="rounded-[30px] border border-white/[0.1] bg-[#08090A] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.48)] sm:p-9">
              <div className="border-b border-white/[0.08] pb-7">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#AEB6FF]/56">
                  Conversation type
                </div>
                <h2 className="mt-3 font-mono text-[22px] font-semibold uppercase tracking-[-0.025em] text-white sm:text-[28px]">
                  {selectedType.title}
                </h2>
                {!customizing && (
                  <p className="mt-3 max-w-2xl text-[14px] leading-7 text-white/58">
                    {selectedType.description}
                  </p>
                )}
              </div>

              {!customizing ? (
                <div
                  className={`pt-7 transition-all duration-[420ms] ${transitioningToBriefing ? 'translate-y-[-6px] opacity-0' : 'translate-y-0 opacity-100'}`}
                >
                  <div className="min-h-[48px] font-mono text-[22px] leading-8 tracking-[-0.035em] text-white sm:text-[28px] sm:leading-10">
                    {structureText}
                  </div>
                  <p className="mt-4 min-h-[56px] max-w-3xl text-[15px] leading-7 text-white/66">
                    {initializationText}
                  </p>
                  <h3 className="mt-6 min-h-[28px] font-mono text-[15px] font-semibold tracking-[-0.02em] text-white">
                    {customizeText}
                  </h3>
                  <p
                    className={`mt-2 text-[13px] leading-6 text-white/48 transition-opacity duration-300 ${introStage >= 3 ? 'opacity-100' : 'opacity-0'}`}
                  >
                    GEORGE will continue the canonical LIVE briefing and preserve
                    any preparation signals already established.
                  </p>
                  <button
                    type="button"
                    onClick={beginCustomization}
                    className={`mt-5 rounded-full border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition duration-500 hover:border-[#AEB6FF]/75 hover:bg-[#203268] ${introStage >= 4 && !transitioningToBriefing ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}
                  >
                    Customize this conversation
                  </button>
                </div>
              ) : activeQuestion ? (
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
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/28">
                      {activeQuestionIndex + 1} of {LIVE_PREPARATION_QUESTIONS.length}
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      {readiness.thresholdMet && (
                        <button
                          type="button"
                          onClick={continueToLiveFinalCheck}
                          className="rounded-full border border-white/[0.14] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/72 transition hover:border-white/30 hover:text-white"
                        >
                          Continue with this briefing
                        </button>
                      )}
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
                </div>
              ) : (
                <div className="pt-7 animate-[fadeIn_420ms_ease-out]">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#AEB6FF]/56">
                    Briefing established
                  </div>
                  <h3 className="mt-3 font-mono text-[20px] leading-8 tracking-[-0.025em] text-white sm:text-[24px]">
                    GEORGE has the canonical preparation signals for your LIVE entry.
                  </h3>
                  <p className="mt-3 max-w-3xl text-[14px] leading-7 text-white/52">
                    Review the existing final check, add documents or context there,
                    then enter LIVE.
                  </p>
                  <button
                    type="button"
                    onClick={continueToLiveFinalCheck}
                    disabled={!readiness.thresholdMet}
                    className="mt-6 rounded-full border border-[#7EA1FF]/48 bg-[#172347] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:border-[#AEB6FF]/75 hover:bg-[#203268] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Continue to final check
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
