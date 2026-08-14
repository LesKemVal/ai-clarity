"use client";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { operationalMotion } from "@/lib/george/ui/operational-motion";
import type { LiveOutcomeObservation } from "@/lib/george/live-runtime/live-outcome-review";

type LiveOutcomeReviewPanelProps = {
  observation: LiveOutcomeObservation;
  onChange: (next: LiveOutcomeObservation) => void;
  onClose: () => void;
  onAccept: () => void;
  onContinue: () => void;
};

export function LiveOutcomeReviewPanel({
  observation,
  onChange,
  onClose,
  onAccept,
  onContinue,
}: LiveOutcomeReviewPanelProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Close outcome review"
      onClick={onClose}
      onKeyDown={(event) => {
        if (
          event.key === "Escape" ||
          event.key === "Enter" ||
          event.key === " "
        ) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black george-motion-fade-soft/58 px-4 backdrop-blur-[14px]"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`relative w-[min(380px,calc(100vw-32px))] px-3 py-3 md:px-5 md:py-4 ${operationalMotion.anchorPanel} ${operationalMotion.surface}`}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[9px] uppercase tracking-[0.22em] text-white/24">
            Outcome Review
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[13px] text-white/28 transition hover:text-white/72"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          {observation.milestone && (
            <div className="rounded-[0.75rem] border border-[#8FB6C9]/14 bg-[#8FB6C9]/[0.045] px-3 py-2">
              <div className="text-[9px] uppercase tracking-[0.18em] text-[#D7DCFF]/44">
                Milestone
              </div>
              <div className="mt-1 text-[12px] leading-5 text-[#D7DCFF]/74">
                {observation.milestone.replace(/^Milestone:\s*/i, "")}
              </div>
            </div>
          )}

          <label className="block">
            <span className="block text-[9px] uppercase tracking-[0.18em] text-white/24">
              Desired outcome
            </span>
            <Input
              value={observation.desiredOutcome}
              onChange={(event) =>
                onChange({
                  ...observation,
                  desiredOutcome: event.target.value,
                })
              }
              className="mt-1 w-full rounded-[0.65rem] border border-white/[0.055] bg-black/[0.20] px-2.5 py-2 text-[12px] text-[#D7DBE4]/72 outline-none focus:border-[#8FB6C9]/24"
            />
          </label>

          <div>
            <div className="mb-1 text-[9px] uppercase tracking-[0.18em] text-white/24">
              Observed progress
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  "unknown",
                  "improving",
                  "stable",
                  "declining",
                ] as const
              ).map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...observation,
                      observedProgress: state,
                    })
                  }
                  className={`rounded-[0.6rem] border px-2 py-1.5 text-left text-[10px] uppercase tracking-[0.12em] transition ${
                    observation.observedProgress === state
                      ? "border-[#8FB6C9]/24 bg-[#8FB6C9]/[0.06] text-[#D7DCFF]/78"
                      : "border-white/[0.055] bg-black/[0.14] text-white/34 hover:text-white/62"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="block text-[9px] uppercase tracking-[0.18em] text-white/24">
              Confidence · {observation.confidence}%
            </span>

            <input
              type="range"
              min="0"
              max="100"
              value={observation.confidence}
              onChange={(event) =>
                onChange({
                  ...observation,
                  confidence: Number(event.target.value),
                })
              }
              className="mt-2 w-full"
            />
          </label>

          <label className="block">
            <span className="block text-[9px] uppercase tracking-[0.18em] text-white/24">
              Possible secondary outcome
            </span>

            <Textarea
              value={observation.possibleSecondaryOutcome}
              onChange={(event) =>
                onChange({
                  ...observation,
                  possibleSecondaryOutcome: event.target.value,
                })
              }
              rows={2}
              className="mt-1 w-full resize-none rounded-[0.65rem] border border-white/[0.055] bg-black/[0.20] px-2.5 py-2 text-[12px] leading-5 text-[#D7DBE4]/72 outline-none focus:border-[#8FB6C9]/24"
            />
          </label>

          <label className="block">
            <span className="block text-[9px] uppercase tracking-[0.18em] text-white/24">
              Notes
            </span>

            <Textarea
              value={observation.notes}
              onChange={(event) =>
                onChange({
                  ...observation,
                  notes: event.target.value,
                })
              }
              rows={2}
              className="mt-1 w-full resize-none rounded-[0.65rem] border border-white/[0.055] bg-black/[0.20] px-2.5 py-2 text-[12px] leading-5 text-[#D7DBE4]/72 outline-none focus:border-[#8FB6C9]/24"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-1">
          <button
            type="button"
            onClick={onAccept}
            className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/62 transition hover:text-white active:scale-[0.98]"
          >
            Accept and exit
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="block w-full py-1.5 text-left text-[11px] uppercase tracking-[0.16em] text-white/42 transition hover:text-white/72 active:scale-[0.98]"
          >
            Continue LIVE
          </button>
        </div>
      </div>
    </div>
  );
}
