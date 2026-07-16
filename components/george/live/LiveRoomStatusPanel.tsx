'use client'

import { useEffect, useState, type ReactNode } from 'react'

type LiveViewMode = 'controls' | 'reading'
type LiveOverlay = 'support' | 'reword' | null
type LiveSupportChoice = 'adaptive' | 'cue' | 'line' | 'response' | 'presentation'
type LiveRewordChoice =
  | 'simpler'
  | 'shorter'
  | 'stronger'
  | 'natural'
  | 'persuasive'
  | 'professional'
  | 'confident'
  | 'diplomatic'


type LiveRoomStatusPanelProps = {
  isListening: boolean
  liveRoomActive: boolean
  voiceOn: boolean
  isThinking: boolean
  roomLabel: string
  chairLabel: string
  objectiveLabel?: string
  steeringLabels: [string, string, string]
  receiverProfileLabel: string
  communicationStyle: string
  onRoomToggle: () => void
  onVoiceToggle: () => void
  onPauseLive?: () => void
  onReceiverPressed: () => void
  onCommunicationPressed: () => void
  onConversationPressed: () => void
  onRepeatPressed: () => boolean
  onSupportSelected: (choice: LiveSupportChoice) => void
  onRewordSelected: (choice: LiveRewordChoice) => void
}

type DockButtonProps = {
  label: string
  detail: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
  compact?: boolean
}

function ConversationIcon({ active }: { active: boolean }) {
  return (
    <span className="relative block h-14 w-16" aria-hidden="true">
      <span className="absolute bottom-1 right-0 h-10 w-11 rounded-[48%_48%_48%_38%] bg-[#D8E0E6] shadow-[inset_-5px_-7px_10px_rgba(77,91,103,0.20),0_8px_18px_rgba(0,0,0,0.28)]">
        <span className="absolute -bottom-1 right-1 h-4 w-4 rotate-[28deg] rounded-br-[80%] bg-[#D8E0E6]" />
        <span className="absolute left-3 top-4 flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8FA0AA]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#8FA0AA]" />
        </span>
      </span>

      <span
        className={`absolute left-0 top-0 h-12 w-13 rounded-[48%_48%_42%_48%] shadow-[inset_-7px_-9px_12px_rgba(0,63,94,0.22),0_10px_22px_rgba(0,0,0,0.30)] transition ${
          active ? 'bg-[#2EA7D7]' : 'bg-[#287FA5]'
        }`}
      >
        <span className="absolute -bottom-1 left-1 h-4 w-4 -rotate-[28deg] rounded-bl-[80%] bg-inherit" />
        <span className="absolute left-3.5 top-5 flex gap-1.5">
          {[0, 1, 2, 3].map((dot) => (
            <span
              key={dot}
              className="h-2 w-2 rounded-full bg-[#E7EDF1] shadow-[inset_-1px_-2px_2px_rgba(111,126,137,0.28),0_2px_4px_rgba(0,0,0,0.28)]"
            />
          ))}
        </span>
      </span>
    </span>
  )
}

function PersonIcon({ active }: { active: boolean }) {
  return (
    <span className="relative block h-14 w-14" aria-hidden="true">
      <span
        className={`absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 rounded-full shadow-[inset_-3px_-4px_6px_rgba(0,74,100,0.22),0_6px_12px_rgba(0,0,0,0.26)] ${
          active ? 'bg-[#2EA7D7]' : 'bg-[#287FA5]'
        }`}
      />
      <span
        className={`absolute bottom-0 left-1/2 h-9 w-11 -translate-x-1/2 rounded-[48%_48%_34%_34%] shadow-[inset_-5px_-7px_10px_rgba(0,74,100,0.22),0_8px_16px_rgba(0,0,0,0.28)] ${
          active ? 'bg-[#2EA7D7]' : 'bg-[#287FA5]'
        }`}
      />
      <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#35D1A3] shadow-[inset_-3px_-4px_6px_rgba(0,96,76,0.20),0_5px_10px_rgba(0,0,0,0.30)]">
        <span className="absolute h-3.5 w-1 rounded-full bg-white/90" />
        <span className="absolute h-1 w-3.5 rounded-full bg-white/90" />
      </span>
    </span>
  )
}

