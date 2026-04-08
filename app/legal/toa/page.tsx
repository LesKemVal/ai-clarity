export default function TOA() {
  return (
    <main className="min-h-screen bg-[#050505] text-neutral-100">

    {/* TOP LEFT BRAND */}
    <div className="fixed top-6 left-6 z-50 flex items-center gap-3">
    <img
    src="/logo5.png"
    alt="BRANES"
    className="h-10 w-10 rounded-full border border-amber-400/30"
   />

   <span className="text-sm font-medium uppercase tracking-[0.28em] text-neutral-200">
    BRANES
   </span>
 </div>

         {/* CONTENT */}
        <div className="mx-auto max-w-3xl px-6 py-10 pt-16">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
            BRANES
          </p>

          <h1 className="mt-4 text-3xl font-semibold">
            Terms of Access
          </h1>

          <p className="mt-4 text-neutral-400">
            These terms define how access to GEORGE is granted and maintained.
          </p>

          {/* Badges */}
          <div className="mt-6 flex flex-wrap gap-2">
            {['Control', 'Structure', 'Alignment', 'No Drift'].map((b) => (
              <span
                key={b}
                className="rounded-full border border-amber-400/30 px-3 py-1 text-xs text-amber-300"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-neutral-300">

          <section className="border-t border-neutral-800 pt-6">
            <h2 className="font-semibold text-neutral-100">1. Nature of the System</h2>
            <p className="mt-2">
              GEORGE is a structured system designed to support clarity,
              direction, and forward movement. It operates on fixed principles
              and is not intended for misuse or harmful application.
            </p>
          </section>

          <section className="border-t border-neutral-800 pt-6">
            <h2 className="font-semibold text-neutral-100">2. User Responsibility</h2>
            <p className="mt-2">
              Users are responsible for their decisions and actions. GEORGE
              provides structured input and guidance, but does not replace
              independent judgment.
            </p>
          </section>

          <section className="border-t border-neutral-800 pt-6">
            <h2 className="font-semibold text-neutral-100">3. Access Control</h2>
            <p className="mt-2">
              Access to GEORGE may be limited, restricted, or revoked if use of
              the system conflicts with its intended purpose or principles.
            </p>
          </section>

          <section className="border-t border-neutral-800 pt-6">
            <h2 className="font-semibold text-neutral-100">4. System Integrity</h2>
            <p className="mt-2">
              GEORGE is designed to reduce confusion and support forward
              movement. It may not respond to or support inputs that conflict
              with its core structure.
            </p>
          </section>

          <section className="border-t border-neutral-800 pt-6">
            <h2 className="font-semibold text-neutral-100">5. Evolution</h2>
            <p className="mt-2">
              GEORGE is an evolving system. Behavior, features, and access
              conditions may change over time.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
