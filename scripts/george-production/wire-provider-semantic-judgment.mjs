import fs from 'node:fs'
import path from 'node:path'

const routePath = path.resolve('app/api/chat/route.ts')

if (!fs.existsSync(routePath)) {
  throw new Error(`Missing canonical chat route: ${routePath}`)
}

let source = fs.readFileSync(routePath, 'utf8')

function replaceOnce(search, replacement, label) {
  const first = source.indexOf(search)
  if (first === -1) {
    throw new Error(`Could not find ${label}. The canonical owner has changed; inspect before patching.`)
  }

  if (source.indexOf(search, first + search.length) !== -1) {
    throw new Error(`Found duplicate ${label}. Inspect ownership before patching.`)
  }

  source = source.slice(0, first) + replacement + source.slice(first + search.length)
}

replaceOnce(
  `import {\n  runNormalTextCompletion,\n  type NormalProviderSemanticIntent,\n} from '@/lib/george/runtime/provider/normal-provider'`,
  `import {\n  runNormalTextCompletion,\n  type NormalProviderSemanticIntent,\n  type NormalProviderSemanticJudgment,\n} from '@/lib/george/runtime/provider/normal-provider'`,
  'normal provider import'
)

replaceOnce(
  `    let reply = ''\n    let providerSemanticIntent: NormalProviderSemanticIntent = null`,
  `    let reply = ''\n    let providerSemanticIntent: NormalProviderSemanticIntent = null\n    let providerSemanticJudgment: NormalProviderSemanticJudgment | null = null`,
  'provider semantic state'
)

replaceOnce(
  `          providerSemanticIntent =\n            providerResult?.semanticIntent ?? null`,
  `          providerSemanticIntent =\n            providerResult?.semanticIntent ?? null\n          providerSemanticJudgment =\n            providerResult?.semanticJudgment ?? null`,
  'Groq provider semantic assignment'
)

replaceOnce(
  `        providerSemanticIntent =\n          providerResult?.semanticIntent ?? null`,
  `        providerSemanticIntent =\n          providerResult?.semanticIntent ?? null\n        providerSemanticJudgment =\n          providerResult?.semanticJudgment ?? null`,
  'OpenAI provider semantic assignment'
)

replaceOnce(
  `        ...runtimeAuthoritySnapshot,\n        providerSemanticIntent,`,
  `        ...runtimeAuthoritySnapshot,\n        providerSemanticIntent,\n        providerSemanticJudgment,`,
  'runtime authority snapshot provider metadata'
)

fs.writeFileSync(routePath, source)

console.log('Wired provider semantic judgment through app/api/chat/route.ts.')
console.log('Next: npm run build')
