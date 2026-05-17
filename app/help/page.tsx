'use client'

import PageShell from '@/components/layout/PageShell'

export default function HelpPage() {
  return (
    <PageShell
      title="Operating GEORGE"
      eyebrow="Manual"
      backToGeorge
    >
      <div className="space-y-5">

        <section className="rounded-[0.9rem] border border-white/[0.045] bg-black/24 p-5 md:p-5">
          <p className="text-sm leading-7 text-white/82">
            GEORGE operates within principles that respect the Holy Bible (KJV) and will not contradict it.
          </p>
          <p className="mt-3 text-sm leading-7 text-white/44">
            You choose the direction. GEORGE keeps the signal, narrows the move, and stays useful when the room changes.
          </p>
        </section>

        <section className="rounded-[0.9rem] border border-white/[0.04] bg-white/[0.012] p-5 md:p-5">
          <p className="text-[20px] font-semibold tracking-[-0.035em] text-white/92">
            Less drift. Better next moves. Stronger words when they count.
          </p>
          <p className="mt-3 leading-7 text-white/44">
            Use GEORGE to decide, prepare, respond, and keep momentum. Use LIVE when the conversation itself becomes the work.
          </p>
        </section>

        <section className="rounded-[0.9rem] border border-white/[0.04] bg-white/[0.012] p-5 md:p-5">
          <h2 className="mb-4 text-[18px] font-semibold text-white/88">Operating model</h2>
          <div className="grid gap-2 text-sm leading-6 text-white/46">
            <p><span className="text-white/76">Direction</span> — identify what actually matters.</p>
            <p><span className="text-white/76">Action</span> — choose the next useful move.</p>
            <p><span className="text-white/76">Signal</span> — learn from what happens next.</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/50">
            Bring the objective. GEORGE turns it into movement.
          </p>
        </section>

        <section className="rounded-[0.9rem] border border-white/[0.04] bg-white/[0.012] p-5 md:p-5">
          <h2 className="mb-4 text-[18px] font-semibold text-white/88">Start with the real situation</h2>
          <div className="grid gap-2 text-sm leading-6 text-white/46">
            <p>“I need to make a decision.”</p>
            <p>“I need to say this the right way.”</p>
            <p>“I need a plan I can actually follow.”</p>
            <p>“I’m stuck. Find the next move.”</p>
          </div>
        </section>

        <section className="rounded-[0.9rem] border border-white/[0.045] bg-black/24 p-5 md:p-5">
          <h2 className="mb-4 text-[18px] font-semibold text-white/88">LIVE</h2>

          <div className="space-y-4">
            <div>
              <p className="font-medium text-white/82">One earbud if possible.</p>
              <p className="mt-2 leading-7 text-white/44">
                LIVE supports timing, pacing, pressure, and next responses without competing with the room.
              </p>
            </div>

            <div>
              <p className="font-medium text-white/82">Steer without exposing the system.</p>
              <p className="mt-2 leading-7 text-white/44">
                Natural phrases like “hmm”, “let me think”, or “right” can guide LIVE toward a line, cue, pause, or shorter response.
              </p>
            </div>

            <div>
              <p className="font-medium text-white/82">Show GEORGE what matters.</p>
              <p className="mt-2 leading-7 text-white/44">
                Upload documents, screenshots, photos, or a résumé before or during LIVE so GEORGE can reference the context in real time.
              </p>
            </div>

            <div>
              <p className="font-medium text-white/82">Silence can be the move.</p>
              <p className="mt-2 leading-7 text-white/44">
                LIVE may hold, compress, cue posture, or give one exact line depending on pressure and timing.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[0.9rem] border border-white/[0.04] bg-white/[0.012] p-5 md:p-5">
          <h2 className="mb-4 text-[18px] font-semibold text-white/88">Controls</h2>
          <div className="grid gap-2 text-sm leading-6 text-white/46">
            <p><span className="text-white/76">Keep this</span> — save what is worth returning to.</p>
            <p><span className="text-white/76">Share</span> — move useful guidance outside GEORGE.</p>
            <p><span className="text-white/76">Related</span> — surface nearby context.</p>
            <p><span className="text-white/76">Simplify</span> — reduce the answer to what matters most.</p>
            <p><span className="text-white/76">Reword</span> — reshape a line for the moment.</p>
          </div>
        </section>

        <section className="rounded-[0.9rem] border border-white/[0.04] bg-white/[0.012] p-5 md:p-5">
          <h2 className="mb-4 text-[18px] font-semibold text-white/88">Continuity</h2>
          <p className="leading-7 text-white/44">
            Continuity keeps useful direction, context, and working history available when the work changes shape.
          </p>
        </section>

        <section className="rounded-[0.9rem] border border-white/[0.04] bg-white/[0.012] p-5 md:p-5">
          <h2 className="mb-4 text-[18px] font-semibold text-white/88">Access</h2>
          <div className="grid gap-2 text-sm leading-6 text-white/46">
            <p><span className="text-white/76">Smart</span> — everyday direction and reasoning.</p>
            <p><span className="text-white/76">Intelligent</span> — stronger continuity and execution support.</p>
            <p><span className="text-white/76">Brilliant</span> — deepest LIVE support and strongest continuity.</p>
            <p><span className="text-white/76">Brilliant Day</span> — temporary Brilliant access.</p>
          </div>
        </section>

        <section className="rounded-[0.9rem] border border-white/[0.04] bg-white/[0.012] p-5 md:p-5">
          <p className="text-[17px] font-medium leading-8 text-white/86">
            Bring the situation. GEORGE keeps the next move in view.
          </p>
        </section>

      </div>
    </PageShell>
  )
}
