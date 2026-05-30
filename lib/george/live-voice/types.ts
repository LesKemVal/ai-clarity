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

export type LiveRuntimeSupportInput = {
  selectedCapabilityIds?: string[]
  selectedCapabilities?: Array<{ label?: string; description?: string }>
  runtimeBias?: unknown[]
  resourceEstimate?: {
    expectedMinutes?: number
    totalCents?: number
    breakdown?: Array<{ label?: string; cents?: number }>
    basis?: string
  } | null
  purview?: {
    label?: string
    body?: string
    line?: string
  } | null
  deliveryOverlay?: {
    cadenceProfile?: string
    compressionBias?: number
    declarativeStrength?: number
    silenceTolerance?: string
    interruptionTiming?: string
    qualificationStyle?: string
    linguisticDensity?: string
    deliveryNotes?: string[]
  } | null
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
  runtimeSupportApplied?: boolean
  runtimeSupportSummary?: string
}

export type LiveVoiceGovernorInput = {
  transcript: string
  mode?: 'text_test' | 'voice_live'
  audio?: boolean
  contextHint?: string
  desiredOutcome?: string
  activeOutcome?: string
  shadowMap?: string
  lastFiveSeconds?: string
  liveAssistMode?: 'cues' | 'lines'
  runtimeMemory?: LiveRuntimeMemory
  runtimeSupport?: LiveRuntimeSupportInput | null
}
