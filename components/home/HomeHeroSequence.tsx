"use client";

import { useEffect, useState } from "react";
import { requestFreshNormalBrowserSession } from "@/lib/george/session/store";

const COMMUNICATION_LEVELS = [
  "Smart",
  "INTELLIGENT",
  "BRILLIANT",
] as const;

const OPERATIONAL_SECTIONS = [
  {
    heading: "Continuous tracking",
    paragraph:
      "You don't need to pause the conversation or press buttons. While you're speaking with a client, investor, interviewer, or candidate, GEORGE continuously follows the conversation in the background and identifies the exact moment to assist.",
  },
  {
    heading: "Instant adaptation",
    paragraph:
      "If an unexpected question comes up, GEORGE doesn't simply search your uploaded notes. He combines your pitch decks, documents, case files, instructions, and conversation context with his own operational knowledge to generate the strongest response strategy for that moment.",
  },
  {
    heading: "Asymmetrical advantage",
    paragraph:
      "Whether you prefer a visual cue on your laptop, a line on your audio glasses, or a quiet phrase in your earbud, the person across from you experiences only a confident, uninterrupted professional conversation.",
  },
  {
    heading: "Dynamic redirection",
    paragraph:
      "If a negotiation stalls, a prospect raises an unexpected objection, or an interviewer suddenly changes direction, GEORGE immediately abandons the previous strategy, reassesses the conversation, and delivers new guidance to keep you moving toward your objective.",
  },
  {
    heading: "Relentless objective focus",
    paragraph:
      "Every recommendation GEORGE delivers to your screen, audio glasses, or earbuds is designed to move the conversation one step closer to your objective. Every cue, every response, and every strategy serves a purpose.",
  },
] as const;

