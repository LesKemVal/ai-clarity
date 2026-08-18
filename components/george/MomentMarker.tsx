"use client";

import { useEffect, useRef, useState } from "react";
import type {
  MomentAssessment,
  MomentMarkerKind,
} from "@/lib/george/chat/message-types";

type MomentMarkerProps = {
  assessment: MomentAssessment;
};

const markerGlyph: Record<MomentMarkerKind, string> = {
  momentum: "🔥",
  alignment: "🎯",
  movement: "🏃",
  interaction: "🙌",
  outcome: "🏁",
  deft_excellence: "BX",
};

export default function MomentMarker({
  assessment,
}: MomentMarkerProps) {
  const [open, setOpen] = useState(false);
  const [activePulse, setActivePulse] = useState(true);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;

    if (!host || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.intersectionRatio === 0) {
          setActivePulse(false);
        }
      },
      { threshold: [0, 0.1] },
    );

    observer.observe(host);

    return () => observer.disconnect();
  }, []);

  const handleOpen = () => {
    setActivePulse(false);
    setOpen(true);
  };

  return (
    <div ref={hostRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Open GEORGE moment assessment"
        aria-expanded={open}
        className={`absolute -right-1 -top-3 z-20 flex h-6 min-w-6 items-center justify-center rounded-full border border-white/[0.08] bg-[#080A0D]/94 px-1.5 text-[10px] font-semibold leading-none text-white/82 shadow-[0_6px_22px_rgba(0,0,0,0.34)] transition hover:border-white/[0.16] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35 ${
          activePulse && !open ? "george-moment-marker-pulse" : ""
        }`}
      >
        {markerGlyph[assessment.marker]}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/48 px-4 backdrop-blur-[6px]">
          <button
            type="button"
            aria-label="Close GEORGE moment assessment"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="GEORGE moment assessment"
            className="relative z-10 w-full max-w-[430px] rounded-[1.15rem] border border-white/[0.08] bg-[#07090D]/96 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.58)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/30">
                  GEORGE · MOMENT
                </div>

                <div className="mt-3 text-[17px] leading-7 text-white/88">
                  {assessment.observed}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.06] text-[18px] text-white/38 transition hover:border-white/[0.12] hover:text-white/72"
              >
                ×
              </button>
            </div>

            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <div className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/28">
                Evidence
              </div>

              <div className="mt-2 space-y-2">
                {assessment.evidence.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex gap-2 text-[13px] leading-6 text-white/58"
                  >
                    <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-white/32" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <div className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/28">
                Why it matters
              </div>

              <p className="mt-2 text-[13px] leading-6 text-white/62">
                {assessment.whyItMatters}
              </p>
            </div>

            <div className="mt-5 rounded-[0.85rem] border border-white/[0.06] bg-white/[0.025] p-3.5">
              <div className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/28">
                Focus
              </div>

              <p className="mt-2 text-[13px] leading-6 text-white/72">
                {assessment.focus}
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
