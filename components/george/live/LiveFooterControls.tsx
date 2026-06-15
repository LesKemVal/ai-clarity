'use client'

import type { MouseEvent } from 'react'

type LiveFooterControlsProps = {
  language: string
  liveMode: boolean
  voiceOn: boolean
  tierLabel: string
  tierActionLabel: string
  motionHoverText: string
  motionPress: string
  onHelp: () => void
  onLanguage: (event: MouseEvent<HTMLButtonElement>) => void
  onExitOrTier: () => void
  onVoiceToggle: () => void
}

export function LiveFooterControls({
  language,
  liveMode,
  voiceOn,
  tierLabel,
  tierActionLabel,
  motionHoverText,
  motionPress,
  onHelp,
  onLanguage,
  onExitOrTier,
  onVoiceToggle,
}: LiveFooterControlsProps) {
  return (
    <div className="pointer-events-auto relative flex items-center justify-center gap-5 rounded-full border border-white/[0.08] bg-transparent px-5 py-1.5 shadow-none">
      <button
        type="button"
        onClick={onHelp}
        className={`px-1 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-[#D7DBE4]/36 ${motionHoverText} ${motionPress}`}
      >
        Help
      </button>

      <button
        type="button"
        onClick={onLanguage}
        className={`px-1 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-[#D7DBE4]/36 ${motionHoverText} ${motionPress}`}
      >
        {language}
      </button>

      <button
        type="button"
        onClick={onExitOrTier}
        className={`inline-flex items-center gap-1.5 px-1 py-1 text-[9px] font-medium uppercase tracking-[0.14em] ${liveMode ? 'text-red-100/58 hover:text-red-100/86' : 'text-[#D7DBE4]/36'} ${motionHoverText} ${motionPress}`}
        aria-label={liveMode ? 'Exit LIVE' : tierActionLabel}
        title={liveMode ? 'Exit LIVE' : tierActionLabel}
      >
        <span className={liveMode ? 'h-1.5 w-1.5 rounded-full bg-red-200/36 shadow-[0_0_10px_rgba(248,113,113,0.20)]' : 'h-1.5 w-1.5 rounded-full bg-white/24'} />
        {liveMode ? 'EXIT' : tierLabel}
      </button>

      {liveMode && (
        <button
          type="button"
          onClick={onVoiceToggle}
          className={`inline-flex items-center gap-1.5 px-1 py-1 text-[9px] font-medium uppercase tracking-[0.14em] ${voiceOn ? 'text-emerald-100/70 hover:text-emerald-100' : 'text-[#D7DBE4]/34 hover:text-[#D7DBE4]/72'} ${motionHoverText} ${motionPress}`}
          aria-label={voiceOn ? 'Turn audio off' : 'Turn audio on'}
          title={voiceOn ? 'Audio on' : 'Audio off'}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${voiceOn ? 'bg-emerald-200/60 shadow-[0_0_10px_rgba(110,231,183,0.24)]' : 'bg-white/22'}`} />
          {voiceOn ? 'MUTE' : 'UNMUTE'}
        </button>
      )}
    </div>
  )
}
