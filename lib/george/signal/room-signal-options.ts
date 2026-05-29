export type SignalRoom =
  | 'Interview'
  | 'Negotiation'
  | 'Boardroom'
  | 'Doctor Appointment'
  | 'Sales Call'
  | 'Presentation'
  | 'Everyday Conversation'

export type SignalMeaning = {
  id: string
  label: string
  description: string
}

export type SavedRoomSignal = {
  id: string
  room: SignalRoom
  phrase: string
  meaningId: string
  meaningLabel: string
  createdAt: number
}

export const SIGNAL_ROOMS: SignalRoom[] = [
  'Interview',
  'Negotiation',
  'Boardroom',
  'Doctor Appointment',
  'Sales Call',
  'Presentation',
  'Everyday Conversation',
]

const SHARED_MEANINGS: SignalMeaning[] = [
  {
    id: 'buy_time',
    label: 'Buy me time',
    description: 'GEORGE helps hold the moment without rushing the answer.',
  },
  {
    id: 'give_repeatable_response',
    label: 'Give me something repeatable',
    description: 'GEORGE starts with a first-person line the user can say as-is or adapt.',
  },
  {
    id: 'quiet_listen',
    label: 'Quiet / listen',
    description: 'GEORGE stops cueing and keeps listening for signal.',
  },
  {
    id: 'compress',
    label: 'Compress this',
    description: 'GEORGE reduces the next move to the cleanest usable version.',
  },
]

export const ROOM_SIGNAL_MEANINGS: Record<SignalRoom, SignalMeaning[]> = {
  Interview: [
    ...SHARED_MEANINGS,
    {
      id: 'answer_first',
      label: 'Answer first',
      description: 'GEORGE helps lead with the answer, then support only if needed.',
    },
    {
      id: 'sharpen_positioning',
      label: 'Sharpen my positioning',
      description: 'GEORGE helps connect experience, proof, and role fit.',
    },
    {
      id: 'recover_pressure',
      label: 'Recover from pressure',
      description: 'GEORGE helps regain control after a hard question or stumble.',
    },
  ],
  Negotiation: [
    ...SHARED_MEANINGS,
    {
      id: 'negotiate_with_me',
      label: 'Negotiate with me',
      description: 'GEORGE treats the phrase as a negotiation signal, then decides the best move live.',
    },
    {
      id: 'protect_leverage',
      label: 'Protect leverage',
      description: 'GEORGE helps avoid over-disclosure, rushing concessions, or weakening position.',
    },
    {
      id: 'question_assumption',
      label: 'Question the assumption',
      description: 'GEORGE helps test the logic behind the other side’s claim.',
    },
  ],
  Boardroom: [
    ...SHARED_MEANINGS,
    {
      id: 'recommendation_first',
      label: 'Recommendation first',
      description: 'GEORGE helps lead with the decision or recommendation before details.',
    },
    {
      id: 'defend_number',
      label: 'Defend the number',
      description: 'GEORGE helps support a number, forecast, or claim under scrutiny.',
    },
    {
      id: 'redirect_to_decision',
      label: 'Redirect to decision',
      description: 'GEORGE helps move the room from discussion back to the decision.',
    },
  ],
  'Doctor Appointment': [
    ...SHARED_MEANINGS,
    {
      id: 'clarify_symptom',
      label: 'Clarify symptom',
      description: 'GEORGE helps describe symptoms clearly and specifically.',
    },
    {
      id: 'ask_next_question',
      label: 'Ask the next question',
      description: 'GEORGE helps ask what should not be missed before the appointment ends.',
    },
    {
      id: 'confirm_next_step',
      label: 'Confirm next step',
      description: 'GEORGE helps confirm plan, timeline, follow-up, or warning signs.',
    },
  ],
  'Sales Call': [
    ...SHARED_MEANINGS,
    {
      id: 'handle_objection',
      label: 'Handle objection',
      description: 'GEORGE helps respond without sounding defensive or desperate.',
    },
    {
      id: 'ask_discovery_question',
      label: 'Ask discovery question',
      description: 'GEORGE helps uncover need, urgency, budget, authority, or timing.',
    },
    {
      id: 'move_to_commitment',
      label: 'Move to commitment',
      description: 'GEORGE helps ask for the next step naturally.',
    },
  ],
  Presentation: [
    ...SHARED_MEANINGS,
    {
      id: 'tighten_message',
      label: 'Tighten message',
      description: 'GEORGE helps remove noise and land the point faster.',
    },
    {
      id: 'recover_attention',
      label: 'Recover attention',
      description: 'GEORGE helps regain the room when energy drops or focus shifts.',
    },
    {
      id: 'close_stronger',
      label: 'Close stronger',
      description: 'GEORGE helps end with a decision, ask, or memorable point.',
    },
  ],
  'Everyday Conversation': [
    ...SHARED_MEANINGS,
    {
      id: 'soften_tone',
      label: 'Soften tone',
      description: 'GEORGE helps reduce friction without losing the point.',
    },
    {
      id: 'hold_boundary',
      label: 'Hold boundary',
      description: 'GEORGE helps stay clear without escalating unnecessarily.',
    },
    {
      id: 'clarify_intent',
      label: 'Clarify intent',
      description: 'GEORGE helps ask what the other person means before reacting.',
    },
  ],
}

export function getSignalMeaningsForRoom(room: SignalRoom) {
  return ROOM_SIGNAL_MEANINGS[room] || ROOM_SIGNAL_MEANINGS.Interview
}

export function getDefaultSignalRoom(): SignalRoom {
  return 'Interview'
}
