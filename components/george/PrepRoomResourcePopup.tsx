'use client'

import { useEffect, useRef, useState } from 'react'
import type { PrepRoomResourceProfile } from '@/lib/george/prep-room/resources'

type Props = {
  open: boolean
  profile: PrepRoomResourceProfile | null
  room?: string
  relatedSessionTitle?: string | null
  chairs?: string[]
  desiredOutcome?: string
  knownContext?: string
  assistMode?: string
  signals?: string[]
  onClose: () => void
  onEnterLive?: () => void
  onEditResource?: <K extends keyof PrepRoomResourceProfile>(key: K, value: PrepRoomResourceProfile[K]) => void
}

function formatValue(value: string) {
  return value.replace(/_/g, ' ')
}

export function PrepRoomResourcePopup({ open, profile, room, relatedSessionTitle, chairs = [], desiredOutcome, knownContext, assistMode, signals = [], onClose, onEnterLive }: Props) {
  const [noticeAccepted, setNoticeAccepted] = useState(false)
  const [voiceBusy, setVoiceBusy] = useState(false)
  const introSpokenRef = useRef(false)

  const speakPrepRoom = async (text: string) => {
    const clean = text.trim()
    if (!clean) return

    try {
      setVoiceBusy(true)

      const res = await fetch('/api/george/live/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean }),
      })

      if (!res.ok) return

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)

      await new Promise<void>((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(url)
          resolve()
        }
        audio.onerror = () => {
          URL.revokeObjectURL(url)
          resolve()
        }
        audio.play().catch(() => resolve())
      })
    } finally {
      setVoiceBusy(false)
    }
  }

  const popupReady = open && Boolean(profile)

  const roomValue = room?.trim() || profile?.roomType || 'LIVE conversation'
  const relatedSessionValue = relatedSessionTitle?.trim() || ''
  const chairValue = chairs.length ? chairs.join(' + ') : 'Not specified'
  const desiredOutcomeValue = desiredOutcome?.trim() || 'Not specified'
  const knownContextValue = knownContext?.trim() || 'Not specified'
  const assistValue = assistMode?.trim() || formatValue(profile?.responseTexture || 'default')


  const normalizeForSpeech = (value: string) => {
    return value
      .replace(/\$1B\b/gi, 'one billion dollars')
      .replace(/\$990M\b/gi, 'nine hundred ninety million dollars')
      .replace(/\$([0-9]+)B\b/gi, '$1 billion dollars')
      .replace(/\$([0-9]+)M\b/gi, '$1 million dollars')
      .replace(/\bCEO\b/g, 'C E O')
      .replace(/\bCFO\b/g, 'C F O')
      .replace(/\bCOO\b/g, 'C O O')
      .replace(/\bCTO\b/g, 'C T O')
  }

  const humanizeRoomBriefing = () => {
    const chair = normalizeForSpeech(chairValue)
    const outcome = normalizeForSpeech(desiredOutcomeValue)
    const context = normalizeForSpeech(knownContextValue)

    const roomLower = `${roomValue} ${knownContextValue} ${assistValue}`.toLowerCase()
    const isMedical = /doctor|medical|clinic|hospital|physician|care|health/.test(roomLower)
    const isInvestor = /investor|capital|raise|fund|valuation|equity/.test(roomLower)
    const isInterview = /interview|candidate|hiring|job|recruiter/.test(roomLower)
    const isNegotiation = /negotiat|deal|offer|terms|price/.test(roomLower)

    if (isMedical) {
      return `You're here for clarity, and that's enough. We'll make sure the important questions get answered. The room is loaded. I'm right here with you. I'm listening.`
    }

    if (isInvestor) {
      const target = outcome !== 'Not specified' ? `We're aiming for ${outcome},` : `We're looking for commitment,`
      return `You're walking in as ${chair !== 'Not specified' ? chair : 'the lead'} today, and the investors are probably looking for reasons to believe. ${target} but the real work is getting them comfortable with the opportunity and the path. Remember, they may challenge assumptions before they challenge the opportunity. The room is loaded. I'm listening.`
    }

    if (isNegotiation) {
      const target = outcome !== 'Not specified' ? `We're moving toward ${outcome},` : `We're moving toward your target,`
      return `You're walking into a negotiation, and the other side may test conviction before they reveal their real position. ${target} but patience will give us information. Remember, the first number isn't always the real number. The room is loaded. I'm listening.`
    }

    if (isInterview) {
      return `You're walking into an interview, and they're trying to understand how you think as much as what you know. We're looking for a strong outcome, but the conversation matters too. Remember, they're evaluating judgment, not just answers. The room is loaded. I'm listening.`
    }

    if (context !== 'Not specified' || outcome !== 'Not specified') {
      return `The room is clear enough. ${context !== 'Not specified' ? `The situation is ${context}.` : ''} ${outcome !== 'Not specified' ? `We're moving toward ${outcome}.` : ''} Stay with the objective, and let the room tell us what matters. The room is loaded. I'm listening.`
    }

    return `The room is loaded. I'm listening.`
  }

  const buildRoomBriefing = () => {
    const lines = [humanizeRoomBriefing()]

    const firstDeviceBriefing =
      typeof window !== 'undefined' &&
      window.localStorage.getItem('george_live_first_room_controls_briefed_v1') !== '1'

    if (firstDeviceBriefing) {
      window.localStorage.setItem('george_live_first_room_controls_briefed_v1', '1')
      lines.push('Oh... use your steering phrases, language settings, or the top card whenever the room changes.')
    }

    return lines.join(' ')
  }

  useEffect(() => {
    if (!popupReady || introSpokenRef.current) return

    introSpokenRef.current = true
    speakPrepRoom("The room has taken shape. Now we turn words into movement. Review the notice, fasten your earbud, and I'll see you in the room.")
  }, [open, profile])

  const handleNoticeAccepted = async (accepted: boolean) => {
    setNoticeAccepted(accepted)
    if (accepted) {
      await speakPrepRoom('Good.')
    }
  }

  const handleStartLive = async () => {
    if (!noticeAccepted || voiceBusy) return
    await speakPrepRoom(buildRoomBriefing())
    onEnterLive?.()
  }

  if (!popupReady) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/52 px-3 py-4 backdrop-blur-[14px] transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]">
      <style jsx>{`
        @keyframes prepShimmer {
          0% { transform: translateX(-45%) rotate(12deg); opacity: 0; }
          20% { opacity: 0.7; }
          55% { opacity: 0.42; }
          100% { transform: translateX(215%) rotate(12deg); opacity: 0; }
        }

        @keyframes liveDeployPulse {
          0%, 100% { box-shadow: 0 12px 32px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.04); }
          22% { box-shadow: 0 0 0 1px rgba(143,182,255,0.26), 0 0 34px rgba(143,182,255,0.22), inset 0 1px 0 rgba(255,255,255,0.08); transform: scale(1.01); }
          50% { box-shadow: 0 12px 32px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.04); }
          76% { box-shadow: 0 0 0 1px rgba(143,182,255,0.30), 0 0 42px rgba(143,182,255,0.24), inset 0 1px 0 rgba(255,255,255,0.08); transform: scale(1.012); }
        }
      `}</style>

      <div className="relative flex max-h-[calc(100dvh-22px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[1rem] border border-white/[0.07] bg-[#05080D]/94 shadow-[0_22px_70px_rgba(0,0,0,0.52)] backdrop-blur-xl transition duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(143,182,255,0.105),transparent_36%)] opacity-80" />
        <div className="pointer-events-none absolute -inset-y-28 -left-1/2 w-[72%] animate-[prepShimmer_5.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#8FB6FF]/[0.075] to-transparent" />
        <div className="pointer-events-none absolute -inset-x-32 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="relative shrink-0 px-4 pb-3 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#8FB6C9]/52">LIVE Preview</p>
              <h2 className="mt-1.5 text-[22px] font-semibold tracking-[-0.045em] text-white">
                The room has taken shape.
              </h2>
            </div>
            <div className="rounded-full border border-[#8FB6C9]/[0.12] bg-[#8FB6C9]/[0.055] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#8FB6C9]/68">
              Signal ready
            </div>
          </div>

          <p className="mt-2 text-[12px] leading-5 text-white/50">
            Now we turn words into movement.
          </p>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <div className="rounded-[0.82rem] border border-[#8FB6C9]/[0.09] bg-black/18 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/24">Current understanding</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#8FB6C9]/42">review</p>
            </div>

            <div className="mt-2 grid gap-2 text-[12px] leading-5 text-white/56">
              {relatedSessionValue && (
                <p><span className="text-white/78">Relevant context:</span> {relatedSessionValue}</p>
              )}
              <p><span className="text-white/78">Your position:</span> {chairValue}</p>
              <p><span className="text-white/78">Objective:</span> {desiredOutcomeValue}</p>
              <p><span className="text-white/78">Situation:</span> {knownContextValue}</p>
            </div>
          </div>

        </div>

        <div className="relative shrink-0 border-t border-white/10 bg-[#05080D]/94 px-4 py-3">
          <label className="mb-3 flex gap-3 rounded-[0.82rem] border border-white/[0.055] bg-black/18 px-3 py-3 text-[12px] leading-5 text-white/46">
            <input
              type="checkbox"
              checked={noticeAccepted}
              onChange={(event) => handleNoticeAccepted(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[#8FB6C9]"
            />
            <span>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-white/30">LIVE Notice</span>
              GEORGE may misunderstand speech, miss context, provide imperfect guidance, or experience latency. GEORGE assists. You remain responsible for decisions and actions.
            </span>
          </label>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-1 py-1 text-[11px] uppercase tracking-[0.22em] text-white/30 transition duration-150 hover:text-white/62 active:text-white"
            >
              Edit
            </button>
            <div className="flex items-center gap-3">

              <button
                onClick={handleStartLive}
                disabled={!noticeAccepted || voiceBusy}
                className="rounded-[0.8rem] border border-[#8FB6C9]/[0.18] bg-[linear-gradient(180deg,rgba(18,28,38,0.92),rgba(5,8,13,0.98))] px-4 py-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[#D7DCFF]/82 shadow-[0_12px_32px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-150 hover:border-[#8FB6C9]/[0.32] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#8FB6C9]/[0.18] disabled:hover:text-[#D7DCFF]/82"
              >
                Start LIVE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
