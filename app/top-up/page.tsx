'use client'

export default function TopUpPage() {
  const usage = {
    total: 78,
    intelligence: 82,
    memory: 41,
    voice: 64,
    connectedKnowledge: 89,
  }

  const recommendedPack = {
    name: 'Research Pack',
    price: '$8',
    description:
      'Best for users leaning on file lookups, connected sources, and repeated retrieval.',
  }

  const packs = [
    {
      name: 'Light Boost',
      price: '$5',
      description: 'A quick extension for standard usage before the month resets.',
      includes: ['Short-term resource extension', 'Standard response capacity', 'Good for lighter users'],
    },
    {
      name: 'Reasoning Pack',
      price: '$10',
      description: 'For deeper thinking, longer exchanges, and heavier advisory use.',
      includes: ['More intelligence capacity', 'Better for longer sessions', 'Supports heavier prompt load'],
    },
    {
      name: 'Voice Pack',
      price: '$8',
      description: 'For users relying on speech input, reply audio, and hands-free flow.',
      includes: ['Extra voice minutes', 'Better for active loop usage', 'Built for voice-first sessions'],
    },
    {
      name: 'Research Pack',
      price: '$8',
      description: 'For users working from files, memory, and connected knowledge.',
      includes: ['More retrieval capacity', 'Better for file/source lookups', 'Best for document-heavy use'],
    },
    {
      name: 'Full Access',
      price: '$15',
      description: 'A broader extension across all major resource types.',
      includes: ['Balanced capacity boost', 'Supports mixed usage', 'Best for power sessions'],
    },
  ]

  const handleSubscribe = async () => {
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Unable to start subscription checkout.')
      }

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error(error)
      window.alert('Unable to start Stripe checkout right now.')
    }
  }

  const Meter = ({
    label,
    value,
  }: {
    label: string
    value: number
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-300">{label}</span>
        <span className="text-neutral-500">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-900">
        <div
          className="h-full rounded-full bg-amber-400 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-neutral-100">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col px-4 py-10 md:px-6">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            BRANES / TOP-UP
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Maintain George’s capacity.
          </h1>

          <p className="mt-4 text-base leading-7 text-neutral-400">
            Real intelligence requires compute, memory, voice, and retrieval. This page gives
            users a controlled way to extend capacity before the month resets, without losing
            performance when usage climbs.
          </p>
        </div>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                  Monthly usage
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Resource overview</h2>
              </div>

              <div className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-300">
                {usage.total}% used
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <Meter label="Intelligence" value={usage.intelligence} />
              <Meter label="Memory" value={usage.memory} />
              <Meter label="Voice" value={usage.voice} />
              <Meter label="Connected knowledge" value={usage.connectedKnowledge} />
            </div>

            <div className="mt-8 rounded-2xl border border-neutral-800 bg-black p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                George’s note
              </p>
              <p className="mt-3 text-sm leading-7 text-neutral-300">
                I operate within resource constraints to remain fast, accurate, and available.
                If you need deeper reasoning or extended output, we can expand capacity.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Recommended
            </p>

            <h2 className="mt-2 text-2xl font-semibold">{recommendedPack.name}</h2>

            <div className="mt-4 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-300">
              {recommendedPack.price}
            </div>

            <p className="mt-4 text-sm leading-7 text-neutral-400">
              {recommendedPack.description}
            </p>

            <div className="mt-6 rounded-2xl border border-neutral-800 bg-black p-4">
              <p className="text-sm text-neutral-300">
                George should determine the best packet based on actual usage pattern, not just
                overall total.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <button className="w-full rounded-full bg-amber-400 px-5 py-3 text-sm font-medium text-black transition hover:opacity-90">
                Continue with {recommendedPack.name}
              </button>

              <button className="w-full rounded-full border border-neutral-700 px-5 py-3 text-sm text-neutral-200 transition hover:border-amber-400 hover:text-amber-300">
                Enable auto top-up
              </button>
            </div>

            <div className="mt-6 text-sm leading-7 text-neutral-500">
              Auto top-up should remain user-controlled, capped, and reversible.
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Resource packets
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Choose a controlled extension</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {packs.map((pack) => (
              <div
                key={pack.name}
                className={`rounded-3xl border p-5 ${
                  pack.name === recommendedPack.name
                    ? 'border-amber-400/40 bg-amber-400/10'
                    : 'border-neutral-800 bg-neutral-950'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{pack.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-neutral-400">
                      {pack.description}
                    </p>
                  </div>

                  <div className="rounded-full border border-neutral-700 px-3 py-1 text-sm text-neutral-200">
                    {pack.price}
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {pack.includes.map((item) => (
                    <div key={item} className="text-sm text-neutral-300">
                      {item}
                    </div>
                  ))}
                </div>

                <button
                  className={`mt-6 w-full rounded-full px-4 py-3 text-sm transition ${
                    pack.name === recommendedPack.name
                      ? 'bg-amber-400 text-black hover:opacity-90'
                      : 'border border-neutral-700 text-neutral-200 hover:border-amber-400 hover:text-amber-300'
                  }`}
                >
                  Select {pack.name}
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
