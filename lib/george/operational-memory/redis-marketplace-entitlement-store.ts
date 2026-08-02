import "server-only";

import { getRedis } from "@/lib/storage/redis";

import type {
  MarketplaceEntitlementRecord,
  MarketplaceEntitlementStore,
} from "./marketplace-entitlement-service";

const KEY_PREFIX = "george:marketplace:entitlement:v1:";
const USER_INDEX_PREFIX = "george:marketplace:entitlement-user:v1:";

function normalize(value: unknown, label: string) {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (!normalized) {
    throw new Error(`Marketplace entitlement requires ${label}`);
  }

  return normalized;
}

function entitlementKey(userId: string, formulaId: string) {
  return `${KEY_PREFIX}${encodeURIComponent(userId)}:${encodeURIComponent(
    formulaId,
  )}`;
}

function userIndexKey(userId: string) {
  return `${USER_INDEX_PREFIX}${encodeURIComponent(userId)}`;
}

function parseRecord(raw: string | null): MarketplaceEntitlementRecord | null {
  if (!raw) return null;

  try {
    const record = JSON.parse(raw) as MarketplaceEntitlementRecord;

    if (
      !record ||
      typeof record !== "object" ||
      !record.id ||
      !record.userId ||
      !record.formulaId
    ) {
      return null;
    }

    return record;
  } catch {
    return null;
  }
}

function isActive(record: MarketplaceEntitlementRecord, at: number) {
  return (
    record.status === "active" &&
    (!record.expiresAt || record.expiresAt > at)
  );
}

export function createRedisMarketplaceEntitlementStore(): MarketplaceEntitlementStore {
  return {
    async getActive(userId, formulaId, at = Date.now()) {
      const normalizedUserId = normalize(userId, "a user id");
      const normalizedFormulaId = normalize(formulaId, "a formula id");
      const redis = getRedis();

      const record = parseRecord(
        await redis.get(
          entitlementKey(normalizedUserId, normalizedFormulaId),
        ),
      );

      return record && isActive(record, at) ? record : null;
    },

    async listByUser(userId, at = Date.now()) {
      const normalizedUserId = normalize(userId, "a user id");
      const redis = getRedis();
      const formulaIds = await redis.sMembers(
        userIndexKey(normalizedUserId),
      );

      if (formulaIds.length === 0) return [];

      const values = await Promise.all(
        formulaIds.map((formulaId) =>
          redis.get(entitlementKey(normalizedUserId, formulaId)),
        ),
      );

      return values
        .map(parseRecord)
        .filter(
          (record): record is MarketplaceEntitlementRecord =>
            record !== null && isActive(record, at),
        )
        .sort((left, right) => right.grantedAt - left.grantedAt);
    },

    async save(record) {
      const userId = normalize(record.userId, "a user id");
      const formulaId = normalize(record.formulaId, "a formula id");
      const redis = getRedis();

      await redis
        .multi()
        .set(
          entitlementKey(userId, formulaId),
          JSON.stringify({
            ...record,
            userId,
            formulaId,
          }),
        )
        .sAdd(userIndexKey(userId), formulaId)
        .exec();
    },

    async revoke(userId, formulaId, at = Date.now()) {
      const normalizedUserId = normalize(userId, "a user id");
      const normalizedFormulaId = normalize(formulaId, "a formula id");
      const redis = getRedis();
      const key = entitlementKey(
        normalizedUserId,
        normalizedFormulaId,
      );
      const existing = parseRecord(await redis.get(key));

      if (!existing) return;

      await redis.set(
        key,
        JSON.stringify({
          ...existing,
          status: "revoked",
          revokedAt: at,
        }),
      );
    },
  };
}
