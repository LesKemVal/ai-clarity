const CUE_ROWS = [
  {
    direction: 'left',
    duration: '64s',
    top: '18%',
    cues: [
      'Facts first.',
      'Ask why.',
      'Listen for leverage.',
      'Anchor the frame.',
      'One point at a time.',
      'What changed?',
    ],
  },
  {
    direction: 'right',
    duration: '82s',
    top: '42%',
    cues: [
      'Silence is information.',
      'Clarify before defending.',
      'Name the real concern.',
      'Timing matters.',
      'Return to the objective.',
      'What are they not saying?',
    ],
  },
  {
    direction: 'left',
    duration: '106s',
    top: '68%',
    cues: [
      'Lead with evidence.',
      'Slow down.',
      'Make them feel heard.',
      'Protect the relationship.',
      'Do not rush the answer.',
      'Ask for the next step.',
    ],
  },
]

export function HomeHeroConversationTicker() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#000_0%,transparent_14%,transparent_86%,#000_100%)]" />

      {CUE_ROWS.map((row, rowIndex) => {
        const cues = [...row.cues, ...row.cues]

        return (
          <div
            key={rowIndex}
            className={`absolute left-0 flex w-max items-center gap-8 ${
              row.direction === 'left'
                ? 'animate-[georgeHeroTickerLeft_var(--ticker-duration)_linear_infinite]'
                : 'animate-[georgeHeroTickerRight_var(--ticker-duration)_linear_infinite]'
            }`}
            style={{
              top: row.top,
              ['--ticker-duration' as string]: row.duration,
            }}
          >
            {cues.map((cue, cueIndex) => (
              <div
                key={`${rowIndex}-${cueIndex}`}
                className="flex items-center gap-8 opacity-[0.055] sm:opacity-[0.04]"
              >
                <div className="relative whitespace-nowrap rounded-[14px] border border-white/30 bg-white/[0.025] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/68">
                  {cue}
                  <span className="absolute -bottom-[4px] left-5 h-2 w-2 rotate-45 border-b border-r border-white/20 bg-black" />
                </div>

                <span className="h-px w-14 border-t border-dashed border-white/25" />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
