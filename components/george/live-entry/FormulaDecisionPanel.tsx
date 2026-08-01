"use client";

import type { OperationalFormula } from "@/lib/george/operational-memory/types";

export type FormulaDecisionSource = "george" | "user";

type FormulaDecisionPanelProps = {
  recommendedFormula: OperationalFormula | null;
  selectedFormula: OperationalFormula | null;
  selectedSource: FormulaDecisionSource | null;
  reviewRequired: boolean;
  onAcceptRecommendation: () => void;
  onEditFormula: () => void;
  onChooseAnother: () => void;
};

export function FormulaDecisionPanel({
  recommendedFormula,
  selectedFormula,
  selectedSource,
  reviewRequired,
  onAcceptRecommendation,
  onEditFormula,
  onChooseAnother,
}: FormulaDecisionPanelProps) {
  const activeFormula = selectedFormula || recommendedFormula;

  if (!activeFormula) {
    return null;
  }

  const activeName = activeFormula.name?.trim() || "Operational formula";
  const recommendationIsSelected =
    selectedFormula?.id === recommendedFormula?.id &&
    selectedFormula?.version === recommendedFormula?.version;

  return (
    <div className="mt-4 border-t border-white/[0.05] pt-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Selected formula
          </div>

          <div className="mt-1.5 text-[13px] font-semibold text-white/82">
            {activeName}
          </div>

          <div className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/30">
            {selectedSource === "user"
              ? "Selected by you"
              : recommendationIsSelected
                ? "GEORGE recommendation"
                : "Ready for selection"}
          </div>
        </div>

        {reviewRequired && (
          <div className="rounded-full border border-[#FFB45B]/30 bg-[#FF9F43]/[0.08] px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.14em] text-[#FFD3A3]/72 shadow-[0_0_18px_rgba(255,159,67,0.14)]">
            Review advised
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={onAcceptRecommendation}
          disabled={!recommendedFormula || recommendationIsSelected}
          className="inline-flex h-9 items-center justify-center rounded-[9px] border border-[#6F8FFF]/26 bg-[#4E7CFF]/[0.08] px-3 font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-[#C5D1FF]/72 transition hover:border-[#88A2FF]/46 hover:text-white disabled:cursor-default disabled:opacity-30"
        >
          Use this formula
        </button>

        <button
          type="button"
          onClick={onEditFormula}
          className="inline-flex h-9 items-center justify-center rounded-[9px] border border-white/[0.10] px-3 font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-white/52 transition hover:border-white/24 hover:text-white"
        >
          Edit formula
        </button>

        <button
          type="button"
          onClick={onChooseAnother}
          className="inline-flex h-9 items-center justify-center rounded-[9px] border border-white/[0.10] px-3 font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-white/52 transition hover:border-white/24 hover:text-white"
        >
          Choose another
        </button>
      </div>
    </div>
  );
}
