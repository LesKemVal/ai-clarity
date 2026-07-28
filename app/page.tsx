'use client'

import { HomeHeroSequence } from '@/components/home/HomeHeroSequence'
import { HomeConversationTypeSurface } from '@/components/home/HomeConversationTypeSurface'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <HomeHeroSequence />

      <HomeConversationTypeSurface />

      <footer className="border-t border-white/10 bg-black px-5 py-8 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/34 sm:px-8">
        © 2026 BRANESx. All Rights Reserved.
      </footer>
    </main>
  )
}
