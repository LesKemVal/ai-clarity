'use client'

import { useEffect, useRef, useState } from 'react'

type LiveRoomStatusPanelProps = {
  isListening: boolean
  liveRoomActive: boolean
  voiceOn: boolean
  isThinking: boolean
  roomLabel: string
  chairLabel: string
  objectiveLabel: string
  steeringLabels: [string, string, string]
  activeSupportLabel: string
  communicationStyle: string
  onRoomToggle: () => void
  onVoiceToggle: () => void
  onPauseLive: () => void
  onSupportPressed: () => void
  onCommunicationPressed: () => void
  onConversationPressed: () => void
}

function TypewriterLabel({ value }: { value: string }) {
  const previousValueRef = useRef(value)
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (previousValueRef.current === value) return

    let frame = 0
    const next = String(value || '').trim() || 'Cue'
    const eraseFrom = previousValueRef.current
    const eraseFrames = Math.min(eraseFrom.length, 5)
    const writeFrames = next.length
    const totalFrames = eraseFrames + 1 + writeFrames

    const timer = window.setInterval(() => {
      frame += 1

      if (frame <= eraseFrames) {
        setDisplayValue(eraseFrom.slice(0, Math.max(0, eraseFrom.length - frame)))
        return
      }

      if (frame === eraseFrames + 1) {
        setDisplayValue('')
        return
      }

      const writeIndex = frame - eraseFrames - 1
      setDisplayValue(next.slice(0, writeIndex))

      if (frame >= totalFrames) {
        window.clearInterval(timer)
        previousValueRef.current = next
        setDisplayValue(next)
      }
    }, 24)

    return () => window.clearInterval(timer)
  }, [value])

  return <span>{displayValue || ' '}</span>
}


