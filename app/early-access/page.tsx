"use client";

import Image from "next/image";
import Link from "next/link";

const useCases = [
  "Employment",
  "Entrepreneurship",
  "Sales",
  "Negotiation",
  "Leadership",
  "Communication",
  "Advocacy",
  "Creator conversations",
  "Learning",
  "Your objective",
];

const capabilities = [
  ["Signals", "Meaningful moments can become actionable guidance."],
  ["Complex reasoning", "More demanding objectives can receive deeper support."],
  ["Memory", "Important context can carry forward when continuity matters."],
  ["Boardroom", "Bring stronger preparation into consequential decisions."],
  ["Fast response", "Support is designed to stay useful while the conversation is moving."],
  ["LIVE", "Discreet support for conversations while they are happening."],
];

const tiers = [
  {
    name: "Smart",
    price: "Free",
    description: "A low-barrier way to experience GEORGE and expand access to intelligent conversation.",
    href: "/george",
    cta: "Try GEORGE",
  },
  {
    name: "Intelligent",
    price: "$9.99 / month",
    description: "Everyday GEORGE for planning, communication, execution, and stronger support when needed.",
    href: "/activate?tier=intelligent",
    cta: "Get Intelligent",
  },
  {
    name: "Brilliant",
    price: "$25 / month",
    description: "Higher-capability GEORGE for demanding objectives and conversations where more support matters.",
    href: "/activate?tier=brilliant",
    cta: "Get Brilliant",
    featured: true,
  },
];

