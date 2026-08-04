import OperationalLibraryClient from "./OperationalLibraryClient";

export default function GeorgeLibraryPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/38">
          GEORGE
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
          Operational Marketplace
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
          Choose the operational strategy most likely to improve your chance of reaching the goal.
        </p>

        <OperationalLibraryClient />
      </div>
    </main>
  );
}