function LockIcon({ active }: { active: boolean }) {
  return (
    <span className="relative block h-14 w-14" aria-hidden="true">
      <span
        className={`absolute left-1/2 top-0 h-8 w-8 -translate-x-1/2 rounded-t-[1rem] border-[6px] ${
          active ? 'border-[#35D1A3]' : 'border-[#8FA0AA]'
        } border-b-0`}
      />
      <span
        className={`absolute bottom-0 left-1/2 h-10 w-12 -translate-x-1/2 rounded-[0.85rem] shadow-[inset_-5px_-7px_10px_rgba(0,68,96,0.24),0_8px_16px_rgba(0,0,0,0.28)] ${
          active ? 'bg-[#2EA7D7]' : 'bg-[#287FA5]'
        }`}
      >
        <span className="absolute left-1/2 top-3 h-4 w-2 -translate-x-1/2 rounded-full border-2 border-[#DDE7EC]">
          <span className="absolute left-1/2 top-2 h-3 w-1 -translate-x-1/2 rounded-b-full bg-[#DDE7EC]" />
        </span>
      </span>
    </span>
  )
}

function ReceiverIcon({ active }: { active: boolean }) {
  return (
    <span className="relative block h-14 w-14" aria-hidden="true">
      <span
        className={`absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 rounded-full shadow-[inset_-3px_-4px_6px_rgba(0,74,100,0.20),0_6px_12px_rgba(0,0,0,0.24)] ${
          active ? 'bg-[#35D1A3]' : 'bg-[#2EA7D7]'
        }`}
      />
      <span
        className={`absolute bottom-0 left-1/2 h-9 w-11 -translate-x-1/2 rounded-[48%_48%_34%_34%] shadow-[inset_-5px_-7px_10px_rgba(0,74,100,0.22),0_8px_16px_rgba(0,0,0,0.28)] ${
          active ? 'bg-[#35D1A3]' : 'bg-[#2EA7D7]'
        }`}
      />
      <span className="absolute inset-x-0 bottom-1 mx-auto h-7 w-7 rounded-full border-[3px] border-white/85">
        <span className="absolute left-1/2 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-white/85" />
        <span className="absolute bottom-1 left-1/2 h-2.5 w-4 -translate-x-1/2 rounded-t-full border-2 border-b-0 border-white/85" />
      </span>
    </span>
  )
}


function ReadingIcon({ reading }: { reading: boolean }) {
  return (
    <span className="relative block h-14 w-14" aria-hidden="true">
      <span
        className={`absolute inset-1 rounded-[1rem] shadow-[inset_-5px_-7px_10px_rgba(0,68,96,0.24),0_8px_16px_rgba(0,0,0,0.28)] ${
          reading ? 'bg-[#35D1A3]' : 'bg-[#287FA5]'
        }`}
      />
      <span className="absolute left-3 right-3 top-4 h-1.5 rounded-full bg-white/90" />
      <span className="absolute left-3 right-5 top-7 h-1.5 rounded-full bg-white/72" />
      <span className="absolute left-3 right-4 top-10 h-1.5 rounded-full bg-white/54" />
    </span>
  )
}


