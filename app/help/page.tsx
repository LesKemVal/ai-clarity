import BxPageHeader from '@/components/BxPageHeader'

const steps = [
  {
    index: '01',
    label: 'GET STARTED',
    title: 'Start with the outcome.',
    body: 'Tell GEORGE what you are trying to accomplish. Your role, audience, constraints, and desired result give the conversation a useful direction.',
    examples: [
      'Help me prepare for an investor meeting.',
      'Review this contract before I sign it.',
      'Build a plan to launch this business.',
      'Help me decide between these options.',
    ],
  },
  {
    index: '02',
    label: 'PREPARATION',
    title: 'Brief GEORGE conversationally.',
    body: 'Preparation is collaborative. Type or speak naturally while GEORGE identifies the objective, required signals, useful existing assets, and any missing information before assembling a briefing.',
    examples: [
      'Voice and typing use the same preparation flow',
      'Existing resumes, proposals, decks, scripts, and briefings can be reviewed',
      'Uploads, screenshots, photos, paste, and voice can supply missing signal',
      'You review and approve the briefing before LIVE',
    ],
  },
  {
    index: '03',
    label: 'WORKSPACE',
    title: 'Reuse work you already have.',
    body: 'GEORGE looks for relevant operational assets before asking you to recreate them. Library and saved sessions can provide documents, formulas, scripts, and prior preparation for your confirmation.',
    examples: [
      'Choose an existing asset or version',
      'Update it, replace it, keep both, or start fresh',
      'Library presents accessible operational strategies and saved work',
      'Marketplace access and publication status remain explicit',
    ],
  },
  {
    index: '04',
    label: 'LIVE',
    title: 'Execute the approved preparation.',
    body: 'LIVE is the real-time operating mode for interviews, meetings, negotiations, presentations, sales calls, reviews, and other conversations where support can still change the outcome.',
    examples: [
      'Current room signals and approved preparation come first',
      'Audio and visual support stay concise and referenceable',
      'Historical memory is not surfaced just because it exists',
      'Use, change, or ignore any guidance',
    ],
  },
  {
    index: '05',
    label: 'AFTER LIVE',
    title: 'Review signals and decide what comes next.',
    body: 'A completed conversation can produce signals, records, review, and recommendations. Signals accumulate into evidence; nothing silently rewrites your brief or script.',
    examples: [
      'Review the conversation and transcript evidence',
      'Reuse the briefing for a next call',
      'Consider script or brief improvements when evidence warrants them',
      'Keep final authority over every recommendation',
    ],
  },
  {
    index: '06',
    label: 'MEMORY',
    title: 'Keep context without losing control.',
    body: 'GEORGE maintains continuity inside a validated session while keeping unrelated sessions isolated. Relevant prior information may inform current work, but it becomes active context only when you adopt it.',
    examples: [
      'Open recent sessions from the sidebar',
      'Use one approved briefing for repeated conversations',
      'Relevant memory can inform Normal and Preparation',
      'You decide what should be remembered, reused, or ignored',
    ],
  },
]

const principles = [
  {
    title: 'You remain in control.',
    body: 'GEORGE provides judgment and support. You decide what to accept, change, ignore, say, or do.',
  },
  {
    title: 'More context can improve the result.',
    body: 'Your role, audience, desired outcome, constraints, documents, and known risks can make guidance more useful.',
  },
  {
    title: 'The current objective comes first.',
    body: 'Prior conversations and files should help the present work, not take it in another direction.',
  },
]

export default function HelpPage() {
  return (
    <main className="min-h-[100dvh] bg-black px-4 py-5 text-[#D7DBE4] sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-[1120px]">
        <BxPageHeader backLabel="GEORGE" backHref="/george" />

        <section className="border-b border-white/[0.08] pb-10 pt-4 sm:pb-14 sm:pt-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/34">
            USING GEORGE
          </div>

          <h1 className="mt-5 max-w-4xl font-mono text-[40px] font-black uppercase leading-[0.92] tracking-[-0.07em] text-white sm:text-[68px]">
            A practical guide to the GEORGE workspace.
          </h1>

          <p className="mt-7 max-w-3xl text-[17px] leading-8 text-white/68 sm:text-[20px] sm:leading-9">
            One GEORGE supports Normal work, collaborative Preparation, focused LIVE execution, and the review that follows. You remain in control of what is adopted, reused, or changed.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/george"
              className="inline-flex min-h-11 items-center rounded-[14px] bg-white px-5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition hover:-translate-y-px"
            >
              Ask GEORGE
            </a>

            <a
              href="/george/live-entry?source=help"
              className="inline-flex min-h-11 items-center rounded-[14px] border border-[#3657A8]/55 bg-[#172347] px-5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-px hover:bg-[#1B2A50]"
            >
              Prepare for LIVE
            </a>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="grid gap-4 md:grid-cols-2">
            {steps.map((step) => (
              <article
                key={step.index}
                className="rounded-[24px] border border-white/[0.07] bg-[#05060A] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28)] sm:p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-white/30">
                    {step.index}
                  </span>

                  <span className="rounded-full border border-[#3657A8]/40 bg-[#172347] px-3 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white/72">
                    {step.label}
                  </span>
                </div>

                <h2 className="mt-5 font-mono text-[23px] font-black uppercase leading-[1] tracking-[-0.045em] text-white sm:text-[29px]">
                  {step.title}
                </h2>

                <p className="mt-5 text-[15px] leading-7 text-white/64">
                  {step.body}
                </p>

                <div className="mt-6 border-t border-white/[0.06] pt-5">
                  <div className="space-y-2">
                    {step.examples.map((example) => (
                      <div
                        key={example}
                        className="flex items-start gap-3 text-[13px] leading-6 text-white/46"
                      >
                        <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#6F8FE0]/72" />
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-white/[0.08] py-10 sm:py-14">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/30">
            Your control
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {principles.map((principle) => (
              <article
                key={principle.title}
                className="rounded-[22px] border border-white/[0.065] bg-[#05060A] p-5"
              >
                <h2 className="font-mono text-[14px] font-semibold uppercase tracking-[0.08em] text-white/86">
                  {principle.title}
                </h2>

                <p className="mt-4 text-[14px] leading-7 text-white/52">
                  {principle.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/[0.08] py-8 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-white/24">
          GEORGE supports your judgment. You retain responsibility and final control.
        </footer>
      </div>
    </main>
  )
}
