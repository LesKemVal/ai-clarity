function clean(value) {
  return String(value || '').trim()
}

function normalizeList(value) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
}

function words(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2)
}

function overlapScore(a, b) {
  const left = new Set(words(a))
  const right = new Set(words(b))
  if (!left.size || !right.size) return 0

  let overlap = 0
  for (const word of left) {
    if (right.has(word)) overlap += 1
  }

  return overlap / Math.max(left.size, right.size)
}

function inferKind(asset = {}) {
  const name = `${asset.name || asset.title || asset.filename || ''}`.toLowerCase()
  const type = `${asset.type || asset.mimeType || ''}`.toLowerCase()

  if (type.includes('image') || /\.(png|jpg|jpeg|webp|gif)$/i.test(name)) return 'image'
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf'
  if (type.includes('word') || name.endsWith('.docx')) return 'docx'
  if (type.includes('text') || name.endsWith('.txt')) return 'text'
  return 'file'
}

function attachmentTargetForContext(context = {}) {
  const mode = clean(context.mode || context.uploadMode || context.source)

  if (mode === 'live_entry' || mode === 'live') {
    return {
      type: 'conversation_package',
      reason: 'Uploaded in LIVE context; assume intended for this live conversation.',
      id: clean(context.conversationPackageId) || clean(context.packageId) || null,
    }
  }

  if (mode === 'normal') {
    return {
      type: clean(context.conversationPackageId || context.packageId) ? 'conversation_package' : 'normal_conversation',
      reason: 'Uploaded in Normal GEORGE context; assume intended for the current work.',
      id: clean(context.conversationPackageId) || clean(context.packageId) || clean(context.conversationId) || null,
    }
  }

  return {
    type: 'conversation_context',
    reason: 'Uploaded into GEORGE; attach to current conversation context until outcome relevance is known.',
    id: clean(context.conversationId) || null,
  }
}

export function normalizeDocumentAsset(upload = {}, context = {}, options = {}) {
  const title =
    clean(upload.title) ||
    clean(upload.name) ||
    clean(upload.filename) ||
    clean(upload.id) ||
    'Untitled document'

  const id =
    clean(upload.id) ||
    clean(options.id) ||
    `document-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'asset'}`

  return {
    id,
    title,
    name: clean(upload.name) || title,
    kind: clean(upload.kind) || inferKind(upload),
    mimeType: clean(upload.mimeType || upload.type),
    summary: clean(upload.summary),
    extractedText: clean(upload.text || upload.extractedText || upload.content),
    uploadContext: clean(context.mode || context.uploadMode || context.source || 'unknown'),
    initialAttachment: attachmentTargetForContext(context),
    createdAt: options.timestamp || new Date().toISOString(),
  }
}

export function mergeDocumentAssets(existing = [], incoming = []) {
  const result = []
  const seen = new Set()

  for (const asset of [...normalizeList(existing), ...normalizeList(incoming)]) {
    const normalized = normalizeDocumentAsset(asset, { mode: asset.uploadContext || 'unknown' }, { id: asset.id, timestamp: asset.createdAt })
    const key = `${normalized.id}::${normalized.title.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push({
      ...asset,
      ...normalized,
    })
  }

  return result
}

export function scoreDocumentRelevance(asset = {}, conversation = {}) {
  const assetText = [
    asset.title,
    asset.summary,
    asset.extractedText,
    asset.kind,
  ].filter(Boolean).join(' ')

  const conversationText = [
    conversation.desiredOutcome,
    conversation.conversationContext,
    conversation.conversationType,
    conversation.conversationWith,
    normalizeList(conversation.signals).join(' '),
  ].filter(Boolean).join(' ')

  const score = overlapScore(assetText, conversationText)

  return Number(Math.min(1, score).toFixed(3))
}

export function suggestRelevantDocuments(assets = [], conversation = {}, options = {}) {
  const threshold = Number(options.threshold ?? 0.08)

  return normalizeList(assets)
    .map((asset) => {
      const normalized = normalizeDocumentAsset(asset, { mode: asset.uploadContext || 'unknown' }, { id: asset.id, timestamp: asset.createdAt })
      const relevance = scoreDocumentRelevance(normalized, conversation)
      return {
        ...normalized,
        relevance,
        suggested: relevance >= threshold,
        reason: relevance >= threshold
          ? 'Related to the current outcome or conversation context.'
          : 'Not enough outcome relevance for automatic suggestion.',
      }
    })
    .filter((asset) => asset.suggested)
    .sort((a, b) => b.relevance - a.relevance)
}

export function attachDocumentAssetsToPackage(pkg = {}, assets = []) {
  const relevantDocumentation = mergeDocumentAssets(pkg.relevantDocumentation || [], assets)

  return {
    ...pkg,
    relevantDocumentation,
  }
}
