"use client";

import { useEffect, useRef, useState } from "react";
import type {
  MomentAssessment,
  MomentMarkerKind,
} from "@/lib/george/chat/message-types";

type MomentMarkerProps = {
  assessment: MomentAssessment;
};

const markerPresentation: Record<
  MomentMarkerKind,
  {
    glyph: string;
    label: string;
  }
> = {
  momentum: {
    glyph: "🔥",
    label: "Momentum",
  },
  alignment: {
    glyph: "🎯",
    label: "Alignment",
  },
  movement: {
    glyph: "🏃",
    label: "Movement",
  },
  interaction: {
    glyph: "🙌",
    label: "Interaction",
  },
  outcome: {
    glyph: "🏁",
    label: "Outcome",
  },
  deft_excellence: {
    glyph: "BX",
    label: "Deft execution",
  },
};

export default function MomentMarker({
  assessment,
}: MomentMarkerProps) {
  const [open, setOpen] = useState(false);
  const [activePulse, setActivePulse] = useState(true);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const presentation = markerPresentation[assessment.marker];

  useEffect(() => {
    if (!activePulse) return;

    const timer = window.setTimeout(() => {
      setActivePulse(false);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [activePulse]);

  const toggleOpen = () => {
    setActivePulse(false);
    setOpen((current) => !current);
  };

  return (
    <div ref={hostRef} className="mb-3 max-w-[42rem]">
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={`${open ? "Close" : "Open"} GEORGE moment assessment`}
        aria-expanded={open}
        className={`group flex max-w-full items-center gap-2 text-left transition ${
          activePulse ? "george-moment-marker-pulse" : ""
        }`}
      >
        <span
          aria-hidden="true"
          className={`shrink-0 leading-none ${
            assessment.marker === "deft_excellence"
              ? "font-mono text-[10px] font-bold tracking-[0.08em] text-white/78"
              : "text-[15px]"
          }`}
        >
          {presentation.glyph}
        </span>

        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.19em] text-white/34 transition group-hover:text-white/54">
          Moment
        </span>

        <span
          aria-hidden="true"
          className="h-px w-3 shrink-0 bg-white/14"
        />

        <span className="truncate font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-white/52 transition group-hover:text-white/72">
          {presentation.label}
        </span>

        <span
          aria-hidden="true"
          className={`ml-0.5 shrink-0 font-mono text-[10px] text-white/24 transition duration-200 group-hover:text-white/48 ${
            open ? "rotate-90" : ""
          }`}
        >
          →
        </span>
      </button>

      {open ? (
        <section
          aria-label="GEORGE moment assessment"
          className="mt-3 border-l border-white/[0.08] pl-3 sm:pl-4"
        >
          <p className="max-w-[40rem] text-[13px] leading-6 text-white/68">
            {assessment.observed}
          </p>

          {assessment.evidence.length > 0 ? (
            <div className="mt-3">
              <div className="font-mono text-[8px] font-semibold uppercase tracking-[0.2em] text-white/24">
                Evidence
              </div>

              <div className="mt-1.5 space-y-1">
                {assessment.evidence.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex max-w-[40rem] gap-2 text-[12px] leading-5 text-white/44"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[8px] h-px w-2 shrink-0 bg-white/18"
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-5">
            <div>
              <div className="font-mono text-[8px] font-semibold uppercase tracking-[0.2em] text-white/24">
                Why it matters
              </div>

              <p className="mt-1 text-[12px] leading-5 text-white/48">
                {assessment.whyItMatters}
              </p>
            </div>

            <div>
              <div className="font-mono text-[8px] font-semibold uppercase tracking-[0.2em] text-white/24">
                Focus
              </div>

              <p className="mt-1 text-[12px] leading-5 text-white/62">
                {assessment.focus}
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
