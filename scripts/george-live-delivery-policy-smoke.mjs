import { readFileSync } from 'node:fs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const root = process.cwd()
const receiverPolicySource = readFileSync(
  `${root}/lib/george/live-delivery/receiver-policy.ts`,
  'utf8'
)
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
  receiverPolicySource.includes("if (input.receiverProfile === 'visual_only') return ['visual']"),
  'visual_only must route exclusively to visual delivery'
)

assert(
  receiverPolicySource.includes(
    "if (input.receiverProfile === 'audio_only') return input.voiceEnabled ? ['voice'] : ['silent']"
  ),
  'audio_only must route to voice when available and fail closed to silent'
)

assert(
  receiverPolicySource.includes(
    "return input.voiceEnabled ? ['voice', 'visual'] : ['visual']"
  ),
  'audio_visual must route one support behavior to both surfaces when voice is enabled'
)

assert(
  receiverPolicySource.includes('shapeAudioText') &&
    receiverPolicySource.includes('shapeVisualOnlyText') &&
    receiverPolicySource.includes('shapeVisualReferenceText'),
  'receiver delivery policy must own separate audio, visual-only, and visual-reference shaping'
)

assert(
  receiverPolicySource.includes("input.receiverProfile === 'visual_only'") &&
    receiverPolicySource.includes('VISUAL_MAX_CHARS') &&
    receiverPolicySource.includes('preserveLines'),
  'visual-only policy must preserve readable structure and allow richer guidance'
)

assert(
  receiverPolicySource.includes('AUDIO_MAX_CHARS') &&
    receiverPolicySource.includes('flattenForAudio') &&
    receiverPolicySource.includes("input.mode === 'voice'"),
  'audio policy must flatten support for sequential spoken delivery'
)

assert(
  receiverPolicySource.includes(
    "? 'Receiver policy routed support as persistent visual reference.'"
  ),
  'audio_visual visual output must be identified as persistent reference'
)

assert(
  receiverPolicySource.includes(
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
  routerSource.includes('resolveGeorgeReceiverDeliveryPolicy') &&
    bridgeSource.includes('routeGeorgeDeliveryCues'),
  'delivery bridge must delegate receiver routing to the canonical delivery policy'
)

assert(
  visualBridgeSource.includes('{visualCue.text}') &&
    !visualBridgeSource.includes('.replace(/\\n+/g'),
  'visual bridge must pass policy-created line breaks through without reshaping them'
)

console.log('GEORGE LIVE delivery policy smoke passed')
