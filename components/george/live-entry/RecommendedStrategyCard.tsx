"use client";

import { useState } from "react";

import type {
  OperationalRecommendationDto,
} from "@/lib/george/operational-memory/recommendation-api";

type RecommendedStrategyCardProps = {
  recommendation: OperationalRecommendationDto | null;
  loading: boolean;
};

function strategyLabel(
  status: OperationalRecommendationDto["strategyStatus"],
) {
  if (status === "confirmed") return "Strategy confirmed";
  if (status === "refined") return "Strategy refined";
  return "Initial strategy";
}

export function RecommendedStrategyCard({
  recommendation,
  loading,
}: RecommendedStrategyCardProps) {
  const [reviewOpen, setReviewOpen] = useState(false);

  if (loading) {
    return (
      <section className="mt-3 rounded-[1rem] border border-white/[0.055] bg-[#080A0D] px-4 py-3">
        <div className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/32">
          Strategy
        </div>
        <div className="mt-2 text-[11px] leading-5 text-white/42">
          Reviewing the briefing…
        </div>
      </section>
    );
  }

  if (!recommendation?.recommendedFormula) {
    return null;
  }

  const formula = recommendation.recommendedFormula;
  const formulaName = formula.name?.trim() || "Operational formula";
  const steps = formula.steps || [];

  return (
    <section className="mt-3 overflow-hidden rounded-[1rem] border border-[#65728A]/[0.24] bg-[#080A0D]">
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#9BA8BC]/42">
              {strategyLabel(recommendation.strategyStatus)}
            </div>

            <div className="mt-1.5 text-[14px] font-semibold tracking-[-0.02em] text-white/84">
              {formulaName}
            </div>

            <p className="mt-1.5 max-w-[500px] text-[11px] leading-5 text-[#C8CED8]/46">
              {recommendation.recommendationSummary}
            </p>
          </div>

          <div className="shrink-0 rounded-full border border-[#7898FF]/[0.18] bg-[#4E7CFF]/[0.055] px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.13em] text-[#BFCBFF]/58">
            v{formula.version}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setReviewOpen((open) => !open)}
          className="mt-3 font-mono text-[8px] font-semibold uppercase tracking-[0.16em] text-[#AFC0FF]/62 transition hover:text-white"
        >
          {reviewOpen ? "Close Review ↑" : "Review Formula →"}
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-white/[0.05] transition-all duration-300 ${
          reviewOpen
            ? "max-h-[520px] opacity-100"
            : "max-h-0 border-t-transparent opacity-0"
        }`}
      >
        <div className="px-4 py-4">
          {formula.bestUsedFor?.[0] && (
            <p className="text-[11px] leading-5 text-white/46">
              {formula.bestUsedFor[0]}
            </p>
          )}

          {steps.length > 0 && (
            <div className="mt-3 space-y-2">
              {steps.map((step, index) => {
                const primary =
                  step.actionType ||
                  step.expectedTransition ||
                  step.signalType;

                const secondary =
                  step.actionType && step.expectedTransition
                    ? step.expectedTransition
                    : "";

                return (
                  <div
                    key={`${formula.id}-${formula.version}-${index}`}
                    className="border-l border-[#7898FF]/[0.18] pl-3"
                  >
                    <div className="text-[11px] leading-5 text-white/68">
                      {primary}
                    </div>

                    {secondary && (
                      <div className="mt-0.5 text-[10px] leading-4 text-white/32">
                        {secondary}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={() => setReviewOpen(false)}
            className="mt-4 inline-flex h-8 items-center justify-center rounded-[8px] border border-white/[0.12] px-3 font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-white/58 transition hover:border-white/28 hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
    </section>
  );
}
