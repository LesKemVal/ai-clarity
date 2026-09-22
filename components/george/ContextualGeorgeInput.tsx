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
    <div className="mt-3 rounded-[11px] border border-[#7EA1FF]/24 bg-[#11182A]/62 px-3 py-2.5">
      <label
        htmlFor={id}
        className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#AFC0FF]/62"
      >
        {label}
      </label>
      <textarea
        id={id}
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        placeholder={placeholder}
        className="mt-1.5 min-h-[58px] w-full resize-none border-0 border-b border-[#7EA1FF]/16 bg-transparent px-0 py-1.5 text-[13px] leading-5 text-white/84 outline-none placeholder:text-white/24 focus:border-[#7EA1FF]/46"
      />
      <div className="mt-2 flex items-center gap-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim()}
          className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9CB3FF]/78 transition hover:text-[#C3D0FF] disabled:opacity-30"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-white/34 transition hover:text-white/62"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
