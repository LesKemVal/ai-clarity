import { readFileSync } from 'node:fs'
import {
  GEORGE_LIVE_LATENCY_BUDGETS_MS,
  evaluateGeorgeLiveLatencyBudgets,
  measureGeorgeLiveLatencySegment,
} from '../lib/george/live-metrics/latency-budgets.mjs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const root = process.cwd()
const metricsSource = readFileSync(
  `${root}/lib/george/live-metrics/runtime-metrics.ts`,
  'utf8'
)
const traceSource = readFileSync(
  `${root}/scripts/george-live-latency-trace.mjs`,
  'utf8'
)
const releasePolicySource = readFileSync(
  `${root}/lib/george/live-runtime/final-transcript-release-policy.ts`,
  'utf8'
)

for (const event of [
  'transcript_input',
  'hub_action_cue_received',
  'action_cue',
  'delivery_cue',
  'visual_cue_rendered',
  'voice_cue_requested',
  'tts_request_start',
  'tts_audio_received',
  'tts_playback_start',
]) {
  assert(
    metricsSource.includes(`'${event}'`),
    `Latency optimization requires the ${event} metric`
  )
}

assert(
  metricsSource.includes('sincePreviousMs'),
  'Latency optimization requires stage-to-stage duration telemetry'
)
assert(
  metricsSource.includes('getRuntimeTurnLatencyReport'),
  'Latency optimization requires per-turn latency reports'
)
assert(
  traceSource.includes('slowest measured segment'),
  'Latency trace should identify the slowest measured segment'
)
assert(
  releasePolicySource.includes('fragment: 210'),
  'Final transcript fragment release must remain bounded at 210ms'
)
assert(
  GEORGE_LIVE_LATENCY_BUDGETS_MS.finalTranscriptRelease >= 210,
  'Optimization budget must accommodate the canonical fragment release policy'
)

const fastTimeline = [
  { event: 'transcript_input', at: 0 },
  { event: 'hub_action_cue_received', at: 220 },
  { event: 'delivery_cue', at: 245 },
  { event: 'visual_cue_received', at: 250 },
  { event: 'visual_cue_rendered', at: 270 },
  { event: 'voice_cue_requested', at: 275 },
  { event: 'tts_request_start', at: 300 },
  { event: 'tts_audio_received', at: 980 },
  { event: 'tts_playback_start', at: 1030 },
]

const fastResult = evaluateGeorgeLiveLatencyBudgets(fastTimeline)
assert(fastResult.passed, 'A compliant LIVE turn should pass latency budgets')
assert(
  fastResult.violations.length === 0,
  'A compliant LIVE turn should have no latency violations'
)
assert(
  measureGeorgeLiveLatencySegment(fastTimeline, 'transcriptToVisualRender') === 270,
  'Latency evaluator should measure transcript-to-visual duration'
)
assert(
  measureGeorgeLiveLatencySegment(fastTimeline, 'transcriptToPlaybackStart') === 1030,
  'Latency evaluator should measure transcript-to-playback-start duration'
)

const slowTimeline = fastTimeline.map((record) => ({ ...record }))
slowTimeline[1].at = 700
slowTimeline[2].at = 790
slowTimeline[3].at = 800
slowTimeline[4].at = 840
slowTimeline[5].at = 845
slowTimeline[6].at = 980
slowTimeline[7].at = 2700
slowTimeline[8].at = 2920

const slowResult = evaluateGeorgeLiveLatencyBudgets(slowTimeline)
assert(!slowResult.passed, 'A regressed LIVE turn should fail latency budgets')
for (const segment of [
  'transcriptToActionCue',
  'actionCueToDelivery',
  'transcriptToVisualRender',
  'voiceCueToTtsRequest',
  'ttsRequestToAudio',
  'audioToPlaybackStart',
  'transcriptToPlaybackStart',
]) {
  assert(
    slowResult.violations.some((violation) => violation.segment === segment),
    `Latency evaluator should report ${segment} regression`
  )
}

const visualOnlyResult = evaluateGeorgeLiveLatencyBudgets([
  { event: 'transcript_input', at: 0 },
  { event: 'action_cue', at: 180 },
  { event: 'delivery_cue', at: 200 },
  { event: 'visual_cue_rendered', at: 225 },
])
assert(
  visualOnlyResult.passed,
  'Visual-only delivery should pass without requiring TTS stages'
)
assert(
  visualOnlyResult.unavailable.includes('ttsRequestToAudio'),
  'Unavailable receiver-specific stages should be reported rather than failed'
)

console.log('GEORGE latency optimization qualification passed')
