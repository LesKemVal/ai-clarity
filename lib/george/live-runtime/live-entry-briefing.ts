import type { LivePrepSetup } from './prep-runtime'

type LiveBriefingMode = 'cues' | 'lines'

type LiveEntryBriefingInput = {
  setup: LivePrepSetup | null
  defaultRoom?: string
}

type SignalSummary = {
  phrase?: string
  meaningLabel?: string
}

function clean(value: unknown) {
  return String(value || '').trim()
}

function normalizeRoom(value: unknown, fallback = 'Adaptive LIVE') {
  const room = clean(value)
  return room || fallback
}

function normalizeAssistMode(setup: LivePrepSetup | null): LiveBriefingMode {
  return setup?.liveAssistMode === 'lines' ? 'lines' : 'cues'
}

function buildObjectiveLine(setup: LivePrepSetup | null) {
  const objective = clean(setup?.objective)
  if (!objective) return 'I know your objective.'

  return `Your primary objective is to ${objective.replace(/\.$/, '')}.`
}

function buildRoomLine(room: string) {
  if (room === 'Adaptive LIVE') {
    return 'I know the room may shift.'
  }

  return `I know this ${room.toLowerCase()} room.`
}

function buildPositionLine(setup: LivePrepSetup | null) {
  const position = clean((setup as any)?.userPosition)

  if (!position) return null

  return `You’re approaching this from a ${position.toLowerCase()} position.`
}

function buildAssistLine(mode: LiveBriefingMode) {
  if (mode === 'lines') {
    return 'I’ll start with something you can repeat while I reference your signal.'
  }

  return 'I’ll keep cues short unless the room calls for something you can repeat.'
}

function buildSignalLine(setup: LivePrepSetup | null) {
  const signals = (setup as any)?.roomSignals as SignalSummary[] | undefined

  if (!signals || signals.length === 0) return null

  const first = signals[0]

  if (!first?.phrase || !first?.meaningLabel) {
    return 'Your room signals are loaded.'
  }

  return `Signal loaded: “${first.phrase}” means “${first.meaningLabel}”.`
}

export function buildLiveEntryBriefing(input: LiveEntryBriefingInput) {
  const setup = input.setup
  const room = normalizeRoom(setup?.room, input.defaultRoom || 'Adaptive LIVE')
  const mode = normalizeAssistMode(setup)
  const signalLine = buildSignalLine(setup)
  const positionLine = buildPositionLine(setup)

  return [
    'Good morning. I’m GEORGE.',
    '',
    `I understand what you’re trying to accomplish in this ${room.toLowerCase()}.`,
    '',
    buildRoomLine(room),
    buildObjectiveLine(setup),
    positionLine,
    '',
    signalLine,
    '',
    'It’s your room.',
    '',
    'If you need time, say:',
    '“Let me think.”',
    '',
    buildAssistLine(mode),
    '',
    'If the room changes, we’ll adapt.',
    '',
    'Go ahead.',
  ].filter(Boolean).join('\n')
}