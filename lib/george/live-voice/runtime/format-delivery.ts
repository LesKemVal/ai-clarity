export type DeliveryFormatResult = {
  spokenText: string
  pauseMs: number
  lowerTone: boolean
  chuckle: boolean
}

export function formatDelivery(raw: string): DeliveryFormatResult {
  let text = raw.trim()

  let pauseMs = 0
  let lowerTone = false
  let chuckle = false

  const pauseMatch = text.match(/\[PAUSE:(\d+)\]/i)

  if (pauseMatch) {
    pauseMs = Number(pauseMatch[1] || 0)
    text = text.replace(pauseMatch[0], '').trim()
  }

  if (/\[LOWER\]/i.test(text)) {
    lowerTone = true
    text = text.replace(/\[LOWER\]/gi, '').trim()
  }

  if (/\[CHUCKLE\]/i.test(text)) {
    chuckle = true
    text = text.replace(/\[CHUCKLE\]/gi, '').trim()
  }

  return {
    spokenText: text,
    pauseMs,
    lowerTone,
    chuckle,
  }
}
