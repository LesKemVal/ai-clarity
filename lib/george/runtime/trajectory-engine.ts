import type { GeorgeOutcomeState } from '@/lib/george/live-voice/runtime/active-outcome'

export type TrajectoryAssessment = {
  currentMove: string
  likelyNextMoves: string[]
  potentialFutureNeeds: string[]
  confidence: number
}

export function assessTrajectory(input: {
  latestUserText: string
  objectiveKnown?: boolean
  signalUsable?: boolean
  outcomeState?: GeorgeOutcomeState
}): TrajectoryAssessment {
  const text = String(input.latestUserText || '').toLowerCase()
  const moves: string[] = []
  const needs: string[] = []

  let currentMove = input.outcomeState?.immediateOutcome || (input.objectiveKnown
    ? 'advance the stated outcome'
    : 'acquire the desired outcome')

  if (/founder|startup|business|company|product/.test(text)) {
    currentMove = 'shape the business path'
    moves.push('clarify positioning', 'prepare proof', 'identify the next audience')
    needs.push('brief', 'visual', 'deck')
  }

  if (/investor|capital|funding|raise|pitch/.test(text)) {
    currentMove = 'prepare capital movement'
    moves.push('tighten the story', 'prepare investor material', 'prepare the conversation')
    needs.push('deck', 'visual', 'brief', 'live')
  }

  if (/meeting|call|interview|negotiation|client|board|doctor/.test(text)) {
    moves.push('prepare the conversation', 'define the desired outcome', 'prepare usable language')
    needs.push('live', 'brief')
  }

  if (/visual|diagram|slide|deck|website|hero|explain|show/.test(text)) {
    moves.push('turn the idea into a visual explanation')
    needs.push('visual', 'diagram', 'presentation')
  }

  if (/timeline|deadline|roadmap|milestone|schedule/.test(text)) {
    moves.push('sequence the work')
    needs.push('timeline')
  }

  if (/numbers|budget|forecast|model|price|cost/.test(text)) {
    moves.push('model the numbers')
    needs.push('spreadsheet')
  }

  return {
    currentMove,
    likelyNextMoves: Array.from(new Set(moves)).slice(0, 3),
    potentialFutureNeeds: Array.from(new Set(needs)).slice(0, 5),
    confidence: input.outcomeState
      ? Math.max(input.outcomeState.confidence, input.objectiveKnown && input.signalUsable ? 0.68 : 0.28)
      : input.objectiveKnown && input.signalUsable
        ? 0.68
        : 0.28,
  }
}

export function buildTrajectoryNote(assessment: TrajectoryAssessment) {
  return `
TRAJECTORY ENGINE
- Current move: ${assessment.currentMove}
- Likely next moves: ${assessment.likelyNextMoves.join('; ') || 'unknown'}
- Potential future needs: ${assessment.potentialFutureNeeds.join('; ') || 'unknown'}
- Confidence: ${assessment.confidence.toFixed(2)}
- Advisory only. Do not override the active task, current runtime, or explicit user direction.
- GEORGE may stay a couple moves ahead and surface likely next moves when it helps the user's outcome.
- Surface likely assets or capabilities conversationally, not as buttons, menus, or separate product pitches.
- Example: "A short brief could help here" or "We may be at the point where a visual helps more than more explanation."
- Mention decks, visuals, documents, diagrams, spreadsheets, briefs, presentations, taglines, images, or LIVE only when they plausibly remove the current bottleneck.
- Preserve user agency: suggest, do not force; make the capability visible without derailing the active task.
`.trim()
}
