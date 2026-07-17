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
      .map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      )
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
const { composeGeorgeSupportBehavior } = loadTypeScriptModule(
  `${root}/lib/george/live-runtime/support-behavior-composer.ts`
)

function decide(input) {
  return composeGeorgeSupportBehavior(input)
}

function expect(name, input, resource) {
  const decision = decide(input)

  assert(
    decision.operationalResource === resource,
    `${name}: expected ${resource}, received ${decision.operationalResource}. ${decision.reason}`
  )

  assert(
    decision.temporary === true,
    `${name}: recovery decisions must remain current-turn decisions`
  )

  return decision
}

function expectSequence(name, steps, expectedResources) {
  const observed = steps.map((step) => decide(step).operationalResource)

  assert(
    JSON.stringify(observed) === JSON.stringify(expectedResources),
    `${name}: expected ${expectedResources.join(' -> ')}, received ${observed.join(' -> ')}`
  )
}

/*
 * Interruption and floor control:
 * GEORGE yields when the user resumes successfully, but may preserve a known
 * completion when evidence says the unfinished thought still needs support.
 */
expect(
  'User resumes naturally after interruption',
  {
    adaptivePreference: 'response',
    userTookOverNaturally: true,
    hasSafeResponse: true,
  },
  'silence'
)

expect(
  'Known unfinished thought survives interruption',
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
 * Missed language should restore what was already established rather than
 * introducing a new answer.
 */
expect(
  'Missed ending restores only the queued tail',
  {
    userAppearsToBeShadowing: true,
    userMissedEnding: true,
    hasHighConfidenceCompletion: true,
    hasCurrentSentence: true,
    hasSafeResponse: true,
  },
  'repeat'
)

expect(
  'Lost place restores the current sentence',
  {
    userAppearsToBeShadowing: true,
    userLostPlace: true,
    hasCurrentSentence: true,
    hasSafeResponse: true,
  },
  'recovery'
)

/*
 * Priority qualification:
 * Repeat is more precise than generic recovery when both missed-ending and
 * lost-place evidence are present.
 */
expect(
  'Specific missed-ending evidence outranks generic lost-place recovery',
  {
    userAppearsToBeShadowing: true,
    userMissedEnding: true,
    userLostPlace: true,
    hasHighConfidenceCompletion: true,
    hasCurrentSentence: true,
    hasSafeResponse: true,
  },
  'repeat'
)

/*
 * Silence and unavailable language:
 * GEORGE does not fabricate a complete response when one is not safe.
 */
expect(
  'Unsafe complete response falls back to the shortest useful cue',
  {
    adaptivePreference: 'response',
    hasSafeResponse: false,
    roomPressure: 'high',
  },
  'cue'
)

expect(
  'No recovery evidence returns to the selected working posture',
  {
    adaptivePreference: 'response',
    currentSupportWorking: true,
    hasSafeResponse: true,
  },
  'response'
)

/*
 * Sequential recovery qualification:
 * A LIVE room may move from normal support to continuation, then repeat or
 * recovery, then yield when the user regains control.
 */
expectSequence(
  'Continuation recovery lifecycle',
  [
    {
      adaptivePreference: 'cue',
      currentSupportWorking: true,
      hasSafeResponse: true,
    },
    {
      adaptivePreference: 'cue',
      userSpeaking: true,
      hasHighConfidenceCompletion: true,
      hasSafeResponse: true,
    },
    {
      adaptivePreference: 'cue',
      userAppearsToBeShadowing: true,
      userMissedEnding: true,
      hasHighConfidenceCompletion: true,
      hasSafeResponse: true,
    },
    {
      adaptivePreference: 'cue',
      userTookOverNaturally: true,
      hasSafeResponse: true,
    },
  ],
  ['cue', 'continuation', 'repeat', 'silence']
)

expectSequence(
  'Lost-place recovery lifecycle',
  [
    {
      adaptivePreference: 'response',
      currentSupportWorking: true,
      hasSafeResponse: true,
    },
    {
      adaptivePreference: 'response',
      userAppearsToBeShadowing: true,
      userLostPlace: true,
      hasCurrentSentence: true,
      hasSafeResponse: true,
    },
    {
      adaptivePreference: 'response',
      userComfortableWithCurrentSupport: true,
      hasSafeResponse: true,
    },
  ],
  ['response', 'recovery', 'response']
)

/*
 * Recovery must not permanently mutate the selected adaptive preference.
 * Each decision is derived from current evidence; once recovery evidence
 * clears, the starting preference remains available.
 */
const afterTemporaryRecovery = decide({
  adaptivePreference: 'cue',
  currentSupportWorking: true,
  hasSafeResponse: true,
})

assert(
  afterTemporaryRecovery.operationalResource === 'cue',
  'Temporary recovery must not permanently replace Adaptive Cue'
)

const composerSource = readFileSync(
  `${root}/lib/george/live-runtime/support-behavior-composer.ts`,
  'utf8'
)

assert(
  composerSource.indexOf("operationalResource: 'repeat'") <
    composerSource.indexOf("operationalResource: 'recovery'"),
  'Specific repeat recovery should remain ahead of generic lost-place recovery'
)

assert(
  composerSource.indexOf("operationalResource: 'silence'") <
    composerSource.indexOf("operationalResource: 'continuation'"),
  'Natural user control should be evaluated before continuation unless completion evidence explicitly preserves support'
)

console.log('GEORGE LIVE recovery qualification passed')
