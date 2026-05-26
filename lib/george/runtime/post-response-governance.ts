export function buildCapacityNotice(input: {
  messageCount: number
  latestUserText: string
}) {
  const isDegraded = input.messageCount > 10
  const text = input.latestUserText.toLowerCase()

  const needsMemory =
    /before|earlier|remember|last time|continue|pick up where we left off|as i said/i.test(text)

  const needsDepth =
    /plan|step by step|full plan|walk me through|break it down|roadmap|strategy|build this|launch/i.test(text)

  if (isDegraded && needsMemory) {
    return "I may be missing earlier context. Give me the missing piece and I’ll reconnect it."
  }

  if (isDegraded && needsDepth) {
    return 'I can move this forward here. Stronger continuity helps when you want GEORGE to carry the thread across longer work.'
  }

  return ''
}

export function buildRiskNotice(latestUserText: string) {
  const text = latestUserText.toLowerCase()

  const legalSubject =
    /lawsuit|sue|court|judge|appeal|petition|hearing|motion|complaint|affidavit|charged|arrested|statute|case number|contract|settlement|legal/i.test(text)

  const legalActionable =
    /(what should i file|how do i file|write.*motion|write.*complaint|can i sue|should i sue|what should i say in court|how do i respond to.*lawsuit|legal strategy|appeal this|draft.*affidavit|court tomorrow|hearing tomorrow|charged with|arrested for)/i.test(text)

  const medicalSubject =
    /chest pain|stroke|heart attack|diagnosis|diagnose|prescription|medication|hospital|severe pain|symptoms|treatment|doctor|medical/i.test(text)

  const medicalActionable =
    /(should i take|what dose|dosage|diagnose me|what do i have|should i go to the hospital|should i stop taking|can i mix|treat this|treatment for|severe chest pain|signs of stroke|can't breathe|trouble breathing|heart attack)/i.test(text)

  if (legalSubject && legalActionable) {
    return 'Use this as preparation, not legal advice.'
  }

  if (medicalSubject && medicalActionable) {
    return 'Use this to prepare better questions, not as medical advice.'
  }

  return ''
}

export function appendPostResponseNotices(input: {
  reply: string
  messageCount: number
  latestUserText: string
}) {
  let nextReply = input.reply

  const capacityNotice = buildCapacityNotice({
    messageCount: input.messageCount,
    latestUserText: input.latestUserText,
  })

  if (capacityNotice && !nextReply.includes(capacityNotice)) {
    nextReply = `${nextReply}\n\n${capacityNotice}`
  }

  const riskNotice = buildRiskNotice(input.latestUserText)

  if (riskNotice && !nextReply.includes(riskNotice)) {
    nextReply = `${nextReply}\n\n${riskNotice}`
  }

  return nextReply
}
