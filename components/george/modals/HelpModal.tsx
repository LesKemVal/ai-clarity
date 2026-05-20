'use client'

type HelpTopic = 'live' | 'continuity' | 'images' | 'signal'

type HelpModalProps = {
  activeHelpTopic: HelpTopic
  onClose: () => void
  onSelectTopic: (topic: HelpTopic) => void
}

export default function HelpModal({
  activeHelpTopic,
  onClose,
  onSelectTopic,
}: HelpModalProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close help"
        onClick={onClose}
        className="fixed inset-0 z-[220] bg-black/62 backdrop-blur-[8px]"
      />

      <div className="fixed inset-0 z-[230] flex items-center justify-center px-4 py-6">
        <div className="relative w-full max-w-[430px] rounded-[1.35rem] border border-white/[0.08] bg-[#0B0D12]/82 p-5 shadow-[0_18px_54px_rgba(0,0,0,0.42)]">
          <button
            type="button"
            aria-label="Close help"
            onClick={onClose}
            className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] bg-[#11131A] text-lg text-white/78 shadow-[0_12px_30px_rgba(0,0,0,0.42)] transition hover:text-white"
          >
            ×
          </button>

          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/34">
              GEORGE Help
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                ['live', 'LIVE'],
                ['continuity', 'Continuity'],
                ['images', 'Images'],
                ['signal', 'Signal'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectTopic(id as HelpTopic)}
                  className={`rounded-xl border px-3 py-2 text-left text-[12px] transition ${
                    activeHelpTopic === id
                      ? 'border-white/[0.14] bg-white/[0.06] text-white'
                      : 'border-white/[0.055] bg-black/20 text-white/52 hover:text-white/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-white/[0.055] bg-black/24 p-4">
              <h3 className="text-[15px] font-semibold text-white/88">
                {activeHelpTopic === 'live' && 'LIVE GEORGE'}
                {activeHelpTopic === 'continuity' && 'Continuity'}
                {activeHelpTopic === 'images' && 'Images'}
                {activeHelpTopic === 'signal' && 'Signal'}
              </h3>

              <p className="mt-2 text-[13px] leading-6 text-white/52">
                {activeHelpTopic === 'live' &&
                  'LIVE helps you operate during real conversations. Use Prep Room to set the room, purview, support level, and context before entering LIVE.'}

                {activeHelpTopic === 'continuity' &&
                  'Continuity restores GEORGE recognition, tier access, and LIVE eligibility on this device through your verified access session.'}

                {activeHelpTopic === 'images' &&
                  'Images lets you generate visual direction, product concepts, campaign visuals, and references from GEORGE.'}

                {activeHelpTopic === 'signal' &&
                  'Signal helps GEORGE notice useful patterns over time so guidance can better serve your interest.'}
              </p>

              <a
                href="/help"
                className="mt-4 inline-flex text-[12px] font-medium text-[#D7DBE4]/62 underline-offset-4 transition hover:text-white hover:underline"
              >
                Open full help topics
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
