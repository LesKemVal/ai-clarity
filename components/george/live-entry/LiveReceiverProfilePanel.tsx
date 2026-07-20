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
    <div className="rounded-[0.82rem] border border-[#4E7CFF]/[0.16] bg-[#4E7CFF]/[0.045] px-4 py-3">
      <div className="text-[9px] uppercase tracking-[0.24em] text-[#D7DCFF]/46">
        Delivery Profile
      </div>

      <div className="mt-2 flex items-center gap-2 text-[14px] font-semibold text-[#F2F4FF]/88">
        <span>{activePanel.label}</span>
        {supportsVisualDelivery(activePanel.id) && <DeliveryProfileBetaBadge />}
      </div>

      <div className="mt-1 text-[11px] leading-5 text-[#D7DBE4]/50">
        Choose how GEORGE delivers support in this room. The runtime remains the same across every profile.
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="mt-3 rounded-[0.65rem] border border-[#4E7CFF]/18 bg-[#4E7CFF]/[0.06] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#D7DCFF]/72 transition hover:border-[#4E7CFF]/34 hover:bg-[#4E7CFF]/[0.10]"
      >
        {open ? 'Collapse' : 'Change'}
      </button>

      {open && (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {panels.map((panel) => {
            const active = activePanel.id === panel.id

            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => selectProfile(panel.id)}
                className={`rounded-[0.72rem] border px-3 py-2.5 text-left transition ${
                  active
                    ? 'border-[#4E7CFF]/[0.24] bg-[#4E7CFF]/[0.055]'
                    : 'border-white/[0.06] bg-white/[0.018] hover:border-[#D7DCFF]/18 hover:bg-[#D7DCFF]/[0.035]'
                }`}
              >
                <span className="flex items-center gap-2 text-[11px] font-semibold text-[#F2F4FF]/78">
                  <span>{panel.label}</span>
                  {supportsVisualDelivery(panel.id) && <DeliveryProfileBetaBadge />}
                </span>

                <span className="mt-1 block text-[10px] leading-4 text-white/36">
                  {panel.line}
                </span>

                {active && (
                  <span className="mt-3 block border-l border-[#4E7CFF]/24 pl-3 text-[11px] leading-5 text-[#D7DBE4]/52">
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
