import fs from "node:fs";

const homepage = fs.readFileSync(
  "components/home/HomeConversationTypeSurface.tsx",
  "utf8",
);

const requestStart = homepage.indexOf(
  "async function requestHomepageOperationalJudgment(",
);
const requestEnd = homepage.indexOf(
  "function editCurrentUnderstanding()",
  requestStart,
);
const request =
  requestStart >= 0 && requestEnd > requestStart
    ? homepage.slice(requestStart, requestEnd)
    : "";

const handoffStart = homepage.indexOf(
  "function preserveHomepageHandoff(",
);
const handoffEnd = homepage.indexOf(
  "function approveAndContinueToLive()",
  handoffStart,
);
const handoff =
  handoffStart >= 0 && handoffEnd > handoffStart
    ? homepage.slice(handoffStart, handoffEnd)
    : "";

const checks = [
  [
    "Homepage does not import fixed-field readiness",
    !homepage.includes(
      'from "@/lib/george/live-runtime/live-intent-runtime"',
    ),
  ],
  [
    "Homepage never calls fixed-field readiness",
    !homepage.includes("resolveLivePreparationReadiness("),
  ],
  [
    "Readiness comes from canonical qualitative judgment",
    request.includes(
      'judgmentResult.operationalJudgment.preparationReadiness',
    ),
  ],
  [
    "Readiness requires minimum LIVE support",
    request.includes(
      "readinessJudgment.minimumLiveSupportEstablished === true",
    ),
  ],
  [
    "Readiness requires Operational Judgment provenance",
    request.includes(
      'readinessJudgment?.source === "operational_judgment"',
    ),
  ],
  [
    "No-question branch cannot activate readiness",
    !request.match(
      /signalAcquisition\.shouldAcquire !== true[\s\S]{0,500}setBriefingSufficient\(true\)/,
    ),
  ],
  [
    "Homepage handoff transports accepted readiness",
    handoff.includes("...preparationReadiness"),
  ],
  [
    "Homepage handoff remains gated by canonical readiness state",
    handoff.includes("thresholdMet: briefingSufficient") &&
      handoff.includes("complete: briefingSufficient"),
  ],
  [
    "Legacy fixed question list is not copied into homepage",
    !homepage.includes("LIVE_PREPARATION_QUESTIONS"),
  ],
];

let failed = false;

for (const [label, passed] of checks) {
  if (passed) {
    console.log(`PASS: ${label}`);
  } else {
    failed = true;
    console.error(`FAIL: ${label}`);
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log(
    "PASS: Homepage readiness is independent of fixed preparation fields.",
  );
}
