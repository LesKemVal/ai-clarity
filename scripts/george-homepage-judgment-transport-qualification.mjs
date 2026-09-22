import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}
const section = (source, start, end) => {
  const startIndex = source.indexOf(start)
  const endIndex = source.indexOf(end, startIndex + start.length)
  return startIndex >= 0 && endIndex > startIndex
    ? source.slice(startIndex, endIndex)
    : ''
}

const homepage = read('components/home/HomeConversationTypeSurface.tsx')
const signalRoute = read('app/api/george/live/signal-question/route.ts')
const judgment = read('lib/george/runtime/operational-judgment.ts')
const chatRoute = read('app/api/chat/route.ts')

const request = section(
  homepage,
  'async function requestHomepageOperationalJudgment(',
  'function editCurrentUnderstanding()',
)
const judgmentRequestBody = section(
  request,
  'body: JSON.stringify({',
  '        }),\n      });',
)
const understanding = section(
  homepage,
  'function preserveCurrentUnderstanding()',
  'async function submitHomepageOptionalAnswer(',
)
const answer = section(
  homepage,
  'async function submitHomepageOptionalAnswer(',
  'function skipHomepageOptionalQuestion()',
)
const acceptedLiveTurn = section(
  homepage,
  'function applyAcceptedLiveBriefingTurn(',
  'async function requestHomepageOperationalJudgment(',
)
const skip = section(
  homepage,
  'function skipHomepageOptionalQuestion()',
  'function continueHomepageBriefing()',
)
const begin = section(
  homepage,
  'function beginQuestions()',
  'function preserveHomepagePendingQuestion(',
)

assert(request, 'homepage Operational Judgment request function is missing')
assert(
  request.indexOf('fetch("/api/chat"') >= 0 &&
    request.indexOf('fetch("/api/chat"') <
      request.indexOf('"/api/george/live/signal-question"'),
  'homepage does not invoke Operational Judgment before question formulation',
)
assert(
  judgmentRequestBody.includes('entrySource: "homepage"') &&
    judgmentRequestBody.includes('preparationSessionId') &&
    judgmentRequestBody.includes('session: preparationSession') &&
    !judgmentRequestBody.includes('normalSessionId'),
  'homepage judgment payload has incorrect preparation provenance or identity',
)
assert(
  request.includes('signalAcquisition.requestedSignal') &&
    request.includes('authorizedEvidenceNeed') &&
    request.includes('authorizationReason') &&
    request.includes(
      'operationalJudgmentAuthorization: authorization',
    ),
  'authorized evidence need is not transported from judgment to formulation',
)
assert(
  request.includes(
    'String(formulationPayload?.evidenceNeed || "") !==',
  ) &&
    request.includes(
      'returnedAuthorization.requestedSignal !== authorizedEvidenceNeed',
    ) &&
    request.includes(
      'returnedAuthorization.reason !== authorizationReason',
    ),
  'question formulation is not validated against exact authorization',
)
assert(
  request.includes('homepageAssessmentSequenceRef.current') &&
    request.includes('homepageAssessmentAbortRef.current?.abort()') &&
    request.includes('controller.signal.aborted') &&
    request.includes('responseIsCurrent()'),
  'stale-request and abort protection is incomplete',
)
assert(
  request.includes('preserveHomepagePendingQuestion(') &&
    request.includes('evidenceNeed: authorizedEvidenceNeed'),
  'authorized pending question is not preserved canonically',
)
const readinessAcceptance = section(
  request,
  'const readinessJudgment =',
  'const signalAcquisition =',
)
const noAuthorizedQuestion = section(
  request,
  'if (\n        signalAcquisition.shouldAcquire !== true',
  'const authorization: HomepageOperationalJudgmentAuthorization',
)