function RepeatIcon() {
  return (
    <span className="relative block h-14 w-14" aria-hidden="true">
      <span className="absolute inset-[7px] rounded-full border-[6px] border-[#2EA7D7] border-l-transparent shadow-[0_8px_18px_rgba(0,0,0,0.28)]" />
      <span className="absolute left-[2px] top-[11px] h-0 w-0 rotate-[-18deg] border-b-[9px] border-r-[13px] border-t-[9px] border-b-transparent border-r-[#2EA7D7] border-t-transparent" />
      <span className="absolute left-[21px] top-[17px] h-[20px] w-[5px] rounded-full bg-[#DDE7EC]" />
      <span className="absolute left-[31px] top-[13px] h-[28px] w-[5px] rounded-full bg-[#DDE7EC]" />
    </span>
  )
}


function SupportIcon() {
  return (
    <span className="relative block h-14 w-14" aria-hidden="true">
      <span className="absolute left-1 right-1 top-2 h-3 rounded-full bg-[#2EA7D7]" />
      <span className="absolute left-2 right-2 top-6 h-3 rounded-full bg-[#287FA5]" />
      <span className="absolute left-3 right-3 top-10 h-3 rounded-full bg-[#D8E0E6]" />
    </span>
  )
}

function RewordIcon() {
  return (
    <span className="relative block h-14 w-14" aria-hidden="true">
      <span className="absolute left-1 top-2 h-8 w-10 rounded-[0.9rem] bg-[#287FA5]" />
      <span className="absolute bottom-2 right-1 h-8 w-10 rounded-[0.9rem] bg-[#2EA7D7]" />
      <span className="absolute left-3 top-5 h-1.5 w-6 rounded-full bg-white/80" />
      <span className="absolute bottom-5 right-3 h-1.5 w-6 rounded-full bg-white/80" />
    </span>
  )
}

