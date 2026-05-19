import { detectConversationSignals } from './conversation-signals'

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
  deliveryStyle?: string
  intervention?: string
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

    if (input.deliveryStyle === 'silence' || input.intervention === 'hold') {
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
    const signals = detectConversationSignals(transcript)
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
      cue = this.prependCue(cue, 'One sentence.')
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

    if (input.deliveryStyle === 'proof') {
      volley = this.forceProof(volley)
      cue = this.prependCue(cue, 'Lead with proof.')
      reasons.push('policy proof delivery')
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

  private shorten(text: string, maxWords: number) {
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, maxWords)
      .join(' ')
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

export const georgeResponseShaper =
  new GeorgeResponseShaper()
