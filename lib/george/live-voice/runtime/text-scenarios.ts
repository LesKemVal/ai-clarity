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
      'step out of the car for me.',
    ],
  },
  {
    id: 'raise_request',
    label: 'Raise Request',
    transcript: [
      'what did you want to discuss?',
      'why do you believe you deserve a raise?',
      'the company is under pressure right now.',
      'I cannot approve that today.',
    ],
  },
  {
    id: 'gatekeeper',
    label: 'Gatekeeper',
    transcript: [
      'what is this regarding?',
      'he is busy right now.',
      'can you send an email instead?',
      'we are not interested.',
    ],
  },
  {
    id: 'authority_pressure',
    label: 'Authority Pressure',
    transcript: [
      'I need you to answer me directly.',
      'that does not sound right.',
      'why should I believe that?',
      'stop talking over me.',
    ],
  },
  {
    id: 'conversation_pivot',
    label: 'Conversation Pivot',
    transcript: [
      'what did you need from me?',
      'that is not the issue.',
      'the real problem is timing.',
      'can you make a decision now?',
    ],
  },
  {
    id: 'interruption_recovery',
    label: 'Interruption Recovery',
    transcript: [
      'hold on.',
      'wait.',
      'no, let me finish.',
      'okay, go ahead.',
    ],
  },
  {
    id: 'rapid_stale_turns',
    label: 'Rapid Stale Turns',
    transcript: [
      'can you explain that?',
      'never mind.',
      'actually answer this instead.',
      'what is the price?',
    ],
  },
]
