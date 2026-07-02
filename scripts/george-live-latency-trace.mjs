import fs from 'node:fs'

const inputPath = process.argv[2]

if (!inputPath) {
  console.error('Usage: node scripts/george-live-latency-trace.mjs <log-file>')
  process.exit(1)
}

const source = fs.readFileSync(inputPath, 'utf8')
const lines = source.split(/\r?\n/)
const turns = new Map()

function clean(value) {
  return String(value || '').trim()
}

function number(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function readField(line, key) {
  const patterns = [
    new RegExp(`${key}:\\s*'([^']+)'`),
    new RegExp(`${key}:\\s*"([^"]+)"`),
    new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`),
    new RegExp(`${key}:\\s*([A-Za-z0-9_.:-]+)`),
    new RegExp(`"${key}"\\s*:\\s*([0-9]+)`),
  ]

  for (const pattern of patterns) {
    const match = line.match(pattern)
    if (match) return clean(match[1])
  }

  return ''
}

function turnFor(turnId) {
  if (!turns.has(turnId)) {
    turns.set(turnId, {
      turnId,
      events: [],
      firstAt: undefined,
      lastAt: undefined,
    })
  }

  return turns.get(turnId)
}

function addEvent(turnId, event, at, latencyMs, line) {
  if (!turnId || !event) return

  const turn = turnFor(turnId)
  const safeAt = number(at)
  const safeLatency = number(latencyMs)

  turn.events.push({ event, at: safeAt, latencyMs: safeLatency, line })

  if (safeAt !== undefined) {
    turn.firstAt = turn.firstAt === undefined ? safeAt : Math.min(turn.firstAt, safeAt)
    turn.lastAt = turn.lastAt === undefined ? safeAt : Math.max(turn.lastAt, safeAt)
  }
}

for (const line of lines) {
  if (!line.includes('turnId')) continue

  const turnId = readField(line, 'turnId')
  if (!turnId) continue

  const event = readField(line, 'event') || readField(line, 'type')
  const at = readField(line, 'at')
  const latencyMs = readField(line, 'latencyMs') || readField(line, 'durationMs') || readField(line, 'totalDurationMs')

  if (event) addEvent(turnId, event, at, latencyMs, line)
}

const orderedTurns = [...turns.values()]
  .filter((turn) => turn.events.length)
  .sort((a, b) => (a.firstAt || 0) - (b.firstAt || 0))

if (!orderedTurns.length) {
  console.log('No LIVE turn metrics found.')
  process.exit(0)
}

function segmentDuration(events, from, to) {
  const start = events.find((item) => item.event === from)
  const end = events.find((item) => item.event === to)

  if (!start || !end) return undefined
  if (start.at !== undefined && end.at !== undefined) return end.at - start.at
  if (end.latencyMs !== undefined && start.latencyMs !== undefined) return end.latencyMs - start.latencyMs

  return undefined
}

function slowestSegment(segments) {
  return [...segments.entries()]
    .filter(([, value]) => typeof value === 'number')
    .sort((a, b) => b[1] - a[1])[0]
}

for (const turn of orderedTurns) {
  const events = turn.events
  const total =
    segmentDuration(events, 'transcript_input', 'tts_playback_end') ??
    segmentDuration(events, 'turn_start', 'tts_playback_end') ??
    (turn.firstAt !== undefined && turn.lastAt !== undefined ? turn.lastAt - turn.firstAt : undefined)

  const segments = new Map([
    ['STT → transcript', segmentDuration(events, 'deepgram_final', 'transcript_input')],
    ['hub queue/flush', segmentDuration(events, 'hub_transcript_queued', 'hub_transcript_flushed')],
    ['transcript → action cue', segmentDuration(events, 'transcript_input', 'action_cue') ?? segmentDuration(events, 'transcript_input', 'hub_action_cue_received')],
    ['delivery', segmentDuration(events, 'action_cue', 'delivery_cue') ?? segmentDuration(events, 'hub_action_cue_received', 'delivery_cue')],
    ['visual render', segmentDuration(events, 'visual_cue_received', 'visual_cue_rendered')],
    ['voice request → TTS request', segmentDuration(events, 'voice_cue_requested', 'tts_request_start')],
    ['TTS request → audio received', segmentDuration(events, 'tts_request_start', 'tts_audio_received')],
    ['audio received → playback start', segmentDuration(events, 'tts_audio_received', 'tts_playback_start')],
    ['playback', segmentDuration(events, 'tts_playback_start', 'tts_playback_end')],
  ])

  const slowest = slowestSegment(segments)

  console.log(`\nLIVE turn: ${turn.turnId}`)
  console.log(`events: ${events.map((item) => item.event).join(' → ')}`)
  if (typeof total === 'number') console.log(`total observed latency: ${total}ms`)

  for (const [name, value] of segments.entries()) {
    if (typeof value === 'number') console.log(`- ${name}: ${value}ms`)
  }

  if (slowest) {
    console.log(`slowest measured segment: ${slowest[0]} (${slowest[1]}ms)`)
  }
}
