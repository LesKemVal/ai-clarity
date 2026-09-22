import { execFileSync } from "node:child_process";
import fs, { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const owner = fs.readFileSync(
  "lib/george/live-runtime/authorized-signal-question.ts",
  "utf8",
);

assert(
  owner.includes(
    "Compare the authorized evidence need with the accumulated evidence before writing the question.",
  ) &&
    owner.includes(
      "Do not select, substitute, broaden, narrow, or reopen another evidence gap.",
    ),
  "authorized question formulation must remain bounded by Operational Judgment",
);

assert(
  owner.includes("export const DIRECT_LIVE_DESIRED_OUTCOME_QUESTION") &&
    owner.includes("What do you want from this conversation?") &&
    owner.includes("Do not rewrite, bridge, paraphrase, contextualize") &&
    owner.includes("Return null for question and questionStem"),
  "external LIVE desired-outcome realization is not canonically fixed",
);

assert(
  owner.includes("export const INFERENCE_CORRECTION_SUFFIX") &&
    owner.includes(" — or something else?") &&
    owner.includes("generate a grammatical pre-suffix question stem") &&
    owner.includes("correctionSuffixCount === 1"),
  "inference realization does not use a canonical exactly-once suffix",
);

assert(
  owner.includes("desired result plus useful contextual specificity") &&
    owner.includes("not merely repeat or confirm the broad topic") &&
    owner.includes("presentation guidance, never user-owned evidence") &&
    owner.includes("contextualExample") &&
    owner.indexOf("if (directLiveDesiredOutcome)") <
      owner.indexOf("const formulationInstruction"),
  "contextual examples are not constrained as illustrative non-evidence",
);

assert(
  owner.includes(
    "direct_desired_outcome has priority when the evidence need directly asks for the desired result",
  ) &&
    owner.indexOf("dutyParsed?.asksForDesiredLiveResult === true") <
      owner.indexOf("dutyParsed?.groundsAnticipatedLiveScope === true"),
  "incidental scope grounding still outranks direct LIVE desired-outcome duty",
);

assert(
  owner.includes(
    "current_george_exchange always requires direct_desired_outcome",
  ) &&
    owner.includes(
      'Do not add "or something else?" or any equivalent correction-path alternative to this direct outcome question.',
    ),
  "Normal GEORGE desired-outcome acquisition lost its distinct direct duty",
);

assert(
  owner.includes(
    "Later questions must depend on the user's answer and a fresh reassessment.",
  ),
  "authorized question owner must not prebuild a questionnaire",
);

const root = process.cwd();
const dir = mkdtempSync(join(tmpdir(), "george-authorized-question-"));
const file = join(dir, "qualification.ts");

writeFileSync(
  file,
  `
import {
  DIRECT_LIVE_DESIRED_OUTCOME_QUESTION,
  INFERENCE_CORRECTION_SUFFIX,
  formulateAuthorizedSignalQuestion,
  realizeInferenceQuestionStem,
} from '${root}/lib/george/live-runtime/authorized-signal-question'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

async function qualify() {
const queued: unknown[] = []
let providerCompletionCount = 0
const client = {
  chat: {
    completions: {
      create: async () => {
        providerCompletionCount += 1
        const content = queued.shift()
        if (!content) throw new Error('qualification completion queue exhausted')
        return { choices: [{ message: { content: JSON.stringify(content) } }] }
      },
    },
  },
}

async function formulate(
  authorizedEvidenceNeed: string,
  completions: unknown[],
  authorizationPurpose?: 'live_scope_grounding' | 'qualification',
) {
  queued.push(...completions)
  const result = await formulateAuthorizedSignalQuestion({
    client: client as never,
    model: 'qualification-model',
    authorizedEvidenceNeed,
    authorizationReason: 'Canonical Operational Judgment authorized this exact evidence need.',
    authorizationPurpose,
    knownSignal: {
      currentUserEvidence: [
        'The user is thinking of building a private investment platform.',
      ],
    },
  })
  assert(queued.length === 0, 'question owner did not consume the expected semantic passes')
  return result
}

const liveOutcomeDuty = {
  realizationDuty: 'inference_testing',
  evidenceObject: 'anticipated_live_interaction',
  asksForDesiredLiveResult: true,
  belongsToAnticipatedLiveInteraction: true,
  groundsAnticipatedLiveScope: true,
  testsUnconfirmedInterpretation: true,
  asksForDirectFact: false,
  contextualExample: 'I want the broker-dealer to agree to sponsor the platform launch this quarter.',
  reason: 'Adversarial fixture notices incidental scope and declares the wrong duty.',
}

const liveOutcomeCompletionCountBefore = providerCompletionCount
const directOutcome = await formulate(
  'the concrete result the user wants to accomplish in the anticipated LIVE interaction',
  [liveOutcomeDuty],
  'qualification',
)
const liveOutcomeCompletionCount =
  providerCompletionCount - liveOutcomeCompletionCountBefore

assert(
  directOutcome.status === 'question' &&
    directOutcome.question === DIRECT_LIVE_DESIRED_OUTCOME_QUESTION &&
    directOutcome.label === 'Desired outcome' &&
    directOutcome.key === 'desiredOutcome' &&
    directOutcome.why ===
      'Canonical Operational Judgment authorized this exact evidence need.' &&
    directOutcome.example ===
      'I want the broker-dealer to agree to sponsor the platform launch this quarter.' &&
    !directOutcome.question.includes('or something else') &&
    liveOutcomeCompletionCount === 1,
  'external LIVE desired outcome was not realized by the exact canonical question',
)

const missingContextualExample = await formulate(
  'the concrete result the user wants to accomplish in the anticipated LIVE interaction',
  [
    {
      ...liveOutcomeDuty,
      contextualExample: null,
    },
  ],
  'qualification',
)

assert(
  missingContextualExample.status === 'unavailable' &&
    missingContextualExample.reason === 'question_formulation_unavailable',
  'missing contextual illustration did not fail closed',
)

const currentGeorgeOutcome = await formulate(
  'The specific guidance, action, or evaluation the user wants GEORGE to provide about building a private investment platform.',
  [
    {
      realizationDuty: 'inference_testing',
      evidenceObject: 'current_george_exchange',
      asksForDesiredLiveResult: false,
      belongsToAnticipatedLiveInteraction: false,
      groundsAnticipatedLiveScope: true,
      testsUnconfirmedInterpretation: true,
      asksForDirectFact: false,
      reason: 'Adversarial fixture misclassifies the missing Normal GEORGE move.',
    },
    {
      status: 'question',
      question: 'What would you like GEORGE to help you accomplish with the platform?',
      questionStem: null,
      label: 'Desired support',
      why: 'The requested move governs the next useful response.',
      example: 'Help me pressure-test the business model.',
      key: 'desired_george_result',
    },
    {
      verdict: 'aligned',
      realizationDuty: 'direct_desired_outcome',
      inferencePresentedAsPossibility: false,
      suggestedOutcomePresent: false,
      correctionPathAtEnd: false,
      grammarNatural: true,
      canonicalQuestionPreserved: true,
      reason: 'The question directly acquires the Normal GEORGE move.',
    },
  ],
)

assert(
  currentGeorgeOutcome.status === 'question' &&
    currentGeorgeOutcome.question ===
      'What would you like GEORGE to help you accomplish with the platform?' &&
    !currentGeorgeOutcome.question.includes('or something else'),
  'Normal GEORGE desired-outcome acquisition was changed or given an inference suffix',
)

const inferenceQuestion = await formulate(
  'whether the user is trying to get the counterparty to reduce the dilution',
  [
    {
      realizationDuty: 'inference_testing',
      evidenceObject: 'anticipated_live_interaction',
      asksForDesiredLiveResult: false,
      belongsToAnticipatedLiveInteraction: true,
      groundsAnticipatedLiveScope: false,
      testsUnconfirmedInterpretation: true,
      asksForDirectFact: false,
      reason: 'The need tests a supported interpretation.',
    },
    {
      status: 'question',
      question: null,
      questionStem: 'Are you trying to get their agreement to reduce the dilution',
      label: 'Desired agreement',
      why: 'The intended agreement changes preparation.',
      example: 'I need them to accept less dilution.',
      key: 'dilution_agreement',
    },
    {
      verdict: 'aligned',
      realizationDuty: 'inference_testing',
      inferencePresentedAsPossibility: true,
      suggestedOutcomePresent: false,
      correctionPathAtEnd: true,
      grammarNatural: true,
      canonicalQuestionPreserved: true,
      reason: 'The canonical suffix completes the grammatical stem.',
    },
  ],
)

assert(
  inferenceQuestion.status === 'question' &&
    inferenceQuestion.question ===
      'Are you trying to get their agreement to reduce the dilution — or something else?' &&
    inferenceQuestion.question.split(INFERENCE_CORRECTION_SUFFIX).length - 1 === 1 &&
    realizeInferenceQuestionStem(
      'Are you trying to get their agreement to reduce the dilution',
    ) === inferenceQuestion.question,
  'inference question did not receive the exact canonical suffix once at the end',
)

const malformedInference = await formulate(
  'whether the anticipated counterpart is the decision-maker',
  [
    {
      realizationDuty: 'inference_testing',
      evidenceObject: 'anticipated_live_interaction',
      asksForDesiredLiveResult: false,
      belongsToAnticipatedLiveInteraction: true,
      groundsAnticipatedLiveScope: false,
      testsUnconfirmedInterpretation: true,
      asksForDirectFact: false,
      reason: 'The need tests an interpretation.',
    },
    ...Array.from({ length: 2 }, () => [
      {
        status: 'question',
        question: null,
        questionStem: 'Is the person the decision-maker — or something else?',
        label: 'Counterpart',
        why: 'Counterpart authority changes preparation.',
        example: 'They advise the decision-maker.',
        key: 'counterpart_authority',
      },
      {
        verdict: 'aligned',
        realizationDuty: 'inference_testing',
        inferencePresentedAsPossibility: true,
        suggestedOutcomePresent: false,
        correctionPathAtEnd: true,
        grammarNatural: true,
        canonicalQuestionPreserved: true,
        reason: 'Adversarial fixture claims the non-stem is acceptable.',
      },
    ]).flat(),
  ],
)

assert(
  malformedInference.status === 'unavailable',
  'question owner accepted a provider-authored correction suffix instead of a stem',
)

const directFact = await formulate(
  'the date of the anticipated external conversation',
  [
    {
      realizationDuty: 'direct_fact',
      evidenceObject: 'other_user_fact',
      asksForDesiredLiveResult: false,
      belongsToAnticipatedLiveInteraction: false,
      groundsAnticipatedLiveScope: false,
      testsUnconfirmedInterpretation: false,
      asksForDirectFact: true,
      reason: 'The need asks for a direct factual date.',
    },
    {
      status: 'question',
      question: 'When is the conversation?',
      questionStem: null,
      label: 'Timing',
      why: 'Timing changes preparation urgency.',
      example: 'Next Tuesday afternoon.',
      key: 'conversation_date',
    },
    {
      verdict: 'aligned',
      realizationDuty: 'direct_fact',
      inferencePresentedAsPossibility: false,
      suggestedOutcomePresent: false,
      correctionPathAtEnd: false,
      grammarNatural: true,
      canonicalQuestionPreserved: true,
      reason: 'The question asks for the direct fact without an inference.',
    },
  ],
)

assert(
  directFact.status === 'question' &&
    directFact.question === 'When is the conversation?' &&
    !directFact.question.includes('or something else'),
  'a direct factual acquisition received the inference suffix',
)

console.log(JSON.stringify({
  directLiveQuestion: directOutcome.status === 'question'
    ? directOutcome.question
    : directOutcome.status,
  contextualExample: directOutcome.status === 'question'
    ? directOutcome.example
    : directOutcome.status,
  directLiveProviderCompletions: liveOutcomeCompletionCount,
  missingContextualExampleFailsClosed:
    missingContextualExample.status === 'unavailable',
  currentGeorgeDesiredOutcome: currentGeorgeOutcome.status,
  inferenceSuffixExactlyOnce: inferenceQuestion.status === 'question',
  providerSuffixRejected: malformedInference.status === 'unavailable',
  directFactUnsuffixed: directFact.status === 'question',
  result: 'PASS',
}, null, 2))

}

qualify().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
`,
);

try {
  execFileSync("npx", ["tsx", file], {
    cwd: root,
    stdio: "inherit",
  });
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(
  JSON.stringify(
    {
      operationalJudgmentAuthorityPreserved: true,
      exactExternalOutcomeQuestion: true,
      desiredOutcomeOutranksIncidentalScope: true,
      directLiveProviderCompletionCount: 1,
      contextualIllustrationValidated: true,
      missingContextualIllustrationFailsClosed: true,
      normalGeorgeOutcomeDistinct: true,
      inferenceSuffixCanonical: true,
      directFactUnsuffixed: true,
      freshReassessmentRequired: true,
      result: "PASS",
    },
    null,
    2,
  ),
);
