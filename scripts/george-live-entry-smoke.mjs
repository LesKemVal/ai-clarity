import fs from "node:fs";

const liveEntry = fs.readFileSync(
  "app/george/live-entry/LiveEntryClient.tsx",
  "utf8",
);
const page = fs.readFileSync("app/george/page.tsx", "utf8");
const hubTypes = fs.readFileSync("lib/george/live-hub/types.ts", "utf8");
const runtimeTypes = fs.readFileSync(
  "lib/george/live-runtime/prep-runtime.ts",
  "utf8",
);

const checks = [
  [
    "Popup 3 has secondary objective type",
    liveEntry.includes("type LiveRoomObjectiveOptionId"),
  ],
  [
    "Popup 3 includes a briefing-compatible confident approach",
    liveEntry.includes("label: 'Confident and prepared'"),
  ],
  [
    "Popup 3 includes Other custom objective",
    liveEntry.includes("customLiveRoomObjective"),
  ],
  ["Popup 3 is final check", liveEntry.includes("BRIEF ROOM · FINAL CHECK")],
  [
    "Popup 3 asks the user to choose an approach",
    liveEntry.includes("Choose your approach"),
  ],
  [
    "Popup 3 explains LIVE control orientation",
    liveEntry.includes("These controls will be available in the conversation."),
  ],
  [
    "Popup 3 explains briefing-filtered approach choices",
    liveEntry.includes(
      "GEORGE filtered these choices using the full briefing.",
    ),
  ],
  [
    "LIVE setup carries intangibleObjective",
    liveEntry.includes("intangibleObjective,"),
  ],
  [
    "LIVE setup carries fallbackOutcome",
    liveEntry.includes("fallbackOutcome: secondaryOutcome"),
  ],
  [
    "Runtime support carries secondaryObjective",
    runtimeTypes.includes("secondaryObjective?: string"),
  ],
  [
    "LiveHub context carries secondaryObjective",
    hubTypes.includes("secondaryObjective?: string"),
  ],
  [
    "Runtime bridge sends secondaryObjective",
    page.includes(
      "secondaryObjective: String(liveRuntimeSupport?.secondaryObjective || '')",
    ),
  ],
  [
    "Briefing voice acknowledgement removed",
    !liveEntry.includes("Good. Hold here if the room still needs adjustment."),
  ],
  [
    "Provisional support meter removed",
    !liveEntry.includes("Estimated LIVE support:"),
  ],
];

const failed = checks.filter(([, pass]) => !pass);

if (failed.length) {
  console.error("GEORGE LIVE entry smoke failed:");
  for (const [label] of failed) console.error(`- ${label}`);
  process.exit(1);
}

console.log("GEORGE LIVE entry smoke passed");
