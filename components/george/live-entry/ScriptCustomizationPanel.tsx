"use client";

import type {
  OperationalScript,
  OperationalScriptLine,
} from "@/lib/george/operational-memory/types";

type ScriptCustomizationPanelProps = {
  open: boolean;
  script: OperationalScript | null;
  onChange: (script: OperationalScript) => void;
  onReset: () => void;
  onDone: () => void;
  onClose: () => void;
};

function updateLine(
  script: OperationalScript,
  lineId: string,
  text: string,
): OperationalScript {
  const lines: OperationalScriptLine[] = script.lines.map((line) =>
    line.id === lineId ? { ...line, text } : line,
  );

  return {
    ...script,
    lines,
  };
}

export function ScriptCustomizationPanel({
  open,
  script,
  onChange,
  onReset,
  onDone,
  onClose,
}: ScriptCustomizationPanelProps) {
  if (!open || !script) return null;

  return (
    <section className="mt-3 overflow-hidden rounded-[1rem] border border-[#7C8AA3]/[0.24] bg-[#080A0D]">
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.05] px-4 py-3">
        <div>
          <div className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#A5B1C5]/42">
            Customize for this room
          </div>
          <div className="mt-1.5 text-[14px] font-semibold tracking-[-0.02em] text-white/84">
            {script.name?.trim() || "Operational script"}
          </div>
          <p className="mt-1 text-[10px] leading-4 text-white/38">
            These edits apply only to this session. The saved script and formula
            remain unchanged.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="george-quiet-action font-mono text-[8px] font-semibold uppercase tracking-[0.15em]"
        >
          Close
        </button>
      </div>

      <div className="space-y-3 px-4 py-4">
        {script.lines.length === 0 && (
          <div className="rounded-[0.8rem] border border-white/[0.06] px-3 py-4 text-[11px] text-white/38">
            This script has no editable lines.
          </div>
        )}

        {script.lines
          .slice()
          .sort((left, right) => left.order - right.order)
          .map((line, index) => (
            <label
              key={line.id}
              className="block rounded-[0.9rem] border border-white/[0.07] bg-white/[0.015] px-3.5 py-3"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/30">
                  Line {index + 1}
                </span>
                {line.purpose && (
                  <span className="text-[8px] text-white/26">
                    {line.purpose}
                  </span>
                )}
              </div>

              <textarea
                value={line.text}
                onChange={(event) =>
                  onChange(updateLine(script, line.id, event.target.value))
                }
                rows={3}
                className="w-full resize-y rounded-[0.7rem] border border-white/[0.08] bg-black/20 px-3 py-2 text-[11px] leading-5 text-white/72 outline-none transition placeholder:text-white/20 focus:border-[#7898FF]/[0.28]"
              />
            </label>
          ))}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] pt-3">
          <button
            type="button"
            onClick={onReset}
            className="george-quiet-action font-mono text-[8px] font-semibold uppercase tracking-[0.15em]"
          >
            Reset session edits
          </button>

          <button
            type="button"
            onClick={onDone}
            className="george-secondary-action inline-flex h-9 items-center justify-center rounded-[8px] px-4 font-mono text-[8px] font-semibold uppercase tracking-[0.15em]"
          >
            Use customized script
          </button>
        </div>
      </div>
    </section>
  );
}
