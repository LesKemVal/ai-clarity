import { readFileSync } from 'node:fs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const root = process.cwd()
const routerSource = readFileSync(
  `${root}/lib/george/live-delivery/delivery-router.ts`,
  'utf8'
)
const typesSource = readFileSync(
  `${root}/lib/george/live-delivery/types.ts`,
  'utf8'
)
const bridgeSource = readFileSync(
  `${root}/components/george/live/LiveHubDeliveryBridge.tsx`,
  'utf8'
)
const visualBridgeSource = readFileSync(
  `${root}/components/george/live/LiveHubVisualCueBridge.tsx`,
  'utf8'
)

assert(
  typesSource.includes('export type GeorgeLiveReceiverProfile') &&
    typesSource.includes("'visual_only'") &&
    typesSource.includes("'audio_only'") &&
    typesSource.includes("'audio_visual'"),
  'LIVE delivery types must define all three receiver profiles'
)

assert(
  routerSource.includes("if (input.receiverProfile === 'visual_only') return ['visual']"),
  'visual_only must route exclusively to visual delivery'
)

assert(
  routerSource.includes(
    "if (input.receiverProfile === 'audio_only') return input.voiceEnabled ? ['voice'] : ['silent']"
  ),
  'audio_only must route to voice when available and fail closed to silent'
)

assert(
  routerSource.includes(
    "return input.voiceEnabled ? ['voice', 'visual'] : ['visual']"
  ),
  'audio_visual must route one support behavior to both surfaces when voice is enabled'
)

assert(
  routerSource.includes('shapeAudioText') &&
    routerSource.includes('shapeVisualOnlyText') &&
    routerSource.includes('shapeVisualReferenceText'),
  'receiver delivery policy must own separate audio, visual-only, and visual-reference shaping'
)

assert(
  routerSource.includes("input.receiverProfile === 'visual_only'") &&
    routerSource.includes('VISUAL_MAX_CHARS') &&
    routerSource.includes('preserveLines'),
  'visual-only policy must preserve readable structure and allow richer guidance'
)

assert(
  routerSource.includes('AUDIO_MAX_CHARS') &&
    routerSource.includes('flattenForAudio') &&
    routerSource.includes("input.mode === 'voice'"),
  'audio policy must flatten support for sequential spoken delivery'
)

assert(
  routerSource.includes(
    "? 'Receiver policy routed support as persistent visual reference.'"
  ),
  'audio_visual visual output must be identified as persistent reference'
)

assert(
  routerSource.includes(
    ": 'Receiver policy routed support as readable visual-only guidance.'"
  ),
  'visual_only output must be identified as readable visual guidance'
)

assert(
  !bridgeSource.includes('AUDIO_MAX_CHARS') &&
    !bridgeSource.includes('VISUAL_MAX_CHARS') &&
    !visualBridgeSource.includes('AUDIO_MAX_CHARS') &&
    !visualBridgeSource.includes('VISUAL_MAX_CHARS'),
  'UI bridges must not own receiver-specific shaping limits'
)

assert(
  bridgeSource.includes('routeGeorgeDeliveryCue'),
  'delivery bridge must delegate receiver routing to the canonical delivery policy'
)

console.log('GEORGE LIVE delivery policy smoke passed')
