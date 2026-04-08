export default function TOS() {
  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-600">
            BRANES
          </p>

          <h1 className="mt-4 text-3xl font-semibold">
            Terms of Service
          </h1>

          <p className="mt-4 text-neutral-600">
            These terms define how you access and use GEORGE.
          </p>

          {/* Badges */}
          <div className="mt-6 flex flex-wrap gap-2">
            {['Clarity', 'Direction', 'Execution', 'No Drift'].map((b) => (
              <span
                key={b}
                className="rounded-full border border-amber-400/40 px-3 py-1 text-xs text-amber-700"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">

          <section className="border-t pt-6">
            <h2 className="font-semibold">1. Service</h2>
            <p className="mt-2 text-neutral-700">
              GEORGE is a digital system designed to assist with clarity,
              structured thinking, and forward movement. It does not provide
              legal, financial, or medical advice.
            </p>
          </section>

          <section className="border-t pt-6">
            <h2 className="font-semibold">2. Subscription</h2>
            <p className="mt-2 text-neutral-700">
              Access is provided through a recurring subscription. You may
              cancel at any time.
            </p>
          </section>

          <section className="border-t pt-6">
            <h2 className="font-semibold">3. Use</h2>
            <p className="mt-2 text-neutral-700">
              You agree to use the service responsibly and not for unlawful or
              harmful purposes.
            </p>
          </section>

          <section className="border-t pt-6">
            <h2 className="font-semibold">4. Liability</h2>
            <p className="mt-2 text-neutral-700">
              The service is provided “as is.” BRANES is not liable for decisions
              made based on use of the system.
            </p>
          </section>

          <section className="border-t pt-6">
            <h2 className="font-semibold">5. Updates</h2>
            <p className="mt-2 text-neutral-700">
              These terms may be updated as the service evolves.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
