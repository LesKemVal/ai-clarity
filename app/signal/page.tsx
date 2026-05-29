'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchGeorgeSessionAuthority, readCachedGeorgeSessionAuthority } from '@/lib/george/session-authority'
import {
  getDefaultSignalRoom,
  getSignalMeaningsForRoom,
  SIGNAL_ROOMS,
  type SavedRoomSignal,
  type SignalRoom,
} from '@/lib/george/signal/room-signal-options'

type Tier = 'smart' | 'intelligent' | 'brilliant'

const ROOM_SIGNAL_STORAGE_KEY = 'GEORGE_ROOM_SIGNALS'

function readSavedRoomSignals(): SavedRoomSignal[] {
  if (typeof window === 'undefined') return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(ROOM_SIGNAL_STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSavedRoomSignals(signals: SavedRoomSignal[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ROOM_SIGNAL_STORAGE_KEY, JSON.stringify(signals.slice(0, 40)))
}

export default function SignalPage() {

  const [tier, setTier] = useState<Tier>('smart')
  const [ready, setReady] = useState(false)

  const [name, setName] = useState('')
  const [mission, setMission] = useState('')
  const [priority, setPriority] = useState('')
  const [learningStyle, setLearningStyle] = useState('')
  const [adaptiveAnswer, setAdaptiveAnswer] = useState('')
  const [adaptiveQuestion, setAdaptiveQuestion] = useState('')
  const [signalRoom, setSignalRoom] = useState<SignalRoom>(getDefaultSignalRoom())
  const [roomTriggers, setRoomTriggers] = useState<Record<string, string>>({})
  const [savedSignals, setSavedSignals] = useState<SavedRoomSignal[]>([])
  const [signalSaved, setSignalSaved] = useState(false)

  const roomMeanings = useMemo(() => getSignalMeaningsForRoom(signalRoom), [signalRoom])
  useEffect(() => {
    const cachedAuthority = readCachedGeorgeSessionAuthority()
    setTier(cachedAuthority.tier)

    fetchGeorgeSessionAuthority()
      .then((authority) => setTier(authority.tier))
      .catch(() => {})

    setName(localStorage.getItem('george_name') || '')
    setMission(localStorage.getItem('george_user_mission') || '')
    setPriority(localStorage.getItem('george_user_priority') || '')
    setLearningStyle(localStorage.getItem('george_user_learning_style') || '')
    setAdaptiveAnswer(localStorage.getItem('george_user_adaptive_answer') || '')
    setSavedSignals(readSavedRoomSignals())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    if (tier === 'smart') {
      window.location.replace('/top-up?intent=make-george-yours')
    }
  }, [ready, tier])

  const adaptivePrompt = useMemo(() => {
    const text = `${mission} ${priority}`.toLowerCase()

    if (!mission && !priority) {
      return 'What should GEORGE understand first — your main goal, current pressure, project, relationship, risk, or next decision?'
    }

    if (/business|startup|company|sell|sales|income|money|fund|revenue|project|product|launch|platform|app/.test(text)) {
      return 'What should GEORGE learn about this project first — the outcome, customer, revenue path, blocker, timeline, risk, or leverage point?'
    }

    if (/interview|job|career|hiring|resume|work/.test(text)) {
      return 'Should I help most with preparation, sharper wording, stronger positioning, follow-through, or negotiation?'
    }

    if (/conversation|meeting|negotiat|doctor|appointment|sales call|call|live|boss|manager/.test(text)) {
      return 'When pressure rises, should I prioritize exact lines, short cues, questions to ask, posture, or silence?'
    }

    if (/learn|study|test|exam|license|school|training|skill/.test(text)) {
      return 'Do you learn best through repetition, conversation, pressure, structure, visuals, examples, or direct execution?'
    }

    if (/credit|debt|bill|approval|car|house|loan/.test(text)) {
      return 'Should I help you protect approval odds, lower monthly pressure, clean up the profile, or avoid a bad deal?'
    }

    return 'What question would help GEORGE understand you better right now — how you decide, communicate, slow down, push forward, lose momentum, or define success?'
  }, [mission, priority])

  useEffect(() => {
    setAdaptiveQuestion(adaptivePrompt)
  }, [adaptivePrompt])

  const valid = useMemo(() => {
    return !!(name && mission && priority && learningStyle && adaptiveAnswer)
  }, [name, mission, priority, learningStyle, adaptiveAnswer])


  function saveRoomSignals() {
    const payload: SavedRoomSignal[] = roomMeanings
      .map((meaning) => ({
        id: `signal_${signalRoom}_${meaning.id}`,
        room: signalRoom,
        phrase: (roomTriggers[meaning.id] || '').trim(),
        meaningId: meaning.id,
        meaningLabel: meaning.label,
        createdAt: Date.now(),
      }))
      .filter((item) => item.phrase.length > 0)

    writeSavedRoomSignals(payload)

    setSavedSignals(payload)

    setSignalSaved(true)

    window.setTimeout(() => {
      setSignalSaved(false)
    }, 2800)
  }

  function save() {
    if (!valid) return

    localStorage.setItem('george_onboarded', 'true')
    localStorage.setItem('george_active', 'true')
    localStorage.setItem('george_name', name)
    localStorage.setItem('george_user_mission', mission)
    localStorage.setItem('george_user_priority', priority)
    localStorage.setItem('george_user_learning_style', learningStyle)
    localStorage.setItem('george_user_adaptive_question', adaptiveQuestion)
    localStorage.setItem('george_user_adaptive_answer', adaptiveAnswer)

    setName('')
    setMission('')
    setPriority('')
    setLearningStyle('')
    setAdaptiveAnswer('')

    window.location.href = '/george'
  }

  if (!ready) return null
  if (tier === 'smart') return null

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060A] px-6 py-10 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-260px] h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-[130px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/[0.05]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl space-y-4">
        <div className="flex items-center justify-between">
          <img
            src="/logofav.png"
            alt="BRANESx"
            className="h-14 w-14 rounded-[1rem] object-contain opacity-94"
          />

          <button
            onClick={() => (window.location.href = '/george')}
            className="text-xs uppercase tracking-[0.18em] text-white/38 transition hover:text-white/68"
          >
            Back
          </button>
        </div>

        <div className="space-y-5 rounded-[1.15rem] border border-white/[0.03] bg-black/22 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.24)] backdrop-blur-[18px] md:p-5">
          <div className="space-y-2 border-b border-white/[0.04] pb-5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/34">
              Add Signal
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
              Give GEORGE better signal.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-white/48 md:text-base">
              Connect your own words to GEORGE meanings. LIVE loads these signals so GEORGE can understand how you hand him the ball without forcing you to sound unnatural.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-3 rounded-[1rem] border border-white/[0.045] bg-black/20 p-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Room signal</p>
                <p className="mt-2 text-sm leading-6 text-white/48">
                  Choose the room first. GEORGE only shows signal meanings that belong in that context.
                </p>
              </div>

              <select
                value={signalRoom}
                onChange={(e) => {
                  const nextRoom = e.target.value as SignalRoom
                  setSignalRoom(nextRoom)
                  setRoomTriggers({})
                }}
                className="w-full rounded-[0.85rem] border border-white/[0.05] bg-[#080A0F] px-4 py-3 text-sm text-white outline-none"
              >
                {SIGNAL_ROOMS.map((room) => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>

              <div className="grid gap-2">
                {roomMeanings.map((meaning) => {
                  const active = false
                  return (
                    <button
                      key={meaning.id}
                      type="button"
                      onClick={() => {}}
                      className={`rounded-[0.9rem] border px-3.5 py-3 text-left transition ${
                        active
                          ? 'border-white/[0.16] bg-white/[0.075] text-white'
                          : 'border-white/[0.045] bg-white/[0.018] text-white/54 hover:border-white/[0.09] hover:text-white/78'
                      }`}
                    >
                      <span className="block text-[12px] font-medium tracking-[-0.01em]">{meaning.label}</span>
                      <span className="mt-1 block text-[11px] leading-4 text-white/36">{meaning.description}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-4 rounded-[1rem] border border-white/[0.045] bg-black/24 p-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Your words</p>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Use words you would actually say in the room. GEORGE maps the phrase to the meaning, then decides the best live behavior from room, objective, and signal.
                </p>
              </div>

              <div className="space-y-3">
                {roomMeanings.map((meaning) => (
                  <div
                    key={meaning.id}
                    className="rounded-[0.9rem] border border-white/[0.045] bg-white/[0.018] p-3"
                  >
                    <p className="text-sm text-white/80">
                      {meaning.label}
                    </p>

                    <p className="mt-1 text-[11px] text-white/38">
                      {meaning.description}
                    </p>

                    <input
                      value={roomTriggers[meaning.id] || ''}
                      onChange={(e) =>
                        setRoomTriggers((prev) => ({
                          ...prev,
                          [meaning.id]: e.target.value,
                        }))
                      }
                      placeholder="Enter a phrase you would naturally say..."
                      className="mt-3 w-full rounded-[0.8rem] border border-white/[0.05] bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/28"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={saveRoomSignals}
                disabled={false}
                className="w-full rounded-[0.9rem] bg-white px-5 py-3 text-sm font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7] disabled:opacity-40"
              >
                Load Signal
              </button>

              {signalSaved && (
                <div className="rounded-[0.9rem] border border-[#AEB6FF]/[0.16] bg-[#AEB6FF]/[0.055] px-3.5 py-3 text-sm text-[#DDE2FF]/78 shadow-[0_0_28px_rgba(174,182,255,0.08)]">
                  Signal loaded. Upload material to sharpen cues and repeatable responses.
                </div>
              )}

              <div className="space-y-2 border-t border-white/[0.045] pt-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Loaded signals</p>
                {savedSignals.length === 0 ? (
                  <p className="text-xs leading-5 text-white/34">No room signals loaded yet.</p>
                ) : (
                  <div className="grid gap-2">
                    {savedSignals.slice(0, 5).map((signal) => (
                      <div key={signal.id} className="rounded-[0.8rem] border border-white/[0.04] bg-black/20 px-3 py-2">
                        <p className="text-[11px] text-white/78">“{signal.phrase}”</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/30">{signal.room} · {signal.meaningLabel}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Current signal</p>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should I call you?"
                  className="rounded-[0.85rem] border border-white/[0.05] bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/28"
                />
                <input
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="What are we trying to build, fix, fund, or change?"
                  className="rounded-[0.85rem] border border-white/[0.05] bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/28"
                />
                <input
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  placeholder="What matters most right now?"
                  className="rounded-[0.85rem] border border-white/[0.05] bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/28"
                />

                <input
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  placeholder="How should I communicate or work with you?"
                  className="rounded-[0.85rem] border border-white/[0.05] bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/28"
                />
              </div>
            </div>

            <div className="rounded-[0.9rem] border border-white/[0.045] bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
                Connected Systems
              </p>
              <p className="mt-3 text-sm leading-6 text-white/48">
                GEORGE can later connect to calendars, repositories, files, email, documents, or other systems when continuity and real work require it.
              </p>
              <p className="mt-3 text-xs leading-5 text-white/38">
                Connections should remain selective, permissioned, and operationally useful.
              </p>
            </div>
          </div>

          <div className="rounded-[0.95rem] border border-white/[0.045] bg-black/24 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/42">
              GEORGE asks next
            </p>
            <p className="mt-2 text-sm leading-6 text-white/78">
              {adaptiveQuestion}
            </p>
            <textarea
              value={adaptiveAnswer}
              onChange={(e) => setAdaptiveAnswer(e.target.value)}
              rows={3}
              placeholder="Answer directly. GEORGE uses this to learn what matters and decide what question may help next."
              className="mt-3 w-full rounded-[0.85rem] border border-white/[0.05] bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={save}
              disabled={!valid}
              className="rounded-[0.9rem] bg-white px-6 py-3.5 text-sm font-semibold text-[#0B0D12] transition hover:bg-[#F3F5F7] disabled:opacity-40"
            >
              Add Signal
            </button>

            <p className="text-xs leading-5 text-white/32">
              You can return here whenever the project, pressure, goal, room, or working style changes.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