export default function EarlyAccessPage() {
  return (
    <main className="min-h-[100dvh] overflow-hidden bg-black text-white selection:bg-[#8DA7FF]/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(83,117,255,0.13),transparent_28%),radial-gradient(circle_at_88%_30%,rgba(110,136,255,0.06),transparent_30%),linear-gradient(180deg,#050607_0%,#000_52%,#030405_100%)]" />

      <header className="relative z-10 border-b border-white/[0.07] bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" aria-label="GEORGE home" className="group flex items-center gap-3">
            <Image src="/logofav.png" alt="Bx" width={48} height={48} className="h-10 w-10 object-contain opacity-95 transition group-hover:opacity-100" priority />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-white/42">BRANESx</span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-6">
            <a href="#why" className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-white/42 transition hover:text-white sm:inline">Why GEORGE</a>
            <a href="#creators" className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-white/42 transition hover:text-white sm:inline">Creators</a>
            <a href="#access" className="rounded-full border border-[#7EA1FF]/30 bg-[#4E7CFF] px-4 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_8px_30px_rgba(40,75,190,0.2)] transition hover:bg-[#5D87FF]">Early Access</a>
          </nav>
        </div>
      </header>

      <section className="relative z-10 border-b border-white/[0.07] px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#7EA1FF]/25 bg-[#4E7CFF]/10 px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-[#DDE5FF]">
              GEORGE / Early Access
            </div>

            <h1 className="mt-7 max-w-5xl font-mono text-[48px] font-black uppercase leading-[0.9] tracking-[-0.075em] text-white sm:text-[78px] md:text-[96px]">
              Give GEORGE
              <br />
              an objective.
            </h1>

            <div className="mt-7 max-w-3xl">
              <p className="font-mono text-[21px] font-semibold uppercase leading-[1.2] tracking-[0.04em] text-white/92 sm:text-[29px]">
                Move toward it.
              </p>
              <p className="mt-5 max-w-2xl text-[16px] leading-8 text-white/58 sm:text-[18px] sm:leading-9">
                Intelligent conversation for planning, communication, and execution in high-impact situations.
              </p>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#access" className="inline-flex h-14 items-center justify-between rounded-[16px] bg-white px-5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-black transition hover:-translate-y-0.5">
                Get Early Access <span className="ml-10 text-[18px]">→</span>
              </a>
              <a href="#creators" className="inline-flex h-14 items-center justify-between rounded-[16px] border border-white/[0.12] bg-white/[0.025] px-5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:-translate-y-0.5 hover:border-white/[0.22]">
                Become a Founding Creator <span className="ml-8 text-[18px] text-white/50">→</span>
              </a>
            </div>

            <p className="mt-6 max-w-2xl font-mono text-[9px] uppercase leading-5 tracking-[0.16em] text-white/30">
              GEORGE is beyond concept and core development. Early Access helps fund refinement, testing, AI resources, infrastructure, and production preparation.
            </p>
          </div>
        </div>
      </section>

      <section id="why" className="relative z-10 border-b border-white/[0.07] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.26em] text-[#9DB2FF]/60">Why GEORGE</p>
            <h2 className="mt-5 max-w-xl font-mono text-[36px] font-black uppercase leading-[0.95] tracking-[-0.06em] sm:text-[54px]">
              Intelligence should be an advantage — not a privilege.
            </h2>
          </div>

          <div className="max-w-2xl text-[16px] leading-8 text-white/58 sm:text-[18px] sm:leading-9">
            <p>
              We believe a lack of substantial resources, social status, or pedigree should not exclude anyone from achieving their goals.
            </p>
            <p className="mt-6">
              We believe intelligent communication can make opportunity more equitable. GEORGE is being built so more people can <strong className="font-semibold text-white/88">prepare, communicate, and execute</strong> with intelligence in high-impact situations.
            </p>
            <p className="mt-6 text-white/76">
              Your ambition sets the direction. Preparation builds the path. Intelligent communication can bring your goals closer to fruition.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-b border-white/[0.07] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="max-w-3xl">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.26em] text-[#9DB2FF]/60">Execution</p>
            <h2 className="mt-5 font-mono text-[38px] font-black uppercase leading-[0.94] tracking-[-0.06em] sm:text-[58px]">
              Instead of asking AI a question, give GEORGE an objective.
            </h2>
            <p className="mt-6 max-w-2xl text-[16px] leading-8 text-white/55 sm:text-[18px] sm:leading-9">
              GEORGE is designed to help you move toward what you want to accomplish — before the conversation, while it is happening, and when the next move matters.
            </p>
          </div>

          <div className="mt-12 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {useCases.map((item, index) => (
              <div key={item} className="min-h-[112px] rounded-[16px] border border-white/[0.08] bg-[#070809] p-4 transition hover:border-[#7EA1FF]/20 hover:bg-[#0A0C10]">
                <div className="font-mono text-[8px] tracking-[0.2em] text-white/22">0{index + 1}</div>
                <div className="mt-7 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/78">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 border-b border-white/[0.07] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="max-w-3xl">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.26em] text-[#9DB2FF]/60">What already exists</p>
            <h2 className="mt-5 font-mono text-[38px] font-black uppercase leading-[0.94] tracking-[-0.06em] sm:text-[58px]">Built enough to test. Designed to become more.</h2>
            <p className="mt-6 max-w-2xl text-[16px] leading-8 text-white/55 sm:text-[18px] sm:leading-9">
              GEORGE already has substantial custom work, runtime architecture, LIVE infrastructure, telemetry, and deployment experience behind it. Early Access is the next step: put the system into real situations, find the edges, and make it better.
            </p>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(([name, description]) => (
              <div key={name} className="rounded-[18px] border border-white/[0.08] bg-[#070809] p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">{name}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8DA7FF]/80 shadow-[0_0_14px_rgba(141,167,255,0.45)]" />
                </div>
                <p className="mt-5 text-[13px] leading-6 text-white/44">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[18px] border border-[#7EA1FF]/15 bg-[#4E7CFF]/[0.035] p-5 sm:p-6">
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#BFCBFF]/55">What we don't reveal</div>
            <p className="mt-4 max-w-4xl text-[13px] leading-7 text-white/45">
              GEORGE's public capabilities are visible. Its proprietary algorithms, prompts, thresholds, routing rules, decision structures, and source code remain protected. <strong className="font-semibold text-white/72">Show the capability. Protect the choreography.</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-b border-white/[0.07] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.26em] text-[#9DB2FF]/60">Early Access</p>
              <h2 className="mt-5 font-mono text-[38px] font-black uppercase leading-[0.94] tracking-[-0.06em] sm:text-[58px]">Help us finish what we've started.</h2>
            </div>

            <div className="max-w-3xl">
              <p className="text-[17px] leading-8 text-white/60 sm:text-[19px] sm:leading-9">
                Early Access isn't just about getting GEORGE early. It gives us the opportunity to put GEORGE into real situations — employment, sales, negotiations, founding companies, leadership, accessibility, advocacy, creator conversations, and whatever else our users bring to it.
              </p>
              <p className="mt-6 text-[17px] leading-8 text-white/60 sm:text-[19px] sm:leading-9">
                Your participation helps us discover where GEORGE is already useful, where it needs improvement, and where it needs to become exceptional.
              </p>

              <div className="mt-9 grid gap-2 sm:grid-cols-5">
                {["Fund", "Test", "Learn", "Refine", "Demonstrate"].map((step, index) => (
                  <div key={step} className="rounded-[13px] border border-white/[0.08] bg-white/[0.02] px-3 py-4 text-center">
                    <div className="font-mono text-[8px] text-white/22">0{index + 1}</div>
                    <div className="mt-3 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-white/66">{step}</div>
                  </div>
                ))}
              </div>

              <p className="mt-7 font-mono text-[9px] uppercase leading-5 tracking-[0.15em] text-white/28">
                We want to measure patterns of effectiveness across use cases — not turn private conversations into a shared data pool.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="creators" className="relative z-10 border-b border-white/[0.07] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="max-w-4xl">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.26em] text-[#9DB2FF]/60">Founding Creators</p>
            <h2 className="mt-5 font-mono text-[38px] font-black uppercase leading-[0.94] tracking-[-0.06em] sm:text-[58px]">Bring GEORGE to your people.</h2>
            <p className="mt-6 max-w-3xl text-[16px] leading-8 text-white/55 sm:text-[18px] sm:leading-9">
              We're looking for creators who see the potential benefit for themselves and the communities they serve — founders, job seekers, salespeople, entrepreneurs, advocates, community leaders, creators, and people who simply need a hand up.
            </p>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Your link", "A personal GEORGE access link for your audience."],
              ["Your QR", "A simple path from your content to Early Access."],
              ["Your script", "A ready-to-record teleprompter you can make your own."],
              ["Your founding status", "A place in the first group helping shape the product."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[17px] border border-white/[0.08] bg-[#070809] p-5">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/76">{title}</div>
                <p className="mt-5 text-[13px] leading-6 text-white/42">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-[20px] border border-[#7EA1FF]/16 bg-[#4E7CFF]/[0.035] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="max-w-2xl">
              <h3 className="font-mono text-[16px] font-semibold uppercase tracking-[0.12em] text-white/86">You don't have to explain GEORGE.</h3>
              <p className="mt-3 text-[13px] leading-6 text-white/45">We'll give you the words, the link, and the QR code. You introduce GEORGE in your own voice.</p>
            </div>
            <a href="mailto:founding@branesx.com?subject=GEORGE%20Founding%20Creator" className="inline-flex h-12 shrink-0 items-center justify-between rounded-[14px] bg-white px-5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-black transition hover:-translate-y-0.5">
              Become a Founding Creator <span className="ml-8 text-[17px]">→</span>
            </a>
          </div>

          <p className="mt-5 font-mono text-[8px] uppercase leading-5 tracking-[0.14em] text-white/22">
            Creator revenue participation is being finalized after the GEORGE unit-economics audit. No commission percentage is promised here until the program economics are complete.
          </p>
        </div>
      </section>

      <section id="access" className="relative z-10 border-b border-white/[0.07] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.26em] text-[#9DB2FF]/60">Get Early Access</p>
              <h2 className="mt-5 font-mono text-[38px] font-black uppercase leading-[0.94] tracking-[-0.06em] sm:text-[58px]">Choose your access.</h2>
            </div>
            <div className="max-w-md font-mono text-[9px] uppercase leading-5 tracking-[0.15em] text-white/28">
              Early Access pricing and capabilities may evolve as GEORGE is refined. Founding participants will be notified of material changes.
            </div>
          </div>

          <div className="mt-12 grid gap-3 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div key={tier.name} className={`relative flex min-h-[330px] flex-col rounded-[22px] border p-6 sm:p-7 ${tier.featured ? "border-[#7EA1FF]/25 bg-[#4E7CFF]/[0.055] shadow-[0_24px_80px_rgba(31,58,150,0.16)]" : "border-white/[0.08] bg-[#070809]"}`}>
                {tier.featured && <div className="absolute right-5 top-5 rounded-full border border-[#7EA1FF]/25 bg-[#4E7CFF]/15 px-2.5 py-1 font-mono text-[7px] font-semibold uppercase tracking-[0.18em] text-[#DDE5FF]">Founding favorite</div>}
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/72">{tier.name}</div>
                <div className="mt-5 font-mono text-[30px] font-black tracking-[-0.04em] text-white">{tier.price}</div>
                <p className="mt-5 max-w-sm text-[13px] leading-6 text-white/43">{tier.description}</p>
                <div className="mt-auto pt-8">
                  <Link href={tier.href} className={`flex h-12 w-full items-center justify-between rounded-[13px] px-4 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] transition hover:-translate-y-0.5 ${tier.featured ? "bg-white text-black" : "border border-white/[0.12] bg-white/[0.025] text-white hover:border-white/[0.22]"}`}>
                    {tier.cta}<span className="text-[17px]">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-[22px] border border-white/[0.08] bg-[#070809] p-6 sm:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9DB2FF]/60">Help build GEORGE</div>
                <h3 className="mt-4 font-mono text-[27px] font-black uppercase leading-[0.98] tracking-[-0.04em] sm:text-[38px]">The first milestone is deliberately small.</h3>
                <p className="mt-5 text-[14px] leading-7 text-white/46 sm:text-[16px] sm:leading-8">
                  Our working first operating milestone is <strong className="font-semibold text-white/78">$2,500</strong>. The purpose is simple: fund the next round of testing, refinement, AI resources, infrastructure, and production preparation — then use what we learn to determine the next step.
                </p>
              </div>
              <div className="shrink-0 rounded-[18px] border border-[#7EA1FF]/18 bg-[#4E7CFF]/[0.05] px-8 py-7 text-center">
                <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-white/28">Initial milestone</div>
                <div className="mt-3 font-mono text-[42px] font-black tracking-[-0.06em] text-white">$2,500</div>
                <a href="mailto:founding@branesx.com?subject=Help%20Build%20GEORGE" className="mt-4 inline-block font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-[#BFCBFF] transition hover:text-white">Support GEORGE →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-5 border-t border-white/[0.07] pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logofav.png" alt="Bx" width={34} height={34} className="h-7 w-7 object-contain opacity-80" />
            <div>
              <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-white/55">BRANESx / GEORGE</div>
              <div className="mt-1 font-mono text-[7px] uppercase tracking-[0.14em] text-white/22">R. Block Shares Holdings, LLC</div>
            </div>
          </div>
          <div className="flex gap-5 font-mono text-[8px] uppercase tracking-[0.16em] text-white/25">
            <Link href="/help" className="transition hover:text-white/60">Help</Link>
            <Link href="/legal" className="transition hover:text-white/60">Legal</Link>
            <Link href="/contact" className="transition hover:text-white/60">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
