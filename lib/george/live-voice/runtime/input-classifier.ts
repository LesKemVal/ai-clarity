export type LiveInputKind =
  | 'room_context'
  | 'direct_george_request'
  | 'steering_phrase'
  | 'room_transcript'
  | 'unclear'

export function classifyLiveInput(text: string): LiveInputKind {
  const clean = text.toLowerCase()

  const roomContext =
    /\bi'?m in\b|\bi am in\b|\bthey'?re\b|\bthey are\b|\bmy boss\b|\bmy interviewer\b|\bthe interviewer\b|\bmy manager\b|\bmeeting\b|\binterview\b|\bnegotiation\b|\braise\b|\bclient\b|\bcustomer\b|\bdeal\b/.test(clean) &&
    /rushing|rush|pressur|challenged|numbers|questioning|pushing back|meeting|interview|negotiation|raise|boss|manager|client|customer|deal/.test(clean)

  if (roomContext) return 'room_context'

  if (
    /\bgeorge\b|\bwhat do i say\b|\bhelp me\b|\bwhat do you need from me\b|\btell me what to say\b|\bsay something\b|\bjump in\b/.test(clean)
  ) {
    return 'direct_george_request'
  }

  if (
    /\bhmm\b|\bone second\b|\bright\b|\blet me think\b|\bsay that again\b|\brepeat that\b/.test(clean)
  ) {
    return 'steering_phrase'
  }

  if (clean.trim().length > 0) return 'room_transcript'

  return 'unclear'
}
