"use client";

import { useEffect, useMemo, useState } from "react";
import type { OperationalFormula } from "@/lib/george/operational-memory/types";
import {
  loadLivePreparationSignals,
  loadPreparationSession,
} from "@/lib/george/live-browser/live-preparation-browser-storage";
import {
  getActiveSessionId,
  getActiveSessionIdForMode,
  updateSessionLinkage,
} from "@/lib/george/session/store";
import {
  GEORGE_PREPARATION_RESUME_EVENT_KEY,
  createGeorgePreparationResumeEvent,
} from "@/lib/george/live-entry/preparation-resume";

type MarketplaceCatalogEntry = {
  formula: OperationalFormula;
};

type MarketplaceCatalogResponse = {
  ok: boolean;
  entries?: MarketplaceCatalogEntry[];
  error?: string;
};

type RecommendationResponse = {
  ok: boolean;
  recommendation?: {
    recommendedFormula: OperationalFormula | null;
    recommendedScript?: unknown;
    recommendationSummary: string;
  };
  error?: string;
};

type EntitlementDecision = {
  allowed: boolean;
  purchasable?: boolean;
};

type EntitlementResponse = {
  ok: boolean;
  decision?: EntitlementDecision;
  error?: string;
};

function displayName(value: string | undefined, fallback: string) {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

function publicationLabel(formula: OperationalFormula) {
  const state = formula.publication?.state || "draft";
  return state === "marketplace_listed"
    ? "Available"
    : state.replaceAll("_", " ");
}

function CheckMark() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/16 text-[10px] text-white/62"
    >
      ✓
    </span>
  );
}

function Glide() {
  return (
    <div
      aria-hidden="true"
      className="george-marketplace-glide ml-[9px] h-14 w-px bg-gradient-to-b from-white/16 via-white/[0.07] to-transparent"
    />
  );
}

