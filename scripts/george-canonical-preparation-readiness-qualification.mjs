import fs from "node:fs";

const judgment = fs.readFileSync(
  "lib/george/runtime/operational-judgment.ts",
  "utf8",
);
const homepage = fs.readFileSync(
  "components/home/HomeConversationTypeSurface.tsx",
  "utf8",
);
const provider = fs.readFileSync(
  "lib/george/runtime/provider/normal-provider.ts",
  "utf8",
);

const checks = [
  [
    "Canonical readiness contract exists",
    judgment.includes(
      "export type OperationalPreparationReadinessJudgment",
    ),
  ],
  [
    "All four qualitative levels exist",
    judgment.includes(
      "'insufficient' | 'developing' | 'supportable' | 'sharp'",
    ),
  ],
  [
    "Minimum support is represented independently",
    judgment.includes("minimumLiveSupportEstablished: boolean"),
  ],
  [
    "Further sharpening is represented independently",
    judgment.includes("furtherBriefingCouldSharpen: boolean") &&
      judgment.includes("sharpeningSignal: string | null"),
  ],
  [
    "Unresolved base judgment is insufficient",
    judgment.includes(
      "Canonical preparation readiness has not yet been established.",
    ),
  ],
  [
    "Only accepted execution_ready establishes minimum support",
    judgment.includes(
      "disposition === 'execution_ready' && providerProposalAccepted",
    ) &&
      judgment.includes("minimumLiveSupportEstablished: true"),
  ],
  [
    "Provider comparison determines supportable versus sharp",
    judgment.includes("level: comparisonCandidateSignal") &&
      judgment.includes("sharpeningSignal: comparisonCandidateSignal"),
  ],
  [
    "Authorized missing evidence produces developing readiness",
    judgment.includes("providerAuthorizesSignalAcquisition") &&
      judgment.includes("'developing' as const"),
  ],
  [
    "Signal-question layer does not own readiness",
    !fs
      .readFileSync(
        "app/api/george/live/signal-question/route.ts",
        "utf8",
      )
      .includes("preparationReadiness"),
  ],
  [
    "Homepage remains free of fixed-field readiness",
    !homepage.includes("resolveLivePreparationReadiness(") &&
      !homepage.includes("LIVE_PREPARATION_QUESTIONS"),
  ],
  [
    "Provider retains inference while Operational Judgment owns acceptance",
    provider.includes("decisionComparison") &&
      judgment.includes(
        "source: 'operational_judgment' as const",
      ),
  ],
  [
    "Support depth does not depend on access tier",
    !judgment.match(
      /preparationReadiness[\s\S]{0,800}\b(smart|intelligent|brilliant)\b/i,
    ),
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
    "PASS: Canonical qualitative preparation readiness is judgment-owned.",
  );
}
