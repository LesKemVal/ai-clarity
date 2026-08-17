type LiveSpeakingStylePanelProps = {
  confirmed: boolean
  open: boolean
  selectedStyle: string
  onEdit: () => void
  onOpen: () => void
  onSelect: (style: string) => void
}

const SPEAKING_STYLE_OPTIONS = [
  ['Adaptive', 'Recommended'],
  ['Executive', 'Concise and composed'],
  ['Conversational', 'Natural and direct'],
] as const

export function LiveSpeakingStylePanel({
  confirmed,
  open,
  selectedStyle,
  onEdit,
  onOpen,
  onSelect,
}: LiveSpeakingStylePanelProps) {
  return (
    <div className="border-l border-white/[0.08] pl-4">
      {confirmed ? (
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[9px] uppercase tracking-[0.24em] text-[#D7DCFF]/46">
              Speaking Style selected
            </div>

            <div className="mt-2 text-[14px] font-semibold text-[#F2F4FF]/88">
              {selectedStyle}
            </div>

            <div className="mt-1 text-[11px] leading-5 text-[#D7DBE4]/50">
              I’ll shape support around this speaking style during LIVE.
            </div>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-[0.65rem] border border-[#4E7CFF]/24 bg-[#4E7CFF]/[0.08] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-[#D7DCFF]/66 transition hover:border-[#4E7CFF]/38 hover:bg-[#4E7CFF]/[0.14] hover:text-white"
          >
            Edit
          </button>
        </div>
      ) : open ? (
        <>
          <div className="text-[9px] uppercase tracking-[0.24em] text-[#D7DCFF]/48">
            Communication
          </div>

          <p className="mt-2 text-[13px] leading-5 text-[#D7DBE4]/64">
            Choose the speaking style that feels most natural to you.
          </p>

          <div className="mt-5 space-y-2">
            {SPEAKING_STYLE_OPTIONS.map(([label, helper]) => {
              const active = selectedStyle === label

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onSelect(label)}
                  className={`block w-full border-l px-4 py-2.5 text-left transition ${
                    active
                      ? 'border-[#7EA1FF]/70 bg-[#4E7CFF]/[0.045]'
                      : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.018]'
                  }`}
                >
                  <span className="block text-[11px] font-semibold text-[#F2F4FF]/78">
                    {label}
                  </span>

                  <span className="mt-1 block text-[10px] leading-4 text-white/36">
                    {helper}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="w-full rounded-[0.72rem] border border-[#4E7CFF]/18 bg-[#4E7CFF]/[0.05] px-3 py-2.5 text-left text-[11px] font-semibold text-[#D7DCFF]/72 transition hover:border-[#4E7CFF]/34 hover:bg-[#4E7CFF]/[0.09]"
        >
          Choose Speaking Style
        </button>
      )}
    </div>
  )
}
