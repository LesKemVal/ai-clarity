import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is required for george-live-reasoning-smoke.')
  process.exit(1)
}

const dir = mkdtempSync(join(tmpdir(), 'george-live-reasoning-smoke-'))
const file = join(dir, 'smoke.ts')

writeFileSync(file, `
import { governLiveVoice } from '${process.cwd()}/lib/george/live-voice/governor'
import { reasonLiveNextMove } from '${process.cwd()}/lib/george/live-voice/live-reasoning'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const fallbackPacket = governLiveVoice({
  transcript: 'The biggest concern investors have is...',
  mode: 'text_test',
  audio: false,
  contextHint: 'investor conversation',
  desiredOutcome: 'raise capital and show the opportunity can scale',
  activeOutcome: 'answer investor concern',
  shadowMap: 'The investor is weighing scalability, execution risk, and proof of demand.',
  lastFiveSeconds: 'Investor is asking about scalability and execution risk.',
  liveAssistMode: 'cues',
  runtimeSupport: {
    deliveryStyle: 'continue',
    objective: 'raise capital and show the opportunity can scale',
    room: 'investor conversation',
  } as any,
} as any)

assert(fallbackPacket.speakerIntent === 'assisted_continuation', 'fallback should mark assisted continuation')
assert(Boolean(fallbackPacket.volley), 'fallback should produce continuation volley')

const reasoned = await reasonLiveNextMove({
  transcript: 'The biggest concern investors have is...',
  room: 'investor conversation',
  desiredOutcome: 'raise capital and show the opportunity can scale',
  activeOutcome: 'answer investor concern',
  shadowMap: 'The investor is weighing scalability, execution risk, and proof of demand.',
  lastFiveSeconds: 'Investor is asking about scalability and execution risk.',
  liveAssistMode: 'cues',
  fallbackPacket,
})

assert(reasoned !== null, 'reasoning should return a packet')
assert(reasoned?.status.includes('Continuation reasoning active'), 'reasoning status should mark continuation reasoning')
assert(reasoned?.volley.trim().startsWith('...'), 'reasoned continuation should start with ellipsis')
assert(!/^\.\.\.\s*(slow down|ask why|return to|continue cleanly|finish clean)/i.test(reasoned?.volley || ''), 'reasoned continuation should not be generic coaching')

console.log('Fallback:', fallbackPacket.volley)
console.log('Reasoned:', reasoned?.volley)
console.log('GEORGE LIVE reasoning smoke passed')
`)

try {
  execFileSync('npx', ['tsx', file], {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
} finally {
  rmSync(dir, { recursive: true, force: true })
}
