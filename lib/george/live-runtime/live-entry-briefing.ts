import type { LivePrepSetup } from './prep-runtime'

type LiveBriefingMode = 'cues' | 'lines'

type LiveEntryBriefingInput = {
  setup: LivePrepSetup | null
  defaultRoom?: string
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

function buildAssistLine(mode: LiveBriefingMode) {
  if (mode === 'lines') {
    return 'I’ll start with something you can repeat while I reference your signal.'
  }

  return 'I’ll keep cues short unless the room calls for something you can repeat.'
}

export function buildLiveEntryBriefing(input: LiveEntryBriefingInput) {
  const setup = input.setup
  const room = normalizeRoom(setup?.room, input.defaultRoom || 'Adaptive LIVE')
  const mode = normalizeAssistMode(setup)

  return [
    'Good morning. I’m GEORGE.',
    '',
    `I understand what you’re trying to accomplish in this ${room.toLowerCase()}.`,
    '',
    buildRoomLine(room),
    buildObjectiveLine(setup),
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
  ].join('\n')
}
