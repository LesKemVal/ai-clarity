'use client'

import type { MouseEvent } from 'react'

type LiveFooterControlsProps = {
  language: string
  liveMode: boolean
  voiceOn?: boolean
  tierLabel: string
  tierActionLabel: string
  motionHoverText: string
  motionPress: string
  onHelp: () => void
  onLanguage: (event: MouseEvent<HTMLButtonElement>) => void
  onExitOrTier: () => void
  onVoiceToggle?: () => void
}

export function LiveFooterControls({
  language,
  liveMode,
  tierLabel,
  tierActionLabel,
  motionHoverText,
  motionPress,
  onHelp,
  onLanguage,
  onExitOrTier,
}: LiveFooterControlsProps) {
  return (
    <div className="pointer-events-auto relative flex items-center justify-center gap-5 rounded-full border border-[var(--border-default)] bg-transparent px-5 py-1.5 shadow-none">
      <button
        type="button"
        onClick={onHelp}
        className={`px-1 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-[color:var(--steel-300)]/36 ${motionHoverText} ${motionPress}`}
      >
        Help
      </button>

      <button
        type="button"
        onClick={onLanguage}
        className={`px-1 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-[color:var(--steel-300)]/36 ${motionHoverText} ${motionPress}`}
      >
        {language}
      </button>

      <button
        type="button"
        onClick={onExitOrTier}
        className={`inline-flex items-center gap-1.5 px-1 py-1 text-[9px] font-medium uppercase tracking-[0.14em] ${liveMode ? 'text-red-100/58 hover:text-red-100/86' : 'text-[color:var(--steel-300)]/36'} ${motionHoverText} ${motionPress}`}
        aria-label={liveMode ? 'Exit LIVE' : tierActionLabel}
        title={liveMode ? 'Exit LIVE' : tierActionLabel}
      >
        <span className={liveMode ? 'h-1.5 w-1.5 rounded-full bg-red-200/36 shadow-[0_0_10px_rgba(248,113,113,0.20)]' : 'h-1.5 w-1.5 rounded-full bg-[color:var(--steel-300)]/24'} />
        {liveMode ? 'EXIT' : tierLabel}
      </button>
    </div>
  )
}
