import BxPageHeader from '@/components/BxPageHeader'

const steps = [
  {
    index: '01',
    label: 'START',
    title: 'Begin with the result you want.',
    body: 'Tell GEORGE what you are trying to accomplish. You can be specific or begin with a rough idea. GEORGE may ask for the smallest piece of information needed to make the next move useful.',
    examples: [
      'Help me prepare for an investor meeting.',
      'Review this contract before I sign it.',
      'Build a plan to launch this business.',
      'Help me decide between these options.',
    ],
  },
  {
    index: '02',
    label: 'PREPARE',
    title: 'Think, plan, practice, and build.',
    body: 'Use GEORGE before an important moment to organize your thinking, understand the situation, identify risks, prepare your message, and create the work you need.',
    examples: [
      'Plans and strategies',
      'Interview and meeting preparation',
      'Presentations, proposals, and pitch decks',
      'Decisions, research, and next steps',
    ],
  },
  {
    index: '03',
    label: 'FILES',
    title: 'Bring GEORGE the information that matters.',
    body: 'Upload a document, image, résumé, contract, report, presentation, or other relevant file. Tell GEORGE what you need from it instead of only asking for a summary.',
    examples: [
      'Find the risks in this agreement.',
      'Use my résumé to prepare stronger interview answers.',
      'Turn this information into a presentation.',
      'Tell me what matters for the decision I need to make.',
    ],
  },
  {
    index: '04',
    label: 'LIVE',
    title: 'Take GEORGE into the conversation.',
    body: 'LIVE is the real-time operating mode for interviews, meetings, negotiations, presentations, sales calls, reviews, and other conversations where support is useful while the outcome can still change.',
    examples: [
      'Choose how you will receive support.',
      'Brief GEORGE on the room and desired outcome.',
      'Talk naturally and remain present.',
      'Use, change, or ignore any guidance.',
    ],
  },
  {
    index: '05',
    label: 'SUPPORT',
    title: 'Choose the support that fits the moment.',
    body: 'GEORGE can provide a small cue, help continue your thought, form a complete response, or recommend the next move. Audio support is designed to be easy to hear and use. Visual support can remain available to read and reference.',
    examples: [
      'Cue — a short nudge',
      'Continuation — help finishing your thought',
      'Response — a complete answer to adapt or repeat',
      'Advice — a practical next move',
    ],
  },
  {
    index: '06',
    label: 'CONTINUE',
    title: 'Keep useful work available.',
    body: 'Saved conversations help you return to plans, documents, decisions, and preparation. GEORGE may use relevant prior work when it improves the current objective, but a new conversation remains a new conversation.',
    examples: [
      'Open a saved conversation from the sidebar.',
      'Start a new workspace when the objective changes.',
      'Tell GEORGE what changed since the last session.',
      'Decide what should be remembered or reused.',
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
            How to use GEORGE
          </div>

          <h1 className="mt-5 max-w-4xl font-mono text-[40px] font-black uppercase leading-[0.92] tracking-[-0.07em] text-white sm:text-[68px]">
            Move from the situation you have to the outcome you want.
          </h1>

          <p className="mt-7 max-w-3xl text-[17px] leading-8 text-white/68 sm:text-[20px] sm:leading-9">
            GEORGE helps you understand what is happening, decide what matters,
            prepare the next move, create useful work, and communicate effectively
            before, during, and after important moments.
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
            Keep in mind
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
