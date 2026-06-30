export type GeorgeDocumentAsset = {
  id: string
  title: string
  name: string
  kind: 'pdf' | 'docx' | 'text' | 'image' | 'file'
  mimeType?: string
  summary?: string
  extractedText?: string
  uploadContext: 'live_entry' | 'live' | 'normal' | 'unknown'
  initialAttachment: {
    type: 'conversation_package' | 'normal_conversation' | 'conversation_context'
    id: string | null
    reason: string
  }
  createdAt: number
}

function clean(value: unknown) {
  return String(value || '').trim()
}

function inferKind(input: { name?: string; type?: string; kind?: string }): GeorgeDocumentAsset['kind'] {
  const name = clean(input.name).toLowerCase()
  const type = clean(input.type || input.kind).toLowerCase()

  if (type.includes('image') || /\.(png|jpg|jpeg|webp|gif)$/i.test(name)) return 'image'
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf'
  if (type.includes('word') || name.endsWith('.docx')) return 'docx'
  if (type.includes('text') || name.endsWith('.txt')) return 'text'
  return 'file'
}

export function buildLiveEntryDocumentAsset(input: {
  id?: string
  name?: string
  type?: string
  summary?: string
  extractedText?: string
  conversationPackageId?: string | null
  createdAt?: number
}): GeorgeDocumentAsset {
  const title = clean(input.name || input.id) || 'Uploaded document'
  const id =
    clean(input.id) ||
    `document-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || Date.now()}`

  return {
    id,
    title,
    name: title,
    kind: inferKind({ name: title, type: input.type }),
    mimeType: clean(input.type) || undefined,
    summary: clean(input.summary) || undefined,
    extractedText: clean(input.extractedText) || undefined,
    uploadContext: 'live_entry',
    initialAttachment: {
      type: 'conversation_package',
      id: clean(input.conversationPackageId) || null,
      reason: 'Uploaded in LIVE Entry; assume intended for this live conversation.',
    },
    createdAt: input.createdAt || Date.now(),
  }
}

export function mergeDocumentAssets<T extends { id?: string; title?: string; name?: string }>(
  existing: T[],
  incoming: T[]
) {
  const seen = new Set<string>()
  const result: T[] = []

  for (const asset of [...existing, ...incoming]) {
    const key = clean(asset.id || asset.title || asset.name).toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(asset)
  }

  return result
}
