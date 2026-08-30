"use client";

import Image from "next/image";
import Link from "next/link";

const reasons = [
  ["Get GEORGE operational", "Help fund the final refinement, testing, AI resources, infrastructure, and production preparation."],
  ["Help prove the opportunity", "Real participation helps us learn where GEORGE can become exceptional across real-world objectives."],
  ["Be there early", "Founding Members are the people who chose to support GEORGE before the broader Early Access expansion."],
];

const capabilities = [
  ["Signals", "Useful moments can become actionable guidance."],
  ["Complex reasoning", "More demanding objectives can receive deeper support."],
  ["Memory", "Important context can carry forward when continuity matters."],
  ["Boardroom", "Bring stronger preparation into consequential decisions."],
  ["Fast response", "Support is designed to remain useful while the conversation is moving."],
  ["LIVE", "Discreet support for conversations while they are happening."],
];

const uses = [
  "Employment",
  "Entrepreneurship",
  "Sales",
  "Negotiation",
  "Leadership",
  "Communication",
  "Advocacy",
  "Creator conversations",
  "Accessibility",
  "Whatever comes next",
];

export default function EarlyAccessPage() {
  return (
    <main className="min-h-[100dvh] overflow-hidden bg-black text-white selection:bg-[#8DA7FF]/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(83,117,255,0.13),transparent_28%),radial-gradient(circle_at_88%_30%,rgba(110,136,255,0.06),transparent_30%),linear-gradient(180deg,#050607_0%,#000_52%,#030405_100%)]" />

      <header className="relative z-10 border-b border-white/[0.07] bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" aria-label="BRANESx home" className="group flex items-center gap-3">
            <Image src="/logofav.png" alt="Bx" width={48} height={48} className="h-10 w-10 object-contain" priority />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-white/42">BRANESx</span>
          </Link>
          <a href="#founding" className="rounded-full border border-[#7EA1FF]/30 bg-[#4E7CFF] px-4 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#5D87FF]">Founding Members</a>
        </div>
      </header>

      <section className="relative z-10 border-b border-white/[0.07] px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#7EA1FF]/25 bg-[#4E7CFF]/10 px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-[#DDE5FF]">GEORGE / Founding Access</div>
            <h1 className="mt-7 max-w-5xl font-mono text-[48px] font-black uppercase leading-[0.9] tracking-[-0.075em] sm:text-[78px] md:text-[96px]">
              Help us get
              <br />
              GEORGE operational.
            </h1>
            <p className="mt-7 max-w-3xl font-mono text-[21px] font-semibold uppercase leading-[1.2] tracking-[0.04em] text-white/92 sm:text-[29px]">Give GEORGE an objective. Move toward it.</p>
            <p className="mt-5 max-w-2xl text-[16px] leading-8 text-white/58 sm:text-[18px] sm:leading-9">GEORGE is beyond concept and core development. We are refining, testing, and preparing the system for production and portability. We're inviting a limited group of people to help us finish the journey.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#founding" className="inline-flex h-14 items-center justify-between rounded-[16px] bg-white px-5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-black transition hover:-translate-y-0.5">Become a Founding Member <span className="ml-8 text-[18px]">→</span></a>
              <a href="#george" className="inline-flex h-14 items-center justify-between rounded-[16px] border border-white/[0.12] bg-white/[0.025] px-5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:-translate-y-0.5">See what already exists <span className="ml-8 text-[18px] text-white/50">↓</span></a>
            </div>
          </div>
        </div>
      </section>

      <section id="founding" className="relative z-10 border-b border-white/[0.07] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.26em] text-[#9DB2FF]/60">Founding Members</p>
              <h2 className="mt-5 font-mono text-[38px] font-black uppercase leading-[0.94] tracking-[-0.06em] sm:text-[58px]">Be there before everyone else.</h2>
            </div>
            <div className="max-w-3xl">
              <p className="text-[17px] leading-8 text-white/60 sm:text-[19px] sm:leading-9">Founding Members are the people making a meaningful early commitment to GEORGE while it moves from substantial development into operation.</p>
              <p className="mt-6 text-[17px] leading-8 text-white/60 sm:text-[19px] sm:leading-9">Your support helps fund the work immediately in front of us. Your participation also gives us a chance to learn from people using GEORGE for real objectives as the system becomes operational.</p>
              <div className="mt-9 grid gap-3">
                {reasons.map(([title, description], index) => (
                  <div key={title} className="flex gap-5 rounded-[17px] border border-white/[0.08] bg-[#070809] p-5">
                    <div className="font-mono text-[9px] text-white/22">0{index + 1}</div>
                    <div><div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/78">{title}</div><p className="mt-2 text-[13px] leading-6 text-white/42">{description}</p></div>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-[20px] border border-[#7EA1FF]/18 bg-[#4E7CFF]/[0.045] p-6">
                <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#BFCBFF]/55">Initial operating milestone</div>
                <div className="mt-3 font-mono text-[48px] font-black tracking-[-0.06em] text-white">$2,500</div>
                <p className="mt-2 max-w-xl text-[13px] leading-6 text-white/42">Our initial working milestone is intentionally modest: enough to support the next stage of testing, refinement, AI resources, infrastructure, and production preparation.</p>
                <a href="mailto:founding@branesx.com?subject=GEORGE%20Founding%20Member" className="mt-6 inline-flex h-12 items-center rounded-[13px] bg-white px-5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-black transition hover:-translate-y-0.5">Talk about becoming a Founding Member →</a>
              </div>
              <p className="mt-5 font-mono text-[8px] uppercase leading-5 tracking-[0.14em] text-white/22">Founding Member qualification, contribution levels, benefits, and any continuing program terms will be finalized before enrollment is opened.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="george" className="relative z-10 border-b border-white/[0.07] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="max-w-4xl">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.26em] text-[#9DB2FF]/60">What already exists</p>
            <h2 className="mt-5 font-mono text-[38px] font-black uppercase leading-[0.94] tracking-[-0.06em] sm:text-[58px]">We're not starting from scratch.</h2>
            <p className="mt-6 max-w-3xl text-[16px] leading-8 text-white/55 sm:text-[18px] sm:leading-9">GEORGE already has substantial custom work, runtime architecture, LIVE infrastructure, telemetry, and deployment experience behind it. The work now is to refine it, test it, harden it, and prepare it to operate reliably at scale.</p>
          </div>
          <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(([name, description]) => (
              <div key={name} className="rounded-[18px] border border-white/[0.08] bg-[#070809] p-5"><div className="flex items-center justify-between"><span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">{name}</span><span className="h-1.5 w-1.5 rounded-full bg-[#8DA7FF]/80 shadow-[0_0_14px_rgba(141,167,255,0.45)]" /></div><p className="mt-5 text-[13px] leading-6 text-white/44">{description}</p></div>
            ))}
          </div>
          <div className="mt-8 rounded-[18px] border border-[#7EA1FF]/15 bg-[#4E7CFF]/[0.035] p-5 sm:p-6"><div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#BFCBFF]/55">What remains protected</div><p className="mt-4 max-w-4xl text-[13px] leading-7 text-white/45">Users can understand what GEORGE is designed to do without being given the proprietary implementation. Algorithms, prompts, thresholds, routing rules, proprietary decision structures, and source code remain protected trade secrets.</p></div>
        </div>
      </section>

      <section className="relative z-10 border-b border-white/[0.07] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div><p className="font-mono text-[9px] font-semibold uppercase tracking-[0.26em] text-[#9DB2FF]/60">Why we're building it</p><h2 className="mt-5 font-mono text-[38px] font-black uppercase leading-[0.94] tracking-[-0.06em] sm:text-[58px]">Intelligence should be an advantage — not a privilege.</h2></div>
            <div className="max-w-3xl text-[16px] leading-8 text-white/55 sm:text-[18px] sm:leading-9"><p>We believe a lack of substantial resources, social status, pedigree, or privilege doesn't have to determine who gets the opportunity to rise within your community.</p><p className="mt-6">We believe intelligent communication can make opportunity more equitable. GEORGE is being built to help more people <strong className="text-white/88">prepare, communicate, and execute</strong> with intelligence in high-impact situations.</p><p className="mt-6 text-white/75">Your ambition matters. Preparation matters. Intelligent communication can bring your goals closer to fruition.</p></div>
          </div>
          <div className="mt-12 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{uses.map((item, index) => <div key={item} className="min-h-[100px] rounded-[16px] border border-white/[0.08] bg-[#070809] p-4"><div className="font-mono text-[8px] tracking-[0.2em] text-white/22">0{index + 1}</div><div className="mt-6 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">{item}</div></div>)}</div>
        </div>
      </section>

      <section className="relative z-10 border-b border-white/[0.07] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1320px] text-center">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.26em] text-[#9DB2FF]/60">The journey</p>
          <h2 className="mx-auto mt-5 max-w-4xl font-mono text-[38px] font-black uppercase leading-[0.94] tracking-[-0.06em] sm:text-[58px]">Help us cross the distance.</h2>
          <div className="mx-auto mt-12 grid max-w-5xl gap-2 sm:grid-cols-5">{["Fund", "Test", "Learn", "Refine", "Operate"].map((step, index) => <div key={step} className="rounded-[15px] border border-white/[0.08] bg-[#070809] px-3 py-5"><div className="font-mono text-[8px] text-white/22">0{index + 1}</div><div className="mt-3 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-white/66">{step}</div></div>)}</div>
          <p className="mx-auto mt-8 max-w-2xl text-[14px] leading-7 text-white/38">Founding Members help us reach operational readiness. Once GEORGE is operational, we'll expand Early Access and begin working with creators and testers across the communities and use cases where GEORGE can matter most.</p>
        </div>
      </section>

      <footer className="relative z-10 px-5 py-12 sm:px-8"><div className="mx-auto flex max-w-[1320px] flex-col gap-5 border-t border-white/[0.07] pt-7 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Image src="/logofav.png" alt="Bx" width={34} height={34} className="h-7 w-7 object-contain opacity-80" /><div><div className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-white/55">BRANESx / GEORGE</div><div className="mt-1 font-mono text-[7px] uppercase tracking-[0.14em] text-white/22">R. Block Shares Holdings, LLC</div></div></div><div className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/25">GEORGE Early Access</div></div></footer>
    </main>
  );
}
