"use client";

import type { NormalLiveVerificationOpportunity } from "@/lib/george/runtime/live-verification-opportunity";

export function NormalLiveVerificationOpportunitySurface({
  opportunity,
  onSetupLive,
}: {
  opportunity: NormalLiveVerificationOpportunity;
  onSetupLive: () => void;
}) {
  return (
    <section className="mt-4 max-w-[42rem] border-l border-[#6F91DE]/24 pl-3 sm:pl-4">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.19em] text-[#AFC0FF]/58">
        I suggest we verify this
      </div>

      <p className="mt-2 text-[13px] leading-6 text-white/62">
        I&apos;ll set up LIVE around {opportunity.interaction}. We&apos;ll use
        the conversation to determine whether{" "}
        <span className="text-white/78">{opportunity.uncertainty}</span> still
        holds.
      </p>

      <p className="mt-2 text-[13px] leading-6 text-white/48">
        Pay attention to your screen or audio device as I deliberately listen
        for evidence that confirms, challenges, or changes what we&apos;re
        relying on.
      </p>

      <p className="mt-2 text-[13px] leading-6 text-white/48">
        If what we learn changes the strategy, we&apos;ll adjust.
      </p>

      <p className="mt-2 text-[13px] leading-6 text-white/72">
        Intelligent communication doesn&apos;t work without your voice.
      </p>

      <button
        type="button"
        onClick={onSetupLive}
        className="group mt-3 font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-[#AFC0FF]/74 transition hover:text-white"
      >
        <span>Set up LIVE</span>
        <span
          aria-hidden="true"
          className="ml-2 inline-block transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </button>
    </section>
  );
}
