"use client";

import type {
  OperationalFormula,
  OperationalScript,
} from "@/lib/george/operational-memory/types";

type FormulaScriptBrowserPanelProps = {
  open: boolean;
  loading: boolean;
  formula: OperationalFormula | null;
  scripts: OperationalScript[];
  selectedScript: OperationalScript | null;
  error?: string;
  onSelectScript: (script: OperationalScript) => void;
  onClose: () => void;
};

export function FormulaScriptBrowserPanel({
  open,
  loading,
  formula,
  scripts,
  selectedScript,
  error,
  onSelectScript,
  onClose,
}: FormulaScriptBrowserPanelProps) {
  if (!open || !formula) return null;

  return (
    <section className="mt-3 overflow-hidden rounded-[1rem] border border-[#65728A]/[0.24] bg-[#080A0D]">
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.05] px-4 py-3">
        <div>
          <div className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#9BA8BC]/42">
            Scripts on this formula
          </div>
          <div className="mt-1.5 text-[14px] font-semibold tracking-[-0.02em] text-white/84">
            {formula.name?.trim() || "Operational formula"}
          </div>
          <p className="mt-1 text-[10px] leading-4 text-white/38">
            Choose the execution strategy GEORGE should customize for this room.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-white/42 transition hover:text-white"
        >
          Close
        </button>
      </div>

      <div className="space-y-2 px-4 py-4">
        {loading && (
          <div className="rounded-[0.8rem] border border-white/[0.06] px-3 py-4 text-[11px] text-white/38">
            Loading scripts…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[0.8rem] border border-red-300/[0.12] bg-red-300/[0.03] px-3 py-4 text-[11px] text-red-100/52">
            {error}
          </div>
        )}

        {!loading && !error && scripts.length === 0 && (
          <div className="rounded-[0.8rem] border border-white/[0.06] px-3 py-4 text-[11px] leading-5 text-white/38">
            No additional scripts are available for this formula yet.
          </div>
        )}

        {!loading &&
          scripts.map((script) => {
            const selected = selectedScript?.id === script.id;

            return (
              <button
                key={`${script.id}-${script.version}`}
                type="button"
                onClick={() => onSelectScript(script)}
                className={`w-full rounded-[0.9rem] border px-3.5 py-3.5 text-left transition ${
                  selected
                    ? "border-[#7898FF]/[0.32] bg-[#4E7CFF]/[0.08]"
                    : "border-white/[0.07] bg-white/[0.015] hover:border-white/[0.14]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-white/78">
                      {script.name?.trim() || "Operational script"}
                    </div>
                    <div className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/30">
                      {script.lines.length} lines · v{script.version}
                    </div>
                  </div>

                  <div className="rounded-full border border-white/[0.09] px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.13em] text-white/42">
                    {selected ? "Selected" : script.status}
                  </div>
                </div>

                {script.lines[0]?.text && (
                  <p className="mt-3 line-clamp-2 text-[10px] leading-4 text-[#D5DBE5]/48">
                    {script.lines[0].text}
                  </p>
                )}
              </button>
            );
          })}
      </div>
    </section>
  );
}
