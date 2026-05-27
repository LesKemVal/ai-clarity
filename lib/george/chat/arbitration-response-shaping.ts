export type ArbitrationShapeInput = {
  posture:
    | 'warn_and_move'
    | 'protect_objective'
    | 'compress'
    | 'restore_context'
    | 'steady'
    | 'direct'
  delivery: 'minimal' | 'short' | 'structured' | 'normal'
  agency: 'user_decides' | 'light_confirmation' | 'strong_warning'
}

export function buildArbitrationResponseShape(
  input: ArbitrationShapeInput
) {
  const maxSentences =
    input.delivery === 'minimal'
      ? 3
      : input.delivery === 'short'
        ? 5
        : input.delivery === 'structured'
          ? 8
          : 10

  const maxWords =
    input.delivery === 'minimal'
      ? 55
      : input.delivery === 'short'
        ? 120
        : input.delivery === 'structured'
          ? 220
          : 320

  const compressionRequired =
    input.delivery === 'minimal' ||
    input.posture === 'compress'

  return {
    maxSentences,
    maxWords,
    compressionRequired,
    note: `
ARBITRATION RESPONSE SHAPING
- Maximum sentences: ${maxSentences}
- Maximum words: ${maxWords}
- Compression required: ${compressionRequired ? 'yes' : 'no'}
- Delivery posture: ${input.posture}
- Agency mode: ${input.agency}

ENFORCEMENT
- Do not exceed the delivery density selected by runtime arbitration.
- Minimal delivery means:
  - short verbal phrasing
  - one idea at a time
  - low clause stacking
  - high verbal clarity
- Structured delivery means:
  - compact operational structure
  - clear sequencing
  - restrained detail
- If posture is protect_objective:
  - preserve leverage
  - reduce unnecessary concessions
  - confirm direction lightly when needed
- If posture is warn_and_move:
  - warn clearly
  - do not become emotional
  - continue helping the user move forward
- User agency remains intact.
`.trim(),
  }
}
