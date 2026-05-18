'use client'

const LIVE_STEERING_PAIRS = [
  { phrase: 'OK', meaning: 'stop / reset' },
  { phrase: 'Right', meaning: 'continue / proceed' },
  { phrase: 'Hmm', meaning: 'slow down / buy time' },
  { phrase: 'Now', meaning: 'move faster' },
  { phrase: 'Shorter', meaning: 'compress' },
  { phrase: 'More', meaning: 'expand' },
  { phrase: 'Soft', meaning: 'reduce pressure' },
  { phrase: 'Firm', meaning: 'strengthen posture' },
]

const CAPACITY_BY_ROOM: Record<string, Array<{ label: string; cents: string; detail: string }>> = {
  Interview: [
    { label: 'Sharper answers', cents: '+4¢', detail: 'Cleaner proof and fewer wandering responses.' },
    { label: 'Pacing guidance', cents: '+8¢', detail: 'Slow down before pressure compounds.' },
    { label: 'Pressure management', cents: '+17¢', detail: 'Hold composure under challenge.' },
  ],
  Negotiation: [
    { label: 'Framing support', cents: '+9¢', detail: 'Keep the discussion inside a stronger frame.' },
    { label: 'Leverage tracking', cents: '+13¢', detail: 'Watch concession pressure and weak openings.' },
    { label: 'Silence timing', cents: '+6¢', detail: 'Let pauses work without rushing.' },
  ],
  'Sales Call': [
    { label: 'Objection handling', cents: '+7¢', detail: 'Respond without pushing harder.' },
    { label: 'Trust calibration', cents: '+6¢', detail: 'Keep posture useful and human.' },
    { label: 'Closing posture', cents: '+8¢', detail: 'Advance without sounding desperate.' },
  ],
  'Doctor Appointment': [
    { label: 'Question support', cents: '+5¢', detail: 'Keep important concerns from getting missed.' },
    { label: 'Clarification tracking', cents: '+7¢', detail: 'Flag unclear answers and follow-ups.' },
    { label: 'Memory reinforcement', cents: '+9¢', detail: 'Help retain what happened after.' },
  ],
  Debate: [
    { label: 'Proof framing', cents: '+8¢', detail: 'Keep claims tied to support.' },
    { label: 'Interruption resistance', cents: '+11¢', detail: 'Hold the line without overreacting.' },
    { label: 'Rebuttal shaping', cents: '+9¢', detail: 'Respond directly without chasing noise.' },
  ],
  Boardroom: [
    { label: 'Executive compression', cents: '+12¢', detail: 'Fewer words. Clearer authority.' },
    { label: 'Risk framing', cents: '+16¢', detail: 'Keep exposure and tradeoffs visible.' },
    { label: 'Posture calibration', cents: '+10¢', detail: 'Hold authority without overtalking.' },
  ],
}

function getCapacities(room: string) {
  return CAPACITY_BY_ROOM[room] || [
    { label: 'Timing support', cents: '+5¢', detail: 'Know when to pause, answer, or redirect.' },
    { label: 'Compression support', cents: '+4¢', detail: 'Turn pressure into fewer, cleaner words.' },
    { label: 'Silent review', cents: '+9¢', detail: 'Listen now. Improve after.' },
  ]
}

export default function LiveSteeringGuide({ room }: { room: string }) {
  const capacities = getCapacities(room)

  return (
    <div className="mt-5 border-t border-white/[0.05] pt-5">
      <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[0.95rem] border border-white/[0.055] bg-black/20 p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/36">
            LIVE Steering
          </div>

          <p className="mt-2 text-[13px] leading-6 text-white/54">
            Say natural words. GEORGE treats them as sentence signals — the beginning of the next direction, not exposed commands.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {LIVE_STEERING_PAIRS.map((item) => (
              <div
                key={item.phrase}
                className="rounded-[0.75rem] border border-white/[0.045] bg-white/[0.014] px-3 py-2"
              >
                <div className="text-[12px] font-semibold text-white/78">{item.phrase}</div>
                <div className="mt-0.5 text-[11px] leading-4 text-white/38">{item.meaning}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[0.8rem] border border-[#AAB4FF]/[0.10] bg-[#AAB4FF]/[0.035] px-3 py-3">
            <div className="text-[11px] uppercase tracking-[0.16em] text-[#C9D0FF]/52">
              Sentence continuation
            </div>
            <p className="mt-2 text-[12px] leading-5 text-white/48">
              Example: “Hmm, okay…” can become “...before we decide that, let’s clarify the constraint.”
            </p>
          </div>
        </section>

        <section className="rounded-[0.95rem] border border-[#AAB4FF]/[0.09] bg-[#AAB4FF]/[0.026] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-[#C9D0FF]/52">
                Add capacity
              </div>
              <p className="mt-2 text-[13px] leading-6 text-white/50">
                Estimated runtime stays small. Add only context-related support the room can actually use.
              </p>
            </div>
            <div className="rounded-full border border-[#AAB4FF]/[0.10] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#C9D0FF]/54">
              cents
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {capacities.map((item) => (
              <div
                key={item.label}
                className="rounded-[0.8rem] border border-white/[0.045] bg-black/20 px-3 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[13px] font-medium text-white/76">{item.label}</div>
                  <div className="text-[12px] font-semibold text-[#C9D0FF]/72">{item.cents}</div>
                </div>
                <div className="mt-1 text-[11px] leading-5 text-white/38">{item.detail}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
