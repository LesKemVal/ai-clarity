import { detectConversationSignals, type ConversationSignalState } from './conversation-signals'

export type ResponseShapeInput = {
  volley: string
  cue: string
  objectiveId: string
  posture: string
  trajectory: string
  recovery: string
  decisionAction: string
  roomPressure?: string
  fatigueScore?: number
  failedCloseTurns?: number
  allowAggressiveIntervention?: boolean
  emotionalVelocity?: 'stable' | 'rising' | 'spiking'
  transcript?: string
  strongestRolePressure?: [string, number]
  responseMode?: string
  responseTone?: string
  responseCompression?: string
  deliveryBehavior?: string
  intervention?: string
  operationalResource?: 'cue' | 'line' | 'continuation' | 'response' | 'recovery' | 'repeat' | 'silence'
  receiver?: 'audio' | 'visual' | 'audio_visual'
  signals?: ConversationSignalState
}

export type ResponseShapeResult = {
  volley: string
  cue: string
  reason: string
  onDeck?: string
  calmingLine?: string
  postureCue?: string
}

const SHADOW_PATTERNS: Record<string, string> = {
  budget: 'What budget range already exists?',
  risk: 'What risk concerns them most?',
  approval: 'Who ultimately approves this?',
  deadline: 'What timeline matters most here?',
  liability: 'What outcome are they trying to avoid?',
  authority: 'Who actually controls the decision?',
}

