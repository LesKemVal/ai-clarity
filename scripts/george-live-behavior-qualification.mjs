import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function loadTypeScriptModule(path) {
  const source = readFileSync(path, 'utf8')
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      strict: true,
    },
    fileName: path,
    reportDiagnostics: true,
  })

  const diagnostics = transpiled.diagnostics || []
  assert(
    diagnostics.length === 0,
    `Unable to transpile ${path}: ${diagnostics
      .map((diagnostic) => ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n'
      ))
      .join('; ')}`
  )

  const module = { exports: {} }
  const context = vm.createContext({
    module,
    exports: module.exports,
    console,
  })

  new vm.Script(transpiled.outputText, { filename: path }).runInContext(context)
  return module.exports
}

const root = process.cwd()
const {
  composeGeorgeSupportBehavior,
} = loadTypeScriptModule(
  `${root}/lib/george/live-runtime/support-behavior-composer.ts`
)
const { LIVE_SUPPORT_PANELS } = loadTypeScriptModule(
  `${root}/lib/george/capabilities/live-support-panels.ts`
)

const liveEntrySource = readFileSync(
  `${root}/app/george/live-entry/LiveEntryClient.tsx`,
  'utf8'
)

assert(
  JSON.stringify(LIVE_SUPPORT_PANELS.map(({ id, label }) => ({ id, label }))) ===
    JSON.stringify([
      { id: 'advice', label: 'Cue' },
      { id: 'response', label: 'Lines' },
    ]),
  'The user-facing LIVE support model must contain only Cue and Lines'
)

const cuePanel = LIVE_SUPPORT_PANELS.find((panel) => panel.id === 'advice')
const linesPanel = LIVE_SUPPORT_PANELS.find((panel) => panel.id === 'response')

assert(
  cuePanel?.line === 'Concise advice about what to do or say next.',
  'Cue must remain advice-oriented'
)
assert(
  linesPanel?.line === 'Directly usable speech in your voice.',
  'Lines must remain directly usable user speech'
)
assert(
  liveEntrySource.includes('if (style === "response") return "response";') &&
    liveEntrySource.includes('return "advice";'),
  'Cue and Lines must map to the existing advice/response runtime semantics'
)
assert(
  liveEntrySource.includes(
    'const supportLabel = activeAdaptiveSupportPanel.label;'
  ),
  'Ready Room must present the canonical Cue/Lines label'
)
assert(
  liveEntrySource.includes(
    '...(selectedBehavior ? { behavior: selectedBehavior } : {}),'
  ),
  'The user choice must remain a real PreparationSession override'
)

function decide(input) {
  return composeGeorgeSupportBehavior(input)
}

function expectResource(name, input, expected) {
  const decision = decide(input)
  assert(
    decision.operationalResource === expected,
    `${name}: expected ${expected}, received ${decision.operationalResource}. Reason: ${decision.reason}`
  )
  assert(
    decision.temporary === true,
    `${name}: support behavior decisions must remain current-turn decisions`
  )
  assert(
    typeof decision.reason === 'string' && decision.reason.length > 0,
    `${name}: decision must preserve an inspectable reason`
  )
  return decision
}

/*
 * Adaptive starting preference remains stable while evidence says it works.
 */
expectResource(
  'Adaptive Cue remains concise while working',
  {
    adaptivePreference: 'cue',
    currentSupportWorking: true,
    hasSafeResponse: true,
  },
  'cue'
)

expectResource(
  'Adaptive Response remains complete while working',
  {
    adaptivePreference: 'response',
    currentSupportWorking: true,
    hasSafeResponse: true,
  },
  'response'
)

/*
 * Continuation, repeat, and recovery are selected from execution evidence.
 */
expectResource(
  'High-confidence unfinished thought selects continuation',
  {
    adaptivePreference: 'cue',
    userSpeaking: true,
    hasHighConfidenceCompletion: true,
    hasSafeResponse: true,
  },
  'continuation'
)

expectResource(
  'Missed established ending selects repeat',
  {
    adaptivePreference: 'response',
    userAppearsToBeShadowing: true,
    userMissedEnding: true,
    hasHighConfidenceCompletion: true,
    hasSafeResponse: true,
  },
  'repeat'
)

expectResource(
  'Lost place in queued language selects recovery',
  {
    adaptivePreference: 'cue',
    userAppearsToBeShadowing: true,
    userLostPlace: true,
    hasCurrentSentence: true,
    hasSafeResponse: true,
  },
  'recovery'
)

/*
 * User execution has priority over unnecessary support.
 */
expectResource(
  'Natural user takeover yields temporarily',
  {
    adaptivePreference: 'response',
    userTookOverNaturally: true,
    hasSafeResponse: true,
  },
  'silence'
)

expectResource(
  'Known completion may still assist after takeover evidence',
  {
    adaptivePreference: 'cue',
    userTookOverNaturally: true,
    userSpeaking: true,
    hasHighConfidenceCompletion: true,
    hasSafeResponse: true,
  },
  'continuation'
)

/*
 * Adaptive Response uses complete usable language when safe.
 */
expectResource(
  'Adaptive Response starts with a safe complete response',
  {
    adaptivePreference: 'response',
    hasSafeResponse: true,
  },
  'response'
)

expectResource(
  'Direct-support need preserves safe Adaptive Response',
  {
    adaptivePreference: 'response',
    userNeedsMoreDirectSupport: true,
    hasSafeResponse: true,
  },
  'response'
)