export function HomeHeroSequence() {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [typedParagraph, setTypedParagraph] = useState("");
  const [messageVisible, setMessageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    let active = true;
    const timers = new Set<number>();
    const section = OPERATIONAL_SECTIONS[sectionIndex];
    setMessageVisible(true);

    const LEVEL_SETTLE_MS = 720;

    if (reducedMotion) {
      setTypedParagraph(section.paragraph);
    } else {
      setTypedParagraph("");

      const typingStartTimer = window.setTimeout(() => {
        if (!active) return;

        let characterIndex = 0;
        const typingTimer = window.setInterval(() => {
          characterIndex += 1;
          setTypedParagraph(section.paragraph.slice(0, characterIndex));

          if (characterIndex >= section.paragraph.length) {
            window.clearInterval(typingTimer);
            timers.delete(typingTimer);
          }
        }, 28);

        timers.add(typingTimer);
      }, LEVEL_SETTLE_MS);

      timers.add(typingStartTimer);
    }

    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (active) callback();
      }, delay);
      timers.add(timer);
    };

    schedule(() => {
      setMessageVisible(false);
      schedule(() => {
        if (!active) return;
        setSectionIndex((current) =>
          (current + 1) % OPERATIONAL_SECTIONS.length,
        );
      }, reducedMotion ? 180 : 600);
    }, reducedMotion
      ? 8000
      : 720 + section.paragraph.length * 28 + 8500);

    return () => {
      active = false;
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, [reducedMotion, sectionIndex]);

  const startNormal = () => {
    requestFreshNormalBrowserSession();
    window.location.href = "/george";
  };

  const startLive = () => {
    window.location.href = "/george/live-entry?source=orientation";
  };

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-black text-white">
      <button
        type="button"
        onClick={startNormal}
        className="absolute left-5 top-5 z-40 flex h-[86px] w-[86px] items-center justify-center sm:h-[104px] sm:w-[104px]"
        aria-label="Open GEORGE"
      >
        <img
          src="/logofav.png"
          alt="Bx"
          className="h-[78px] w-[78px] object-contain opacity-95 sm:h-[96px] sm:w-[96px]"
        />
      </button>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1500px] flex-col px-5 pb-6 pt-[19vh] sm:px-10 sm:pb-8 sm:pt-[23vh]">
        <div className="max-w-4xl">
          <h1 className="font-mono tracking-[-0.045em]">
            <span className="flex flex-col items-start">
              <span className="relative block h-[36px] w-full sm:h-[54px] md:h-[66px]">
                <span
                  key={`level-${sectionIndex}`}
                  className={`george-home-level-fade absolute bottom-0 left-0 block text-[34px] font-black leading-none sm:text-[52px] md:text-[64px] ${
                    COMMUNICATION_LEVELS[
                      sectionIndex % COMMUNICATION_LEVELS.length
                    ] === "BRILLIANT"
                      ? "text-[#9fb7ff] [text-shadow:0_0_10px_rgba(126,156,255,0.75),0_0_24px_rgba(78,124,255,0.55)]"
                      : COMMUNICATION_LEVELS[
                            sectionIndex % COMMUNICATION_LEVELS.length
                          ] === "INTELLIGENT"
                        ? "text-[#d4dcff]"
                        : "text-white"
                  }`}
                >
                  {COMMUNICATION_LEVELS[
                    sectionIndex % COMMUNICATION_LEVELS.length
                  ]}
                </span>
              </span>

              <span className="mt-3 block text-[34px] font-medium leading-none text-white/72 sm:mt-4 sm:text-[52px] md:text-[64px]">
                Communication
              </span>
            </span>
          </h1>
          <div className="mt-8 min-h-[12rem] max-w-4xl sm:mt-10 sm:min-h-[14rem]">
            <div
              aria-live="polite"
              className={`george-motion-fade-soft min-h-[12rem] px-1 py-2 text-white/80 transition-opacity duration-700 motion-reduce:transition-none sm:min-h-[14rem] sm:px-2 sm:py-4 ${
                messageVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="relative z-10 flex h-[18px] items-center justify-between gap-4 [perspective:700px]">
                <p
                  key={`capability-${sectionIndex}`}
                  className="george-home-capability-flip absolute left-0 top-0 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/68"
                >
                  {OPERATIONAL_SECTIONS[sectionIndex].heading}
                </p>
              </div>
              <p className="relative z-10 mt-4 max-w-3xl text-[20px] font-medium leading-[1.55] sm:text-[28px] sm:leading-[1.45]">
                {typedParagraph}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto w-full pt-8">
          <div className="mb-4 flex items-center gap-1.5 px-1" aria-label={`Rendering ${sectionIndex + 1} of ${OPERATIONAL_SECTIONS.length}`}>
            {OPERATIONAL_SECTIONS.map((_, index) => (
              <span key={index} className={`h-[2px] rounded-full transition-colors duration-500 motion-reduce:transition-none ${index === sectionIndex ? "w-8 bg-[#4E7CFF]" : "w-3 bg-white/20"}`} />
            ))}
          </div>
          <div className="mx-auto grid max-w-[1040px] grid-cols-1 gap-2.5 md:grid-cols-3 md:gap-3">
            <button
              type="button"
              onClick={startNormal}
              className="group flex h-12 w-full items-center justify-between rounded-[14px] bg-white px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-black transition hover:-translate-y-[1px] sm:h-[52px] sm:text-[11px] sm:tracking-[0.22em]"
            >
              <span>
                Ask GEORGE <span className="text-black/45">(Prepare)</span>
              </span>
              <span className="text-[20px]">→</span>
            </button>
            <button
              type="button"
              onClick={startLive}
              className="group flex h-12 w-full items-center justify-between rounded-[14px] border border-[#7EA1FF]/35 bg-[#4E7CFF] px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:-translate-y-[1px] hover:bg-[#5B86FF] sm:h-[52px] sm:text-[11px] sm:tracking-[0.18em]"
            >
              <span>
                LIVE Support <span className="text-white/70">(Execute)</span>
              </span>
              <span className="text-[20px]">→</span>
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/help";
              }}
              className="group flex h-12 w-full items-center justify-between rounded-[14px] border border-white/14 bg-black px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:-translate-y-[1px] hover:border-white/24 hover:bg-white/[0.03] sm:h-[52px] sm:text-[11px] sm:tracking-[0.2em]"
            >
              <span>
                Help <span className="text-white/42">(How to use GEORGE)</span>
              </span>
              <span className="text-[18px] text-white/66">→</span>
            </button>
          </div>
        </div>
      </div>

    </section>
  );
}
