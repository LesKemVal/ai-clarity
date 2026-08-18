"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const messages = [
  "GEORGE follows the objective, context, pressure, and signals that matter while you work.",
  "It helps you prepare before the room, then supports execution when the conversation is happening.",
  "You discreetly receive a visual cue on your laptop, audio glasses, or earbud while the other party experiences only a confident, uninterrupted conversation."
];

export default function HomePage() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [rendered, setRendered] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
          window.setTimeout(() => setMessageIndex((current) => current + 1), 850);
        }
      }
    }, 18);

    return () => window.clearInterval(typing);
  }, [messageIndex]);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="george-public-home-mask">
        <div className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="flex h-[104px] items-start pt-3 sm:h-[116px]">
            <img src="/logofav.png" alt="Bx" className="h-[80px] w-[80px] object-contain sm:h-[90px] sm:w-[90px]" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-14 pt-[118px] sm:px-8 sm:pt-[132px]">
        <section className="border-b border-white/[0.08] pb-8">
          <p className="george-home-intelligent-label font-mono uppercase">INTELLIGENT COMMUNICATION</p>
          <div className="mt-4 min-h-[74px] max-w-3xl font-mono text-[15px] leading-7 text-white/58 sm:text-[16px]">
            {rendered}<span className="george-home-proof-caret" aria-hidden="true">▍</span>
          </div>
        </section>

        <section className="border-b border-white/[0.08] py-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/30">ROLE FIRST / CONVERSATION SETUP</p>
          <h2 className="mt-4 text-[30px] font-medium tracking-[-0.03em] text-white sm:text-[40px]">Start from your role in the discussion.</h2>
          <p className="mt-4 max-w-3xl font-mono text-[14px] leading-7 text-white/44">Choose your role and the kind of conversation you are preparing for. GEORGE shapes support around your objective, position, risks, and pressure points.</p>
          <Link href="/george/live-home" className="george-home-route-role mt-6 flex w-full items-center justify-between rounded-[1rem] border border-white/[0.12] px-5 py-4 font-mono text-[13px] uppercase tracking-[0.18em] text-white">
            <span>LIVE SUPPORT <span className="text-white/65">(EXECUTE)</span></span><span>→</span>
          </Link>
        </section>

        <section className="border-b border-white/[0.08] py-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/30">TRADITIONAL LIVE</p>
          <h2 className="mt-4 text-[30px] font-medium tracking-[-0.03em] text-white sm:text-[40px]">Build the room before you enter it.</h2>
          <p className="mt-4 max-w-3xl font-mono text-[14px] leading-7 text-white/44">Brief GEORGE step by step on the outcome, participants, known context, support mechanics, and readiness before entering LIVE.</p>
          <Link href="/george/live-entry?source=start" className="mt-6 flex w-full items-center justify-between rounded-[1rem] bg-[#4f7cff] px-5 py-4 font-mono text-[13px] uppercase tracking-[0.18em] text-white">
            <span>BEGIN TRADITIONAL LIVE</span><span>→</span>
          </Link>
        </section>

        <section className="border-b border-white/[0.08] py-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/30">NORMAL GEORGE</p>
          <h2 className="mt-4 text-[30px] font-medium tracking-[-0.03em] text-white sm:text-[40px]">Work through the situation first. Bring the work with you.</h2>
          <p className="mt-4 max-w-3xl font-mono text-[14px] leading-7 text-white/44">Think, prepare, decide, write, rehearse, compare options, or work through uncertainty before moving into LIVE.</p>
          <Link href="/george" className="george-home-route-ask mt-6 flex w-full items-center justify-between rounded-[1rem] px-5 py-4 font-mono text-[13px] uppercase tracking-[0.18em] text-white">
            <span>ASK GEORGE <span className="text-black/45">(PREPARE)</span></span><span>→</span>
          </Link>
        </section>

        <section className="border-b border-white/[0.08] py-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/30">HELP / HOW TO USE GEORGE</p>
          <h2 className="mt-4 text-[30px] font-medium tracking-[-0.03em] text-white sm:text-[40px]">Understand the routes before you choose one.</h2>
          <p className="mt-4 max-w-3xl font-mono text-[14px] leading-7 text-white/44">See how Normal GEORGE, Role First, Traditional LIVE, support mechanics, and LIVE execution fit together.</p>
          <Link href="/help" className="mt-6 flex w-full items-center justify-between rounded-[1rem] border border-white/[0.10] px-5 py-4 font-mono text-[13px] uppercase tracking-[0.18em] text-white/60">
            <span>HELP <span className="text-white/30">(HOW TO USE GEORGE)</span></span><span>→</span>
          </Link>
        </section>

        <section className="border-b border-white/[0.08] py-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/32">GEORGE · OPERATIONAL INTELLIGENCE</p>
          <h1 className="mt-4 max-w-4xl text-[40px] font-medium leading-[1.03] tracking-[-0.045em] text-white sm:text-[58px]">Know what matters. Know what to do next.</h1>
          <p className="mt-4 max-w-3xl font-mono text-[15px] leading-7 text-white/54 sm:text-[16px]">GEORGE helps you plan, prepare, decide, write, negotiate, learn, and execute—or work with you LIVE when the outcome depends on what happens in the room.</p>
        </section>

        <section className="border-b border-white/[0.08] py-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/28">HOW GEORGE WORKS</p>
          <div className="mt-4 font-mono text-[18px] leading-8 text-white/72 sm:text-[20px]">Context → Assessment → Strategy → Execution → Learning</div>
          <p className="mt-4 max-w-3xl font-mono text-[14px] leading-7 text-white/42">GEORGE uses your role, objective, known context, prior work, and live signals to determine the highest valued response.</p>
        </section>



        <footer className="george-public-home-footer">
          <div className="george-public-home-footer-line" />
          <div className="george-public-home-footer-row">
            <span>GEORGE · OPERATIONAL INTELLIGENCE</span>
            <span>PREPARE · EXECUTE · ADAPT</span>
          </div>
        </footer>

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
