export type EarbudRuntimeState = {
  active: boolean
  responseDensity: 'minimal' | 'normal'
  cadence: 'tight' | 'standard'
  structure: 'single_thought' | 'standard'
  cueStyle: 'tactical' | 'standard'
}

const SIGNALS = [
  'earbud',
  'earbuds',
  'one ear',
  'in my ear',
  'live in person',
  'whisper',
  'quiet mode',
  'walking into',
  'he is here',
  'she is here',
]

export function detectEarbudRuntime(input: string): EarbudRuntimeState {
  const lowered = input.toLowerCase()

  const active = SIGNALS.some(signal => lowered.includes(signal))

  return {
    active,
    responseDensity: active ? 'minimal' : 'normal',
    cadence: active ? 'tight' : 'standard',
    structure: active ? 'single_thought' : 'standard',
    cueStyle: active ? 'tactical' : 'standard',
  }
}

export function buildEarbudRuntimeNote(state: EarbudRuntimeState) {
  if (!state.active) return ''

  return `
EARBUD RUNTIME ACTIVE
- Use short operational phrasing.
- Prefer one thought at a time.
- Reduce stacked clauses.
- Prioritize timing, cues, and tactical sequencing.
- Avoid long explanations unless explicitly requested.
- Responses should be verbally parseable in motion or pressure.
- Favor calm, fast, repeatable phrasing.
- Use lower cognitive load delivery.
`.trim()
}
