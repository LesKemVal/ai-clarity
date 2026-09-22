import fs from "node:fs";

const page = fs.readFileSync("app/george/page.tsx", "utf8");
const entry = fs.readFileSync(
  "app/george/live-entry/LiveEntryClient.tsx",
  "utf8",
);
const provider = fs.readFileSync(
  "lib/george/runtime/provider/normal-provider.ts",
  "utf8",
);
const resolver = fs.readFileSync(
  "lib/george/runtime/live-verification-opportunity.ts",
  "utf8",
);
const liveCapabilitySurface = fs.readFileSync(
  "components/george/LiveCapabilitySurface.tsx",
  "utf8",
);
const runtimeContextComposer = fs.readFileSync(
  "lib/george/runtime/runtime-context-composer.ts",
  "utf8",
);
const operationalJudgment = fs.readFileSync(
  "lib/george/runtime/operational-judgment.ts",
  "utf8",
);
const chatRoute = fs.readFileSync(
  "app/api/chat/route.ts",
  "utf8",
);
const runtimePipeline = fs.readFileSync(
  "lib/george/runtime/runtime-pipeline.ts",
  "utf8",
);
const preparationController = fs.readFileSync(
  "lib/george/live-runtime/live-preparation-controller.ts",
  "utf8",
);
const signalQuestionRoute = fs.readFileSync(
  "app/api/george/live/signal-question/route.ts",
  "utf8",
);
const authorizedSignalQuestion = fs.readFileSync(
  "lib/george/live-runtime/authorized-signal-question.ts",
  "utf8",
);

function expect(label, condition) {
  if (!condition) {
    console.error(`FAIL: ${label}`);
    process.exit(1);
  }

  console.log(`PASS: ${label}`);
}

expect(
  "first LIVE tap explains support",
  page.includes(
    "LIVE lets me support you while another conversation is happening.",
  ),
);

expect(
  "second LIVE tap continues current conversation",
  page.includes("Tap LIVE again to continue with this conversation.") &&
    page.includes("continueCurrentConversationIntoLive") &&
    page.includes("startLiveSignalAcquisition();"),
);

expect(
  "LIVE orientation distinguishes current and alternate context",
  page.includes(
    "We can continue with THIS CONVERSATION, or use LIVE for SOMETHING ELSE.",
  ),
);

expect(
  "Normal LIVE desired outcome outranks subordinate scope confirmation",
  runtimeContextComposer.includes(
    "That choice establishes provenance only. It does not establish the desired outcome",
  ) &&
    runtimeContextComposer.includes(
      "Do not spend the first acquisition reconfirming whether the anticipated interaction is \"about\" the carried Normal subject",
    ) &&
    runtimeContextComposer.includes(
      "Its acquisition has priority over scope or topic confirmation, participant identity, role, mechanics, constraints, leverage, risks",
    ) &&
    runtimeContextComposer.includes(
      "No scope, participant, role, constraint, or other field is automatically next",
    ),
);

expect(
  "current conversation selection establishes provenance, not LIVE outcome",
  page.includes("continueCurrentConversationIntoLive") &&
    preparationController.includes("entrySource: 'normal' as const") &&
    provider.includes(
      "The user selected THIS CONVERSATION as provenance and starting context",
    ) &&
    provider.includes(
      "selection does not establish the desired outcome",
    ) &&
    !chatRoute.includes("const liveScopeGroundingRequired") &&
    !chatRoute.includes("const liveScopeGrounded"),
);

