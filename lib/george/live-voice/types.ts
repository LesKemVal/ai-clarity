export type LiveSpeakerRole =
  | 'other_party'
  | 'user'
  | 'george_instruction'
  | 'unclear'

export type LiveRuntimeMemory = {
  preferredForce?: 'light' | 'balanced' | 'strong'
  toneCorrection?: 'softer' | 'firmer' | 'neutral'
  acceptedCarryCount?: number
  overrideCount?: number
  hesitationCount?: number
}

export type LiveVoicePacket = {
  speaker: LiveSpeakerRole
  shouldSpeak: boolean
  volley: string
  cue: string
  status: string
  confidence: number
  shadowUsed?: boolean
  roomPressure?: 'low' | 'moderate' | 'high' | 'authority'
  interruptionRisk?: number
  responseMode?: string
  responseTone?: string
  responseCompression?: string
  deliveryStyle?: string
  intervention?: string
  speakerIntent?: string
  speakerIntentConfidence?: number
  speakerIntentReason?: string
  speakerIntentShouldSpeak?: boolean
  speakerIntentShouldHold?: boolean
  liveAssistMode?: 'cues' | 'lines'
  runtimeForce?: 'light' | 'balanced' | 'strong'
  runtimeMemoryApplied?: boolean
}

export type LiveVoiceGovernorInput = {
  transcript: string
  mode?: 'text_test' | 'voice_live'
  audio?: boolean
  contextHint?: string
  shadowMap?: string
  lastFiveSeconds?: string
  liveAssistMode?: 'cues' | 'lines'
  runtimeMemory?: LiveRuntimeMemory
}