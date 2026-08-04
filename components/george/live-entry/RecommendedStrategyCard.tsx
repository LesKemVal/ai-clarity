"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { FormulaDecisionSource } from "@/components/george/live-entry/FormulaDecisionPanel";
import type { OperationalRecommendationDto } from "@/lib/george/operational-memory/recommendation-api";
import type { OperationalFormula } from "@/lib/george/operational-memory/types";

type RecommendedStrategyCardProps = {
  recommendation: OperationalRecommendationDto | null;
  loading: boolean;
  selectedFormula: OperationalFormula | null;
  selectedSource: FormulaDecisionSource | null;
  reviewRequired: boolean;
  onAcceptRecommendation: () => void;
  onEditFormula: () => void;
  onChooseAnother: () => void;
  onBrowseScripts: (formula: OperationalFormula) => void;
  onContinue?: () => void;
};

const EXPLANATION_STORAGE_KEY =
  "GEORGE_LIVE_FORMULA_EXPLANATION_OPEN";
const EXPLANATION_IDLE_MS = 9000;

export function RecommendedStrategyCard({
  recommendation,
  loading,
  selectedFormula,
  onChooseAnother,
  onContinue,
}: RecommendedStrategyCardProps) {
  const [explanationOpen, setExplanationOpen] = useState(false);
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
            Browse Formula Library
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex h-9 items-center justify-center rounded-[9px] border border-white/[0.12] px-4 font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-white/58 transition hover:border-white/28 hover:text-white"
          >
            Continue without formula
          </button>
        </div>
      </section>
    );
  }

  const formulaName =
    formula.name?.trim() ||
    `Formula ${String(formula.id || formula.version)}`;

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
        className="mt-3 rounded-[12px] border border-white/[0.08] bg-white/[0.02] px-4 py-4 transition-all duration-500 ease-out"
        onPointerDown={restartIdleTimer}
        onPointerMove={restartIdleTimer}
        onKeyDown={restartIdleTimer}
        onWheel={restartIdleTimer}
        onTouchMove={restartIdleTimer}
      >
        <button
          type="button"
          onClick={closeExplanation}
          className="font-mono text-[8px] font-semibold uppercase tracking-[0.16em] text-[#AFC0FF]/62 transition hover:text-white"
        >
          Back
        </button>

        <div className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-white/86">
          {formulaName}
        </div>

        <div className="mt-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/34">
          What this formula does
        </div>

        {explanationItems.length > 0 ? (
          <div className="mt-3 space-y-2">
            {explanationItems.map((item, index) => (
              <div
                key={`${formula.id}-explanation-${index}`}
                className="flex items-start gap-2 text-[11px] leading-5 text-white/62"
              >
                <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-[#8FAEFF]/70" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-[11px] leading-5 text-white/50">
            {formula.bestUsedFor?.[0] ||
              "This formula provides the operational sequence for the current conversation."}
          </p>
        )}

        <button
          type="button"
          onClick={onChooseAnother}
          className="mt-5 inline-flex h-9 items-center justify-center rounded-[9px] border border-[#7898FF]/[0.24] bg-[#4E7CFF]/[0.08] px-4 font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-[#D4DCFF]/72 transition hover:border-[#7898FF]/45 hover:text-white"
        >
          Browse Formula Library
        </button>
      </section>
    );
  }

  return (
    <section className="mt-3 rounded-[12px] border border-white/[0.08] bg-white/[0.02] px-4 py-4 transition-all duration-500 ease-out">
      <div className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#9BA8BC]/42">
        Recommended formula
      </div>

      <div className="mt-1.5 text-[15px] font-semibold tracking-[-0.02em] text-white/86">
        {formulaName}
      </div>

      <button
        type="button"
        onClick={openExplanation}
        className="mt-4 block font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-[#AFC0FF]/68 transition hover:text-white"
      >
        What this formula does
      </button>

      <button
        type="button"
        onClick={onChooseAnother}
        className="mt-3 block font-mono text-[8px] font-semibold uppercase tracking-[0.15em] text-white/44 transition hover:text-white"
      >
        Browse Formula Library
      </button>

      {onContinue && (
        <button
          type="button"
          onClick={onContinue}
          className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[10px] border border-[#7898FF]/55 bg-[#4E7CFF] px-4 font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-white transition hover:bg-[#5B86FF]"
        >
          Use this formula
        </button>
      )}
    </section>
  );
}
