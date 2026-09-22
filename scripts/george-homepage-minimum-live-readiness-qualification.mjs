import fs from "node:fs";

const file = "components/home/HomeConversationTypeSurface.tsx";
const source = fs.readFileSync(file, "utf8");

const checks = [
  [
    "Homepage reads canonical qualitative readiness",
    source.includes(
      "judgmentResult.operationalJudgment.preparationReadiness",
    ),
  ],
  [
    "Only supportable or sharp establishes minimum LIVE support",
    source.includes(
      'readinessJudgment.level === "supportable"',
    ) && source.includes(
      'readinessJudgment.level === "sharp"',
    ),
  ],
  [
    "Minimum support must be canonically established",
    source.includes(
      "readinessJudgment.minimumLiveSupportEstablished === true",
    ),
  ],
  [
    "Disposition retains Operational Judgment provenance",
    source.includes(
      'readinessJudgment?.source === "operational_judgment"',
    ),
  ],
  [
    "Accepted readiness activates homepage readiness",
    source.includes("setBriefingSufficient(true);"),
  ],
  [
    "Accepted readiness clears the pending question",
    source.includes(
      "preserveHomepagePendingQuestion(preparationSession, null);",
    ),
  ],
  [
    "Accepted readiness advances to the decision phase",
    source.includes('setPhase("decision");'),
  ],
  [
    "ENTER LIVE remains governed by readiness",
    source.includes("disabled={!briefingSufficient}"),
  ],
  [
    "ENTER LIVE advances to same-surface review",
    source.includes('onClick={() => setPhase("review")}'),
  ],
  [
    "No-question path does not manufacture readiness",
    !source.match(
      /signalAcquisition\.shouldAcquire !== true[\s\S]{0,500}setBriefingSufficient\(true\)/,
    ),
  ],
  [
    "Homepage communicates supportable versus sharp honestly",
    source.includes(
      "GEORGE can support you LIVE now.",
    ) && source.includes("Another answer could sharpen my support."),
  ],
  [
    "Obsolete NEXT QUESTION decision control is removed",
    !source.includes("NEXT QUESTION"),
  ],
];

let failed = false;

for (const [name, passed] of checks) {
  if (passed) {
    console.log(`PASS: ${name}`);
  } else {
    failed = true;
    console.error(`FAIL: ${name}`);
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log(
    "PASS: LH-3A3a homepage minimum viable LIVE readiness qualification",
  );
}
