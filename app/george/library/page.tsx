import Link from "next/link";
import OperationalLibraryClient from "./OperationalLibraryClient";
import GeorgePageGuide from "@/components/george/page-guide/GeorgePageGuide";

export default function GeorgeLibraryPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-3 sm:px-6 sm:pb-12 sm:pt-4">
        <div className="sticky top-0 z-50 border-b border-white/[0.065] bg-black/92 px-1 py-2.5 backdrop-blur-xl">
          <div className="flex min-w-0 items-center justify-between gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href="/george"
            className="inline-flex items-center gap-3 transition-opacity duration-200 hover:opacity-82"
            aria-label="Return to GEORGE"
          >
            <img
              src="/logofav.png"
              alt=""
              aria-hidden="true"
              className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12"
            />
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <GeorgePageGuide
              pageId="library"
              steps={[
                {
                  element: "[data-george-guide=library-recommended]",
                  popover: {
                    title: "Recommended formula",
                    side: "right",
                    align: "start",
                    description:
                      "Start here. GEORGE surfaces a formula relevant to the work and objective currently in front of you.",
                  },
                },
                {
                  element: "[data-george-guide=library-formulas]",
                  popover: {
                    title: "Your formulas",
                    side: "right",
                    align: "start",
                    description:
                      "This is your working surface. Change, edit, inspect, and manage formulas you already control.",
                  },
                },
                {
                  element: "[data-george-guide=library-scripts]",
                  popover: {
                    title: "Review scripts",
                    side: "right",
                    align: "start",
                    description:
                      "Scripts are the executable expressions of formulas.",
                  },
                },
              ]}
            />

            <nav
              aria-label="GEORGE resources"
              className="flex shrink-0 items-center gap-3 font-mono text-[8px] uppercase tracking-[0.16em] sm:gap-4 sm:text-[9px]"
            >
            <Link
              href="/george/marketplace"
              className="text-white/30 transition hover:text-white/68"
            >
              Marketplace
            </Link>
            <span className="text-white/72">Library</span>
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

        <header className="mt-8 max-w-4xl sm:mt-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/34">
            GEORGE / LIBRARY
          </p>

          <h1 className="mt-2 text-[30px] font-medium leading-[1.05] tracking-[-0.04em] sm:text-[44px]">
            Your operational working set.
          </h1>

          <p className="mt-3 max-w-3xl text-[13px] leading-6 text-white/46 sm:text-[14px]">
            Review, adapt, and manage the formulas and scripts you can use in
            execution. Inspect what changed, what has worked, and what should
            carry into the next conversation.
          </p>
        </header>

        <OperationalLibraryClient />
      </div>
    </main>
  );
}
