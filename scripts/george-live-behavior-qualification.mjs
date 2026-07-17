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
