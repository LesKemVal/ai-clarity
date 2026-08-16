"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { OperationalRecommendationDto } from "@/lib/george/operational-memory/recommendation-api";
import type { OperationalFormula } from "@/lib/george/operational-memory/types";

type RecommendedStrategyCardProps = {
  recommendation: OperationalRecommendationDto | null;
  loading: boolean;
  selectedFormula: OperationalFormula | null;
  onChooseAnother: () => void;
  onUseFormula?: (formula: OperationalFormula) => void;
  onViewScripts?: (formula: OperationalFormula) => void;
};

const EXPLANATION_STORAGE_KEY =
  "GEORGE_LIVE_FORMULA_EXPLANATION_OPEN";
const EXPLANATION_IDLE_MS = 9000;

export function RecommendedStrategyCard({
  recommendation,
  loading,
  selectedFormula,
  onChooseAnother,
  onUseFormula,
  onViewScripts,
}: RecommendedStrategyCardProps) {
  const [explanationOpen, setExplanationOpen] = useState(false);
  const [formulaDetailsOpen, setFormulaDetailsOpen] = useState(false);
  const idleTimerRef = useRef<number | null>(null);

  const formula =
    selectedFormula || recommendation?.recommendedFormula || null;

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const closeExplanation = useCallback(() => {
    clearIdleTimer();
    setExplanationOpen(false);

    try {
      window.sessionStorage.removeItem(EXPLANATION_STORAGE_KEY);
    } catch {}
  }, [clearIdleTimer]);

  const restartIdleTimer = useCallback(() => {
    if (!formula) return;

    clearIdleTimer();
    idleTimerRef.current = window.setTimeout(() => {
      closeExplanation();
    }, EXPLANATION_IDLE_MS);
  }, [clearIdleTimer, closeExplanation, formula]);

  const openExplanation = useCallback(() => {
    setExplanationOpen(true);

    try {
      window.sessionStorage.setItem(EXPLANATION_STORAGE_KEY, "1");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (
        formula &&
        window.sessionStorage.getItem(EXPLANATION_STORAGE_KEY) === "1"
      ) {
        setExplanationOpen(true);
      }
    } catch {}
  }, [formula]);

  useEffect(() => {
    if (!explanationOpen || !formula) {
      clearIdleTimer();
      return;
    }

    restartIdleTimer();
    return clearIdleTimer;
  }, [
    clearIdleTimer,
    explanationOpen,
    formula,
    restartIdleTimer,
  ]);

  if (loading) {
    return (
      <section className="mt-3 rounded-[1rem] border border-white/[0.055] bg-[#080A0D] px-4 py-4">
        <div className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/32">
          Recommended formula
        </div>
        <div className="mt-2 text-[11px] leading-5 text-white/42">
          Reviewing the briefing...
        </div>
      </section>
    );
  }

  if (!formula) {
    return (
      <section className="mt-3 rounded-[12px] border border-white/[0.08] bg-white/[0.02] px-4 py-4 transition-all duration-500 ease-out">
        <div className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#9BA8BC]/42">
          Recommended formula
        </div>
        <div className="mt-2 text-[13px] font-semibold text-white/76">
          No formula selected yet.
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onChooseAnother}
            className="inline-flex h-9 items-center justify-center rounded-[9px] border border-[#7898FF]/[0.24] bg-[#4E7CFF]/[0.08] px-4 font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-[#D4DCFF]/72 transition hover:border-[#7898FF]/45 hover:text-white"
          >
            Choose another
          </button>
        </div>
      </section>
    );
  }

  const formulaName =
    formula.name?.trim() ||
    `Formula ${String(formula.id || formula.version)}`;

  const recommendationExplanation =
    recommendation?.recommendationSummary?.trim() ||
    formula.bestUsedFor?.[0]?.trim() ||
    "This strategy gives me an operational reference for the outcome you are pursuing in this room.";

  const explanationItems = (formula.steps || [])
    .map(
      (step) =>
        step.actionType ||
        step.expectedTransition ||
        step.signalType ||
        "",
    )
    .filter(Boolean)
    .slice(0, 4);


  if (explanationOpen) {
    return (
      <section
        className="mt-3 rounded-[11px] border border-white/[0.07] bg-white/[0.015] px-4 py-3.5 transition-all duration-500 ease-out"
        onPointerDown={restartIdleTimer}
        onPointerMove={restartIdleTimer}
        onKeyDown={restartIdleTimer}
        onWheel={restartIdleTimer}
        onTouchMove={restartIdleTimer}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-white/32">
              Conversation formula
            </div>
            <div className="mt-1.5 text-[13px] font-semibold text-white/84">
              {formulaName}
            </div>
          </div>

          <button
            type="button"
            onClick={closeExplanation}
            className="shrink-0 font-mono text-[7px] font-semibold uppercase tracking-[0.14em] text-white/34 transition hover:text-white/70"
          >
            Close
          </button>
        </div>

        <div className="mt-4 border-t border-white/[0.055] pt-3">
          <div className="font-mono text-[8px] font-semibold uppercase tracking-[0.17em] text-white/34">
            Why I recommend this
          </div>

          <p className="mt-2 text-[11px] leading-5 text-white/58">
            {recommendationExplanation}
          </p>

          {explanationItems.length > 0 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setFormulaDetailsOpen((current) => !current)
                }
                className="mt-4 font-mono text-[8px] font-semibold uppercase tracking-[0.16em] text-[#AFC0FF]/68 transition hover:text-white"
              >
                {formulaDetailsOpen ? "Hide formula" : "View formula"}
              </button>

              {formulaDetailsOpen && (
                <div className="mt-3 space-y-2 border-t border-white/[0.055] pt-3">
                  {explanationItems.map((item, index) => (
                    <div
                      key={`${formula.id}-explanation-${index}`}
                      className="flex items-start gap-2 text-[11px] leading-5 text-white/58"
                    >
                      <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-[#8FAEFF]/70" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-3 rounded-[11px] border border-white/[0.07] bg-white/[0.015] px-4 py-3.5 transition-all duration-500 ease-out">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-[#9BA8BC]/42">
            Recommended formula
          </div>

          <div className="mt-1.5 text-[13px] font-semibold tracking-[-0.01em] text-white/86">
            {formulaName}
          </div>
        </div>

        <button
          type="button"
          onClick={openExplanation}
          className="shrink-0 font-mono text-[7px] font-semibold uppercase tracking-[0.14em] text-white/34 transition hover:text-white/70"
        >
          View
        </button>
      </div>

      {(onUseFormula || onViewScripts) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.055] pt-3">
          {onUseFormula && (
            <button
              type="button"
              onClick={() => onUseFormula(formula)}
              className="font-mono text-[8px] font-semibold uppercase tracking-[0.16em] text-[#AFC0FF]/66 transition hover:text-white"
            >
              Continue with this formula
            </button>
          )}

          {onViewScripts && (
            <button
              type="button"
              onClick={() => onViewScripts(formula)}
              className="font-mono text-[8px] font-semibold uppercase tracking-[0.16em] text-white/34 transition hover:text-white/70"
            >
              View scripts
            </button>
          )}
        </div>
      )}
    </section>
  );
}
