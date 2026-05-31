import Link from 'next/link'

const chairSignals = {
  Interview: {
    examples: ['Resume', 'Job description', 'Portfolio', 'Certifications', 'Interview notes'],
    value: ['Experience', 'Achievements', 'Credibility', 'Likely questions', 'Skill gaps'],
  },
  Boardroom: {
    examples: ['Board packet', 'Forecast', 'KPIs', 'Financial report', 'Meeting notes'],
    value: ['Numbers', 'Risks', 'Assumptions', 'Stakeholders', 'Decision history'],
  },
  Negotiation: {
    examples: ['Contract', 'Proposal', 'Term sheet', 'Pricing sheet', 'Email thread'],
    value: ['Leverage', 'Concessions', 'Deadlines', 'Terms', 'Objections'],
  },
  Sales: {
    examples: ['Sales script', 'Discovery notes', 'CRM notes', 'Proposal', 'Competitor comparison'],
    value: ['Pain points', 'Objections', 'Buying signals', 'Decision makers', 'Next step'],
  },
  Doctor: {
    examples: ['Medical notes', 'Lab results', 'Medication list', 'Symptoms', 'Referral notes'],
    value: ['History', 'Symptoms', 'Questions', 'Concerns', 'Treatment context'],
  },
  Presentation: {
    examples: ['Slides', 'Speaker notes', 'Research', 'Agenda', 'Audience notes'],
    value: ['Key points', 'Weak areas', 'Likely questions', 'Supporting evidence', 'Timing'],
  },
}

export default function DeployLivePage() {
  return (
    <main className="min-h-screen bg-[#050506] text-white px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7C8CFF]">Deploy LIVE</p>
          <Link href="/live-voice" className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/70">
            Skip tutorial
          </Link>
        </div>

        <h1 className="mt-8 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
          Bring GEORGE up to speed.
        </h1>

        <p className="mt-6 max-w-2xl text-white/60 leading-7">
          Upload anything that contains relevant signals. GEORGE uses those signals to reduce explanation, improve timing, and support the room faster.
        </p>

        <div className="mt-10 rounded-2xl border border-[#7C8CFF]/25 bg-[#7C8CFF]/[0.06] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Give GEORGE better signal</p>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Upload documents, notes, screenshots, images, or anything else that helps GEORGE understand the room before pressure rises.
          </p>
          <button className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-black">
            Upload relevant signal
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {Object.entries(chairSignals).map(([chair, data]) => (
            <div key={chair} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/85">{chair}</h2>

              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/35">Upload examples</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.examples.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/65">
                    {item}
                  </span>
                ))}
              </div>

              <p className="mt-5 text-xs uppercase tracking-[0.18em] text-white/35">GEORGE looks for</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.value.map((item) => (
                  <span key={item} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/65">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Default steering</p>
          <div className="mt-4 grid gap-3 text-sm text-white/60 sm:grid-cols-2">
            <p>“One second...” → buy time</p>
            <p>“Right...” → continue</p>
            <p>“Interesting...” → reframe</p>
            <p>Repeat signal → repair context</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/live-voice" className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-black">
            LIVE Now
          </Link>
          <Link href="/george/live-entry" className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.18em] text-white/75">
            Back to Prep
          </Link>
        </div>
      </section>
    </main>
  )
}
