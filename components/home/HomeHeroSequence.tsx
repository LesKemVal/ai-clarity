"use client";

import { useEffect, useState } from "react";
import { requestFreshNormalBrowserSession } from "@/lib/george/session/store";

const MESSAGES = [
  "GEORGE quietly delivers the right facts, answers, and strategies to your screen, audio glasses, or earbuds while you confidently drive the conversation to completion.",
  "Use GEORGE during meetings, interviews, negotiations, sales calls, presentations, or any situation where conversation determines the outcome.",
  "Use GEORGE on Zoom, over the phone, face-to-face, by desktop or mobile device.",
] as const;

export function HomeHeroSequence() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [messageVisible, setMessageVisible] = useState(true);

  useEffect(() => {
    let active = true;
    const timers = new Set<number>();

    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (active) callback();
      }, delay);
      timers.add(timer);
    };

    const cycle = (index: number) => {
      schedule(() => {
        setMessageVisible(false);
        schedule(() => {
          const nextIndex = (index + 1) % MESSAGES.length;
          setMessageIndex(nextIndex);
          setMessageVisible(true);
          cycle(nextIndex);
        }, 700);
      }, 6500);
    };

    cycle(0);

    return () => {
      active = false;
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const startNormal = () => {
    requestFreshNormalBrowserSession();
    window.location.href = "/george";
  };

  const startLive = () => {
    window.localStorage.setItem("george_start_new_live", "1");
    window.location.href = "/george/live-entry?source=start";
  };

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-black text-white">
      <button
        type="button"
        onClick={startNormal}
        className="absolute left-5 top-5 z-40 flex h-[58px] w-[58px] items-center justify-center"
        aria-label="Open GEORGE"
      >
        <img
          src="/logofav.png"
          alt="Bx"
          className="h-[52px] w-[52px] object-contain opacity-95"
        />
      </button>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1500px] flex-col px-5 pb-6 pt-[14vh] sm:px-10 sm:pb-8 sm:pt-[18vh]">
        <div className="max-w-4xl">
          <h1 className="font-mono text-[42px] font-black uppercase leading-[0.94] tracking-[-0.07em] text-white sm:text-[68px] md:text-[88px]">
            Ask GEORGE.
          </h1>

          <div className="mt-8 min-h-[12rem] max-w-4xl sm:mt-10 sm:min-h-[14rem]">
            <div
              aria-live="polite"
              className={`flex min-h-[12rem] items-center rounded-[16px] border border-white/[0.12] bg-white/[0.025] px-5 py-6 text-[20px] font-medium leading-[1.5] text-white/80 transition-opacity duration-700 sm:min-h-[14rem] sm:px-8 sm:py-8 sm:text-[28px] sm:leading-[1.45] ${
                messageVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              {MESSAGES[messageIndex]}
            </div>
          </div>
        </div>

        <div className="mt-auto w-full pt-8">
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