expect(
  "legitimate explicit LIVE scope gate remains canonical but is not imposed by second tap",
  operationalJudgment.includes("liveScopeGroundingRequired?: boolean") &&
    operationalJudgment.includes("liveScopeGroundingSatisfied") &&
    operationalJudgment.includes(
      "providerSignalAcquisitionSemanticValidations.get(reasoning)",
    ) &&
    operationalJudgment.includes(
      "signalAcquisitionSemanticValidation.satisfiesPurpose === true",
    ) &&
    operationalJudgment.includes("validatedScopeSpansSatisfied") &&
    runtimePipeline.includes(
      "liveScopeGroundingRequired?: boolean",
    ) &&
    runtimePipeline.includes(
      "liveScopeGroundingRequired: input.liveScopeGroundingRequired",
    ) &&
    !chatRoute.includes("liveScopeGroundingRequired,") &&
    !operationalJudgment.includes(
      "normalizeEvidenceNeed(consequentialUncertainty).includes(",
    ),
);

expect(
  "second-tap semantic pass invokes outcome boundary before adaptive qualification",
  provider.includes(
    "requiredSignalAcquisitionPurpose?: SignalAcquisitionPurpose",
  ) &&
    provider.includes("GEORGE LIVE DESIRED-OUTCOME EVIDENCE BOUNDARY") &&
    provider.includes("resolveLiveDesiredOutcomeBoundary") &&
    provider.includes(
      "When the desired LIVE outcome is unresolved, acquiring it has priority over",
    ) &&
    provider.includes(
      "The governed LIVE desired-outcome boundary controls this pass",
    ) &&
    chatRoute.includes(
      "requiredSignalAcquisitionPurpose: operationalJudgmentRequest",
    ) &&
    chatRoute.includes("? 'qualification'") &&
    !chatRoute.includes("? 'live_scope_grounding'"),
);

expect(
  "Normal semantic reasoning preserves contextual ambiguity",
  provider.includes(
    "Distinguish user-supplied context from a user-established instruction or",
  ) &&
    provider.includes(
      "preserve that exact uncertainty in consequentialUncertainty",
    ) &&
    provider.includes(
      "desiredOutcome may be null when the user has not established what they want to accomplish",
    ) &&
    provider.includes("buildNormalIntentBoundaryInstruction") &&
    provider.includes("resolveNormalIntentBoundary") &&
    provider.includes("GEORGE GOVERNED NORMAL INTENT BOUNDARY") &&
    provider.includes("normalCandidatesPreserveIntentBoundary") &&
    provider.includes(
      "signalCandidate.userOwnedFact must preserve that exact consequential uncertainty",
    ) &&
    !provider.includes("validateNormalCandidateIntent") &&
    !provider.includes("candidate_semantic_validation") &&
    operationalJudgment.includes(
      "disposition.disposition === 'unresolved'",
    ) &&
    operationalJudgment.includes("questions.length > 0") &&
    !operationalJudgment.includes(
      "questions.length > 0 &&\n    !governedProviderExecution",
    ),
);

expect(
  "LIVE desired outcome is distinct from LIVE scope",
  provider.includes(
    'signalAcquisition.purpose must be "live_scope_grounding" only when a canonical caller explicitly requires verification of what the anticipated LIVE interaction is about or how it relates to carried Normal context',
  ) &&
    provider.includes(
      'Acquiring the user-confirmed result they want from the interaction is "qualification"',
    ) &&
    !operationalJudgment.includes("live_outcome_grounding") &&
    !provider.includes("live_outcome_grounding"),
);

expect(
  "pre-qualification reasoning requires definitive execution-grade outcome evidence",
  provider.includes("GEORGE LIVE DESIRED-OUTCOME EVIDENCE BOUNDARY") &&
    provider.includes("resolveLiveDesiredOutcomeBoundary") &&
    provider.includes("userEstablishedDesiredLiveOutcome") &&
    provider.includes(
      "the subject or topic of the anticipated interaction by itself",
    ) &&
    provider.includes(
      "a persisted, inferred, baseline, proposed, or stale preparation value",
    ) &&
    provider.includes(
      "Interpret every answer together with the exact question GEORGE presented",
    ) &&
    provider.includes(
      "signalCandidate.userOwnedFact must preserve that exact consequential",
    ) &&
    provider.includes(
      "desired result from topic, broad purpose, role, counterpart, provisional",
    ),
);