/*
 * Safety overrides preference without abandoning support.
 */
expectResource(
  'Unavailable safe response falls back to cue',
  {
    adaptivePreference: 'response',
    hasSafeResponse: false,
  },
  'cue'
)

/*
 * Legacy delivery style may establish the starting preference, but does not
 * create another runtime or operational-resource vocabulary.
 */
expectResource(
  'Legacy response delivery style resolves to Adaptive Response',
  {
    deliveryStyle: 'response',
    hasSafeResponse: true,
  },
  'response'
)

expectResource(
  'Legacy line delivery style resolves to Adaptive Response',
  {
    deliveryStyle: 'line',
    hasSafeResponse: true,
  },
  'response'
)

expectResource(
  'Unspecified preference defaults to Adaptive Cue',
  {
    hasSafeResponse: true,
  },
  'cue'
)

/*
 * Receiver recommendation and receiver confirmation are separate authorities.
 * GEORGE may recommend a delivery receiver, but only explicit user selection
 * may satisfy preparation readiness.
 */
const receiverConfirmationSource = readFileSync(
  `${root}/app/george/live-entry/LiveEntryClient.tsx`,
  'utf8'
)

assert(
  /setSelectedReceiverProfile\(homepageReceiverProfile\);\s*setReceiverProfileConfirmed\(\s*Boolean\(\s*recommendedHomepageSession\?\.support\.confirmations\.receiverConfirmed\s*\?\?\s*homepagePreparationSeed\?\.support\.confirmations\.receiverConfirmed,?\s*\),?\s*\);/.test(
    receiverConfirmationSource
  ),
  'Homepage receiver confirmation must restore only canonical PreparationSession confirmation'
)

assert(
  /const hasCompletedSupportConfiguration = Boolean\([\s\S]*?selectedReceiverProfile &&\s*receiverProfileConfirmed &&\s*String\(communicationStyle/.test(
    receiverConfirmationSource
  ),
  'Support readiness must require explicit receiver confirmation'
)

assert(
  /const mechanicsSelectionsComplete = Boolean\([\s\S]*?selectedReceiverProfile &&\s*receiverProfileConfirmed &&\s*String\(communicationStyle/.test(
    receiverConfirmationSource
  ),
  'Mechanics completion must require explicit receiver confirmation'
)

/*
 * Homepage Final Review already owns preparation and delivery confirmation.
 * LIVE Entry must not add Ready Room as another homepage stop. Once canonical
 * homepage preparation is complete, it delegates exactly once to startLive(),
 * which remains the LIVE launch authority.
 */
assert(
  /homepageWorkflowAction === "review_brief"[\s\S]*?setShowLiveBriefingRoom\(false\);/.test(
    receiverConfirmationSource
  ),
  'Homepage handoff must not present the redundant Ready Room'
)

assert(
  /savePreparationSession\(restoredPreparationSession\);\s*setShowLiveBriefingRoom\(source !== "homepage"\);\s*setLiveBriefingStep\(3\);/.test(
    receiverConfirmationSource
  ),
  'Homepage live-prep return must not reopen Ready Room while preserving shared restoration for other routes'
)

assert(
  receiverConfirmationSource.includes(
    'const homepageDirectLiveStartedRef = useRef(false);'
  ),
  'Homepage direct LIVE handoff must have a one-shot launch guard'
)

assert(
  /useEffect\(\(\) => \{\s*if \(liveEntryRoute !== "homepage"\) return;\s*if \(!homepagePreparationSession\) return;\s*if \(!hasRequiredLiveSignal\) return;\s*if \(homepageDirectLiveStartedRef\.current\) return;/.test(
    receiverConfirmationSource
  ),
  'Homepage direct LIVE handoff must require canonical preparation and existing LIVE signal readiness'
)

assert(
  /const homepageReadyForDirectLive = Boolean\([\s\S]*?homepageSupport\.receiver[\s\S]*?homepageConfirmations\.receiverConfirmed &&\s*homepageConfirmations\.speakingStyleConfirmed/.test(
    receiverConfirmationSource
  ),
  'Homepage direct LIVE handoff must require canonical delivery configuration and confirmations'
)

assert(
  /if \(!homepageReadyForDirectLive\) return;\s*const hasLiveAccess =\s*Boolean\(sessionEmail\.trim\(\)\) \|\|\s*preLivePreviewReady \|\|\s*window\.localStorage\.getItem\("george_founder_access"\) ===\s*"server-verified";\s*if \(!hasLiveAccess\) return;\s*homepageDirectLiveStartedRef\.current = true;\s*startLive\(false, editableResources, true\);/.test(
    receiverConfirmationSource
  ),
  'Homepage direct LIVE handoff must wait for existing LIVE access authority, then delegate once to canonical startLive'
)

/*
 * Receiver profile is deliberately absent from composer input. Receiver
 * changes realization downstream and must not alter behavior selection.
 */
const composerSource = readFileSync(
  `${root}/lib/george/live-runtime/support-behavior-composer.ts`,
  'utf8'
)

assert(
  !composerSource.includes('receiverProfile'),
  'Support Behavior Composer must not select behavior from receiver profile'
)

for (const resource of [
  'cue',
  'line',
  'continuation',
  'response',
  'recovery',
  'repeat',
  'silence',
]) {
  assert(
    composerSource.includes(`| '${resource}'`),
    `Canonical operational resource vocabulary should include ${resource}`
  )
}

console.log('GEORGE LIVE behavioral qualification passed')
