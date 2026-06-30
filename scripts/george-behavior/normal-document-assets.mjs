import assert from 'node:assert'
import {
  buildNormalGeorgeDocumentAsset,
  mergeNormalGeorgeDocumentAssets,
} from '../../lib/george/documents/normal-document-assets.ts'

export function run() {
  const asset = buildNormalGeorgeDocumentAsset({
    id: 'Resume.docx',
    name: 'Resume.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    summary: 'Resume with product and operations experience.',
    extractedText: 'Product operations and interview experience.',
    conversationId: 'normal-conversation-1',
    createdAt: 1782835200000,
  })

  assert.equal(asset.kind, 'docx')
  assert.equal(asset.uploadContext, 'normal')
  assert.equal(asset.initialAttachment.type, 'normal_conversation')
  assert.equal(asset.initialAttachment.id, 'normal-conversation-1')
  assert.equal(
    asset.initialAttachment.reason,
    'Uploaded in Normal GEORGE; assume intended for the current work.'
  )

  const merged = mergeNormalGeorgeDocumentAssets([asset], [asset])
  assert.equal(
    merged.length,
    1,
    'Normal GEORGE document assets should dedupe before storage.'
  )

  return true
}
