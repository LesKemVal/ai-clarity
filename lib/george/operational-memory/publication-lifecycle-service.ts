import type {
  OperationalFormula,
  OperationalFormulaPublication,
  OperationalFormulaPublicationState,
} from "./types";

export type OperationalFormulaPublicationTransition =
  | "request_verification"
  | "mark_verified"
  | "publish"
  | "list_marketplace"
  | "unlist_marketplace"
  | "retire"
  | "withdraw";

export class OperationalFormulaPublicationTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OperationalFormulaPublicationTransitionError";
  }
}

function currentState(
  publication: OperationalFormulaPublication | undefined,
): OperationalFormulaPublicationState {
  return publication?.state ?? "draft";
}

function requireState(
  state: OperationalFormulaPublicationState,
  allowed: readonly OperationalFormulaPublicationState[],
  transition: OperationalFormulaPublicationTransition,
) {
  if (!allowed.includes(state)) {
    throw new OperationalFormulaPublicationTransitionError(
      `Cannot ${transition.replaceAll("_", " ")} from ${state}`,
    );
  }
}

export function transitionOperationalFormulaPublication(
  formula: OperationalFormula,
  transition: OperationalFormulaPublicationTransition,
  at = Date.now(),
): OperationalFormula {
  const state = currentState(formula.publication);
  const publication: OperationalFormulaPublication = {
    ...formula.publication,
    state,
  };

  switch (transition) {
    case "request_verification":
      requireState(state, ["draft"], transition);
      publication.state = "verification_requested";
      publication.verificationRequestedAt = at;
      break;

    case "mark_verified":
      requireState(state, ["verification_requested"], transition);

      if (!formula.verification?.verified) {
        throw new OperationalFormulaPublicationTransitionError(
          "BRANESX verification is required before publication can be marked verified",
        );
      }

      publication.state = "verified";
      break;

    case "publish":
      requireState(state, ["verified"], transition);
      publication.state = "published";
      publication.publishedAt = at;
      break;

    case "list_marketplace":
      requireState(state, ["published"], transition);

      if (publication.marketplaceReady !== true) {
        throw new OperationalFormulaPublicationTransitionError(
          "Marketplace-ready metadata is required before listing",
        );
      }

      publication.state = "marketplace_listed";
      publication.listedAt = at;
      break;

    case "unlist_marketplace":
      requireState(state, ["marketplace_listed"], transition);
      publication.state = "published";
      publication.listedAt = undefined;
      break;

    case "retire":
      requireState(
        state,
        ["verified", "published", "marketplace_listed"],
        transition,
      );
      publication.state = "retired";
      publication.retiredAt = at;
      publication.listedAt = undefined;
      break;

    case "withdraw":
      requireState(
        state,
        [
          "draft",
          "verification_requested",
          "verified",
          "published",
          "marketplace_listed",
        ],
        transition,
      );
      publication.state = "withdrawn";
      publication.withdrawnAt = at;
      publication.listedAt = undefined;
      break;
  }

  return {
    ...formula,
    publication,
    version: formula.version + 1,
    updatedAt: at,
  };
}

export function invalidateOperationalFormulaPublicationVerification(
  formula: OperationalFormula,
  at = Date.now(),
): OperationalFormula {
  const state = currentState(formula.publication);

  if (
    !formula.verification?.verified &&
    state !== "verification_requested" &&
    state !== "verified" &&
    state !== "published" &&
    state !== "marketplace_listed"
  ) {
    return formula;
  }

  return {
    ...formula,
    verification: formula.verification
      ? {
          ...formula.verification,
          verified: false,
          verifiedAt: undefined,
          verificationVersion: undefined,
        }
      : undefined,
    publication: {
      ...formula.publication,
      state: "draft",
      verificationRequestedAt: undefined,
      publishedAt: undefined,
      listedAt: undefined,
      retiredAt: undefined,
      withdrawnAt: undefined,
    },
    updatedAt: at,
  };
}

export type OperationalFormulaPublicationLifecycleService = {
  transition(
    formula: OperationalFormula,
    transition: OperationalFormulaPublicationTransition,
    at?: number,
  ): OperationalFormula;
  invalidateVerification(
    formula: OperationalFormula,
    at?: number,
  ): OperationalFormula;
};

export function createOperationalFormulaPublicationLifecycleService(): OperationalFormulaPublicationLifecycleService {
  return {
    transition: transitionOperationalFormulaPublication,
    invalidateVerification:
      invalidateOperationalFormulaPublicationVerification,
  };
}
