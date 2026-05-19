export type DebriefCategory =
  | 'what_helped'
  | 'what_hurt'
  | 'what_shifted'
  | 'future_leverage'
  | 'next_room'

export type DebriefAttribution =
  | 'user'
  | 'george'
  | 'shared'
  | 'room'

export type DebriefEntry = {
  category: DebriefCategory
  attribution: DebriefAttribution
  summary: string
  importance: number
}

export type DebriefInput = {
  trajectory?: string
  leverageState?: string
  perceivedPositioning?: string
  trustMovement?: string
  credibilityMovement?: string
  salvageObjective?: string
  recovery?: string
  usedAssistedLanguage?: boolean
}

export type DebriefSummary = {
  quickSummary: string
  entries: DebriefEntry[]
}

export function buildDebrief(
  input: DebriefInput
): DebriefSummary {
  const entries: DebriefEntry[] = []

  if (input.perceivedPositioning === 'strengthening') {
    entries.push({
      category: 'what_helped',
      attribution: input.usedAssistedLanguage ? 'shared' : 'user',
      summary: 'Perceived positioning improved during the conversation.',
      importance: 0.82,
    })
  }

  if (input.trustMovement === 'rising') {
    entries.push({
      category: 'what_helped',
      attribution: 'shared',
      summary: 'The room became more receptive over time.',
      importance: 0.74,
    })
  }

  if (
    input.recovery === 'defensive_spiral' ||
    input.perceivedPositioning === 'weakening'
  ) {
    entries.push({
      category: 'what_hurt',
      attribution: input.usedAssistedLanguage ? 'shared' : 'user',
      summary: 'Synchronization weakened once the conversation became more defensive.',
      importance: 0.86,
    })
  }

  if (input.salvageObjective && input.salvageObjective !== 'none') {
    entries.push({
      category: 'what_shifted',
      attribution: 'room',
      summary: `The room shifted away from the original objective toward ${input.salvageObjective.replace(/_/g, ' ')}.`,
      importance: 0.8,
    })
  }

  if (
    input.leverageState === 'recovering' ||
    input.perceivedPositioning === 'strengthening'
  ) {
    entries.push({
      category: 'future_leverage',
      attribution: 'shared',
      summary: 'Future leverage appears stronger than the immediate outcome suggests.',
      importance: 0.72,
    })
  }

  if (
    input.salvageObjective === 'secure_next_step' ||
    input.salvageObjective === 'preserve_access'
  ) {
    entries.push({
      category: 'next_room',
      attribution: 'room',
      summary: 'The strongest remaining opportunity may exist in the next conversation.',
      importance: 0.7,
    })
  }

  entries.sort((a, b) => b.importance - a.importance)

  const quickSummary =
    entries[0]?.summary ||
    'The conversation remained operationally stable.'

  return {
    quickSummary,
    entries: entries.slice(0, 6),
  }
}