assert(
  readinessAcceptance.includes(
    'judgmentResult.operationalJudgment.preparationReadiness',
  ) &&
    readinessAcceptance.includes(
      'readinessJudgment?.source === "operational_judgment"',
    ) &&
    readinessAcceptance.includes(
      'readinessJudgment.minimumLiveSupportEstablished === true',
    ) &&
    readinessAcceptance.includes(
      'if (minimumLiveSupportEstablished)',
    ) &&
    readinessAcceptance.includes('setBriefingSufficient(true)'),
  'homepage readiness is not restricted to accepted canonical execution readiness',
)
assert(
  noAuthorizedQuestion &&
    noAuthorizedQuestion.includes(
      'preserveHomepagePendingQuestion(preparationSession, null)',
    ) &&
    noAuthorizedQuestion.includes('setOptionalQuestion(null)') &&
    !noAuthorizedQuestion.includes('setBriefingSufficient(true)') &&
    request.includes('setBriefingSufficient(false)'),
  'absence of a question can still manufacture homepage LIVE readiness',
)
assert(
  understanding.indexOf('savePreparationSession(nextSession)') >= 0 &&
    understanding.indexOf('savePreparationSession(nextSession)') <
      understanding.indexOf('requestHomepageOperationalJudgment('),
  'Current Understanding is not preserved before reassessment',
)
assert(
  answer.includes('fetch("/api/chat"') &&
    answer.includes('preparationTurnIntent: {') &&
    answer.includes('explicitSelection: explicitSelection ?? null') &&
    answer.indexOf('applyAcceptedLiveBriefingTurn(') >
      answer.indexOf('classification?.authority !== "operational_judgment"') &&
    !answer.includes('interactionMode: "ask_george"'),
  'homepage conversational turns do not pass through accepted canonical classification',
)
assert(
  acceptedLiveTurn.includes(
    'acceptedDisposition.providerProposalAccepted',
  ) &&
    acceptedLiveTurn.includes('classification.preservePendingQuestion') &&
    acceptedLiveTurn.includes('acceptedDisposition.knownEvidence') &&
    !acceptedLiveTurn.includes('exactSubmission'),
  'raw submission can enter homepage evidence before canonical acceptance',
)
assert(
  skip.indexOf('savePreparationSession(nextSession)') >= 0 &&
    skip.indexOf('savePreparationSession(nextSession)') <
      skip.indexOf('requestHomepageOperationalJudgment(nextSession)'),
  'skip is not preserved before reassessment',
)
assert(
  !begin.includes('selectedRole?.label') &&
    !homepage.includes(
      'role: answers.role || selectedRole?.label || ""',
    ),
  'an inferred/restored selected role can still enter confirmed evidence',
)
assert(
  signalRoute.includes('homepageAuthorizationValid') &&
    signalRoute.includes(
      'invalid_operational_judgment_authorization',
    ) &&
    signalRoute.includes(
      'if (homepagePreparationRequest && !homepageAuthorizationValid)',
    ),
  'homepage signal-question requests are not authorization-gated',
)
assert(
  signalRoute.indexOf(
    'if (homepagePreparationRequest && !homepageAuthorizationValid)',
  ) <
    signalRoute.indexOf(
      "You are GEORGE's adaptive preparation evidence-acquisition authority.",
    ),
  'homepage can reach independent evidence selection before authorization rejection',
)
assert(
  signalRoute.includes("transitionReason: 'rate_limited'") &&
    signalRoute.includes("status: 'unavailable'") &&
    !section(
      signalRoute,
      'if (!rate.ok)',
      'const body = (await req.json())',
    ).includes("status: 'sufficient'"),
  'rate limiting still falsely declares evidence sufficient',
)
assert(
  judgment.includes(
    "export type OperationalPreparationEntrySource = 'normal' | 'homepage'",
  ) &&
    chatRoute.includes("declaredEntrySource === 'homepage'"),
  'validated shared Operational Preparation Judgment ingress is missing',
)
assert(
  homepage.includes('disabled={!briefingSufficient}') ||
    homepage.includes('disabled'),
  'Enter LIVE does not retain a disabled pre-readiness state',
)

console.log(
  'GEORGE homepage Operational Judgment transport qualification: PASS',
)