class GeorgeResponseShaper {
  shape(input: ResponseShapeInput): ResponseShapeResult {
    let volley = input.volley.trim()
    let cue = input.cue.trim()
    const reasons: string[] = []

    let onDeck = ''
    let calmingLine = ''
    let postureCue = ''

    if (input.deliveryBehavior === 'silence' || input.intervention === 'hold') {
      return {
        volley: '',
        cue,
        reason: 'Policy requested silence.',
      }
    }

    if (!volley) {
      return {
        volley,
        cue,
        reason: 'No response to shape.',
      }
    }

    const transcript = (input.transcript || '').toLowerCase()
    const signals = input.signals || detectConversationSignals(transcript)
    const [role, rolePressure] = input.strongestRolePressure ?? ['neutral', 0]

    if (role === 'authority' && rolePressure > 1.2) {
      volley = this.shorten(volley, 5)
      cue = this.prependCue(cue, 'Comply first. Do not challenge.')
      reasons.push('authority pressure shaping')
    }

    if (role === 'skeptic' && rolePressure > 1.4) {
      volley = this.forceProof(volley)
      cue = this.prependCue(cue, 'Proof first. No extra explanation.')
      reasons.push('skeptic pressure shaping')
    }

    if (role === 'gatekeeper' && rolePressure > 1.4) {
      volley = this.forceAccessBridge(volley)
      cue = this.prependCue(cue, 'Lower friction. Ask for the right path.')
      reasons.push('gatekeeper access shaping')
    }

    if (role === 'ally' && rolePressure > 1.2 && input.decisionAction !== 'hold') {
      volley = this.forceClose(volley, input.objectiveId)
      cue = this.prependCue(cue, 'Use the opening.')
      reasons.push('ally opening shaping')
    }

    for (const [signal, question] of Object.entries(SHADOW_PATTERNS)) {
      if (transcript.includes(signal)) {
        onDeck = question
        reasons.push(`shadow:${signal}`)
        break
      }
    }

    if (
      input.emotionalVelocity === 'spiking' ||
      input.posture === 'deescalating'
    ) {
      calmingLine = 'Slow down. One clean sentence.'

      cue = this.prependCue(
        cue,
        'Lower your pace. Do not rush.'
      )

      reasons.push('counter-velocity calming')
    }


    if (input.posture === 'deescalating') {
      postureCue = '[LOWER YOUR PACE]'

      if (
        signals.has('defensive_language') || signals.has('hesitation')
      ) {
        volley = 'Let’s look at the actual issue.'
        reasons.push('defensive posture reset')
      }
    }

    if (input.posture === 'directing') {
      postureCue = '[CHEST UP]'
    }

    if (input.posture === 'deferential') {
      postureCue = '[STEADY MOVEMENTS]'
    }

    if (input.posture === 'calming') {
      postureCue = '[SLOW BREATH]'
    }


    if (input.roomPressure === 'authority') {
      volley = this.shorten(volley, 7)
      cue = this.prependCue(cue, 'Respectful. Slow movements.')
      reasons.push('authority-safe phrasing')
    }

    if (
      input.allowAggressiveIntervention &&
      (input.failedCloseTurns || 0) >= 2 &&
      input.decisionAction === 'close'
    ) {
      volley = this.forceRedirect(volley, input.objectiveId)
      cue = this.prependCue(cue, 'Pivot. Stop pushing the same door.')
      reasons.push('failed close pivot')
    } else if (input.decisionAction === 'close') {
      volley = this.forceClose(volley, input.objectiveId)
      cue = this.prependCue(cue, 'Ask cleanly.')
      reasons.push('close window')
    }

    if (input.decisionAction === 'redirect') {
      volley = this.forceRedirect(volley, input.objectiveId)
      cue = this.prependCue(cue, 'Do not push harder.')
      reasons.push('redirect window')
    }

    if (input.decisionAction === 'reframe') {
      volley = this.forceReframe(volley)
      cue = this.prependCue(cue, 'Reset the frame.')
      reasons.push('reframe needed')
    }

    if (input.posture === 'deescalating') {
      volley = this.soften(volley)
      cue = this.prependCue(cue, 'Lower temperature.')
      reasons.push('de-escalation')
    }

    if (input.recovery !== 'stable') {
      volley = this.removeDefensiveLanguage(volley)
      cue = this.prependCue(cue, 'Keep the point clean.')
      reasons.push('recovery shaping')
    }

    if ((input.fatigueScore || 0) > 0.72) {
      volley = this.shorten(volley, 5)
      cue = this.prependCue(cue, 'Preserve human syntax. Reduce only what weakens the point.')
      reasons.push('fatigue compression')
    }

    if (signals.has('weak_confidence')) {
      volley = this.removeWeakConfidence(volley)
      volley = this.shorten(volley, 6)
      cue = this.prependCue(cue, 'Sound clear. Keep useful bridge language.')
      reasons.push('weak confidence tightening')
    }

    if (signals.has('behavioral_question')) {
      cue = this.prependCue(cue, 'Use one example. Result last.')
      reasons.push('behavioral answer framing')
    }

    if (signals.has('competency_test')) {
      volley = this.forceProof(volley)
      cue = this.prependCue(cue, 'Answer with direct experience.')
      reasons.push('competency proof framing')
    }

    if (input.responseCompression === 'high') {
      volley = this.shorten(volley, 5)
      cue = this.prependCue(cue, 'Match the room. Compress only if timing requires it.')
      reasons.push('policy high compression')
    }

    if (input.responseTone === 'calm') {
      cue = this.prependCue(cue, 'Stay measured.')
      reasons.push('policy calm tone')
    }

    if (input.deliveryBehavior === 'proof') {
      volley = this.forceProof(volley)
      cue = this.prependCue(cue, 'Lead with proof.')
      reasons.push('policy proof delivery')
    }

    const realization = resolvePostureRealization(input.posture)
    volley = this.applyPostureRealization(volley, realization)
    volley = this.applyReceiverRealization(
      volley,
      input.receiver,
      input.operationalResource,
      input.roomPressure
    )

    if (input.operationalResource === 'silence') {
      volley = ''
    }

    reasons.push(
      `posture realization:${realization.bridge}/${realization.hedge}/${realization.cadence}`
    )

    if (input.receiver) {
      reasons.push(`receiver realization:${input.receiver}`)
    }

    if (input.receiver === 'audio') {
      volley = this.shorten(volley, 16)
    }

    if (input.operationalResource) {
      reasons.push(`operational resource:${input.operationalResource}`)
    }

    return {
      volley,
      cue,
      reason: reasons.length ? reasons.join(', ') : 'No shaping needed.',
      onDeck,
      calmingLine,
      postureCue,
    }
  }

