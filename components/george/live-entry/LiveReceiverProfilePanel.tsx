import type { LiveReceiverProfilePanelId } from '@/lib/george/capabilities/live-support-panels'

type ReceiverProfilePanel = {
  id: LiveReceiverProfilePanelId
  label: string
  line: string
  detail: string
}

type LiveReceiverProfilePanelProps = {
  activePanel: ReceiverProfilePanel
  open: boolean
  panels: readonly ReceiverProfilePanel[]
  onToggle: () => void
  onSelect: (profile: LiveReceiverProfilePanelId) => void
}

function DeliveryProfileBetaBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-[#7EA1FF]/45 bg-[#4E7CFF] px-2 py-[1px] text-[8px] font-bold uppercase tracking-[0.16em] text-white">
      BETA
    </span>
  )
}

function supportsVisualDelivery(profile: LiveReceiverProfilePanelId) {
  return profile === 'visual_only' || profile === 'audio_visual'
}

export function LiveReceiverProfilePanel({
  activePanel,
  open,
  panels,
  onToggle,
  onSelect,
}: LiveReceiverProfilePanelProps) {
  function selectProfile(profile: LiveReceiverProfilePanelId) {
    onSelect(profile)
    onToggle()
  }

  return (
    <div className="border-l border-white/[0.08] pl-4">
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="text-[9px] uppercase tracking-[0.24em] text-white/34">
            Delivery Profile
          </div>

          <div className="mt-2 flex items-center gap-2 text-[14px] font-semibold text-[#F2F4FF]/88">
            <span>{activePanel.label}</span>
            {supportsVisualDelivery(activePanel.id) && <DeliveryProfileBetaBadge />}
          </div>

          <div className="mt-1 max-w-[560px] text-[11px] leading-5 text-[#D7DBE4]/46">
            Choose how GEORGE delivers support in this room.
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 px-1 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-white/38 transition hover:text-white/72"
        >
          {open ? 'Done' : 'Edit'}
        </button>
      </div>

      {open && (
        <div className="mt-5 space-y-2">
          {panels.map((panel) => {
            const active = activePanel.id === panel.id

            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => selectProfile(panel.id)}
                className={`block w-full border-l px-4 py-2.5 text-left transition ${
                  active
                    ? 'border-[#7EA1FF]/70 bg-[#4E7CFF]/[0.045]'
                    : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.018]'
                }`}
              >
                <span className="flex items-center gap-2 text-[11px] font-semibold text-[#F2F4FF]/80">
                  <span>{active ? '✓ ' : ''}{panel.label}</span>
                  {supportsVisualDelivery(panel.id) && <DeliveryProfileBetaBadge />}
                </span>

                <span className="mt-1 block text-[10px] leading-4 text-white/38">
                  {panel.line}
                </span>

                {active && (
                  <span className="mt-2 block max-w-[620px] text-[10px] leading-5 text-white/46">
                    {panel.detail}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
