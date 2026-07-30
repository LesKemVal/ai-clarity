import OperationalLibraryClient from "./OperationalLibraryClient";

export default function GeorgeLibraryPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">
          Operational Library
        </h1>

        <p className="mt-3 max-w-2xl text-white/70">
          Browse operational formulas and scripts learned by GEORGE.
        </p>

        <OperationalLibraryClient />
      </div>
    </main>
  );
}
