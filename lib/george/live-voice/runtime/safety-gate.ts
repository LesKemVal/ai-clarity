export type SafetyResult = {
  allowed: boolean
  reason: string
}

const BLOCK_PATTERNS = [
  /(hide (a|the)? body)/i,
  /(destroy evidence)/i,
  /(how do i kill)/i,
  /(make a bomb)/i,
  /(traffic drugs)/i,
]

export function evaluateLiveSafety(text: string): SafetyResult {
  const clean = text.trim()

  if (!clean) {
    return {
      allowed: false,
      reason: 'Empty transcript.',
    }
  }

  for (const pattern of BLOCK_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        allowed: false,
        reason: 'Unsafe live request blocked.',
      }
    }
  }

  return {
    allowed: true,
    reason: 'Allowed.',
  }
}
