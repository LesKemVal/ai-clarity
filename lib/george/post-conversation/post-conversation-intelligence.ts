export type ConversationTurn = {
  speaker: 'user' | 'other_party' | 'george'
  text: string
}

export type PostConversationIntelligenceInput = {
  desiredOutcome: string
  transcript: ConversationTurn[]
}

export function summarizeConversationIntelligence(
  input: PostConversationIntelligenceInput
) {
  const transcript = input.transcript ?? []

  const joined = transcript
    .map((t) => t.text)
    .join(' ')

  return {
    desiredOutcome: input.desiredOutcome,

    summary: joined,

    commitments: transcript.filter((t) =>
      /send|deliver|follow up/i.test(t.text)
    ),

    evidenceRequested: transcript.filter((t) =>
      /proof|evidence|data|results/i.test(t.text)
    ),

    opportunities: transcript.filter((t) =>
      /next discussion|next meeting|schedule/i.test(t.text)
    ),

    unresolvedQuestions: transcript.filter((t) =>
      /\?/.test(t.text)
    ),

    resistance: transcript.filter((t) =>
      /but|however|concern/i.test(t.text)
    ),

    nextConversation: [
      'Bring requested evidence.',
      'Answer unresolved objections.',
      'Advance the highest-priority desired outcome.',
    ],
  }
}
