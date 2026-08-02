import type { SubscriberTier } from "@/lib/subscriptions/subscriber-store";

import type { OperationalFormula } from "./types";

export type MarketplaceEntitlementSource =
  | "purchase"
  | "founder"
  | "promotion"
  | "administrative";

export type MarketplaceEntitlementStatus = "active" | "revoked";

export type MarketplaceEntitlementRecord = {
  id: string;
  userId: string;
  formulaId: string;
  formulaVersion: number;
  source: MarketplaceEntitlementSource;
  status: MarketplaceEntitlementStatus;
  grantedAt: number;
  expiresAt?: number;
  revokedAt?: number;
  externalReference?: string;
};

export type MarketplaceEntitlementStore = {
  getActive(
    userId: string,
    formulaId: string,
    at?: number,
  ): Promise<MarketplaceEntitlementRecord | null>;
  listByUser(
    userId: string,
    at?: number,
  ): Promise<MarketplaceEntitlementRecord[]>;
  save(record: MarketplaceEntitlementRecord): Promise<void>;
  revoke(userId: string, formulaId: string, at?: number): Promise<void>;
};

export type MarketplaceAccessSource =
  | "owner"
  | "purchase"
  | "founder"
  | "promotion"
  | "administrative"
  | "tier"
  | "none";

export type MarketplaceAccessDecision = {
  allowed: boolean;
  source: MarketplaceAccessSource;
  reason: string;
  requiredTier?: SubscriberTier;
  currentTier: SubscriberTier;
  purchasable: boolean;
  entitlement?: MarketplaceEntitlementRecord;
};

export type MarketplaceEntitlementDecisionInput = {
  userId: string;
  currentTier: SubscriberTier;
  formula: OperationalFormula;
  at?: number;
};

export type MarketplaceEntitlementGrantInput = {
  id: string;
  userId: string;
  formula: OperationalFormula;
  source: MarketplaceEntitlementSource;
  grantedAt?: number;
  expiresAt?: number;
  externalReference?: string;
};

export type MarketplaceEntitlementService = {
  decide(
    input: MarketplaceEntitlementDecisionInput,
  ): Promise<MarketplaceAccessDecision>;
  grant(
    input: MarketplaceEntitlementGrantInput,
  ): Promise<MarketplaceEntitlementRecord>;
  revoke(userId: string, formulaId: string, at?: number): Promise<void>;
  listByUser(
    userId: string,
    at?: number,
  ): Promise<MarketplaceEntitlementRecord[]>;
};

const TIER_RANK: Record<SubscriberTier, number> = {
  smart: 0,
  intelligent: 1,
  brilliant: 2,
};

function normalized(value: string | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function tierAllows(
  currentTier: SubscriberTier,
  requiredTier: SubscriberTier,
) {
  return TIER_RANK[currentTier] >= TIER_RANK[requiredTier];
}

function marketplaceUnavailable(
  input: MarketplaceEntitlementDecisionInput,
): MarketplaceAccessDecision {
  return {
    allowed: false,
    source: "none",
    reason: "Formula is not currently available through the marketplace",
    currentTier: input.currentTier,
    purchasable: false,
  };
}

export function createMarketplaceEntitlementService(
  store: MarketplaceEntitlementStore,
): MarketplaceEntitlementService {
  return {
    async decide(input) {
      const userId = normalized(input.userId);
      const ownerId = normalized(input.formula.ownerId);
      const publication = input.formula.publication;

      if (userId && ownerId && userId === ownerId) {
        return {
          allowed: true,
          source: "owner",
          reason: "Formula creator retains access",
          currentTier: input.currentTier,
          purchasable: Boolean(publication?.purchasable),
        };
      }

      if (
        publication?.state !== "marketplace_listed" ||
        input.formula.verification?.verified !== true ||
        input.formula.status === "retired"
      ) {
        return marketplaceUnavailable(input);
      }

      const durableEntitlement = await store.getActive(
        userId,
        input.formula.id,
        input.at,
      );

      if (durableEntitlement) {
        return {
          allowed: true,
          source: durableEntitlement.source,
          reason: "Active durable marketplace entitlement",
          currentTier: input.currentTier,
          purchasable: Boolean(publication.purchasable),
          entitlement: durableEntitlement,
        };
      }

      if (publication.includedWithTier === true) {
        const requiredTier = publication.requiredTier ?? "smart";

        if (tierAllows(input.currentTier, requiredTier)) {
          return {
            allowed: true,
            source: "tier",
            reason: `Included with ${requiredTier} access`,
            requiredTier,
            currentTier: input.currentTier,
            purchasable: Boolean(publication.purchasable),
          };
        }

        return {
          allowed: false,
          source: "none",
          reason: `Requires ${requiredTier} access or a durable entitlement`,
          requiredTier,
          currentTier: input.currentTier,
          purchasable: Boolean(publication.purchasable),
        };
      }

      return {
        allowed: false,
        source: "none",
        reason: publication.purchasable
          ? "Purchase or grant required"
          : "No marketplace entitlement is available",
        currentTier: input.currentTier,
        purchasable: Boolean(publication.purchasable),
      };
    },

    async grant(input) {
      const userId = normalized(input.userId);
      const formulaId = String(input.formula.id ?? "").trim();

      if (!userId || !formulaId || !String(input.id ?? "").trim()) {
        throw new Error(
          "Marketplace entitlement requires an id, user id, and formula id",
        );
      }

      const record: MarketplaceEntitlementRecord = {
        id: String(input.id).trim(),
        userId,
        formulaId,
        formulaVersion: input.formula.version,
        source: input.source,
        status: "active",
        grantedAt: input.grantedAt ?? Date.now(),
        expiresAt: input.expiresAt,
        externalReference: input.externalReference,
      };

      await store.save(record);
      return record;
    },

    revoke(userId, formulaId, at) {
      return store.revoke(userId, formulaId, at);
    },

    listByUser(userId, at) {
      return store.listByUser(userId, at);
    },
  };
}
