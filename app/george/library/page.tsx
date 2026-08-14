import OperationalLibraryClient from "./OperationalLibraryClient";
import { Surface } from "@/components/ui/Surface";

export default function GeorgeLibraryPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/38">WORKSPACE / LIBRARY</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
          Operational Library
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
          This is where GEORGE presents accessible operational strategies and the work you can reuse in Preparation. Review the recommendation, choose an available asset, and keep your current objective in view.
        </p>

        <div className="mt-6 grid gap-3 text-sm leading-6 text-white/54 md:grid-cols-3">
          <Surface
            variant="base"
            radius="lg"
            className="rounded-xl border-white/[0.07] bg-white/[0.018] p-4"
          >
            <strong className="block text-white/78">Discover</strong>
            Browse catalog strategies supplied by the canonical Marketplace service.
          </Surface>

          <Surface
            variant="base"
            radius="lg"
            className="rounded-xl border-white/[0.07] bg-white/[0.018] p-4"
          >
            <strong className="block text-white/78">Reuse</strong>
            Use accessible formulas and scripts as Preparation evidence when they fit.
          </Surface>

          <Surface
            variant="base"
            radius="lg"
            className="rounded-xl border-white/[0.07] bg-white/[0.018] p-4"
          >
            <strong className="block text-white/78">Decide</strong>
            Entitlement and recommendation status remain explicit; GEORGE never silently adopts an asset.
          </Surface>
        </div>

        <OperationalLibraryClient />
      </div>
    </main>
  );
}
