"use client";

const ROWS = [
  [
    "Facts first.",
    "Pause.",
    "Ask why.",
    "Listen for leverage.",
    "Control the frame.",
    "One point at a time.",
  ],
  [
    "Silence is information.",
    "Lead with evidence.",
    "Stay curious.",
    "Timing matters.",
    "Clarify before defending.",
    "Make them feel heard.",
  ],
  [
    "Anchor value first.",
    "Return to the objective.",
    "Listen for what is missing.",
    "Do not rush the answer.",
    "Name the real concern.",
    "Direction before response.",
  ],
];

export function HomeConversationAmbient() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/25" />

      <div className="absolute inset-0 opacity-[0.035] [mask-image:linear-gradient(to_bottom,transparent_2%,black_17%,black_78%,transparent_98%)]">
        {ROWS.map((row, rowIndex) => {
          const repeated = [...row, ...row];

          return (
            <div
              key={rowIndex}
              className={[
                "absolute left-0 flex w-max items-center gap-10",
                rowIndex === 0
                  ? "top-[16%] animate-[george-conversation-left_48s_linear_infinite]"
                  : rowIndex === 1
                    ? "top-[47%] animate-[george-conversation-right_62s_linear_infinite]"
                    : "top-[76%] animate-[george-conversation-left_78s_linear_infinite]",
              ].join(" ")}
            >
              {repeated.map((cue, cueIndex) => (
                <div
                  key={`${rowIndex}-${cueIndex}`}
                  className="flex items-center gap-10"
                >
                  <div className="relative min-w-max rounded-[18px] border border-white/30 bg-white/[0.06] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-white/70 shadow-[0_0_28px_rgba(255,255,255,0.025)]">
                    {cue}
                    <span className="absolute -bottom-[5px] left-6 h-2.5 w-2.5 rotate-45 border-b border-r border-white/20 bg-[#07090b]" />
                  </div>

                  <span className="block h-px w-20 border-t border-dashed border-white/20" />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
