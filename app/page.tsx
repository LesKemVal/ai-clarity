"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const messages = [
  "GEORGE works across preparation, execution, and learning—following the objective, context, pressure, and signals that matter while you work.",
  "Before the room, it helps you think, prepare, decide, write, rehearse, and choose an operational strategy.",
  "During LIVE, support reaches you discreetly while the other party experiences only a confident, uninterrupted conversation."
];

export default function HomePage() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [rendered, setRendered] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      setRendered(messages[messages.length - 1]);
      setMessageIndex(messages.length - 1);
      return;
    }

    let charIndex = 0;
    const active = messages[messageIndex];
    setRendered("");

    const typing = window.setInterval(() => {
      charIndex += 1;
      setRendered(active.slice(0, charIndex));

      if (charIndex >= active.length) {
        window.clearInterval(typing);

        if (messageIndex < messages.length - 1) {
          window.setTimeout(
            () => setMessageIndex((current) => current + 1),
            2200
          );
        }
      }
    }, 34);

    return () => window.clearInterval(typing);
  }, [messageIndex]);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="george-public-home-mask">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="flex h-[104px] items-start pt-3 sm:h-[116px]">
            <img
              src="/logofav.png"
              alt="Bx"
              className="h-[80px] w-[80px] object-contain sm:h-[90px] sm:w-[90px]"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-14 pt-[150px] sm:px-8 sm:pt-[166px]">
        <section className="border-b border-white/[0.08] pb-8 sm:pb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/28">
            INTELLIGENT COMMUNICATION
          </p>

          <div className="mt-5 max-w-4xl font-mono text-[24px] leading-[1.42] tracking-[-0.025em] text-white/88 sm:text-[35px] sm:leading-[1.34]">
            {rendered}
            <span className="george-home-proof-caret" aria-hidden="true">
              ▍
            </span>
          </div>

        </section>

        <section className="border-b border-white/[0.08] pb-10 pt-8 sm:pb-14 sm:pt-9">
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-12">
              <p className="mb-3 font-mono text-[14px] uppercase leading-6 tracking-[0.18em] text-white/30 sm:mb-4 sm:text-[16px] sm:leading-7">
                Choose how you want to work with GEORGE.
              </p>
            </div>

            <Link
              href="/george"
              className="george-home-route-surface group flex flex-col justify-between px-1 py-3 lg:col-span-5 lg:px-2 lg:py-4"
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/34">
                  NORMAL GEORGE · PREPARE
                </p>

                <h2 className="mt-5 max-w-xl text-[29px] font-medium leading-[1.06] tracking-[-0.04em] text-white/78 sm:text-[38px]">
                  Ask GEORGE.
                </h2>

                <p className="mt-4 max-w-xl font-mono text-[13px] leading-6 text-white/38">
                  Plan, decide, write, compare options, rehearse, research, or
                  work through uncertainty. Determine whether intelligent LIVE
                  support is really your next best move.
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.17em] text-white/52 transition group-hover:text-white/82">
                <span>Ask GEORGE</span>
                <span>→</span>
              </div>
            </Link>

            <Link
              href="/george/live-entry?source=start"
              className="george-home-route-surface george-home-route-traditional group flex flex-col justify-between px-1 py-3 lg:col-span-7 lg:px-3 lg:py-4"
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/58">
                  TRADITIONAL LIVE · FULL BRIEFING
                </p>

                <h2 className="mt-5 max-w-2xl text-[32px] font-medium leading-[1.04] tracking-[-0.045em] text-white/82 sm:text-[46px]">
                  Build the room before you enter it.
                </h2>

                <p className="mt-5 max-w-2xl font-mono text-[13px] leading-6 text-white/44 sm:text-[14px] sm:leading-7">
                  Build the brief around your goal, the participants, known context,
                  support mechanics, and readiness. Use this route when you want
                  the most deliberate preparation before LIVE begins.
                </p>
              </div>

              <div className="mt-7 flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.18em] text-[#7EA1FF]/78 transition group-hover:text-[#AFC0FF]">
                <span>Begin Traditional LIVE</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </section>

        <section className="border-b border-white/[0.08] py-10 sm:py-14">
          <Link
            href="/george/live-home"
            className="george-home-route-surface group flex flex-col justify-between px-1 py-3 sm:px-2 sm:py-4"
          >
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
                  ROLE FIRST · LIVE SUPPORT
                </p>

                <h2 className="mt-4 text-[30px] font-medium leading-[1.06] tracking-[-0.04em] text-white/78 sm:text-[40px]">
                  Start from your position—your role in the conversation.
                </h2>
              </div>

              <div className="lg:pt-7">
                <p className="max-w-xl font-mono text-[13px] leading-6 text-white/40 sm:text-[14px] sm:leading-7">
                  GEORGE shapes preparation and LIVE support around your
                  responsibilities, objective, position, risks, leverage, and
                  pressure points before the conversation begins.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.17em] text-white/52 transition group-hover:text-white/82">
              <span>Start Role First</span>
              <span>→</span>
            </div>
          </Link>
        </section>

        <section className="grid border-b border-white/[0.08] py-10 sm:py-14 md:grid-cols-2 md:gap-5">
          <Link
            href="/george/library"
            className="group flex flex-col justify-between px-2 py-3 sm:px-3 sm:py-4"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
                OPERATIONAL LIBRARY
              </p>

              <h2 className="mt-4 text-[27px] font-medium leading-[1.06] tracking-[-0.035em] text-white/72 sm:text-[32px]">
                Work with what you control.
              </h2>

              <p className="mt-4 font-mono text-[13px] leading-6 text-white/36">
                Review and manage formulas, scripts, execution history, and
                operational strategy connected to any conversation, negotiation,
                or case. Rhetorical presentation is often key to successful
                outcomes.
              </p>
            </div>

            <div className="mt-7 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.17em] text-white/42 transition group-hover:text-white/72">
              <span>Open Library</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            href="/george/marketplace"
            className="group mt-5 flex flex-col justify-between px-2 py-3 sm:px-3 sm:py-4 md:mt-0 md:border-l md:border-white/[0.06] md:pl-7"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
                STRATEGY MARKETPLACE
              </p>

              <h2 className="mt-4 text-[27px] font-medium leading-[1.06] tracking-[-0.035em] text-white/92 sm:text-[32px]">
                Choose another operational strategy.
              </h2>

              <p className="mt-4 font-mono text-[13px] leading-6 text-white/46">
                Start with GEORGE&apos;s recommendation, understand why it fits,
                then inspect alternatives when another approach may improve the outcome.
              </p>
            </div>

            <div className="mt-7 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.17em] text-white/42 transition group-hover:text-white/72">
              <span>Open Marketplace</span>
              <span>→</span>
            </div>
          </Link>
        </section>

        <section className="py-9 sm:py-11">
          <Link
            href="/help"
            className="group flex items-center justify-between gap-5 border-b border-white/[0.08] pb-7"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/26">
                HELP · HOW TO USE GEORGE
              </p>

              <p className="mt-3 max-w-2xl font-mono text-[13px] leading-6 text-white/44">
                Understand Normal GEORGE, Role First, Traditional LIVE,
                preparation, support mechanics, and LIVE execution.
              </p>
            </div>

            <span className="font-mono text-[14px] text-white/48 transition group-hover:text-white">
              →
            </span>
          </Link>
        </section>

        <footer className="george-public-home-footer">
          <div className="george-public-home-footer-line" />
          <div className="george-public-home-footer-row">
            <span>GEORGE · OPERATIONAL INTELLIGENCE</span>
            <span>PREPARE · EXECUTE · ADAPT</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
