import GeorgePage from '../page'

export const dynamic = 'force-dynamic'

export default function GeorgeLivePage() {
  return (
    <div className="george-live-route">
      <style dangerouslySetInnerHTML={{ __html: `
        .george-live-route [data-normal-hero],
        .george-live-route [data-george-normal-hero],
        .george-live-route .normal-george-hero {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }
      ` }} />
      <GeorgePage forceLive />
    </div>
  )
}
