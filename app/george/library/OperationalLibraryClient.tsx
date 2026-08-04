"use client";

import { useEffect, useMemo, useState } from "react";

import {
  BRANESX_MARKETPLACE_FORMULAS,
  type BranesxMarketplaceFormula,
} from "@/lib/george/operational-memory/branesx-marketplace-catalog";

const SAVED_FORMULAS_KEY = "GEORGE_MY_LIBRARY_FORMULAS";
const SELECTED_FORMULA_KEY = "GEORGE_MARKETPLACE_FORMULA_SELECTION";

function statusLabel(status: BranesxMarketplaceFormula["status"]) {
  if (status === "proven") return "Proven";
  if (status === "emerging") return "Not yet proven";
  return "Experimental";
}

export default function OperationalLibraryClient() {
  const [livePrepReturnAvailable, setLivePrepReturnAvailable] = useState(false);
  const [savedFormulaIds, setSavedFormulaIds] = useState<Set<string>>(() => new Set());
  const [expandedFormulaId, setExpandedFormulaId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const returnUrl = window.sessionStorage.getItem("GEORGE_LIVE_PREP_RETURN_URL");

    setLivePrepReturnAvailable(
      params.get("source") === "live-prep" && Boolean(returnUrl),
    );

    try {
      const saved = JSON.parse(
        window.localStorage.getItem(SAVED_FORMULAS_KEY) || "[]",
      ) as string[];
      setSavedFormulaIds(new Set(saved));
    } catch {
      setSavedFormulaIds(new Set());
    }
  }, []);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(BRANESX_MARKETPLACE_FORMULAS.map((item) => item.category))),
    ],
    [],
  );

  const visibleFormulas = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return BRANESX_MARKETPLACE_FORMULAS.filter((formula) => {
      if (category !== "All" && formula.category !== category) return false;
      if (!normalizedSearch) return true;

      return [
        formula.name,
        formula.category,
        formula.purpose,
        ...formula.environments,
        ...formula.formula,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [category, search]);

  const savedFormulas = useMemo(
    () => BRANESX_MARKETPLACE_FORMULAS.filter((formula) => savedFormulaIds.has(formula.id)),
    [savedFormulaIds],
  );

  function persistSaved(next: Set<string>) {
    setSavedFormulaIds(next);
    try {
      window.localStorage.setItem(SAVED_FORMULAS_KEY, JSON.stringify(Array.from(next)));
    } catch {}
  }

  function toggleSaved(formulaId: string) {
    const next = new Set(savedFormulaIds);
    if (next.has(formulaId)) next.delete(formulaId);
    else next.add(formulaId);
    persistSaved(next);
  }

  function returnToLivePrep() {
    try {
      const returnUrl = window.sessionStorage.getItem("GEORGE_LIVE_PREP_RETURN_URL");
      if (returnUrl) {
        window.location.href = returnUrl;
        return;
      }
    } catch {}

    window.location.href = "/george/live-entry?source=homepage&stage=formula&return=live-prep";
  }

  function useFormula(formula: BranesxMarketplaceFormula) {
    const next = new Set(savedFormulaIds);
    next.add(formula.id);
    persistSaved(next);

    try {
      window.sessionStorage.setItem(
        SELECTED_FORMULA_KEY,
        JSON.stringify({
          id: formula.id,
          name: formula.name,
          publisher: "BRANESX",
          category: formula.category,
          status: formula.status,
          selectedAt: Date.now(),
        }),
      );
    } catch {}

    if (livePrepReturnAvailable) returnToLivePrep();
  }

  return (
    <div className="mt-10 space-y-10">
      {livePrepReturnAvailable ? (
        <button
          type="button"
          onClick={returnToLivePrep}
          className="rounded-[10px] border border-[#7898FF]/38 bg-[#11182A] px-5 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-white transition hover:border-[#AEB6FF]/65 hover:bg-[#18213A]"
        >
          Back to Ready Room
        </button>
      ) : null}

      <section className="rounded-[18px] border border-white/[0.09] bg-[#050608] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#AEB6FF]/60">
              Recommendation-first discovery
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Conversation Formulas</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/48">
              Formulas govern operational strategy. Scripts implement them.
              Screeners identify barriers, routing conditions, or resistance a script may need to overcome.
            </p>
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/34">
            {BRANESX_MARKETPLACE_FORMULAS.length} published by BRANESX
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search formulas, goals, or conversation environments"
            className="h-12 rounded-[11px] border border-white/[0.1] bg-black px-4 font-mono text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#7898FF]/55"
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-[9px] border px-3 py-2 font-mono text-[8px] uppercase tracking-[0.15em] transition ${
                  category === item
                    ? "border-[#7898FF]/65 bg-[#14244A] text-white"
                    : "border-white/[0.09] text-white/42 hover:border-white/22 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {savedFormulas.length > 0 ? (
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[#AEB6FF]/60">My Library</div>
              <h2 className="mt-2 text-xl font-semibold">Saved operational capabilities</h2>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/32">{savedFormulas.length} saved</span>
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {savedFormulas.map((formula) => (
              <button
                key={formula.id}
                type="button"
                onClick={() => useFormula(formula)}
                className="min-w-[250px] rounded-[13px] border border-[#7898FF]/25 bg-[#0B1222] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#7898FF]/55"
              >
                <div className="font-mono text-[8px] uppercase tracking-[0.17em] text-[#AEB6FF]/52">{formula.category}</div>
                <div className="mt-2 text-sm font-semibold text-white/88">{formula.name}</div>
                <div className="mt-3 font-mono text-[8px] uppercase tracking-[0.15em] text-white/38">Use for this room →</div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-white/38">Marketplace</div>
            <h2 className="mt-2 text-xl font-semibold">Published Formulas</h2>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/32">{visibleFormulas.length} shown</span>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {visibleFormulas.map((formula) => {
            const expanded = expandedFormulaId === formula.id;
            const saved = savedFormulaIds.has(formula.id);

            return (
              <article key={formula.id} className="rounded-[16px] border border-white/[0.09] bg-[#050608] p-5 transition hover:border-white/[0.16]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-[#AEB6FF]/58">Published by BRANESX</div>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em]">{formula.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/[0.1] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-white/45">{formula.category}</span>
                      <span className="rounded-full border border-white/[0.1] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-white/45">{statusLabel(formula.status)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSaved(formula.id)}
                    className={`rounded-[9px] border px-3 py-2 font-mono text-[8px] uppercase tracking-[0.14em] transition ${
                      saved
                        ? "border-[#7898FF]/55 bg-[#14244A] text-white"
                        : "border-white/[0.1] text-white/42 hover:text-white"
                    }`}
                  >
                    {saved ? "Saved" : "Save"}
                  </button>
                </div>

                <p className="mt-4 text-sm leading-6 text-white/55">{formula.purpose}</p>

                <div className="mt-5 rounded-[12px] border border-white/[0.08] bg-black/30 p-4">
                  <div className="font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-white/34">Conversation Formula</div>
                  <ol className="mt-3 space-y-2">
                    {formula.formula.slice(0, expanded ? undefined : 3).map((step, index) => (
                      <li key={`${formula.id}-${step}`} className="flex gap-3 text-[12px] leading-5 text-white/68">
                        <span className="font-mono text-white/28">{String(index + 1).padStart(2, "0")}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                    {!expanded && formula.protectedSteps > 0 ? (
                      <li className="flex gap-3 text-[12px] leading-5 text-white/28">
                        <span className="font-mono">••</span>
                        <span>{formula.protectedSteps} protected operational {formula.protectedSteps === 1 ? "step" : "steps"}</span>
                      </li>
                    ) : null}
                  </ol>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[10px] border border-white/[0.07] p-3">
                    <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/30">Associated Scripts</div>
                    <div className="mt-1 text-lg font-semibold text-white/78">{formula.associatedScripts}</div>
                  </div>
                  <div className="rounded-[10px] border border-white/[0.07] p-3">
                    <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/30">Associated Screeners</div>
                    <div className="mt-1 text-lg font-semibold text-white/78">{formula.associatedScreeners}</div>
                  </div>
                </div>

                {expanded ? (
                  <div className="mt-4 border-t border-white/[0.08] pt-4">
                    <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/30">Conversation environments</div>
                    <p className="mt-2 text-xs leading-5 text-white/52">{formula.environments.join(" · ")}</p>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => useFormula(formula)}
                    className="rounded-[10px] border border-[#7898FF]/55 bg-[#14244A] px-4 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#1A2E60]"
                  >
                    Use Formula
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedFormulaId(expanded ? null : formula.id)}
                    className="rounded-[10px] border border-white/[0.11] px-4 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-white/54 transition hover:border-white/25 hover:text-white"
                  >
                    {expanded ? "Collapse" : "View Formula"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
