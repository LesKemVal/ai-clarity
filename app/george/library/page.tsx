import OperationalLibraryClient from "./OperationalLibraryClient";

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

        <OperationalLibraryClient />
      </div>
    </main>
  );
}
