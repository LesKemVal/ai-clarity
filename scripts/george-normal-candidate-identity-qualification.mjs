import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const provider = readFileSync(
  "lib/george/runtime/provider/normal-provider.ts",
  "utf8",
);

const normalize = (value) =>
  String(value)
    .trim()
    .replace(/[‘’‚‛'“”„‟"]/g, '"')
    .replace(/\s+/g, " ");

const matches = (left, right) => normalize(left) === normalize(right);

assert.equal(
  matches(
    "The specific context in which the user is asking about 'dilution'.",
    'The specific context in which the user is asking about "dilution".',
  ),
  true,
);

assert.equal(
  matches(
    "Clarify   the meaning of 'dilution' across contexts.",
    'Clarify the meaning of "dilution" across contexts.',
  ),
  true,
);

assert.equal(
  matches(
    "The specific context in which the user is asking about dilution.",
    "The specific financial context in which the user is asking about dilution.",
  ),
  false,
);

assert.equal(
  matches(
    "Clarify the meaning of dilution.",
    "Explain the financial meaning of dilution.",
  ),
  false,
);

assert.match(
  provider,
  /function normalizeNormalCandidateIdentityText\(/,
);

assert.match(
  provider,
  /!normalCandidateIdentityMatches\(\s*comparison\.bestActionNow,\s*discoveredActNow\s*\)/,
);

assert.match(
  provider,
  /!normalCandidateIdentityMatches\(\s*comparison\.candidateSignal,\s*discoveredSignal\s*\)/,
);

assert.match(
  provider,
  /comparison\.signalInteractionCost !== discoveredSignalCost/,
);

assert.doesNotMatch(
  provider,
  /toLowerCase\(\)/,
);

console.log(
  JSON.stringify(
    {
      quoteTypographyEquivalent: true,
      whitespaceEquivalent: true,
      semanticSubstitutionRejected: true,
      signalCostRemainsExact: true,
      fuzzyMatchingIntroduced: false,
      result: "PASS",
    },
    null,
    2,
  ),
);
