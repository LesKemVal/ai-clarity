"use client";

import { useEffect, useState } from "react";

import type {
  OperationalFormula,
  OperationalFormulaLineage,
  OperationalFormulaPublicationState,
  OperationalFormulaReassessment,
  OperationalFormulaStep,
  OperationalScript,
} from "@/lib/george/operational-memory/types";

type FormulaResponse = {
  ok: boolean;
  formulas?: OperationalFormula[];
  formula?: OperationalFormula;
  ownedFormulaIds?: string[];
  error?: string;
};

type ScriptResponse = {
  ok: boolean;
  scripts?: OperationalScript[];
  error?: string;
};

type FormulaHistoryResponse = {
  ok: boolean;
  formulaId?: string;
  reassessments?: OperationalFormulaReassessment[];
  lineages?: OperationalFormulaLineage[];
  error?: string;
};

type FormulaHistory = {
  reassessments: OperationalFormulaReassessment[];
  lineages: OperationalFormulaLineage[];
};

type FormulaDraft = {
  name: string;
  bestUsedFor: string;
  roomTypes: string;
  objectiveTypes: string;
  prerequisites: string;
  steps: string;
  failureConditions: string;
  reasons: string;
};

type FormulaMetadataDraft = {
  name: string;
  bestUsedFor: string;
  author: string;
  publisher: string;
  marketplaceReady: boolean;
  provenBy: string;
  alternatives: string;
};

type PublicationTransition =
  | "request_verification"
  | "mark_verified"
  | "publish"
  | "list_marketplace"
  | "unlist_marketplace"
  | "retire"
  | "withdraw";

type PublicationAction = {
  transition: PublicationTransition;
  label: string;
  destructive?: boolean;
};

function publicationState(
  formula: OperationalFormula,
): OperationalFormulaPublicationState {
  return formula.publication?.state ?? "draft";
}

function publicationActions(formula: OperationalFormula): PublicationAction[] {
  const state = publicationState(formula);

  switch (state) {
    case "draft":
      return [
        {
          transition: "request_verification",
          label: "Request verification",
        },
        {
          transition: "withdraw",
          label: "Withdraw",
          destructive: true,
        },
      ];

    case "verification_requested":
      return formula.verification?.verified
        ? [
            {
              transition: "mark_verified",
              label: "Confirm BRANESX verification",
            },
            {
              transition: "withdraw",
              label: "Withdraw",
              destructive: true,
            },
          ]
        : [
            {
              transition: "withdraw",
              label: "Withdraw",
              destructive: true,
            },
          ];

    case "verified":
      return [
        {
          transition: "publish",
          label: "Publish",
        },
        {
          transition: "retire",
          label: "Retire",
          destructive: true,
        },
        {
          transition: "withdraw",
          label: "Withdraw",
          destructive: true,
        },
      ];

    case "published":
      return [
        ...(formula.publication?.marketplaceReady
          ? [
              {
                transition: "list_marketplace" as const,
                label: "List marketplace",
              },
            ]
          : []),
        {
          transition: "retire",
          label: "Retire",
          destructive: true,
        },
        {
          transition: "withdraw",
          label: "Withdraw",
          destructive: true,
        },
      ];

    case "marketplace_listed":
      return [
        {
          transition: "unlist_marketplace",
          label: "Unlist",
        },
        {
          transition: "retire",
          label: "Retire",
          destructive: true,
        },
        {
          transition: "withdraw",
          label: "Withdraw",
          destructive: true,
        },
      ];

    case "retired":
    case "withdrawn":
      return [];
  }
}

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

