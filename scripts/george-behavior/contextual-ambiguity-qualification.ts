import assert from 'node:assert/strict'

import {
  isStandaloneAmbiguousKnowledgeQuestion,
} from '../../lib/george/runtime/runtime-pipeline'

assert.equal(
  isStandaloneAmbiguousKnowledgeQuestion(
    'What can you tell me about dilution?'
  ),
  true,
  'Dilution remains a standalone definitional question by itself'
)

assert.equal(
  isStandaloneAmbiguousKnowledgeQuestion('What is dilution?'),
  true,
  'A concise definitional question must remain standalone'
)

assert.equal(
  isStandaloneAmbiguousKnowledgeQuestion(
    'What does that dilution mean for our round?'
  ),
  false,
  'Explicit contextual language must preserve the active conversation'
)

assert.equal(
  isStandaloneAmbiguousKnowledgeQuestion(
    'What does the dilution in this deal mean?'
  ),
  false,
  'A question tied to this deal must not be isolated from context'
)

console.log('Contextual ambiguity qualification: PASS')
