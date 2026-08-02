import type {
  OperationalAssetCommercialPolicy,
  OperationalFormula,
  OperationalFormulaOwnership,
  OperationalMarketplaceAuthority,
  OperationalScript,
} from "./types";

export type OperationalFormulaGovernanceDecision = {
  ownership: OperationalFormulaOwnership;
  publicationAuthority: OperationalMarketplaceAuthority;
  priceAuthority: OperationalMarketplaceAuthority;
};

function normalized(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export function resolveOperationalFormulaOwnership(
  formula: OperationalFormula,
): OperationalFormulaOwnership {
  if (formula.ownership) {
    return formula.ownership;
  }

  const legacyOwnerId = normalized(formula.ownerId);

  return legacyOwnerId
    ? { kind: "user", userId: legacyOwnerId }
    : { kind: "branesx" };
}

export function resolveOperationalFormulaGovernance(
  formula: OperationalFormula,
): OperationalFormulaGovernanceDecision {
  const ownership = resolveOperationalFormulaOwnership(formula);

  if (ownership.kind === "branesx") {
    return {
      ownership,
      publicationAuthority: "BRANESX",
      priceAuthority: "BRANESX",
    };
  }

  if (ownership.kind === "co_owned") {
    return {
      ownership,
      publicationAuthority: "user",
      priceAuthority: "BRANESX",
    };
  }

  return {
    ownership,
    publicationAuthority: "user",
    priceAuthority: "user",
  };
}

export function canUserControlFormulaPublication(
  formula: OperationalFormula,
  userId: string,
) {
  const governance = resolveOperationalFormulaGovernance(formula);
  const actor = normalized(userId);

  return (
    governance.publicationAuthority === "user" &&
    "userId" in governance.ownership &&
    normalized(governance.ownership.userId) === actor
  );
}

export function canUserSetFormulaPrice(
  formula: OperationalFormula,
  userId: string,
) {
  const governance = resolveOperationalFormulaGovernance(formula);
  const actor = normalized(userId);

  return (
    governance.priceAuthority === "user" &&
    governance.ownership.kind === "user" &&
    normalized(governance.ownership.userId) === actor
  );
}

export function canUserControlScriptCommerce(
  script: OperationalScript,
  userId: string,
) {
  return normalized(script.ownerId) === normalized(userId);
}

export function validateOperationalCommercialPolicy(
  policy: OperationalAssetCommercialPolicy,
) {
  if (policy.distribution !== "premium") {
    if (policy.priceCents !== undefined) {
      throw new Error("Only premium assets may declare a price");
    }

    return;
  }

  if (
    policy.priceCents === undefined ||
    !Number.isInteger(policy.priceCents) ||
    policy.priceCents < 0
  ) {
    throw new Error("Premium assets require a non-negative integer price");
  }
}
