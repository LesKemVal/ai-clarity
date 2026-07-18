import type { LiveBriefingSupportPanelId } from '@/lib/george/capabilities/live-support-panels'

type AdaptiveSupportPanel = {
  id: LiveBriefingSupportPanelId
  label: string
  line: string
  detail: string
}

type LiveAdaptiveSupportPanelProps = {
  activePanel: AdaptiveSupportPanel
  open: boolean
  panels: readonly AdaptiveSupportPanel[]
  onToggle: () => void
  onSelect: (panelId: LiveBriefingSupportPanelId) => void
}

export function LiveAdaptiveSupportPanel({
  activePanel,
  open,
  panels,
  onToggle,
  onSelect,
}: LiveAdaptiveSupportPanelProps) {
  function selectPanel(panelId: LiveBriefingSupportPanelId) {
    onSelect(panelId)
    onToggle()
  }

  return (
    <div className="rounded-[0.82rem] border border-white/[0.08] bg-[#080A10]/[0.72] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[9px] uppercase tracking-[0.24em] text-white/34">
            GEORGE&apos;s support
          </div>

          <div className="mt-2 text-[14px] font-semibold text-[#F2F4FF]/88">
            {activePanel.label}
          </div>

          <div className="mt-1 text-[11px] leading-5 text-[#D7DBE4]/48">
            {activePanel.line}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 rounded-[0.65rem] border border-white/[0.08] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-white/46 transition hover:border-white/[0.16] hover:text-white/72"
        >
          {open ? 'Close' : 'Change'}
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-[cubic-bezier(0.22,0.72,0.18,1)] ${
          open
            ? 'mt-4 grid-rows-[1fr] opacity-100'
            : 'mt-0 grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="grid gap-2 sm:grid-cols-2">
            {panels.map((panel) => {
              const active = activePanel.id === panel.id

              return (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => selectPanel(panel.id)}
                  className={`rounded-[0.72rem] border px-3 py-3 text-left transition ${
                    active
                      ? 'border-[#4E7CFF]/35 bg-[#4E7CFF]/[0.075]'
                      : 'border-white/[0.06] bg-white/[0.018] hover:border-white/[0.14] hover:bg-white/[0.035]'
                  }`}
                >
                  <span className="block text-[11px] font-semibold text-[#F2F4FF]/82">
                    {panel.label}
                  </span>

                  <span className="mt-1 block text-[10px] leading-4 text-white/40">
                    {panel.line}
                  </span>

                  {active && (
                    <span className="mt-3 block border-l border-white/[0.14] pl-3 text-[11px] leading-5 text-[#D7DBE4]/54">
                      {panel.detail}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
