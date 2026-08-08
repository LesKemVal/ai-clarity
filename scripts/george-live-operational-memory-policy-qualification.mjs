import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { isExplicitOperationalMemoryRequest, shouldRetrieveOperationalMemory } from '../lib/george/operational-memory/retrieval-policy.ts'

assert.equal(shouldRetrieveOperationalMemory({ mode: 'normal', currentContextSufficient: true }), true)
assert.equal(shouldRetrieveOperationalMemory({ mode: 'preparation', currentContextSufficient: true }), true)
assert.equal(shouldRetrieveOperationalMemory({ mode: 'post_live', currentContextSufficient: true }), true)
assert.equal(shouldRetrieveOperationalMemory({ mode: 'live', currentContextSufficient: true }), false)
assert.equal(shouldRetrieveOperationalMemory({ mode: 'live', currentContextSufficient: false }), true)
assert.equal(shouldRetrieveOperationalMemory({ mode: 'live', currentContextSufficient: true, explicitUserRequest: true }), true)

assert.equal(isExplicitOperationalMemoryRequest('What did I tell you last month?'), true)
assert.equal(isExplicitOperationalMemoryRequest('Show my previous notes.'), true)
assert.equal(isExplicitOperationalMemoryRequest('Who was that investor?'), true)
assert.equal(isExplicitOperationalMemoryRequest('Help me handle this objection.'), false)

const policy = readFileSync(resolve(process.cwd(), 'lib/george/operational-memory/retrieval-policy.ts'), 'utf8')
const route = readFileSync(resolve(process.cwd(), 'app/api/chat/route.ts'), 'utf8')
assert.match(policy, /OperationalMemoryExecutionMode/)
assert.match(policy, /currentContextSufficient/)
assert.match(policy, /explicitUserRequest/)
assert.match(route, /shouldRetrieveOperationalMemory\(/)
assert.match(route, /currentRuntime === 'live_george' \? 'live' : 'normal'/)
assert.match(route, /isExplicitOperationalMemoryRequest\(latestUserRaw\)/)
assert.match(route, /runtime: currentRuntime/)

console.log('GEORGE LIVE operational-memory execution policy qualification passed', { normalRetrieval: true, preparationRetrieval: true, livePassiveRetrievalSuppressed: true, liveExplicitRetrieval: true, postLiveRetrieval: true })
