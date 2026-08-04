import OperationalLibraryClient from "./OperationalLibraryClient";

export default function GeorgeLibraryPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#AEB6FF]/60">
          GEORGE
        </div>
        <h1 className="mt-3 font-mono text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          Operational Marketplace
        </h1>
        <p className="mt-4 max-w-3xl font-mono text-sm leading-7 text-white/55">
          Discover formulas that shape how GEORGE prepares, reasons, and
          supports execution. Save them to My Library and use them again
          without returning to the Marketplace.
        </p>

        <OperationalLibraryClient />
      </div>
    </main>
  );
}
