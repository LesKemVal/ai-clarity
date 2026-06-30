import assert from 'node:assert'
import {
  buildLiveEntryDocumentAsset,
  mergeDocumentAssets,
} from '../../lib/george/documents/live-entry-document-assets.ts'

export function run() {
  const asset = buildLiveEntryDocumentAsset({
    id: 'Retention metrics.pdf',
    name: 'Retention metrics.pdf',
    type: 'application/pdf',
    summary: 'Retention metrics and cohort performance.',
    extractedText: 'Retention cohorts improved investor confidence.',
    conversationPackageId: 'acme-investor-package',
    createdAt: 1782835200000,
  })

  assert.equal(asset.kind, 'pdf')
  assert.equal(asset.uploadContext, 'live_entry')
  assert.equal(asset.initialAttachment.type, 'conversation_package')
  assert.equal(asset.initialAttachment.id, 'acme-investor-package')
  assert.equal(
    asset.initialAttachment.reason,
    'Uploaded in LIVE Entry; assume intended for this live conversation.'
  )

  const merged = mergeDocumentAssets([asset], [asset])
  assert.equal(
    merged.length,
    1,
    'LIVE Entry document assets should dedupe before reaching runtime setup.'
  )

  return true
}
