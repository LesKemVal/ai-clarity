export type LiveSpeakerRole =
  | 'other_party'
  | 'user'
  | 'george_instruction'
  | 'unclear'

export type LiveVoicePacket = {
  speaker: LiveSpeakerRole
  shouldSpeak: boolean
  volley: string
  cue: string
  status: string
  confidence: number
}

export type LiveVoiceGovernorInput = {
  transcript: string
  mode?: 'text_test' | 'voice_live'
  audio?: boolean
  contextHint?: string
}
