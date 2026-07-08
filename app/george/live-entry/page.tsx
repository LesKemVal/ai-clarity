import LiveEntryClient from './LiveEntryClient'
import LiveEntryReceiverProfileEnhancer from '@/components/george/live/LiveEntryReceiverProfileEnhancer'

export default function LiveEntryPage() {
  return (
    <>
      <LiveEntryReceiverProfileEnhancer />
      <LiveEntryClient />
    </>
  )
}
