'use client'

type VoiceOption = {
  label: string
  value: string
}

type PersonalizeModalProps = {
  voiceType: string
  setVoiceType: (value: string) => void
  draftProfileName: string
  setDraftProfileName: (value: string) => void
  onSave: () => void
  onSkip: () => void
  onClose: () => void
}

const voices: VoiceOption[] = [
  { label: 'Ash', value: 'ash' },
  { label: 'Onyx', value: 'onyx' },
  { label: 'Sage', value: 'sage' },
  { label: 'Alloy', value: 'alloy' },
  { label: 'Nova', value: 'nova' },
  { label: 'Shimmer', value: 'shimmer' },
  { label: 'Coral', value: 'coral' },
]

export default function PersonalizeModal({
  voiceType,
  setVoiceType,
  draftProfileName,
  setDraftProfileName,
  onSave,
  onSkip,
  onClose,
}: PersonalizeModalProps) {
  return (
    <div
      className="fixed inset-0 z-[92] flex items-end justify-center bg-black/68 px-4 pb-4 backdrop-blur-[8px]"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[420px] overflow-y-auto rounded-[1.35rem] border border-white/[0.08] bg-[#0B0D12]/78 p-5 shadow-[0_18px_54px_rgba(0,0,0,0.42)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-[#D7DBE4]">
            Make GEORGE yours
          </p>

          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Optional. Same mind. Same standards. Choose GEORGE or GEORGette, then keep the name or make it yours.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-neutral-500">
              Voice
            </p>

            <div className="grid grid-cols-2 gap-2">
              {voices.map((voice) => (
                <button
                  key={voice.value}
                  type="button"
                  onClick={() => setVoiceType(voice.value)}
                  className={`rounded-[1rem] border px-5 py-4 text-sm transition hover:scale-[1.01] ${
                    voiceType === voice.value
                      ? 'border-white/[0.16] bg-white/[0.032] text-[#D7DBE4]'
                      : 'border-white/[0.06] bg-black/28 text-neutral-500 hover:text-[#D7DBE4]'
                  }`}
                >
                  {voice.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-neutral-500">
              Name
            </label>

            <input
              value={draftProfileName}
              onChange={(e) => setDraftProfileName(e.target.value)}
              placeholder="GEORGE"
              className="w-full max-w-full rounded-[1rem] border border-white/[0.08] bg-black/40 px-5 py-4 text-sm text-[#D7DBE4] outline-none transition placeholder:text-neutral-500 focus:border-white/[0.09]"
            />
          </div>

          <button
            type="button"
            onClick={onSave}
            className="w-full max-w-full rounded-[1rem] bg-white px-5 py-4 text-sm font-medium text-black transition hover:opacity-55"
          >
            Save
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="w-full text-xs text-neutral-500 transition hover:text-[#D7DBE4]"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
