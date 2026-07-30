"use client";

import { useEffect, useState } from "react";

import type {
  OperationalFormula,
  OperationalScript,
} from "@/lib/george/operational-memory/types";

type FormulaResponse = {
  ok: boolean;
  formulas?: OperationalFormula[];
  error?: string;
};

type ScriptResponse = {
  ok: boolean;
  scripts?: OperationalScript[];
  error?: string;
};

function formatDate(value: number) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function displayName(name: string | undefined, fallback: string) {
  const normalized = String(name ?? "").trim();
  return normalized || fallback;
}

export default function OperationalLibraryClient() {
  const [formulas, setFormulas] = useState<OperationalFormula[]>([]);
  const [scripts, setScripts] = useState<OperationalScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadLibrary() {
      try {
        const [formulaResponse, scriptResponse] = await Promise.all([
          fetch("/api/george/operational-memory/formulas", {
            cache: "no-store",
          }),
          fetch("/api/george/operational-memory/scripts", {
            cache: "no-store",
          }),
        ]);

        const formulaPayload =
          (await formulaResponse.json()) as FormulaResponse;
        const scriptPayload = (await scriptResponse.json()) as ScriptResponse;

        if (!formulaResponse.ok || !formulaPayload.ok) {
          throw new Error(
            formulaPayload.error || "Unable to load operational formulas",
          );
        }

        if (!scriptResponse.ok || !scriptPayload.ok) {
          throw new Error(
            scriptPayload.error || "Unable to load operational scripts",
          );
        }

        if (cancelled) return;

        setFormulas(formulaPayload.formulas ?? []);
        setScripts(scriptPayload.scripts ?? []);
      } catch (loadError) {
        if (cancelled) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load the operational library",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadLibrary();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="mt-10 text-sm text-white/55">Loading operational memory…</p>
    );
  }

  if (error) {
    return (
      <div className="mt-10 rounded-xl border border-red-400/20 bg-red-400/5 p-5">
        <p className="text-sm text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-8">
      <section className="rounded-xl border border-white/10 p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-medium">Operational Formulas</h2>
          <span className="text-xs uppercase tracking-[0.18em] text-white/40">
            {formulas.length} saved
          </span>
        </div>

        {formulas.length === 0 ? (
          <p className="mt-5 text-sm text-white/55">
            No personal operational formulas have been saved yet.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {formulas.map((formula) => (
              <article
                key={formula.id}
                className="rounded-lg border border-white/8 bg-white/[0.025] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium">
                      {displayName(
                        formula.name,
                        "Untitled operational formula",
                      )}
                    </h3>
                    <p className="mt-1 text-xs text-white/40">
                      Version {formula.version} · {formula.scope} ·{" "}
                      {formula.status ?? "candidate"}
                    </p>
                  </div>

                  <p className="text-xs text-white/40">
                    Updated {formatDate(formula.updatedAt)}
                  </p>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-white/65 sm:grid-cols-3">
                  <p>Confidence: {Math.round(formula.confidence * 100)}%</p>
                  <p>Samples: {formula.sampleCount}</p>
                  <p>Successful: {formula.successCount}</p>
                </div>

                {formula.bestUsedFor?.length ? (
                  <p className="mt-4 text-sm text-white/55">
                    Best used for: {formula.bestUsedFor.join(", ")}
                  </p>
                ) : null}

                {formula.verification || formula.publication ? (
                  <div className="mt-4 space-y-2 border-t border-white/8 pt-4 text-xs text-white/45">
                    {formula.verification ? (
                      <p>
                        Verification: {formula.verification.authority} ·{" "}
                        {formula.verification.verified
                          ? "verified"
                          : "not verified"}
                        {formula.verification.verificationVersion
                          ? ` · ${formula.verification.verificationVersion}`
                          : ""}
                      </p>
                    ) : null}

                    {formula.publication?.author ||
                    formula.publication?.publisher ? (
                      <p>
                        Published by:{" "}
                        {formula.publication.author ??
                          formula.publication.publisher}
                      </p>
                    ) : null}

                    {formula.publication?.marketplaceReady !== undefined ? (
                      <p>
                        Marketplace:{" "}
                        {formula.publication.marketplaceReady
                          ? "ready"
                          : "not ready"}
                      </p>
                    ) : null}

                    {formula.publication?.provenBy?.length ? (
                      <p>
                        Proven by: {formula.publication.provenBy.join(", ")}
                      </p>
                    ) : null}

                    {formula.publication?.alternatives?.length ? (
                      <p>
                        Alternatives:{" "}
                        {formula.publication.alternatives.join(", ")}
                      </p>
                    ) : null}

                  </div>
                ) : null}

                <p className="mt-4 text-xs text-white/35">
                  {formula.steps.length} steps ·{" "}
                  {formula.failureConditions.length} failure conditions
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-white/10 p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-medium">Operational Scripts</h2>
          <span className="text-xs uppercase tracking-[0.18em] text-white/40">
            {scripts.length} saved
          </span>
        </div>

        {scripts.length === 0 ? (
          <p className="mt-5 text-sm text-white/55">
            No operational scripts have been saved yet.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {scripts.map((script) => (
              <article
                key={script.id}
                className="rounded-lg border border-white/8 bg-white/[0.025] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium">
                      {displayName(script.name, "Untitled operational script")}
                    </h3>
                    <p className="mt-1 text-xs text-white/40">
                      Version {script.version} · {script.status}
                    </p>
                  </div>

                  <p className="text-xs text-white/40">
                    Updated {formatDate(script.updatedAt)}
                  </p>
                </div>

                <p className="mt-4 text-sm text-white/65">
                  {script.lines.length} script lines
                </p>

                <p className="mt-2 text-xs text-white/35">
                  Formula {script.formulaId} · version {script.formulaVersion}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
