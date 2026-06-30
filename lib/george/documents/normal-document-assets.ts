export type NormalGeorgeDocumentAsset = {
  id: string
  title: string
  name: string
  kind: 'pdf' | 'docx' | 'text' | 'image' | 'file'
  mimeType?: string
  summary?: string
  extractedText?: string
  uploadContext: 'normal'
  initialAttachment: {
    type: 'normal_conversation'
    id: string | null
    reason: string
  }
  createdAt: number
}

export const GEORGE_DOCUMENT_ASSETS_KEY = 'GEORGE_DOCUMENT_ASSETS'

function clean(value: unknown) {
  return String(value || '').trim()
}

function inferKind(input: { name?: string; type?: string; kind?: string }): NormalGeorgeDocumentAsset['kind'] {
  const name = clean(input.name).toLowerCase()
  const type = clean(input.type || input.kind).toLowerCase()

  if (type.includes('image') || /\.(png|jpg|jpeg|webp|gif)$/i.test(name)) return 'image'
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf'
  if (type.includes('word') || name.endsWith('.docx')) return 'docx'
  if (type.includes('text') || name.endsWith('.txt')) return 'text'
  return 'file'
}

export function buildNormalGeorgeDocumentAsset(input: {
  id?: string
  name?: string
  type?: string
  summary?: string
  extractedText?: string
  conversationId?: string | null
  createdAt?: number
}): NormalGeorgeDocumentAsset {
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
    uploadContext: 'normal',
    initialAttachment: {
      type: 'normal_conversation',
      id: clean(input.conversationId) || null,
      reason: 'Uploaded in Normal GEORGE; assume intended for the current work.',
    },
    createdAt: input.createdAt || Date.now(),
  }
}

export function mergeNormalGeorgeDocumentAssets(
  existing: NormalGeorgeDocumentAsset[],
  incoming: NormalGeorgeDocumentAsset[]
) {
  const seen = new Set<string>()
  const result: NormalGeorgeDocumentAsset[] = []

  for (const asset of [...existing, ...incoming]) {
    const key = clean(asset.id || asset.title || asset.name).toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(asset)
  }

  return result
}

export function appendNormalGeorgeDocumentAssetToStorage(
  upload: Parameters<typeof buildNormalGeorgeDocumentAsset>[0]
) {
  if (typeof window === 'undefined') return null

  const asset = buildNormalGeorgeDocumentAsset(upload)

  try {
    const existing = JSON.parse(window.localStorage.getItem(GEORGE_DOCUMENT_ASSETS_KEY) || '[]')
    const next = mergeNormalGeorgeDocumentAssets(
      Array.isArray(existing) ? existing : [],
      [asset]
    )
    window.localStorage.setItem(GEORGE_DOCUMENT_ASSETS_KEY, JSON.stringify(next))
  } catch {
    window.localStorage.setItem(GEORGE_DOCUMENT_ASSETS_KEY, JSON.stringify([asset]))
  }

  return asset
}
