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
    "Popup 3 performs proof of awareness",
    liveEntry.includes("beginProofOfAwareness"),
  ],
  [
    "Popup 3 retains custom objective support",
    liveEntry.includes("customLiveRoomObjective"),
  ],
  [
    "Popup 3 is readiness",
    liveEntry.includes('label="BRIEF ROOM · READINESS"'),
  ],
  ["Popup 3 is Ready Room", liveEntry.includes('title="Ready Room."')],
  [
    "Popup 3 follows Mechanics",
    liveEntry.includes("onBack={() => setLiveBriefingStep(2)}"),
  ],
  ["Popup 3 remains stage three", liveEntry.includes("stage={3}")],
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
    page.includes("secondaryObjective: String(") &&
      page.includes("liveRuntimeSupport?.secondaryObjective"),
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
