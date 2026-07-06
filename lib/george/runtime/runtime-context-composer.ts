export function composeRuntimeContext(blocks: Array<string | null | undefined>) {
  return blocks
    .map((block) => String(block || '').trim())
    .filter(Boolean)
    .map((block) => `\n\n${block}\n\n`)
    .join('')
}
