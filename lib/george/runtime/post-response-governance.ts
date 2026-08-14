import type { OperationalJudgment } from '@/lib/george/runtime/operational-judgment'

export function buildCapacityNotice(input: {
  messageCount: number
  latestUserText: string
  operationalJudgment?: OperationalJudgment | null
}) {
  const isDegraded = input.messageCount > 10
  const text = input.latestUserText.toLowerCase()

  const needsMemory =
    /before|earlier|remember|last time|continue|pick up where we left off|as i said/i.test(text)

  const needsDepth =
    /plan|step by step|full plan|walk me through|break it down|roadmap|strategy|build this|launch/i.test(text)

  if (isDegraded && needsMemory) {
    if (input.operationalJudgment) {
      return 'I may be missing earlier context, so this response is limited to the currently validated evidence.'
    }

    return "I may be missing earlier context. Give me the missing piece and I’ll reconnect it."
  }

  if (isDegraded && needsDepth) {
    return 'I can move this forward here. Stronger continuity helps when you want GEORGE to carry the thread across longer work.'
  }

  return ''
}

export function buildRiskNotice(
  latestUserText: string,
  operationalJudgment?: OperationalJudgment | null
) {
  const text = latestUserText.toLowerCase()

  if (
    operationalJudgment &&
    operationalJudgment.action !== 'warn_and_move'
  ) {
    return ''
  }

  const legalSubject =
    /lawsuit|sue|court|judge|appeal|petition|hearing|motion|complaint|affidavit|charged|arrested|statute|case number|contract|settlement|legal/i.test(text)

  const legalActionable =
    /(what should i file|how do i file|write.*motion|write.*complaint|can i sue|should i sue|what should i say in court|how do i respond to.*lawsuit|legal strategy|appeal this|draft.*affidavit|court tomorrow|hearing tomorrow|charged with|arrested for)/i.test(text)

  const medicalSubject =
    /chest pain|stroke|heart attack|diagnosis|diagnose|prescription|medication|hospital|severe pain|symptoms|treatment|doctor|medical/i.test(text)

  const medicalEmergency =
    /(severe chest pain|chest pain.*shortness of breath|signs of stroke|can't breathe|trouble breathing|heart attack|stroke symptoms|face drooping|arm weakness|sudden confusion)/i.test(text)

  const medicalActionable =
    /(should i take|what dose|dosage|diagnose me|what do i have|should i go to the hospital|should i stop taking|can i mix|treat this|treatment for)/i.test(text)

  if (legalSubject && legalActionable) {
    return 'Use this as preparation, not legal advice.'
  }

  if (medicalEmergency) {
    return 'For emergency symptoms, contact local emergency services now.'
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
  operationalJudgment?: OperationalJudgment | null
}) {
  if (input.operationalJudgment?.signalAcquisition.shouldAcquire) {
    return input.reply
  }

  let nextReply = input.reply

  const capacityNotice = buildCapacityNotice({
    messageCount: input.messageCount,
    latestUserText: input.latestUserText,
    operationalJudgment: input.operationalJudgment,
  })

  if (capacityNotice && !nextReply.includes(capacityNotice)) {
    nextReply = `${nextReply}\n\n${capacityNotice}`
  }

  const riskNotice = buildRiskNotice(
    input.latestUserText,
    input.operationalJudgment
  )

  if (riskNotice && !nextReply.includes(riskNotice)) {
    nextReply = `${nextReply}\n\n${riskNotice}`
  }

  return nextReply
}
