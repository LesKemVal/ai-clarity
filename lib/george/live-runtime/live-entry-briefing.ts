import type { LivePrepSetup } from './prep-runtime'

type LiveBriefingMode = 'cues' | 'lines'

type LiveEntryBriefingInput = {
  setup: LivePrepSetup | null
  defaultRoom?: string
  estimatedCents?: number | null
}

type SignalSummary = {
  phrase?: string
  meaningLabel?: string
}

function clean(value: unknown) {
  return String(value || '').trim()
}

function normalizeRoom(value: unknown, fallback = 'this room') {
  const room = clean(value)
  return room || fallback
}

function normalizeAssistMode(setup: LivePrepSetup | null): LiveBriefingMode {
  return setup?.liveAssistMode === 'lines' ? 'lines' : 'cues'
}

function getName(setup: LivePrepSetup | null) {
  return (
    clean((setup as any)?.name) ||
    clean((setup as any)?.alias) ||
    clean((setup as any)?.profileName) ||
    clean((setup as any)?.userName) ||
    clean((setup as any)?.chair) ||
    'You'
  )
}

function getSecondaryPosition(setup: LivePrepSetup | null) {
  return (
    clean((setup as any)?.secondaryObjective) ||
    clean((setup as any)?.acceptableOutcome) ||
    clean((setup as any)?.fallbackOutcome) ||
    clean((setup as any)?.floor)
  )
}

function buildSignalLine(setup: LivePrepSetup | null) {
  const signals = (setup as any)?.roomSignals as SignalSummary[] | undefined

  if (!signals || signals.length === 0) {
    return 'Remember your steering phrases.'
  }

  const first = signals[0]

  if (!first?.phrase || !first?.meaningLabel) {
    return 'Remember your steering phrases.'
  }

  return `Remember your steering phrases. “${first.phrase}” tells me ${first.meaningLabel.toLowerCase()}.`
}

function buildAssistLine(mode: LiveBriefingMode) {
  if (mode === 'lines') {
    return 'If useful, I can help frame the opening or formulate important moments when greater precision would improve the outcome.'
  }

  return 'I will default to brief observations, useful details, and support that preserves your voice. If useful, I can also help frame the opening or formulate important moments when greater precision would improve the outcome.'
}

function buildRoomObservation(setup: LivePrepSetup | null, room: string, desiredOutcome: string, observedReality: string) {
  const signal = `${room} ${desiredOutcome} ${observedReality}`.toLowerCase()

  if (/interview|candidate|hiring|job/.test(signal)) {
    return 'I suspect they may be listening for how you think, not just whether you have perfect answers.'
  }

  if (/investor|capital|fundraising|raise|fund/.test(signal)) {
    return 'I suspect credibility may matter before persuasion here.'
  }

  if (/doctor|medical|patient|treatment|symptom/.test(signal)) {
    return 'I think clarity may matter more than speed in this room.'
  }

  if (/negotiat|offer|terms|deal|price|counter/.test(signal)) {
    return 'I think precision may matter here, especially when pressure starts shaping the language.'
  }

  if (/sales|customer|client|buyer/.test(signal)) {
    return 'I suspect trust may move this further than pressure.'
  }

  if (/conflict|argument|apology|repair|relationship/.test(signal)) {
    return 'I think being understood may matter, but reducing threat may matter first.'
  }

  if (/board|ceo|executive|leadership|strategy/.test(signal)) {
    return 'I’ll treat this as executive awareness: interpretation first, lines only when precision matters.'
  }

  return ''
}

export function buildLiveEntryBriefing(input: LiveEntryBriefingInput) {
  const setup = input.setup
  const name = getName(setup)
  const room = normalizeRoom(setup?.room, input.defaultRoom || 'this room')
  const mode = normalizeAssistMode(setup)
  const desiredOutcome = clean(setup?.objective) || 'your desired outcome'
  const observedReality =
    clean((setup as any)?.observedReality) ||
    clean((setup as any)?.reality) ||
    clean((setup as any)?.currentReality) ||
    clean((setup as any)?.knownContext)

  const secondaryPosition = getSecondaryPosition(setup)
  const signalLine = buildSignalLine(setup)
  const observation = buildRoomObservation(setup, room, desiredOutcome, observedReality)
  const estimatedCents =
    typeof input.estimatedCents === 'number' && Number.isFinite(input.estimatedCents)
      ? Math.max(0, Math.round(input.estimatedCents))
      : null

  return [
    `${name}.`,
    '',
    'You made it.',
    '',
    `Your primary objective is: ${desiredOutcome}.`,
    '',
    observation ? `Observed facts and signals suggest: ${observation}` : null,
    '',
    estimatedCents !== null ? `Estimated LIVE support: ${estimatedCents}¢.` : null,
    '',
    'Check the box.',
    '',
    "We can't continue until you do.",
    '',
    '[RESPONSIBILITY_CHECKPOINT]',
    '',
    'Good.',
    '',
    secondaryPosition
      ? 'I also understand your secondary outcome.'
      : null,
    secondaryPosition
      ? `But that's secondary.`
      : null,
    secondaryPosition ? '' : null,
    'Before we go LIVE, double-check facts and signals.',
    '',
    'Based on what you’ve shared, I’ll help you notice what matters, keep important details organized, communicate with greater precision when useful, and adapt as the room reveals itself — while preserving your agency and your voice.',
    '',
    buildAssistLine(mode),
    '',
    'Repeated use sharpens support.',
    '',
    'Check the next box.',
    '',
    '[TOA_CHECKPOINT]',
    '',
    'Okay.',
    '',
    signalLine,
    '',
    'Use your steering language or phone screen, according to availability, to adjust support, delivery style, or tone.',
    '',
    'Questions?',
    '',
    `Okay, then. Please proceed, ${name}.`,
    '',
    'I’ll help guide your conversation as it develops.',
    '',
    'Then let’s go to work.',
  ].filter(Boolean).join('\n')
}
