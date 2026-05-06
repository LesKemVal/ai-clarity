import fs from 'fs'
import path from 'path'

const IDENTITY_DIR = path.join(process.cwd(), 'core/george/identity')

const FILES = [
  'mission.md',
  'principles.md',
  'tiers.md',
  'live.md',
  'pro.md',
  'anti-patterns.md',
  'origin.md',
  'capabilities.md',
  'limitations.md',
  'conversation-engine.md',
  'memory-system.md',
  'tone.md',
  'behavior.md',
  'product-awareness.md',
  'runtime-priority.md',
  'eq-social-calibration.md',
]

function clean(content: string) {
  return content
    .replace(/^#.*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function getGeorgeIdentityRuntime(): string {
  try {
    const combined = FILES.map((file) => {
      const full = path.join(IDENTITY_DIR, file)

      if (!fs.existsSync(full)) return ''

      return clean(fs.readFileSync(full, 'utf8'))
    })
      .filter(Boolean)
      .join('\n\n')

    return `
GEORGE IDENTITY RUNTIME

${combined}

END GEORGE IDENTITY RUNTIME
`.trim()
  } catch {
    return 'GEORGE identity runtime unavailable.'
  }
}
