import assert from 'node:assert'
import {
  attachDocumentAssetsToPackage,
  mergeDocumentAssets,
  normalizeDocumentAsset,
  suggestRelevantDocuments,
} from '../../lib/george/documents/runtime.mjs'

export function run() {
  const liveUpload = normalizeDocumentAsset(
    {
      id: 'retention-metrics',
      name: 'Retention metrics.pdf',
      type: 'application/pdf',
      summary: 'Retention metrics and cohort performance for investor follow-up.',
    },
    {
      mode: 'live_entry',
      conversationPackageId: 'acme-investor-package',
    },
    { timestamp: '2026-06-30T16:00:00.000Z' }
  )

  assert.equal(liveUpload.kind, 'pdf')
  assert.equal(liveUpload.uploadContext, 'live_entry')
  assert.equal(liveUpload.initialAttachment.type, 'conversation_package')
  assert.equal(liveUpload.initialAttachment.id, 'acme-investor-package')

  const normalUpload = normalizeDocumentAsset(
    {
      id: 'resume',
      name: 'Resume.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      summary: 'Resume with project leadership and operator experience.',
    },
    {
      mode: 'normal',
      conversationId: 'normal-work-1',
    },
    { timestamp: '2026-06-30T16:01:00.000Z' }
  )

  assert.equal(normalUpload.kind, 'docx')
  assert.equal(normalUpload.initialAttachment.type, 'normal_conversation')

  const merged = mergeDocumentAssets([liveUpload], [liveUpload, normalUpload])

  assert.equal(
    merged.length,
    2,
    'Document Asset Runtime should avoid duplicate assets while preserving cross-mode assets.'
  )

  const investorSuggestions = suggestRelevantDocuments(
    merged,
    {
      desiredOutcome: 'secure investor follow-up with retention proof',
      conversationContext: 'investor asked about retention metrics and cohort performance',
      conversationType: 'Investor Meeting',
    }
  )

  assert(
    investorSuggestions.some((asset) => asset.id === 'retention-metrics'),
    'Future conversations should suggest relevant documents regardless of where the asset was uploaded.'
  )

  const packageWithDocs = attachDocumentAssetsToPackage(
    {
      id: 'acme-investor-package',
      relevantDocumentation: [],
    },
    investorSuggestions.filter((asset) => asset.id === 'retention-metrics')
  )

  assert.equal(packageWithDocs.relevantDocumentation.length, 1)
  assert.equal(packageWithDocs.relevantDocumentation[0].id, 'retention-metrics')

  return true
}