  private applyPostureRealization(
    text: string,
    realization: ReturnType<typeof resolvePostureRealization>
  ) {
    let shaped = text.replace(/\s+/g, ' ').trim()

    if (realization.hedge === 'minimal' || realization.hedge === 'none') {
      shaped = this.removeWeakConfidence(shaped)
    }

    if (realization.bridge === 'acknowledge' && !/^(that|i understand|i appreciate|fair)/i.test(shaped)) {
      shaped = `I understand the concern. ${shaped}`
    }

    if (realization.bridge === 'relational' && !/^(i appreciate|thank you|that makes sense)/i.test(shaped)) {
      shaped = `I appreciate you raising that. ${shaped}`
    }

    if (realization.bridge === 'context' && !/^(the key|the issue|the important point|here is)/i.test(shaped)) {
      shaped = `The key point is this: ${shaped}`
    }

    if (realization.cadence === 'concise') {
      shaped = this.shorten(shaped, 12)
    }

    if (realization.cadence === 'direct') {
      shaped = this.shorten(this.removeWeakConfidence(shaped), 14)
    }

    if (realization.cadence === 'measured') {
      shaped = shaped
        .replace(/\bimmediately\b/gi, 'now')
        .replace(/\burgently\b/gi, '')
        .replace(/\bright now\b/gi, 'now')
        .replace(/\s+/g, ' ')
        .trim()
    }

    return shaped
  }

  private applyReceiverRealization(
    text: string,
    receiver?: ResponseShapeInput['receiver'],
    resource?: ResponseShapeInput['operationalResource'],
    roomPressure?: string
  ) {
    if (!text) return text

    if (receiver === 'audio') {
      const limit =
        resource === 'cue' ? 7 :
        resource === 'line' ? 14 :
        resource === 'continuation' ? 16 :
        resource === 'response' ? 22 :
        12

      return this.shorten(text, roomPressure === 'high' ? Math.min(limit, 10) : limit)
    }

    if (receiver === 'visual') {
      return text.replace(/\s+/g, ' ').trim()
    }

    if (receiver === 'audio_visual' && roomPressure === 'high') {
      return this.shorten(text, resource === 'response' ? 20 : 14)
    }

    return text
  }

  private shorten(text: string, maxWords: number) {
    const clean = text.replace(/\s+/g, ' ').trim()
    const words = clean.split(/\s+/).filter(Boolean)

    if (words.length <= maxWords) {
      return clean
    }

    const sentenceBoundary = clean.match(/^(.+?[.!?])\s+/)

    if (sentenceBoundary) {
      const sentenceWords = sentenceBoundary[1]
        .split(/\s+/)
        .filter(Boolean)

      if (sentenceWords.length <= maxWords + 3) {
        return sentenceBoundary[1]
      }
    }

    return words.slice(0, maxWords).join(' ')
  }

  private prependCue(cue: string, prefix: string) {
    return `${prefix} ${cue}`.trim()
  }

  private soften(text: string) {
    return text
      .replace(/\bI need\b/gi, 'I want')
      .replace(/\bYou need to\b/gi, 'Let’s')
      .replace(/\bThat is wrong\b/gi, 'I see it differently')
      .trim()
  }

