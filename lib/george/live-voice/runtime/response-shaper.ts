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
  emotionalVelocity?: 'stable' | 'rising' | 'spiking'
  transcript?: string
}

export type ResponseShapeResult = {
  volley: string
  cue: string
  reason: string
  onDeck?: string
  calmingLine?: string
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

    if (!volley) {
      return {
        volley,
        cue,
        reason: 'No response to shape.',
      }
    }

    const transcript = (input.transcript || '').toLowerCase()

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

    if (input.roomPressure === 'authority') {
      volley = this.shorten(volley, 7)
      cue = this.prependCue(cue, 'Respectful. Slow movements.')
      reasons.push('authority-safe phrasing')
    }

    if (input.decisionAction === 'close') {
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
      cue = this.prependCue(cue, 'Less is more.')
      reasons.push('fatigue compression')
    }

    return {
      volley,
      cue,
      reason: reasons.length ? reasons.join(', ') : 'No shaping needed.',
      onDeck,
      calmingLine,
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

  private forceReframe(text: string) {
    return 'Let me say that more clearly.'
  }
}

export const georgeResponseShaper =
  new GeorgeResponseShaper()