function joinLines(values: string[] | undefined) {
  return values?.join("\n") ?? "";
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatSteps(steps: OperationalFormulaStep[]) {
  return steps
    .map((step) =>
      [
        step.signalType,
        step.actionType ?? "",
        step.expectedTransition ?? "",
      ].join(" | "),
    )
    .join("\n");
}

function parseSteps(value: string): OperationalFormulaStep[] {
  return parseLines(value).map((line) => {
    const [signalType = "", actionType = "", expectedTransition = ""] = line
      .split("|")
      .map((item) => item.trim());

    return {
      signalType,
      ...(actionType ? { actionType } : {}),
      ...(expectedTransition ? { expectedTransition } : {}),
    };
  });
}

function createDraft(formula: OperationalFormula): FormulaDraft {
  return {
    name: formula.name ?? "",
    bestUsedFor: joinLines(formula.bestUsedFor),
    roomTypes: joinLines(formula.roomTypes),
    objectiveTypes: joinLines(formula.objectiveTypes),
    prerequisites: joinLines(formula.prerequisites),
    steps: formatSteps(formula.steps),
    failureConditions: joinLines(formula.failureConditions),
    reasons: "",
  };
}

function createMetadataDraft(
  formula: OperationalFormula,
): FormulaMetadataDraft {
  return {
    name: formula.name ?? "",
    bestUsedFor: joinLines(formula.bestUsedFor),
    author: formula.publication?.author ?? "",
    publisher: formula.publication?.publisher ?? "",
    marketplaceReady: formula.publication?.marketplaceReady ?? false,
    provenBy: joinLines(formula.publication?.provenBy),
    alternatives: joinLines(formula.publication?.alternatives),
  };
}

const inputClassName =
  "mt-2 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none transition focus:border-white/30";

export default function OperationalLibraryClient() {
  const [formulas, setFormulas] = useState<OperationalFormula[]>([]);
  const [ownedFormulaIds, setOwnedFormulaIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [scripts, setScripts] = useState<OperationalScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingFormulaId, setEditingFormulaId] = useState<string | null>(null);
  const [draft, setDraft] = useState<FormulaDraft | null>(null);
  const [derivingFormulaId, setDerivingFormulaId] = useState<string | null>(null);
  const [derivationError, setDerivationError] = useState("");
  const [deletingFormulaId, setDeletingFormulaId] = useState<string | null>(null);
  const [formulaMutationError, setFormulaMutationError] = useState("");
  const [editingMetadataFormulaId, setEditingMetadataFormulaId] = useState<
    string | null
  >(null);
  const [metadataDraft, setMetadataDraft] =
    useState<FormulaMetadataDraft | null>(null);
  const [savingMetadataFormulaId, setSavingMetadataFormulaId] = useState<
    string | null
  >(null);
  const [
    transitioningPublicationFormulaId,
    setTransitioningPublicationFormulaId,
  ] = useState<string | null>(null);
  const [expandedHistoryFormulaId, setExpandedHistoryFormulaId] = useState<
    string | null
  >(null);
  const [formulaHistory, setFormulaHistory] = useState<
    Record<string, FormulaHistory>
  >({});
  const [historyLoadingFormulaId, setHistoryLoadingFormulaId] = useState<
    string | null
  >(null);
  const [historyErrors, setHistoryErrors] = useState<Record<string, string>>({});

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
        setOwnedFormulaIds(new Set(formulaPayload.ownedFormulaIds ?? []));
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

  async function toggleFormulaHistory(formulaId: string) {
    if (expandedHistoryFormulaId === formulaId) {
      setExpandedHistoryFormulaId(null);
      return;
    }

    setExpandedHistoryFormulaId(formulaId);

    if (formulaHistory[formulaId] || historyLoadingFormulaId === formulaId) {
      return;
    }

    setHistoryLoadingFormulaId(formulaId);
    setHistoryErrors((current) => {
      const next = { ...current };
      delete next[formulaId];
      return next;
    });

    try {
      const response = await fetch(
        `/api/george/operational-memory/formulas/${encodeURIComponent(
          formulaId,
        )}/history`,
        {
          cache: "no-store",
        },
      );

      const payload = (await response.json()) as FormulaHistoryResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to load formula history");
      }

      setFormulaHistory((current) => ({
        ...current,
        [formulaId]: {
          reassessments: payload.reassessments ?? [],
          lineages: payload.lineages ?? [],
        },
      }));
    } catch (historyError) {
      setHistoryErrors((current) => ({
        ...current,
        [formulaId]:
          historyError instanceof Error
            ? historyError.message
            : "Unable to load formula history",
      }));
    } finally {
      setHistoryLoadingFormulaId((current) =>
        current === formulaId ? null : current,
      );
    }
  }

  function beginDerivation(formula: OperationalFormula) {
    setEditingFormulaId(formula.id);
    setDraft(createDraft(formula));
    setDerivationError("");
    setFormulaMutationError("");
  }

  function beginMetadataEdit(formula: OperationalFormula) {
    if (!ownedFormulaIds.has(formula.id)) return;

    setEditingMetadataFormulaId(formula.id);
    setMetadataDraft(createMetadataDraft(formula));
    setFormulaMutationError("");
  }

  function cancelMetadataEdit() {
    if (savingMetadataFormulaId) return;

    setEditingMetadataFormulaId(null);
    setMetadataDraft(null);
    setFormulaMutationError("");
  }

  function updateMetadataDraft<K extends keyof FormulaMetadataDraft>(
    key: K,
    value: FormulaMetadataDraft[K],
  ) {
    setMetadataDraft((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current,
    );
  }

  async function saveFormulaMetadata(formula: OperationalFormula) {
    if (
      !ownedFormulaIds.has(formula.id) ||
      !metadataDraft ||
      savingMetadataFormulaId
    ) {
      return;
    }

    setSavingMetadataFormulaId(formula.id);
    setFormulaMutationError("");

    try {
      const response = await fetch(
        `/api/george/operational-memory/formulas/${encodeURIComponent(
          formula.id,
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: metadataDraft.name.trim(),
            bestUsedFor: parseLines(metadataDraft.bestUsedFor),
            publication: {
              author: metadataDraft.author.trim(),
              publisher: metadataDraft.publisher.trim(),
              marketplaceReady: metadataDraft.marketplaceReady,
              provenBy: parseLines(metadataDraft.provenBy),
              alternatives: parseLines(metadataDraft.alternatives),
            },
          }),
        },
      );

      const payload = (await response.json()) as FormulaResponse;

      if (!response.ok || !payload.ok || !payload.formula) {
        throw new Error(payload.error || "Unable to update formula metadata");
      }

      const updatedFormula = payload.formula;

      setFormulas((current) =>
        current.map((currentFormula) =>
          currentFormula.id === updatedFormula.id
            ? updatedFormula
            : currentFormula,
        ),
      );
      setEditingMetadataFormulaId(null);
      setMetadataDraft(null);
    } catch (metadataError) {
      setFormulaMutationError(
        metadataError instanceof Error
          ? metadataError.message
          : "Unable to update formula metadata",
      );
    } finally {
      setSavingMetadataFormulaId(null);
    }
  }

  async function transitionFormulaPublication(
    formula: OperationalFormula,
    transition: PublicationTransition,
  ) {
    if (
      !ownedFormulaIds.has(formula.id) ||
      transitioningPublicationFormulaId
    ) {
      return;
    }

    const action = publicationActions(formula).find(
      (candidate) => candidate.transition === transition,
    );

    if (!action) return;

    if (
      action.destructive &&
      !window.confirm(
        `${action.label} ${displayName(
          formula.name,
          "this operational formula",
        )}?`,
      )
    ) {
      return;
    }

    setTransitioningPublicationFormulaId(formula.id);
    setFormulaMutationError("");

    try {
      const response = await fetch(
        `/api/george/operational-memory/formulas/${encodeURIComponent(
          formula.id,
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicationTransition: transition,
          }),
        },
      );

      const payload = (await response.json()) as FormulaResponse;

      if (!response.ok || !payload.ok || !payload.formula) {
        throw new Error(
          payload.error || "Unable to update formula publication",
        );
      }

      const updatedFormula = payload.formula;

      setFormulas((current) =>
        current.map((currentFormula) =>
          currentFormula.id === updatedFormula.id
            ? updatedFormula
            : currentFormula,
        ),
      );
    } catch (publicationError) {
      setFormulaMutationError(
        publicationError instanceof Error
          ? publicationError.message
          : "Unable to update formula publication",
      );
    } finally {
      setTransitioningPublicationFormulaId(null);
    }
  }

  async function deleteFormula(formula: OperationalFormula) {
    if (!ownedFormulaIds.has(formula.id) || deletingFormulaId) return;

    const confirmed = window.confirm(
      `Delete ${displayName(formula.name, "this operational formula")}? This cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingFormulaId(formula.id);
    setFormulaMutationError("");

    try {
      const response = await fetch(
        `/api/george/operational-memory/formulas/${encodeURIComponent(
          formula.id,
        )}`,
        {
          method: "DELETE",
        },
      );

      const payload = (await response.json()) as FormulaResponse & {
        formulaId?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to delete the formula");
      }

      setFormulas((current) =>
        current.filter((currentFormula) => currentFormula.id !== formula.id),
      );
      setOwnedFormulaIds((current) => {
        const next = new Set(current);
        next.delete(formula.id);
        return next;
      });
      setFormulaHistory((current) => {
        const next = { ...current };
        delete next[formula.id];
        return next;
      });
      setHistoryErrors((current) => {
        const next = { ...current };
        delete next[formula.id];
        return next;
      });
      setExpandedHistoryFormulaId((current) =>
        current === formula.id ? null : current,
      );
      setEditingFormulaId((current) =>
        current === formula.id ? null : current,
      );
      setDraft((current) =>
        editingFormulaId === formula.id ? null : current,
      );
      setEditingMetadataFormulaId((current) =>
        current === formula.id ? null : current,
      );
      setMetadataDraft((current) =>
        editingMetadataFormulaId === formula.id ? null : current,
      );
    } catch (deleteError) {
      setFormulaMutationError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete the formula",
      );
    } finally {
      setDeletingFormulaId(null);
    }
  }

  function cancelDerivation() {
    if (derivingFormulaId) return;

    setEditingFormulaId(null);
    setDraft(null);
    setDerivationError("");
  }

  function updateDraft<K extends keyof FormulaDraft>(
    key: K,
    value: FormulaDraft[K],
  ) {
    setDraft((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current,
    );
  }

  async function deriveFormula(parent: OperationalFormula) {
    if (!draft || derivingFormulaId) return;

    const steps = parseSteps(draft.steps);

    if (steps.some((step) => !step.signalType)) {
      setDerivationError("Every formula step requires a signal type.");
      return;
    }

    setDerivingFormulaId(parent.id);
    setDerivationError("");

    try {
      const response = await fetch(
        "/api/george/operational-memory/formulas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parentFormulaId: parent.id,
            changes: {
              name: draft.name.trim(),
              bestUsedFor: parseLines(draft.bestUsedFor),
              roomTypes: parseLines(draft.roomTypes),
              objectiveTypes: parseLines(draft.objectiveTypes),
              prerequisites: parseLines(draft.prerequisites),
              steps,
              failureConditions: parseLines(draft.failureConditions),
            },
            reasons: parseLines(draft.reasons),
          }),
        },
      );

      const payload = (await response.json()) as FormulaResponse;

      if (!response.ok || !payload.ok || !payload.formula) {
        throw new Error(
          payload.error || "Unable to create the derived formula",
        );
      }

      setFormulas((current) => [
        payload.formula as OperationalFormula,
        ...current.filter((formula) => formula.id !== payload.formula?.id),
      ]);
      setEditingFormulaId(null);
      setDraft(null);
    } catch (deriveError) {
      setDerivationError(
        deriveError instanceof Error
          ? deriveError.message
          : "Unable to create the derived formula",
      );
    } finally {
      setDerivingFormulaId(null);
    }
  }

  if (loading) {
    return (
      <p className="mt-10 text-sm text-white/55">
        Loading operational memory…
      </p>
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
            {formulas.length} available
          </span>
        </div>

        {formulaMutationError ? (
          <p className="mt-5 text-sm text-red-200">
            {formulaMutationError}
          </p>
        ) : null}

        {formulas.length === 0 ? (
          <p className="mt-5 text-sm text-white/55">
            No operational formulas are available yet.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {formulas.map((formula) => {
              const isEditing = editingFormulaId === formula.id;
              const isDeriving = derivingFormulaId === formula.id;
              const isOwned = ownedFormulaIds.has(formula.id);
              const isDeleting = deletingFormulaId === formula.id;
              const isMetadataEditing =
                editingMetadataFormulaId === formula.id;
              const isMetadataSaving =
                savingMetadataFormulaId === formula.id;
              const isPublicationTransitioning =
                transitioningPublicationFormulaId === formula.id;
              const availablePublicationActions =
                isOwned && !isEditing && !isMetadataEditing
                  ? publicationActions(formula)
                  : [];
              const isHistoryExpanded =
                expandedHistoryFormulaId === formula.id;
              const isHistoryLoading =
                historyLoadingFormulaId === formula.id;
              const history = formulaHistory[formula.id];
              const historyError = historyErrors[formula.id];

              return (
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

                    <div className="flex items-center gap-3">
                      <p className="text-xs text-white/40">
                        Updated {formatDate(formula.updatedAt)}
                      </p>

                      {!isEditing && !isMetadataEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => beginDerivation(formula)}
                            disabled={Boolean(
                              derivingFormulaId ||
                                deletingFormulaId ||
                                savingMetadataFormulaId ||
                                transitioningPublicationFormulaId,
                            )}
                            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Derive
                          </button>

                          {isOwned ? (
                            <>
                              <button
                                type="button"
                                onClick={() => beginMetadataEdit(formula)}
                                disabled={Boolean(
                                  derivingFormulaId ||
                                    deletingFormulaId ||
                                    savingMetadataFormulaId,
                                )}
                                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => void deleteFormula(formula)}
                                disabled={Boolean(
                                  derivingFormulaId ||
                                    deletingFormulaId ||
                                    savingMetadataFormulaId,
                                )}
                                className="rounded-lg border border-red-300/20 px-3 py-1.5 text-xs text-red-200/70 transition hover:border-red-300/40 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {isDeleting ? "Deleting…" : "Delete"}
                              </button>
                            </>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-white/65 sm:grid-cols-3">
                    <p>
                      Confidence: {Math.round(formula.confidence * 100)}%
                    </p>
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
                          Proven by:{" "}
                          {formula.publication.provenBy.join(", ")}
                        </p>
                      ) : null}

                      {formula.publication?.alternatives?.length ? (
                        <p>
                          Alternatives:{" "}
                          {formula.publication.alternatives.join(", ")}
                        </p>
                      ) : null}

                      <p>
                        Publication:{" "}
                        {publicationState(formula).replaceAll("_", " ")}
                      </p>
                    </div>
                  ) : null}

                  {availablePublicationActions.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/8 pt-4">
                      {availablePublicationActions.map((action) => (
                        <button
                          key={action.transition}
                          type="button"
                          onClick={() =>
                            void transitionFormulaPublication(
                              formula,
                              action.transition,
                            )
                          }
                          disabled={Boolean(
                            derivingFormulaId ||
                              deletingFormulaId ||
                              savingMetadataFormulaId ||
                              transitioningPublicationFormulaId,
                          )}
                          className={
                            action.destructive
                              ? "rounded-lg border border-red-300/20 px-3 py-1.5 text-xs text-red-200/70 transition hover:border-red-300/40 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                              : "rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                          }
                        >
                          {isPublicationTransitioning
                            ? "Updating…"
                            : action.label}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {isMetadataEditing && metadataDraft ? (
                    <div className="mt-5 border-t border-white/10 pt-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-medium">
                            Edit formula metadata
                          </h4>
                          <p className="mt-1 text-xs text-white/45">
                            Operational steps and learning evidence remain
                            unchanged.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={cancelMetadataEdit}
                          disabled={isMetadataSaving}
                          className="text-xs text-white/45 transition hover:text-white disabled:opacity-40"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <label className="text-xs text-white/55">
                          Name
                          <input
                            value={metadataDraft.name}
                            onChange={(event) =>
                              updateMetadataDraft("name", event.target.value)
                            }
                            className={inputClassName}
                          />
                        </label>

                        <label className="text-xs text-white/55">
                          Best used for
                          <textarea
                            value={metadataDraft.bestUsedFor}
                            onChange={(event) =>
                              updateMetadataDraft(
                                "bestUsedFor",
                                event.target.value,
                              )
                            }
                            rows={4}
                            className={inputClassName}
                            placeholder="One use per line"
                          />
                        </label>

                        <label className="text-xs text-white/55">
                          Author
                          <input
                            value={metadataDraft.author}
                            onChange={(event) =>
                              updateMetadataDraft("author", event.target.value)
                            }
                            className={inputClassName}
                          />
                        </label>

                        <label className="text-xs text-white/55">
                          Publisher
                          <input
                            value={metadataDraft.publisher}
                            onChange={(event) =>
                              updateMetadataDraft(
                                "publisher",
                                event.target.value,
                              )
                            }
                            className={inputClassName}
                          />
                        </label>

                        <label className="text-xs text-white/55">
                          Proven by
                          <textarea
                            value={metadataDraft.provenBy}
                            onChange={(event) =>
                              updateMetadataDraft(
                                "provenBy",
                                event.target.value,
                              )
                            }
                            rows={4}
                            className={inputClassName}
                            placeholder="One source per line"
                          />
                        </label>

                        <label className="text-xs text-white/55">
                          Alternatives
                          <textarea
                            value={metadataDraft.alternatives}
                            onChange={(event) =>
                              updateMetadataDraft(
                                "alternatives",
                                event.target.value,
                              )
                            }
                            rows={4}
                            className={inputClassName}
                            placeholder="One alternative per line"
                          />
                        </label>
                      </div>

                      <label className="mt-5 flex items-center gap-3 text-xs text-white/55">
                        <input
                          type="checkbox"
                          checked={metadataDraft.marketplaceReady}
                          onChange={(event) =>
                            updateMetadataDraft(
                              "marketplaceReady",
                              event.target.checked,
                            )
                          }
                        />
                        Marketplace ready
                      </label>

                      <div className="mt-5 flex justify-end">
                        <button
                          type="button"
                          onClick={() => void saveFormulaMetadata(formula)}
                          disabled={isMetadataSaving}
                          className="rounded-lg border border-white/20 bg-white px-4 py-2 text-xs font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isMetadataSaving ? "Saving…" : "Save metadata"}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <p className="mt-4 text-xs text-white/35">
                    {formula.steps.length} steps ·{" "}
                    {formula.failureConditions.length} failure conditions
                  </p>

                  <button
                    type="button"
                    onClick={() => void toggleFormulaHistory(formula.id)}
                    aria-expanded={isHistoryExpanded}
                    className="mt-4 flex w-full items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-left text-xs text-white/60 transition hover:border-white/20 hover:text-white"
                  >
                    <span>Learning history</span>
                    <span
                      className={`transition-transform duration-200 ${
                        isHistoryExpanded ? "rotate-180" : ""
                      }`}
                    >
                      ⌄
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isHistoryExpanded
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="mt-3 space-y-4 border-t border-white/8 pt-4">
                        {isHistoryLoading ? (
                          <p className="text-xs text-white/45">
                            Loading learning history…
                          </p>
                        ) : null}

                        {historyError ? (
                          <p className="text-xs text-red-200">
                            {historyError}
                          </p>
                        ) : null}

                        {history &&
                        history.reassessments.length === 0 &&
                        history.lineages.length === 0 ? (
                          <p className="text-xs text-white/45">
                            No learning history has been recorded for this
                            formula yet.
                          </p>
                        ) : null}

                        {history?.reassessments.length ? (
                          <div>
                            <h4 className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
                              Reassessments
                            </h4>
                            <div className="mt-3 space-y-3">
                              {history.reassessments.map((reassessment) => (
                                <div
                                  key={reassessment.id}
                                  className="rounded-lg border border-white/8 bg-white/[0.02] p-3"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm text-white/70">
                                      {reassessment.decision.replaceAll(
                                        "_",
                                        " ",
                                      )}
                                    </p>
                                    <p className="text-xs text-white/35">
                                      {formatDate(reassessment.assessedAt)}
                                    </p>
                                  </div>
                                  <p className="mt-2 text-xs text-white/45">
                                    Confidence{" "}
                                    {Math.round(
                                      reassessment.confidenceBefore * 100,
                                    )}
                                    % →{" "}
                                    {Math.round(
                                      reassessment.confidenceAfter * 100,
                                    )}
                                    %
                                  </p>
                                  {reassessment.reasons.length ? (
                                    <p className="mt-2 text-xs leading-5 text-white/50">
                                      {reassessment.reasons.join(" · ")}
                                    </p>
                                  ) : null}
                                  <p className="mt-2 text-[11px] text-white/30">
                                    {reassessment.evidence.length} evidence{" "}
                                    {reassessment.evidence.length === 1
                                      ? "record"
                                      : "records"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {history?.lineages.length ? (
                          <div>
                            <h4 className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">
                              Lineage
                            </h4>
                            <div className="mt-3 space-y-3">
                              {history.lineages.map((lineage) => (
                                <div
                                  key={lineage.id}
                                  className="rounded-lg border border-white/8 bg-white/[0.02] p-3"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm text-white/70">
                                      {lineage.kind}
                                      {lineage.source
                                        ? ` · ${lineage.source.replaceAll(
                                            "_",
                                            " ",
                                          )}`
                                        : ""}
                                    </p>
                                    <p className="text-xs text-white/35">
                                      {formatDate(lineage.createdAt)}
                                    </p>
                                  </div>
                                  {lineage.reasons.length ? (
                                    <p className="mt-2 text-xs leading-5 text-white/50">
                                      {lineage.reasons.join(" · ")}
                                    </p>
                                  ) : null}
                                  <p className="mt-2 text-[11px] text-white/30">
                                    {lineage.parentFormulaIds.length} parent{" "}
                                    {lineage.parentFormulaIds.length === 1
                                      ? "formula"
                                      : "formulas"}
                                    {lineage.childFormulaId
                                      ? " · child formula recorded"
                                      : ""}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {isEditing && draft ? (
                    <div className="mt-5 border-t border-white/10 pt-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-medium">
                            Derive a personal formula
                          </h4>
                          <p className="mt-1 text-xs text-white/45">
                            The original remains unchanged. Your edits create a
                            new private formula.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={cancelDerivation}
                          disabled={isDeriving}
                          className="text-xs text-white/45 transition hover:text-white disabled:opacity-40"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <label className="text-xs text-white/55">
                          Name
                          <input
                            value={draft.name}
                            onChange={(event) =>
                              updateDraft("name", event.target.value)
                            }
                            className={inputClassName}
                          />
                        </label>

                        <label className="text-xs text-white/55">
                          Best used for
                          <textarea
                            value={draft.bestUsedFor}
                            onChange={(event) =>
                              updateDraft("bestUsedFor", event.target.value)
                            }
                            rows={4}
                            className={inputClassName}
                            placeholder="One use per line"
                          />
                        </label>

                        <label className="text-xs text-white/55">
                          Room types
                          <textarea
                            value={draft.roomTypes}
                            onChange={(event) =>
                              updateDraft("roomTypes", event.target.value)
                            }
                            rows={4}
                            className={inputClassName}
                            placeholder="One room type per line"
                          />
                        </label>

                        <label className="text-xs text-white/55">
                          Objective types
                          <textarea
                            value={draft.objectiveTypes}
                            onChange={(event) =>
                              updateDraft("objectiveTypes", event.target.value)
                            }
                            rows={4}
                            className={inputClassName}
                            placeholder="One objective per line"
                          />
                        </label>

                        <label className="text-xs text-white/55">
                          Prerequisites
                          <textarea
                            value={draft.prerequisites}
                            onChange={(event) =>
                              updateDraft("prerequisites", event.target.value)
                            }
                            rows={5}
                            className={inputClassName}
                            placeholder="One prerequisite per line"
                          />
                        </label>

                        <label className="text-xs text-white/55">
                          Failure conditions
                          <textarea
                            value={draft.failureConditions}
                            onChange={(event) =>
                              updateDraft(
                                "failureConditions",
                                event.target.value,
                              )
                            }
                            rows={5}
                            className={inputClassName}
                            placeholder="One condition per line"
                          />
                        </label>
                      </div>

                      <label className="mt-5 block text-xs text-white/55">
                        Steps
                        <textarea
                          value={draft.steps}
                          onChange={(event) =>
                            updateDraft("steps", event.target.value)
                          }
                          rows={7}
                          className={inputClassName}
                          placeholder="signal type | action type | expected transition"
                        />
                        <span className="mt-2 block text-[11px] text-white/35">
                          One step per line: signal type | action type |
                          expected transition
                        </span>
                      </label>

                      <label className="mt-5 block text-xs text-white/55">
                        Reason for deriving
                        <textarea
                          value={draft.reasons}
                          onChange={(event) =>
                            updateDraft("reasons", event.target.value)
                          }
                          rows={3}
                          className={inputClassName}
                          placeholder="Optional. One reason per line."
                        />
                      </label>

                      {derivationError ? (
                        <p className="mt-4 text-sm text-red-200">
                          {derivationError}
                        </p>
                      ) : null}

                      <div className="mt-5 flex justify-end">
                        <button
                          type="button"
                          onClick={() => void deriveFormula(formula)}
                          disabled={isDeriving}
                          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeriving
                            ? "Creating derived formula…"
                            : "Create derived formula"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
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
