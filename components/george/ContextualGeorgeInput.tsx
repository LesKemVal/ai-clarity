"use client";

type ContextualGeorgeInputProps = {
  id: string;
  value: string;
  label?: string;
  placeholder?: string;
  submitLabel?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function ContextualGeorgeInput({
  id,
  value,
  label = "What should GEORGE understand instead?",
  placeholder = "Tell GEORGE what is unique about this conversation.",
  submitLabel = "Update understanding",
  onChange,
  onSubmit,
  onCancel,
}: ContextualGeorgeInputProps) {
  return (
    <div className="mt-4 rounded-[12px] border border-[#7EA1FF]/28 bg-[#11182A]/70 p-3">
      <label
        htmlFor={id}
        className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-white/48"
      >
        {label}
      </label>
      <textarea
        id={id}
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder={placeholder}
        className="mt-2 min-h-[84px] w-full resize-none rounded-[9px] border border-white/[0.09] bg-black/30 px-3 py-2 text-[13px] leading-5 text-white outline-none placeholder:text-white/24 focus:border-[#7EA1FF]/55"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim()}
          className="rounded-[9px] border border-[#7EA1FF]/45 bg-[#172347] px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-35"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[9px] border border-white/[0.12] px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-white/54"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
