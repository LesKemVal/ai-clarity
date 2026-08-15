"use client";

type GeorgePersonalizationPanelProps = {
  voiceType: string;
  draftProfileName: string;
  onVoiceTypeChange: (voiceType: string) => void;
  onDraftProfileNameChange: (name: string) => void;
  onSave: () => void;
  onSkip: () => void;
  onClose: () => void;
};

const voices = [
  { label: "Ash", value: "ash" },
  { label: "Onyx", value: "onyx" },
  { label: "Sage", value: "sage" },
  { label: "Alloy", value: "alloy" },
  { label: "Nova", value: "nova" },
  { label: "Shimmer", value: "shimmer" },
  { label: "Coral", value: "coral" },
];

export function GeorgePersonalizationPanel({
  voiceType,
  draftProfileName,
  onVoiceTypeChange,
  onDraftProfileNameChange,
  onSave,
  onSkip,
  onClose,
}: GeorgePersonalizationPanelProps) {
  return (
    <div
      className="fixed inset-0 z-[92] flex items-end justify-center bg-black george-motion-fade-soft/68 px-4 -[10px] pb-4 "
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] md:max-w-[720px] xl:max-w-[920px] md:max-w-[720px] xl:max-w-[920px] md:max-w-[420px] md:max-w-[720px] xl:max-w-[920px] xl:max-w-[760px] max-h-[90vh] overflow-y-auto rounded-[1.65rem] border border-white/[0.07] bg-[#05080D]/88 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-[#D7DBE4]">
            Make GEORGE yours
          </p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Optional. Same mind. Same standards. Choose GEORGE or GEORGette,
            then keep the name or make it yours.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-neutral-500">
              Voice
            </p>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 md:grid-cols-3 md:gap-3">
              {voices.map((voice) => (
                <button
                  key={voice.value}
                  type="button"
                  onClick={() => onVoiceTypeChange(voice.value)}
                  className={`rounded-[1rem] border transition hover:scale-[1.01] px-5 py-4 text-sm ${
                    voiceType === voice.value
                      ? "border-white/[0.16] bg-white/[0.032] text-[#D7DBE4]"
                      : "border-white/[0.06] bg-black/28 text-neutral-500 hover:text-[#D7DBE4]"
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
              onChange={(event) =>
                onDraftProfileNameChange(event.target.value)
              }
              placeholder=""
              className="w-full rounded-[1rem] max-w-full border border-white/[0.07] bg-black/40 px-5 py-4 text-sm text-[#D7DBE4] outline-none transition placeholder:text-neutral-500 focus:border-white/[0.09]"
            />
          </div>

          <button
            type="button"
            onClick={onSave}
            className="w-full rounded-[1rem] max-w-full bg-white px-5 py-4 text-sm font-medium text-black transition hover:opacity-55"
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
  );
}