function LiveChoiceOverlay({
  title,
  detail,
  options,
  onSelect,
  onClose,
}: {
  title: string
  detail: string
  options: Array<{ value: string; label: string; helper?: string }>
  onSelect: (value: string) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[10030] flex items-center justify-center px-3 py-4 sm:px-5">
      <button
        type="button"
        aria-label="Close options"
        onClick={onClose}
        className="absolute inset-0 bg-black/58 backdrop-blur-[14px] transition-[opacity,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,0.72,0.18,1)]"
      />

      <div className="relative z-10 flex max-h-[calc(100dvh-32px)] w-full max-w-[620px] flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#070A10]/96 shadow-[0_30px_100px_rgba(0,0,0,0.68)]">
        <div className="shrink-0 border-b border-white/[0.055] px-5 pb-4 pt-5 text-left">
          <div className="text-[17px] font-semibold leading-6 text-white/88 sm:text-[19px]">
            {title}
          </div>
          <p className="mt-2 max-w-[500px] text-[13px] leading-5 text-white/42">
            {detail}
          </p>
        </div>

        <div className="min-h-0 overflow-y-auto p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2.5">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className="flex min-h-[92px] flex-col justify-center rounded-[1.25rem] border border-white/[0.07] bg-white/[0.02] px-3.5 py-3 text-left transition-[transform,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,0.72,0.18,1)] hover:border-[#2EA7D7]/28 hover:bg-[#2EA7D7]/[0.055] active:scale-[0.985] sm:min-h-[98px] sm:px-4"
              >
                <div className="whitespace-normal text-[14px] font-semibold leading-5 text-white/88 sm:text-[15px]">
                  {option.label}
                </div>
                {option.helper && (
                  <div className="mt-1.5 whitespace-normal text-[11px] leading-4 text-white/38 sm:text-xs sm:leading-5">
                    {option.helper}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-white/[0.05] p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-[1rem] border border-white/[0.06] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/44 transition-[background-color,transform] duration-300 hover:bg-white/[0.035] active:scale-[0.99]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function DockButton({
  label,
  detail,
  active = false,
  disabled = false,
  onClick,
  children,
  compact = false,
}: DockButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${label}: ${detail}`}
      title={`${label}: ${detail}`}
      className={`group flex min-w-0 w-full flex-col items-center text-center transition-[transform,background-color,opacity] duration-300 ease-[cubic-bezier(0.22,0.72,0.18,1)] hover:bg-white/[0.035] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
        compact
          ? 'gap-0 rounded-[0.95rem] px-1 py-1.5'
          : 'gap-0 rounded-[1.1rem] px-1.5 py-2.5 md:rounded-[1.4rem] md:px-2 md:py-3'
      }`}
    >
      <span
        className={`flex items-center justify-center border shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_12px_30px_rgba(0,0,0,0.28)] transition-[width,height,border-radius,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,0.72,0.18,1)] ${
          compact
            ? 'h-[44px] w-[44px] rounded-[0.9rem] md:h-[52px] md:w-[52px] md:rounded-[1rem]'
            : 'h-[58px] w-[58px] rounded-[1rem] md:h-[76px] md:w-[76px] md:rounded-[1.35rem]'
        } ${
          active
            ? 'border-[#35D1A3]/22 bg-[#35D1A3]/[0.055]'
            : 'border-white/[0.06] bg-white/[0.018] group-hover:border-[#2EA7D7]/20 group-hover:bg-[#2EA7D7]/[0.045]'
        }`}
      >
        {children}
      </span>
      <span className="mt-4 max-w-full truncate text-[8px] font-semibold uppercase leading-none tracking-[0.15em] text-white/64 md:mt-5 md:text-[9px] md:tracking-[0.17em]">
        {label}
      </span>
      <span className={`${compact ? 'hidden md:block' : 'hidden sm:block'} max-w-full truncate text-[10px] text-white/36`}>
        {detail}
      </span>
    </button>
  )
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
  receiverProfileLabel,
  communicationStyle,
  onRoomToggle,
  onVoiceToggle,
  onPauseLive,
  onReceiverPressed,
  onCommunicationPressed,
  onConversationPressed,
  onRepeatPressed,
  onSupportSelected,
  onRewordSelected,
}: LiveRoomStatusPanelProps) {
  const [viewMode, setViewMode] = useState<LiveViewMode>('controls')
  const [overlay, setOverlay] = useState<LiveOverlay>(null)
  const [surfaceNotice, setSurfaceNotice] = useState(
    'Controls expanded. Critical support will appear below when needed.'
  )

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('GEORGE_LIVE_VIEW_MODE')

      if (stored === 'controls' || stored === 'reading') {
        setViewMode(stored)
        setSurfaceNotice(
          stored === 'reading'
            ? 'Reading space expanded. Visual support will use the available screen.'
            : 'Controls expanded. Critical support will appear below when needed.'
        )
      }
    } catch {}
  }, [])

  const toggleViewMode = () => {
    const nextMode: LiveViewMode =
      viewMode === 'controls' ? 'reading' : 'controls'

    setViewMode(nextMode)
    setSurfaceNotice(
      nextMode === 'reading'
        ? 'Reading space expanded. Visual support will use the available screen.'
        : 'Controls expanded. Critical support will appear below when needed.'
    )

    try {
      window.localStorage.setItem('GEORGE_LIVE_VIEW_MODE', nextMode)
    } catch {}
  }

  const safeRoomLabel = String(roomLabel || 'LIVE conversation').trim()
  const safeChairLabel = String(chairLabel || 'User').trim()
  const safeObjective = String(objectiveLabel || '').trim()
  const roomSummary = [safeRoomLabel, safeChairLabel].filter(Boolean).join(' · ')
  const signalSummary = steeringLabels.filter(Boolean).join(' · ')

  const handlePause = () => {
    if (onPauseLive) {
      onPauseLive()
      return
    }

    onRoomToggle()
  }

  return (
    <section className="pointer-events-auto w-full" aria-label="LIVE conversation controls">
      <div className="mb-3 flex min-h-[42px] items-center justify-between gap-4 px-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full transition-[background-color,box-shadow,opacity] duration-500 ${
                isThinking
                  ? 'bg-[#2EA7D7]/72 shadow-[0_0_12px_rgba(46,167,215,0.32)]'
                  : isListening
                    ? 'bg-[#35D1A3] shadow-[0_0_16px_rgba(53,209,163,0.68)]'
                    : 'bg-white/18 shadow-none'
              }`}
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/62">
              {isThinking
                ? 'GEORGE is working'
                : isListening
                  ? 'GEORGE is listening'
                  : liveRoomActive
                    ? 'GEORGE is paused'
                    : 'LIVE is paused'}
            </span>
          </div>

          <p className="mt-1 truncate text-[11px] text-white/34">
            {roomSummary}
            {safeObjective ? ` · ${safeObjective}` : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={onVoiceToggle}
          className={`shrink-0 rounded-full border px-2.25 py-1.25 font-semibold uppercase transition-[transform,border-color,background-color,opacity] duration-400 active:scale-[0.97] ${
            voiceOn
              ? 'border-[#2EA7D7]/70 bg-[#2EA7D7]/[0.12]'
              : 'border-[#2EA7D7]/22 bg-[#2EA7D7]/[0.04]'
          }`}
          aria-label={voiceOn ? 'Turn audio off' : 'Turn audio on'}
        >
          <span className="text-[11px] font-semibold tracking-[0.14em] text-white">
            AUDIO
          </span>
          <span
            className={`ml-1 text-[7px] tracking-[0.12em] ${
              voiceOn ? 'text-white/82' : 'text-white/56'
            }`}
          >
            {voiceOn ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      <div className="rounded-[1.75rem] border border-white/[0.055] bg-[#05070B]/88 p-2 shadow-[0_22px_70px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-xl">
        <div
          className={`grid gap-2 ${
            viewMode === 'reading'
              ? 'grid-cols-4 sm:grid-cols-5'
              : 'grid-cols-2'
          }`}
        >
          <DockButton
            compact={viewMode === 'reading'}
            label="Conversation"
            detail={isListening ? 'Listening' : 'Support'}
            active={isListening}
            disabled={isThinking}
            onClick={onConversationPressed}
          >
            <ConversationIcon active={isListening} />
          </DockButton>

          <DockButton
            compact={viewMode === 'reading'}
            label={viewMode === 'controls' ? 'Reading' : 'Controls'}
            detail={
              viewMode === 'controls'
                ? 'Visual support'
                : 'Touch controls'
            }
            active={viewMode === 'reading'}
            disabled={isThinking}
            onClick={toggleViewMode}
          >
            <ReadingIcon reading={viewMode === 'reading'} />
          </DockButton>

          <DockButton
            compact={viewMode === 'reading'}
            label="Repeat"
            detail="Last line"
            disabled={isThinking}
            onClick={() => {
              const repeated = onRepeatPressed()
              setSurfaceNotice(
                repeated
                  ? 'Last support repeated.'
                  : 'No previous support is available to repeat.'
              )
            }}
          >
            <RepeatIcon />
          </DockButton>


          <DockButton
            compact={viewMode === 'reading'}
            label="Support"
            detail="Choose style"
            disabled={isThinking}
            onClick={() => setOverlay('support')}
          >
            <SupportIcon />
          </DockButton>

          <DockButton
            compact={viewMode === 'reading'}
            label="Reword"
            detail={communicationStyle || 'Natural'}
            disabled={isThinking}
            onClick={() => setOverlay('reword')}
          >
            <RewordIcon />
          </DockButton>

          <DockButton
            compact={viewMode === 'reading'}
            label="Room"
            detail={communicationStyle || 'Context'}
            active={liveRoomActive}
            disabled={isThinking}
            onClick={onCommunicationPressed}
          >
            <PersonIcon active={liveRoomActive} />
          </DockButton>

          <DockButton
            compact={viewMode === 'reading'}
            label={isListening ? 'Pause' : 'Resume'}
            detail={isListening ? 'Suspend' : 'Continue'}
            active={!isListening}
            disabled={isThinking}
            onClick={handlePause}
          >
            <LockIcon active={!liveRoomActive} />
          </DockButton>

          <DockButton
            compact={viewMode === 'reading'}
            label="Receiver"
            detail={receiverProfileLabel || 'Visual'}
            active={liveRoomActive}
            disabled={isThinking}
            onClick={onReceiverPressed}
          >
            <ReceiverIcon active={liveRoomActive} />
          </DockButton>
        </div>

        {(signalSummary || !liveRoomActive) && viewMode === 'controls' && (
          <div className="border-t border-white/[0.045] px-4 py-2.5 text-center text-[10px] leading-4 text-white/30">
            {liveRoomActive ? signalSummary : 'Support is suspended. Resume when you are ready.'}
          </div>
        )}
      </div>

      <div
        className={`mt-3 overflow-y-auto rounded-[1.35rem] border border-white/[0.05] bg-white/[0.018] px-5 py-4 transition-[min-height,max-height] duration-500 ease-[cubic-bezier(0.22,0.72,0.18,1)] ${
          viewMode === 'reading'
            ? 'min-h-[190px] max-h-[calc(100dvh-300px)]'
            : 'min-h-[150px] max-h-[240px]'
        }`}
        aria-live="polite"
      >
        <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/32">
          GEORGE
        </div>
        <p
          className={`mt-2 text-white/72 ${
            viewMode === 'reading'
              ? 'max-w-[760px] text-[clamp(18px,3vw,32px)] font-medium leading-[1.38]'
              : 'max-w-[920px] text-[15px] leading-6'
          }`}
        >
          {surfaceNotice}
        </p>
      </div>

      {overlay === 'support' && (
        <LiveChoiceOverlay
          title="Choose GEORGE\'s support"
          detail="Select how you want GEORGE to begin supporting you."
          options={[
            { value: 'adaptive', label: 'Adaptive', helper: 'GEORGE chooses the useful support depth.' },
            { value: 'cue', label: 'Cue', helper: 'Brief signals at the right moment.' },
            { value: 'line', label: 'Line', helper: 'Exact speakable wording.' },
            { value: 'response', label: 'Response', helper: 'A complete answer.' },
            { value: 'presentation', label: 'Presentation', helper: 'Longer structured support.' },
          ]}
          onSelect={(value) => {
            const choice = value as LiveSupportChoice
            onSupportSelected(choice)
            setSurfaceNotice(
              choice === 'adaptive'
                ? 'Support: Adaptive. I’ll choose the useful support depth.'
                : `Support: ${choice.charAt(0).toUpperCase() + choice.slice(1)}. I’ll keep using it until you change it.`
            )
            setOverlay(null)
          }}
          onClose={() => setOverlay(null)}
        />
      )}

      {overlay === 'reword' && (
        <LiveChoiceOverlay
          title="Reword"
          detail="Reword the current support and keep future support consistent."
          options={[
            { value: 'simpler', label: 'Simpler' },
            { value: 'shorter', label: 'Shorter' },
            { value: 'stronger', label: 'Stronger' },
            { value: 'natural', label: 'More natural' },
            { value: 'persuasive', label: 'More persuasive' },
            { value: 'professional', label: 'More professional' },
            { value: 'confident', label: 'More confident' },
            { value: 'diplomatic', label: 'More diplomatic' },
          ]}
          onSelect={(value) => {
            const choice = value as LiveRewordChoice
            onRewordSelected(choice)
            const label =
              choice === 'natural'
                ? 'Natural'
                : choice.charAt(0).toUpperCase() + choice.slice(1)
            setSurfaceNotice(
              `Communication: ${label}. I’ll reword the current support and keep future support consistent.`
            )
            setOverlay(null)
          }}
          onClose={() => setOverlay(null)}
        />
      )}
    </section>
  )
}
