import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const section = (source, start, end) => {
  const startIndex = source.indexOf(start)
  const endIndex = source.indexOf(end, startIndex + start.length)
  assert.ok(startIndex >= 0 && endIndex > startIndex, `missing section: ${start}`)
  return source.slice(startIndex, endIndex)
}

const judgment = read('lib/george/runtime/operational-judgment.ts')
const chatRoute = read('app/api/chat/route.ts')
const contextComposer = read('lib/george/runtime/runtime-context-composer.ts')
const runtimeSupport = read('lib/george/live-runtime/prep-runtime.ts')
const liveEntry = read('app/george/live-entry/LiveEntryClient.tsx')

const homepageNormalizer = section(
  judgment,
  'function normalizeHomepageOperationalPreparationContext(',
  'export function normalizeOperationalPreparationContext(',
)
const sharedNormalizer = section(
  judgment,
  'export function normalizeOperationalPreparationContext(',
  'export function buildOperationalPreparationContextNote(',
)
const ingress = section(
  chatRoute,
  'const preparationTransport =',
  'const sessionTier =',
)
const semanticProposalPath = section(
  chatRoute,
  'const normalSemanticPhase =',
  'if (!normalSemanticPhase && !reply)',
)

assert.match(judgment, /export type OperationalPreparationEntrySource = 'normal' \| 'homepage'/)
assert.match(
  judgment,
  /export const NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST =\s+OPERATIONAL_PREPARATION_JUDGMENT_REQUEST/,
)
assert.match(sharedNormalizer, /input\.entrySource !== 'normal'/)
assert.match(sharedNormalizer, /!normalSessionId/)
assert.match(sharedNormalizer, /entrySource: 'normal' as const/)
assert.match(sharedNormalizer, /normalSessionId,/)
assert.match(sharedNormalizer, /preparationSessionId,/)

assert.match(homepageNormalizer, /provenance\.entrySource !== 'homepage'/)
assert.match(homepageNormalizer, /\^preparation_\[A-Za-z0-9-\]\+\$/)
assert.match(homepageNormalizer, /cleanOptionalText\(relations\?\.normalSessionId\)/)
assert.match(homepageNormalizer, /restoredFromKind === 'preparation'/)
assert.match(homepageNormalizer, /restoredFromKind === 'live_session'/)
assert.doesNotMatch(homepageNormalizer, /restoredFromKind === 'normal_session'/)
assert.match(homepageNormalizer, /restoredFromId === preparationSessionId/)
assert.match(homepageNormalizer, /restoredFromId === relatedLiveSessionId/)
assert.match(homepageNormalizer, /entrySource: 'homepage' as const/)
assert.match(homepageNormalizer, /preparationSessionId: preparationSessionId!/)
assert.match(
  homepageNormalizer,
  /preparationEvidenceProjection:\s*\n\s+input as unknown as PreparationRuntimeEvidenceProjection/,
)
assert.doesNotMatch(homepageNormalizer, /normalSessionId:/)
assert.match(
  homepageNormalizer,
  /precedence\.source !== 'active_normal_session_metadata'/,
)

assert.match(homepageNormalizer, /question,/)
assert.match(homepageNormalizer, /answer,/)
assert.match(homepageNormalizer, /status,/)
assert.match(homepageNormalizer, /evidenceNeed:/)
assert.match(homepageNormalizer, /confirmedPreparationEvidence/)
assert.match(homepageNormalizer, /qualifiedDocumentEvidence/)
assert.match(homepageNormalizer, /provisionalPreparationEvidence/)
assert.match(homepageNormalizer, /inferenceEvidence/)
assert.match(homepageNormalizer, /pendingQuestion:/)

assert.match(ingress, /projectNormalPreparationEvidence\(\{/)
assert.match(ingress, /projectPreparationSessionForLiveRuntime\(preparationTransport\.session\)/)
assert.match(ingress, /projectedPreparationSession\?\.provenance\.entrySource === 'homepage'/)
assert.match(ingress, /declaredEntrySource === 'homepage'/)
assert.match(
  ingress,
  /preparationEvidenceProjection: projectedPreparationSession/,
)
assert.match(
  ingress,
  /preparationTransport\.preparationSessionId ===\s+projectedPreparationSession\.preparationSessionId/,
)
assert.match(ingress, /!preparationTransport\.activeNormalSessionId/)
assert.match(ingress, /!preparationTransport\.linkedPreparationSessionId/)
assert.match(ingress, /!projectedPreparationSession\.relations\.normalSessionId/)
assert.match(ingress, /if \(operationalJudgmentRequested && !preparationContext\)/)
assert.match(ingress, /status: 400/)
assert.match(
  ingress,
  /preparationContext\?\.entrySource === 'normal' \|\|\s+preparationContext\?\.entrySource === 'homepage'/,
)

assert.match(semanticProposalPath, /runNormalSemanticProposal\(\{/)
assert.doesNotMatch(semanticProposalPath, /entrySource === 'homepage'/)
assert.doesNotMatch(chatRoute, /runHomepageSemanticProposal/)
assert.doesNotMatch(chatRoute, /homepageOperationalJudgment/)
assert.match(
  contextComposer,
  /export function buildOperationalPreparationJudgmentRequestNote\(\)/,
)
assert.match(
  contextComposer,
  /return buildOperationalPreparationJudgmentRequestNote\(\)/,
)
assert.doesNotMatch(contextComposer, /HOMEPAGE OPERATIONAL JUDGMENT PROMPT/)

assert.match(runtimeSupport, /preparationEvidence\?: PreparationRuntimeEvidenceProjection/)
assert.match(liveEntry, /projectPreparationSessionForLiveRuntime\(selectedPreparationSession\)/)
assert.doesNotMatch(judgment, /recentTranscript/)
assert.doesNotMatch(chatRoute, /recentTranscript/)
assert.doesNotMatch(contextComposer, /recentTranscript/)

console.log('GEORGE source-neutral Operational Preparation Judgment ingress qualification: PASS')
