export type LiveScenario = {
  id: string
  label: string
  transcript: string[]
}

export const LIVE_TEXT_SCENARIOS: LiveScenario[] = [
  {
    id: 'traffic_stop',
    label: 'Traffic Stop',
    transcript: [
      'do you know why I pulled you over?',
      'do you have your registration?',
      'where are you headed tonight?',
    ],
  },
  {
    id: 'raise_request',
    label: 'Raise Request',
    transcript: [
      'what did you want to discuss?',
      'why do you believe you deserve a raise?',
      'the company is under pressure right now.',
    ],
  },
  {
    id: 'gatekeeper',
    label: 'Gatekeeper',
    transcript: [
      'what is this regarding?',
      'he is busy right now.',
      'can you send an email instead?',
    ],
  },
]
