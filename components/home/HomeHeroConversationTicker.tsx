import { CONVERSATION_TYPES } from "@/lib/george/live-entry/conversation-types";

const HERO_CONVERSATIONS = CONVERSATION_TYPES.filter(
  (conversationType) => conversationType.title !== "Other",
).map((conversationType) => conversationType.title);

const ROWS = [
  { direction: "left", duration: "320s", top: "7%", offset: 0 },
  { direction: "right", duration: "380s", top: "29%", offset: 11 },
  { direction: "left", duration: "430s", top: "52%", offset: 27 },
  { direction: "right", duration: "490s", top: "75%", offset: 43 },
];

export function HomeHeroConversationTicker() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#000_0%,transparent_12%,transparent_88%,#000_100%)]" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_24%_35%,transparent_0%,rgba(0,0,0,0.18)_48%,rgba(0,0,0,0.7)_100%)]" />

      {ROWS.map((row, rowIndex) => {
        const ordered = [
          ...HERO_CONVERSATIONS.slice(row.offset),
          ...HERO_CONVERSATIONS.slice(0, row.offset),
        ];
        const conversations = [...ordered, ...ordered];

        return (
          <div
            key={rowIndex}
            className={`absolute left-0 flex w-max items-center gap-3 ${
              row.direction === "left"
                ? "animate-[georgeHeroTickerLeft_var(--ticker-duration)_linear_infinite]"
                : "animate-[georgeHeroTickerRight_var(--ticker-duration)_linear_infinite]"
            }`}
            style={{
              top: row.top,
              ["--ticker-duration" as string]: row.duration,
            }}
          >
            {conversations.map((conversation, conversationIndex) => (
              <div
                key={`${rowIndex}-${conversationIndex}`}
                className="flex min-h-[82px] w-[320px] items-center justify-between rounded-[16px] border border-white/[0.18] bg-[#08090A]/78 px-6 py-4 opacity-[0.2] sm:w-[390px] sm:opacity-[0.17]"
              >
                <span className="font-mono text-[12px] font-semibold uppercase leading-5 tracking-[0.16em] text-white">
                  {conversation}
                </span>
                <span className="text-[17px] text-white/72">→</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