expect(
  "definitive LIVE outcome releases fresh operational reassessment",
  provider.includes("GEORGE CONFIRMED LIVE DESIRED-OUTCOME EVIDENCE") &&
    provider.includes("reacquire or rephrase the desired outcome") &&
    provider.includes("Reassess the complete evidence") &&
    provider.includes("No participant, role,") &&
    provider.includes(
      "constraint, strategy, or other question is automatically next",
    ),
);

expect(
  "realized question example and answer retain semantic continuity",
  page.includes("question: currentPreLiveQuestion.question") &&
    page.includes("example: currentPreLiveQuestion.example") &&
    page.includes(
      'answer: interactionStatus === "answered" ? answer : ""',
    ) &&
    preparationController.includes("example?: string") &&
    preparationController.includes(
      "priorInteractions.map((interaction) => Object.freeze({ ...interaction }))",
    ) &&
    operationalJudgment.includes("Question shown:") &&
    operationalJudgment.includes(
      "Illustrative example shown (presentation guidance only; not evidence)",
    ) &&
    operationalJudgment.includes("User answer:") &&
    chatRoute.includes("currentConversation: incomingMessages") &&
    signalQuestionRoute.includes("priorInteractions,") &&
    signalQuestionRoute.includes("knownSignal") &&
    provider.includes("...input.messages.map("),
);

expect(
  "external LIVE desired outcome has exact canonical realization and contextual illustration",
  authorizedSignalQuestion.includes(
    "'What do you want from this conversation?' as const",
  ) &&
    authorizedSignalQuestion.includes("directLiveDesiredOutcome") &&
    authorizedSignalQuestion.includes("'desiredOutcome'") &&
    authorizedSignalQuestion.includes(
      "desired result plus useful contextual specificity",
    ) &&
    authorizedSignalQuestion.includes(
      "examplePromotedToEvidence === false",
    ),
);

expect(
  "second-tap LIVE briefing uses canonical highest-value signal authority",
  page.includes(
    "operationalJudgment.signalAcquisition.shouldAcquire",
  ) &&
    page.includes(
      "operationalJudgment.signalAcquisition.requestedSignal",
    ) &&
    page.includes("authorizedEvidenceNeed") &&
    page.includes('fetch("/api/george/live/signal-question"') &&
    page.includes("presentNormalAdaptiveQuestion(") &&
    !page.includes('key: "intended_live_interaction"') &&
    !page.includes(
      'question: "Who will you be speaking with, and about what?"',
    ),
);

expect(
  "different LIVE context remains available in the same control slot",
  page.includes('"/george/live-entry?source=start"') &&
    page.includes('normalLiveOrientationArmed') &&
    liveCapabilitySurface.includes("SOMETHING ELSE"),
);

expect(
  "verification opportunity derives from canonical judgment",
  resolver.includes('disposition.disposition !== "execution_opportunity"') &&
    resolver.includes("liveMateriallyImprovesExecution"),
);

expect(
  "provider may recommend legitimate verification interaction",
  provider.includes("A legitimate verification conversation may be an execution_opportunity"),
);

expect(
  "provider cannot manufacture LIVE demonstration",
  provider.includes("Never propose a conversation merely to demonstrate LIVE"),
);

expect(
  "verification enters Popup 3",
  entry.includes('title="Ready Room."') &&
    entry.includes("verificationLiveMode && liveBriefingStep === 3"),
);

expect(
  "verification receiver is user choice",
  entry.includes('selectVerificationReceiver("visual_only")') &&
    entry.includes('selectVerificationReceiver("audio_only")'),
);

expect(
  "verification preserves partnership doctrine",
  entry.includes(
    "Intelligent communication doesn&apos;t work without your voice.",
  ),
);

console.log("GEORGE Normal/LIVE partnership qualification passed");
