import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is required for george-live-mode-comparison.')
  process.exit(1)
}

const dir = mkdtempSync(join(tmpdir(), 'george-live-mode-comparison-'))
const file = join(dir, 'mode-comparison.ts')

writeFileSync(file, `
import { governLiveVoice } from '${process.cwd()}/lib/george/live-voice/governor'
import { reasonLiveNextMove } from '${process.cwd()}/lib/george/live-voice/live-reasoning'

const transcript = 'How do you defend your margins?'
const shared = {
  transcript,
  mode: 'text_test',
  audio: false,
  contextHint: 'investor conversation',
  desiredOutcome: 'raise capital and show the opportunity can scale',
  activeOutcome: 'answer investor concern',
  shadowMap: 'The investor is challenging unit economics, margin defensibility, scalability, and execution risk.',
  lastFiveSeconds: 'Investor asks how margins are defended under pressure.',
}

const modes = [
  { label: 'Cue', deliveryStyle: 'advice', liveAssistMode: 'cues' },
  { label: 'Continuation', deliveryStyle: 'continue', liveAssistMode: 'cues', transcript: 'The reason our margins can hold is...' },
  { label: 'Response', deliveryStyle: 'response', liveAssistMode: 'cues' },
  { label: 'Presentation', deliveryStyle: 'expandedLine', liveAssistMode: 'cues' },
]

async function main() {
  for (const mode of modes) {
    const currentTranscript = mode.transcript || transcript
    const fallbackPacket = governLiveVoice({
      ...shared,
      transcript: currentTranscript,
      liveAssistMode: mode.liveAssistMode as any,
      deliveryStyle: mode.deliveryStyle,
      runtimeSupport: {
        deliveryStyle: mode.deliveryStyle,
        objective: shared.desiredOutcome,
        room: shared.contextHint,
      } as any,
    } as any)

    const reasoned = await reasonLiveNextMove({
      ...shared,
      transcript: currentTranscript,
      liveAssistMode: mode.liveAssistMode as any,
      deliveryStyle: mode.deliveryStyle,
      fallbackPacket,
    })

    console.log('')
    console.log('==============================')
    console.log(mode.label)
    console.log('deliveryStyle:', mode.deliveryStyle)
    console.log('fallback status:', fallbackPacket.status)
    console.log('fallback volley:', fallbackPacket.volley)
    console.log('reasoned status:', reasoned?.status || 'none')
    console.log('reasoned responseForm:', reasoned?.responseForm || 'none')
    console.log('reasoned volley:', reasoned?.volley || 'none')
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
`)

try {
  execFileSync('npx', ['tsx', file], {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
} finally {
  rmSync(dir, { recursive: true, force: true })
}