export function LiveRoomStatusPanel({
  isListening,
  liveRoomActive,
  voiceOn,
  isThinking,
  roomLabel,
  chairLabel,
  objectiveLabel,
  steeringLabels,
  activeSupportLabel,
  communicationStyle,
  onRoomToggle,
  onVoiceToggle,
  onPauseLive,
  onSupportPressed,
  onCommunicationPressed,
  onConversationPressed,
}: LiveRoomStatusPanelProps) {
  return (
    <div className={`pointer-events-auto w-full max-w-[430px] md:max-w-[520px] md:max-w-[780px] xl:max-w-[980px] md:max-w-[720px] xl:max-w-[860px] md:max-w-[720px] xl:max-w-[860px] rounded-[1.15rem] border px-4 py-3 transition duration-300 ${liveRoomActive ? 'border-white/[0.055] bg-[#05070B]/82 shadow-[0_22px_80px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,0.035)]' : 'border-white/[0.035] bg-[#05070B]/58 opacity-72 shadow-[0_14px_48px_rgba(0,0,0,0.32)]'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isListening ? 'bg-[#8FF0C7] shadow-[0_0_14px_rgba(143,240,199,0.65)]' : 'bg-[#D7DBE4]/22'}`} />
          <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#D7DBE4]/58">
            {isListening ? 'GEORGE IS LISTENING' : 'GEORGE READY'}
          </span>
        </div>

        <span className="text-[9px] uppercase tracking-[0.18em] text-[#D7DBE4]/26">
          {liveRoomActive ? 'ROOM ACTIVE' : 'ROOM INACTIVE'}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[9px] md:text-[10px] leading-4">
        <div className={`rounded-[0.8rem] border px-3 py-2 ${isListening ? 'border-[#8FF0C7]/[0.18] bg-[#8FF0C7]/[0.07] text-[#8FF0C7]' : 'border-white/[0.045] bg-white/[0.018] text-[#D7DBE4]/42'}`}>
          <span className="block uppercase tracking-[0.16em] text-[#BFD9FF]/34">GEORGE</span>
          {isThinking ? 'THINKING' : isListening ? 'LISTENING' : 'READY'}
        </div>
        <button
          type="button"
          onClick={onRoomToggle}
          disabled={isThinking}
          className={`rounded-[0.8rem] border px-3 py-2 text-left transition active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-40 ${liveRoomActive ? 'border-[#8FF0C7]/[0.18] bg-[#8FF0C7]/[0.055] text-[#DCEBFF]/72' : 'border-white/[0.045] bg-white/[0.018] text-[#D7DBE4]/42 hover:border-[#8FF0C7]/[0.18] hover:bg-[#8FF0C7]/[0.045]'}`}
        >
          <span className="block uppercase tracking-[0.16em] text-[#BFD9FF]/34">LIVE</span>
          <span className="mt-1 flex items-center justify-between gap-2">
            <span>{liveRoomActive ? 'ON' : 'OFF'}</span>
            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${liveRoomActive ? 'border-[#8FF0C7]/24 bg-[#8FF0C7]/18 text-[#8FF0C7]' : 'border-white/[0.08] bg-white/[0.025] text-white/34'}`}>
              {liveRoomActive ? '●' : '○'}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={onVoiceToggle}
          className={`rounded-[0.8rem] border px-3 py-2 text-left transition active:scale-[0.985] ${voiceOn ? 'border-emerald-200/[0.16] bg-emerald-200/[0.055] text-emerald-100/72' : 'border-white/[0.045] bg-white/[0.018] text-[#D7DBE4]/42 hover:border-emerald-200/[0.16] hover:bg-emerald-200/[0.045]'}`}
        >
          <span className="block uppercase tracking-[0.16em] text-[#BFD9FF]/34">AUDIO</span>
          <span className="mt-1 flex items-center justify-between gap-2">
            <span>{voiceOn ? 'ON' : 'OFF'}</span>
            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${voiceOn ? 'border-emerald-200/24 bg-emerald-200/18 text-emerald-100' : 'border-white/[0.08] bg-white/[0.025] text-white/34'}`}>
              {voiceOn ? '●' : '○'}
            </span>
          </span>
        </button>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-[9px] md:text-[10px] leading-4">
        <button
          type="button"
          onPointerDown={(event) => {
            event.stopPropagation()
          }}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (isThinking) return
            onSupportPressed()
          }}
          disabled={isThinking}
          className={`rounded-[0.95rem] border px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition duration-150 active:scale-[0.985] active:border-[#8FF0C7]/[0.28] active:bg-[#8FF0C7]/[0.105] hover:border-[#8FF0C7]/[0.22] hover:bg-[#8FF0C7]/[0.085] disabled:cursor-not-allowed disabled:opacity-40 ${liveRoomActive ? 'border-[#8FF0C7]/[0.20] bg-[#8FF0C7]/[0.075] text-[#DCEBFF]/72 shadow-[0_0_26px_rgba(143,240,199,0.055),inset_0_1px_0_rgba(255,255,255,0.035)]' : 'border-[#8FB6C9]/[0.10] bg-[#8FB6C9]/[0.026] text-[#DCEBFF]/36'}`}
        >
          <span className="block uppercase tracking-[0.16em] text-[#BFD9FF]/34">Guidance</span>
          <span className="mt-1 flex items-center justify-between gap-2">
            <TypewriterLabel value={activeSupportLabel} />
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-[12px] transition ${liveRoomActive ? 'border-[#8FF0C7]/24 bg-[#8FF0C7]/18 text-[#8FF0C7]' : 'border-white/[0.06] bg-white/[0.025] text-white/30'}`}>
              {liveRoomActive ? '◉' : '○'}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onCommunicationPressed}
          className={`rounded-[0.95rem] border px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition duration-300 ${liveRoomActive ? 'border-[#8FB6C9]/[0.20] bg-[#8FB6C9]/[0.075] text-[#DCEBFF]/68' : 'border-[#8FB6C9]/[0.12] bg-[#8FB6C9]/[0.045] text-[#DCEBFF]/46'}`}
        >
          <span className="block uppercase tracking-[0.16em] text-[#BFD9FF]/34">Communication</span>
          {communicationStyle}
        </button>

        <button
          type="button"
          onClick={onConversationPressed}
          className="rounded-[0.72rem] border border-[#8FB6C9]/[0.12] bg-[#8FB6C9]/[0.045] px-2 py-1.5 text-left text-[#DCEBFF]/52 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition duration-300 hover:border-[#8FB6C9]/[0.18] hover:bg-[#8FB6C9]/[0.07]"
        >
          <span className="block uppercase tracking-[0.16em] text-[#BFD9FF]/34">Conversation</span>
          After LIVE
        </button>
      </div>

      <div className={`mt-2 border-t pt-2 text-[10px] md:text-[11px] leading-4 transition duration-500 ${liveRoomActive ? 'border-[#8FB6C9]/[0.08] text-[#DCEBFF]/52' : 'border-white/[0.035] text-[#D7DBE4]/42'}`}>
        <span className={`block ${liveRoomActive ? 'text-[#DCEBFF]/68' : 'text-[#D7DBE4]/56'}`}>
          {liveRoomActive ? (isListening ? 'Listening for the next useful signal.' : 'LIVE is on. GEORGE is standing by.') : 'LIVE is off.'}
        </span>
        {!liveRoomActive && (
          <span>Talk naturally. I'll adapt.</span>
        )}
      </div>
    </div>
  )
}
