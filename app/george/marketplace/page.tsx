import Link from "next/link";
import MarketplaceClient from "./MarketplaceClient";
import GeorgePageGuide from "@/components/george/page-guide/GeorgePageGuide";

export default function GeorgeMarketplacePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <div className="sticky top-3 z-50 rounded-[18px] border border-white/[0.08] bg-black/80 px-3 py-2.5 shadow-[0_18px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:px-4">
          <div className="flex min-w-0 items-center justify-between gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/george" className="inline-flex shrink-0 items-center transition-opacity duration-200 hover:opacity-82" aria-label="Return to GEORGE"><img src="/logofav.png" alt="" aria-hidden="true" className="h-11 w-11 shrink-0 rounded-[0.8rem] object-contain sm:h-12 sm:w-12" /></Link>

          <div className="flex shrink-0 items-center gap-2">
            <GeorgePageGuide
              pageId="marketplace"
              steps={[
                {
                  element: "[data-george-guide=marketplace-recommended]",
                  popover: {
                    title: "Recommended for you",
                    side: "right",
                    align: "start",
                    description:
                      "Start here. GEORGE surfaces the operational strategy that best fits the current objective.",
                  },
                },
                {
                  element: "[data-george-guide=marketplace-why]",
                  popover: {
                    title: "Why this strategy?",
                    side: "right",
                    align: "start",
                    description:
                      "Review the reasoning behind the recommendation.",
                  },
                },
                {
                  element: "[data-george-guide=marketplace-discover]",
                  popover: {
                    title: "Discover alternatives",
                    side: "right",
                    align: "start",
                    description:
                      "Browse other operational strategies when you want another approach.",
                  },
                },
              ]}
            />

            <nav
              aria-label="GEORGE resources"
              className="flex shrink-0 items-center gap-3 font-mono text-[8px] uppercase tracking-[0.16em] sm:gap-4 sm:text-[9px]"
            >
            <span className="text-white/72">Marketplace</span>
            <Link
              href="/george/library"
              className="text-white/30 transition hover:text-white/68"
            >
              Library
            </Link>
            <Link
              href="/help"
              className="text-white/30 transition hover:text-white/68"
            >
              Help
            </Link>
            </nav>
          </div>
          </div>
        </div>

        <header className="mt-16 max-w-3xl sm:mt-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/34">
            GEORGE / MARKETPLACE
          </p>

          <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-6xl">
            Operational Strategy Marketplace
          </h1>

          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/56 sm:text-base">
            Choose the operational strategy most likely to improve your chance
            of achieving the outcome in front of you.
          </p>
        </header>

        <MarketplaceClient />

        <footer className="mt-20 border-t border-white/[0.045] py-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/24">
            <Link href="/george/library" className="transition hover:text-white/58">
              Operational Library
            </Link>
            <Link href="/help" className="transition hover:text-white/58">
              Help
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