  private removeDefensiveLanguage(text: string) {
    return text
      .replace(/\bI just\b/gi, 'I')
      .replace(/\bSorry,?\s*/gi, '')
      .replace(/\bWhat I meant was\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private removeWeakConfidence(text: string) {
    return text
      .replace(/\bI think\b/gi, 'I')
      .replace(/\bkind of\b/gi, '')
      .replace(/\bsort of\b/gi, '')
      .replace(/\bmaybe\b/gi, '')
      .replace(/\bI guess\b/gi, '')
      .replace(/\bnot really sure\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private forceClose(text: string, objectiveId: string) {
    if (objectiveId === 'book_appointment') {
      return 'What time works best?'
    }

    if (objectiveId === 'secure_raise') {
      return 'Can we agree on the next compensation step?'
    }

    return text
  }

  private forceRedirect(text: string, objectiveId: string) {
    if (objectiveId === 'book_appointment') {
      return 'What would make a short call worthwhile?'
    }

    if (objectiveId === 'secure_raise') {
      return 'What would need to be true?'
    }

    return 'Let’s narrow this to the next real issue.'
  }

  private forceProof(text: string) {
    const clean = text.trim()

    if (!clean) return 'Here is the proof point.'

    return clean
      .replace(/^(i think|maybe|honestly|basically|just)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private forceAccessBridge(text: string) {
    if (!text.trim()) {
      return 'Who is the right person to speak with?'
    }

    return 'Who is the right person to speak with?'
  }

  private forceReframe(text: string) {
    return 'Let me say that more clearly.'
  }
}


const POSTURE_REALIZATION = {
  authority: { hedge: "minimal", bridge: "none", cadence: "direct" },
  strength: { hedge: "minimal", bridge: "minimal", cadence: "concise" },
  trust: { hedge: "light", bridge: "acknowledge", cadence: "balanced" },
  warmth: { hedge: "light", bridge: "relational", cadence: "balanced" },
  calm: { hedge: "light", bridge: "minimal", cadence: "measured" },
  analytical: { hedge: "none", bridge: "context", cadence: "structured" },
} as const

type PostureKey = keyof typeof POSTURE_REALIZATION

const DEFAULT_POSTURE_REALIZATION = {
  hedge: "light",
  bridge: "minimal",
  cadence: "balanced",
} as const

const POSTURE_ALIASES: Record<string, PostureKey> = {
  directing: 'authority',
  deferential: 'trust',
  deescalating: 'calm',
  calming: 'calm',
}

export function resolvePostureRealization(posture?: string) {
  const normalized = (posture ?? "").toLowerCase()
  const key = (POSTURE_ALIASES[normalized] ?? normalized) as PostureKey

  return POSTURE_REALIZATION[key] ?? DEFAULT_POSTURE_REALIZATION
}

export const georgeResponseShaper =
  new GeorgeResponseShaper()

export function governLiveResponse(raw: string, opts: { audio: boolean; userText?: string }) {
  const text = String(raw || "").trim()
  if (!text) return text

  const cleaned = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(strongest move|clean opener|next move|quick prep|close|if they|if he|if she|if budget|if timing|if pushback|what number|one thing|your opener|use this instead|try|consider|you should|lead with|drop)/i.test(line))
    .filter((line) => !/^(budget|timing|performance|band|market|low counter|process|hr|title-first|vague no):/i.test(line))
    .join("\n")

  const sayMatch = cleaned.match(/Say:\s*\n?([\s\S]*?)(?=\n(?:Backup:|Cue:|Do:|Boundary:|Ask:|$))/i)
  const backupMatch = cleaned.match(/Backup:\s*\n?([\s\S]*?)(?=\n(?:Say:|Cue:|Do:|Boundary:|Ask:|$))/i)
  const cueMatch = cleaned.match(/(?:Cue:|Do:)\s*\n?([\s\S]*?)(?=\n(?:Say:|Backup:|Boundary:|Ask:|$))/i)

  const normalizeLine = (value: string, maxWords: number) => {
    let line = String(value || "")
      .split("\n")
      .map((part) => part.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean)[0] || ""

    line = line.replace(/\[[^\]]+\]/g, "").replace(/\s+/g, " ").trim()
    const words = line.split(/\s+/).filter(Boolean)
    const maxChars = maxWords <= 10 ? 120 : 180

    if (words.length > maxWords && line.length > maxChars) {
      const sentenceEnd = line.slice(0, maxChars).match(/^([\s\S]*?[.!?][”"]?)(\s|$)/)
      const clauseEnd = line.slice(0, maxChars).match(/^([\s\S]*?[,;:][”"]?)(\s|$)/)
      line =
        sentenceEnd?.[1]?.trim() ||
        clauseEnd?.[1]?.replace(/[,;:][”"]?$/, "").trim() ||
        words.slice(0, maxWords).join(" ").replace(/[,:;.-]*$/, "").trim()
    }

    return line
  }

  const fallbackLine = (() => {
    const firstQuoted = cleaned.match(/[“"]([^”"]{3,160})[”"]/)
    if (firstQuoted?.[1]) return `“${firstQuoted[1]}”`

    const firstUsable = cleaned
      .split("\n")
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .find((line) =>
        line &&
        !/^(Say|Backup|Cue|Do|Ask|Boundary):/i.test(line) &&
        !/^pause\.?\s*hold\.?/i.test(line) &&
        !/^holding/i.test(line) &&
        !/do not give another line unless asked/i.test(line) &&
        !/what outcome|outcome matters|trying to accomplish|move forward right now|what matters most/i.test(line) &&
        !/GEORGE|clarity, direction|execution system|You are GEORGE|not a chatbot|not a therapist/i.test(line)
      )

    if (/^hi\b|^hello\b|^hey\b/i.test(firstUsable || "")) {
      return "I’m listening."
    }

    return firstUsable || "I’m listening."
  })()

  let backup = normalizeLine(backupMatch?.[1] || "", opts.audio ? 10 : 16)
  if (/^(budget|timing|performance|band|market|low counter|process|hr|title|if)\b/i.test(backup)) {
    backup = ""
  }

  const liveUserText = String(opts.userText || "").toLowerCase()
  const storedSupportStyle =
    typeof window !== "undefined"
      ? window.localStorage.getItem("GEORGE_LIVE_SUPPORT_STYLE") ||
        window.localStorage.getItem("GEORGE_LIVE_DELIVERY_STYLE")
      : null
  const storedAssistMode =
    typeof window !== "undefined"
      ? window.localStorage.getItem("george_live_assist_mode")
      : null
  const resolvedSupportStyle =
    storedSupportStyle ||
    (storedAssistMode === "lines" ? "continue" : storedAssistMode === "cues" ? "cue" : null)

  let say = normalizeLine(sayMatch?.[1] || fallbackLine, opts.audio ? 10 : 18)

  if (/raise|compensation|pay/.test(liveUserText) && /sir|discuss|talk|raise|compensation|pay/.test(liveUserText)) {
    if (/book|schedule|set .*minute|grab .*minute|this week|email|chat|slack/i.test(say)) {
      say = "“I wanted to talk about my compensation for a minute.”"
    }
  }

  if (/\bid\b|identification|license|registration/i.test(liveUserText)) {
    if (/GEORGE|clarity, direction|execution system|not a chatbot|not a therapist/i.test(say) || !say) {
      say = "“Yes, officer. May I reach for it?”"
    }
  }

  const cue = normalizeLine(cueMatch?.[1] || (/\bid\b|identification|license|registration/i.test(liveUserText) ? "Hands visible. Move slowly." : "Give one clean next move."), opts.audio ? 8 : 10)

  const stripOperationalLabels = (value: string) =>
    String(value || "")
      .replace(/^\s*(Word|Say|Cue|Need|Style|Pause|Backup):\s*/i, "")
      .replace(/\[pause\]/gi, "")
      .replace(/\s+/g, " ")
      .trim()

  say = stripOperationalLabels(say)
  const cleanCue = stripOperationalLabels(cue)

  if (opts.audio) return say || cleanCue

  const wantsCue =
    resolvedSupportStyle === "cue" ||
    resolvedSupportStyle === "advice" ||
    /cue|slow down|listen/i.test(liveUserText) ||
    /\b(pause|hold|wait)\b/i.test(liveUserText)

  const wantsLine =
    resolvedSupportStyle === "continue" ||
    resolvedSupportStyle === "line" ||
    /what should i say|what do i say|how do i say|give me a line|exact line|exact wording/i.test(liveUserText)

  if (wantsLine) return say || cleanCue || ""
  if (wantsCue) return cleanCue || say || ""

  return say || cleanCue || ""
}

