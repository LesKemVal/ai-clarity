import { classifyLiveSpeakerIntent, type LiveSpeakerIntent } from './speaker-intent'

type SpeakerIntentCase = {
  name: string
  transcript: string
  knownUserSpeaking?: boolean
  expected: LiveSpeakerIntent
}

const cases: SpeakerIntentCase[] = [
  {
    name: 'direct GEORGE request',
    transcript: 'George, help me respond to that.',
    knownUserSpeaking: true,
    expected: 'addressed_to_george',
  },
  {
    name: 'implicit GEORGE request',
    transcript: 'What should I say?',
    knownUserSpeaking: true,
    expected: 'addressed_to_george',
  },
  {
    name: 'short steering phrase',
    transcript: 'let me think',
    knownUserSpeaking: true,
    expected: 'steering_signal',
  },
  {
    name: 'user answering the room',
    transcript: 'To answer your question, my experience is strongest in operations and follow through.',
    knownUserSpeaking: true,
    expected: 'addressed_to_room',
  },
  {
    name: 'other party question',
    transcript: 'Can you explain why you left that position?',
    knownUserSpeaking: false,
    expected: 'room_speaker',
  },
  {
    name: 'empty transcript',
    transcript: '   ',
    knownUserSpeaking: true,
    expected: 'ambiguous',
  },
]

export function runSpeakerIntentSelfTest() {
  return cases.map((testCase) => {
    const result = classifyLiveSpeakerIntent({
      transcript: testCase.transcript,
      knownUserSpeaking: testCase.knownUserSpeaking,
    })

    return {
      name: testCase.name,
      expected: testCase.expected,
      actual: result.intent,
      passed: result.intent === testCase.expected,
      confidence: result.confidence,
      reason: result.reason,
    }
  })
}

export function speakerIntentSelfTestPassed() {
  return runSpeakerIntentSelfTest().every((result) => result.passed)
}
