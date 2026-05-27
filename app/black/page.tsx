'use client'

import Link from 'next/link'

export default function BlackPage() {
  return (
    <main className="min-h-screen bg-[#05070B] text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.05] bg-[#05070B]/82 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-5">
          <Link
            href="/"
            className="text-[12px] font-medium uppercase tracking-[0.28em] text-white/78 transition hover:text-white"
          >
            Bx
          </Link>

          <div className="text-[10px] uppercase tracking-[0.24em] text-white/28">
            BLACK
          </div>
        </div>
      </header>

      <section className="flex min-h-screen items-center justify-center px-6 pt-24">
        <div className="w-full max-w-[520px] rounded-[1.6rem] border border-white/[0.06] bg-[#070A0F]/88 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.52)] backdrop-blur-xl">
          <div className="mb-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/34">
              BLACK
            </div>

            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-white/92">
              Continue
            </h1>

            <p className="mt-2 text-[14px] leading-6 text-white/44">
              Secure operational access, continuity, and tier restoration.
            </p>
          </div>

          <div className="min-h-[420px] rounded-[1.2rem] border border-white/[0.05] bg-black/24" />
        </div>
      </section>
    </main>
  )
}
