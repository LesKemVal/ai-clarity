import assert from 'node:assert/strict'

import {
  hasRelevantConversationContext,
  isStandaloneAmbiguousKnowledgeQuestion,
} from '../../lib/george/runtime/runtime-pipeline'

type Message = Readonly<{
  role: 'user' | 'assistant'
  content: string
}>

function context(messages: Message[], latest: string) {
  return hasRelevantConversationContext(messages, latest)
}

assert.equal(
  isStandaloneAmbiguousKnowledgeQuestion('What can you tell me about dilution?'),
  true,
  'Dilution remains lexically ambiguous by itself'
)

assert.equal(
  context(
    [
      {
        role: 'user',
        content:
          'I have a broker-dealer service contract for a Reg CF raise.',
      },
      {
        role: 'assistant',
        content:
          'Your broker-dealer can help facilitate the securities offering.',
      },
      {
        role: 'user',
        content: 'What can you tell me about dilution?',
      },
    ],
    'What can you tell me about dilution?'
  ),
  true,
  'Reg CF and securities history must preserve financial context'
)

assert.equal(
  context(
    [
      {
        role: 'user',
        content:
          'I want an extension on my service contract and direct help positioning the company for various securities.',
      },
      {
        role: 'assistant',
        content:
          'The objective is the extension plus offering-positioning assistance.',
      },
      {
        role: 'user',
        content: "Let's get on a call together.",
      },
    ],
    "Let's get on a call together."
  ),
  true,
  'An established objective must remain active when execution begins'
)

assert.equal(
  context(
    [
      {
        role: 'user',
        content: 'What can you tell me about dilution?',
      },
    ],
    'What can you tell me about dilution?'
  ),
  false,
  'A genuinely isolated ambiguous question must remain standalone'
)

console.log('Contextual ambiguity qualification: PASS')