export default function MarketplaceClient() {
  const [entries, setEntries] = useState<MarketplaceCatalogEntry[]>([]);
  const [recommendation, setRecommendation] =
    useState<RecommendationResponse["recommendation"]>();
  const [entitlements, setEntitlements] = useState<
    Record<string, EntitlementDecision>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formulaOpenId, setFormulaOpenId] = useState<string | null>(null);

  const preparationSignals = useMemo(() => loadLivePreparationSignals(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadMarketplace() {
      try {
        const recommendationInput = {
          roomType:
            preparationSignals.conversationTypeId ||
            preparationSignals.conversationType ||
            undefined,
          objectiveType:
            preparationSignals.desiredOutcome ||
            preparationSignals.broadGoal ||
            undefined,
          briefingComplete: true,
          preparationContext: {
            role: preparationSignals.role || undefined,
            desiredOutcome:
              preparationSignals.desiredOutcome ||
              preparationSignals.broadGoal ||
              undefined,
            conversationContext:
              preparationSignals.knownContext ||
              preparationSignals.conversationType ||
              undefined,
            audience: preparationSignals.audience || undefined,
            knownFacts: Object.values(
              preparationSignals.optionalSignals || {},
            )
              .map((value) => String(value || "").trim())
              .filter(Boolean),
          },
        };

        const [catalogResponse, recommendationResponse] = await Promise.all([
          fetch("/api/george/marketplace/catalog?limit=100", {
            cache: "no-store",
          }),
          fetch("/api/george/operational-memory/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify(recommendationInput),
          }),
        ]);

        const catalog =
          (await catalogResponse.json()) as MarketplaceCatalogResponse;
        const recommended =
          (await recommendationResponse.json()) as RecommendationResponse;

        if (!catalogResponse.ok || !catalog.ok) {
          throw new Error(catalog.error || "Unable to load Marketplace.");
        }

        if (!recommendationResponse.ok || !recommended.ok) {
          throw new Error(
            recommended.error || "Unable to load recommendation.",
          );
        }

        if (cancelled) return;

        setEntries(catalog.entries || []);
        setRecommendation(recommended.recommendation);

        const ids = Array.from(
          new Set(
            [
              ...(catalog.entries || []).map((entry) => entry.formula.id),
              recommended.recommendation?.recommendedFormula?.id,
            ].filter((id): id is string => Boolean(id)),
          ),
        );

        const decisions = await Promise.all(
          ids.map(async (formulaId) => {
            const response = await fetch(
              `/api/george/marketplace/entitlements/${encodeURIComponent(
                formulaId,
              )}`,
              { cache: "no-store" },
            );
            const payload = (await response.json()) as EntitlementResponse;

            if (!response.ok || !payload.ok || !payload.decision) {
              return [formulaId, { allowed: false }] as const;
            }

            return [formulaId, payload.decision] as const;
          }),
        );

        if (!cancelled) {
          setEntitlements(Object.fromEntries(decisions));
        }
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load Marketplace.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMarketplace();

    return () => {
      cancelled = true;
    };
  }, [preparationSignals]);

  function markMarketplaceSurface() {
    const sessionId =
      getActiveSessionIdForMode("normal") || getActiveSessionId();

    if (!sessionId) return;

    const preparation = loadPreparationSession();

    updateSessionLinkage(sessionId, {
      preparationSessionId:
        preparation?.relations.normalSessionId === sessionId
          ? preparation.preparationSessionId
          : undefined,
      surface: "marketplace",
    });
  }

  function useStrategy(formula: OperationalFormula) {
    const decision = entitlements[formula.id];
    if (!decision?.allowed) return;

    markMarketplaceSurface();

    const selection = {
      formulaId: formula.id,
      formulaVersion: formula.version,
      source: "marketplace",
      selectedAt: Date.now(),
    };

    try {
      const rawSnapshot = window.sessionStorage.getItem(
        "GEORGE_LIVE_PREP_RETURN_STATE",
      );
      const snapshot = rawSnapshot ? JSON.parse(rawSnapshot) : {};

      const previousFormulaId = String(
        snapshot?.selectedFormula?.id || "",
      ).trim();

      const change =
        previousFormulaId && previousFormulaId !== formula.id
          ? "formula_changed"
          : "formula_selected";

      window.sessionStorage.setItem(
        "GEORGE_MARKETPLACE_FORMULA_SELECTION",
        JSON.stringify(selection),
      );

      window.sessionStorage.setItem(
        "GEORGE_LIVE_PREP_RETURN_STATE",
        JSON.stringify({
          ...snapshot,
          georgeSessionId:
            getActiveSessionIdForMode("normal") || getActiveSessionId(),
          preparationSessionId:
            loadPreparationSession()?.preparationSessionId,
          selectedFormula: formula,
          selectedFormulaSource: "user",
          livePrepOpenSection: "formula",
        }),
      );

      window.sessionStorage.setItem(
        GEORGE_PREPARATION_RESUME_EVENT_KEY,
        JSON.stringify(
          createGeorgePreparationResumeEvent({
            source: "marketplace",
            changes: [change],
            formula: {
              id: formula.id,
              version: formula.version,
              name: formula.name,
            },
          }),
        ),
      );

      const returnUrl = window.sessionStorage.getItem(
        "GEORGE_LIVE_PREP_RETURN_URL",
      );

      if (returnUrl) {
        window.location.href = returnUrl;
        return;
      }
    } catch {}

    const params = new URLSearchParams({
      source: "marketplace",
      stage: "formula",
      return: "live-prep",
      formulaId: formula.id,
      formulaVersion: String(formula.version),
    });

    window.location.href = `/george/live-entry?${params.toString()}`;
  }

  if (loading) {
    return (
      <p className="mt-12 text-sm text-white/42">
        Finding operational strategies…
      </p>
    );
  }

  if (error) {
    return (
      <div className="mt-12 border-t border-white/[0.07] pt-7">
        <p className="text-sm text-white/52">{error}</p>
      </div>
    );
  }

  const formulas = entries.map((entry) => entry.formula);
  const recommendedFormula = recommendation?.recommendedFormula || null;

  const discover = formulas.filter(
    (formula) => formula.status !== "validated",
  );

  const emerging = formulas.filter(
    (formula) =>
      formula.status !== "validated" &&
      Number(formula.successCount || 0) > 0,
  );

  const proven = formulas.filter(
    (formula) => formula.status === "validated",
  );

  return (
    <div className="mt-14">
      <section aria-labelledby="marketplace-recommended">
        <div className="flex items-start gap-4">
          <CheckMark />

          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/34">
              Recommended for you
            </p>

            {recommendedFormula ? (
              <>
                <h2
                  id="marketplace-recommended"
                  className="mt-3 max-w-4xl text-3xl font-medium tracking-[-0.035em] text-white sm:text-5xl"
                >
                  {displayName(
                    recommendedFormula.name,
                    "Untitled operational strategy",
                  )}
                </h2>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/38">
                  <span>
                    {recommendedFormula.publication?.publisher ||
                      recommendedFormula.publication?.author ||
                      "BRANESX"}
                  </span>
                  <span>{publicationLabel(recommendedFormula)}</span>
                </div>

                <div className="mt-8 max-w-3xl border-t border-white/[0.07] pt-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">
                    Why this strategy?
                  </p>
                  <p className="mt-3 text-[15px] leading-7 text-white/64">
                    {recommendation?.recommendationSummary ||
                      "This strategy best fits the objective and context GEORGE currently understands."}
                  </p>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  {entitlements[recommendedFormula.id]?.allowed ? (
                    <button
                      type="button"
                      onClick={() => useStrategy(recommendedFormula)}
                      className="george-primary-action min-h-11 rounded-[0.7rem] px-5 py-2.5 text-sm font-medium"
                    >
                      Use Strategy
                    </button>
                  ) : (
                    <span className="inline-flex min-h-11 items-center rounded-[0.7rem] border border-white/[0.08] px-5 py-2.5 text-sm text-white/34">
                      {entitlements[recommendedFormula.id]?.purchasable
                        ? "Locked"
                        : "Unavailable"}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setFormulaOpenId((current) =>
                        current === recommendedFormula.id
                          ? null
                          : recommendedFormula.id,
                      )
                    }
                    className="george-secondary-action min-h-11 rounded-[0.7rem] px-5 py-2.5 text-sm"
                  >
                    {formulaOpenId === recommendedFormula.id
                      ? "Hide Formula"
                      : "View Formula"}
                  </button>
                </div>

                {formulaOpenId === recommendedFormula.id ? (
                  <div className="mt-7 max-w-3xl border-l border-white/[0.08] pl-5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/28">
                      Formula
                    </p>

                    <div className="mt-4 space-y-4 text-sm leading-6 text-white/54">
                      {recommendedFormula.bestUsedFor?.length ? (
                        <p>
                          <span className="text-white/32">Best used for </span>
                          {recommendedFormula.bestUsedFor.join(" · ")}
                        </p>
                      ) : null}

                      {recommendedFormula.steps?.length ? (
                        <ol className="space-y-2">
                          {recommendedFormula.steps.map((step, index) => (
                            <li key={`${recommendedFormula.id}-${index}`}>
                              <span className="mr-2 text-white/26">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              {typeof step === "string"
                                ? step
                                : JSON.stringify(step)}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-white/36">
                          Formula details are not available for this strategy.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <h2
                  id="marketplace-recommended"
                  className="mt-3 text-2xl font-medium tracking-[-0.025em]"
                >
                  No recommendation yet.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/48">
                  Recommendations appear when GEORGE has enough context to
                  identify an operational fit.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <Glide />

      <section aria-labelledby="marketplace-discover">
        <div className="flex items-start gap-4">
          <CheckMark />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
              Discover
            </p>
            <h2
              id="marketplace-discover"
              className="mt-2 text-2xl font-medium tracking-[-0.025em]"
            >
              Explore another approach
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/46">
              Browse when you want a different operational strategy than
              GEORGE&apos;s recommendation.
            </p>

            <div className="mt-7 grid gap-px overflow-hidden rounded-[1rem] border border-white/[0.055] bg-white/[0.055] md:grid-cols-2">
              {discover.slice(0, 6).map((formula) => (
                <article
                  key={formula.id}
                  className="bg-[#07080B] p-5 transition duration-200 hover:bg-[#0A0C10]"
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/28">
                    {Number(formula.successCount || 0) > 0
                      ? "Evidence accumulating"
                      : "Working strategy"}
                  </p>

                  <h3 className="mt-3 text-lg font-medium text-white/86">
                    {displayName(
                      formula.name,
                      "Untitled operational strategy",
                    )}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/44">
                    {formula.bestUsedFor?.join(" · ") ||
                      formula.objectiveTypes?.join(" · ") ||
                      "Available for operational execution."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {entitlements[formula.id]?.allowed ? (
                      <button
                        type="button"
                        onClick={() => useStrategy(formula)}
                        className="george-primary-action rounded-[0.6rem] px-3.5 py-2 text-xs"
                      >
                        Use Strategy
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() =>
                        setFormulaOpenId((current) =>
                          current === formula.id ? null : formula.id,
                        )
                      }
                      className="george-secondary-action rounded-[0.6rem] px-3.5 py-2 text-xs"
                    >
                      View Formula
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Glide />

      <section className="grid gap-8 border-t border-white/[0.055] pt-8 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-3">
            {emerging.length ? <CheckMark /> : null}
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">
              Emerging
            </p>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/44">
            {emerging.length} strategies are accumulating execution evidence.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-3">
            {proven.length ? <CheckMark /> : null}
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">
              Proven
            </p>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/44">
            {proven.length} strategies have reached validated status.
          </p>
        </div>
      </section>
    </div>
  );
}
