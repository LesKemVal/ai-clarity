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


export type OutcomeProgressionReport = {
  desiredOutcome: string
  probability: 'increased' | 'unchanged' | 'decreased'
  reasons: string[]
  remainingBarriers: string[]
  missingEvidence: string[]
  highestLeverageAction: string
}

export function summarizeOutcomeProgression(
  input: PostConversationIntelligenceInput
): OutcomeProgressionReport {

  const transcript = input.transcript.map(t => t.text).join(' ').toLowerCase()

  const reasons:string[]=[]
  const barriers:string[]=[]
  const evidence:string[]=[]

  let probability:'increased'|'unchanged'|'decreased'='unchanged'

  if(/next meeting|second meeting|follow up|schedule/i.test(transcript)){
    probability='increased'
    reasons.push('Future conversation was invited.')
  }

  if(/send|pilot|results|proof|evidence|data/i.test(transcript)){
    evidence.push('Supporting evidence still required.')
  }

  if(/but|however|concern|risk|not convinced|skeptical/i.test(transcript)){
    barriers.push('Outstanding resistance remains.')
  }

  if(probability==='unchanged' && barriers.length){
    probability='decreased'
  }

  return{

    desiredOutcome:input.desiredOutcome,

    probability,

    reasons,

    remainingBarriers:barriers,

    missingEvidence:evidence,

    highestLeverageAction:
      evidence.length
        ? 'Provide the requested evidence.'
        : barriers.length
          ? 'Resolve the strongest remaining objection.'
          : 'Advance the next conversation while momentum is positive.'

  }

}
