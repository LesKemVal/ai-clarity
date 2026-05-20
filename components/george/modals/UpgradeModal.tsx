'use client'

import ContinuityCapsule from '@/components/george/ContinuityCapsule'

type UpgradeModalProps = {
  subscriberEmail: string
  setSubscriberEmail: (value: string) => void
  onClearContinuity: () => void
  onContinuityRequest: () => void
  onTierCheckout: (tier: 'intelligent' | 'brilliant') => void
  onRedeemFounderCode: () => void
  onClose: () => void
}

export default function UpgradeModal({
  subscriberEmail,
  setSubscriberEmail,
  onClearContinuity,
  onContinuityRequest,
  onTierCheckout,
  onRedeemFounderCode,
  onClose,
}: UpgradeModalProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[210] flex items-center justify-center overflow-y-auto px-4 py-6">
      <div
        className="pointer-events-auto w-full max-w-[400px] rounded-[1.35rem] border border-white/[0.08] bg-[#0B0D12]/78 p-5 shadow-[0_18px_54px_rgba(0,0,0,0.42)] ring-1 ring-white/[0.04]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#D7DBE4]/58">
            GEORGE Continuity
          </p>

          <p className="mt-3 text-sm font-medium text-[#D7DBE4]">
            Restore GEORGE access
          </p>

          <p className="mt-1 text-xs leading-6 text-neutral-500">
            Restore your access, preferences, and LIVE support.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1rem] border border-white/[0.08] bg-black/28 px-4 py-3">
            <label className="block text-[10px] uppercase tracking-[0.18em] text-neutral-500">
              Recognized access
            </label>

            <ContinuityCapsule
              email={subscriberEmail}
              label="Recognized as"
              onClear={onClearContinuity}
            />

            <input
              type="email"
              value={subscriberEmail}
              onChange={(event) => {
                const value = event.target.value.trim().toLowerCase()

                setSubscriberEmail(value)

                if (value) {
                  window.localStorage.setItem('george_email', value)
                } else {
                  window.localStorage.removeItem('george_email')
                }
              }}
              placeholder="you@example.com"
              className="mt-2 w-full bg-transparent text-sm text-[#D7DBE4] outline-none placeholder:text-neutral-700"
            />

            <p className="mt-2 text-[11px] leading-5 text-neutral-500">
              Your access link restores GEORGE recognition and LIVE access on this device.
            </p>

            <button
              type="button"
              onClick={onContinuityRequest}
              className="mt-3 w-full rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-2 text-[11px] font-medium tracking-[0.08em] text-[#D7DBE4]/70 transition hover:bg-white/[0.12] hover:text-[#D7DBE4]"
            >
              Send access link
            </button>
          </div>

          <button
            type="button"
            onClick={() => onTierCheckout('intelligent')}
            className="block w-full max-w-full rounded-[1rem] border border-white/[0.055] bg-white/[0.018] px-4 py-3 text-left transition hover:border-white/[0.12] hover:bg-white/[0.04]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-[#D7DBE4]">
                  Intelligent
                </div>

                <div className="mt-1 text-xs leading-5 text-neutral-500">
                  Stronger memory, execution support, and adaptive guidance.
                </div>
              </div>

              <div className="text-[11px] font-medium text-[#D7DBE4]/70">
                $9.99
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onTierCheckout('brilliant')}
            className="block w-full max-w-full rounded-[1rem] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left transition hover:border-white/[0.09] hover:bg-white/[0.05]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-[#D7DBE4]">
                  Brilliant
                </div>

                <div className="mt-1 text-xs leading-5 text-neutral-300">
                  Deep LIVE conversational support and stronger restoration.
                </div>
              </div>

              <div className="text-[11px] font-medium text-[#D7DBE4]/70">
                $25
              </div>
            </div>
          </button>
        </div>

        <div className="mt-5 space-y-3 border-t border-white/5 pt-4">
          <button
            type="button"
            onClick={onRedeemFounderCode}
            className="w-full rounded-full border border-white/[0.06] bg-white/[0.018] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#D7DBE4]/70 transition hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-[#D7DBE4]"
          >
            Enter Founder Code
          </button>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-neutral-500 transition hover:text-[#D7DBE4]"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => window.open('/top-up', '_blank')}
              className="text-xs text-[#D7DBE4]/72 transition hover:opacity-80"
            >
              See full options
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
