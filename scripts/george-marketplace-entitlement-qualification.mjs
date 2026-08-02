import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const service = read(
  "lib/george/operational-memory/marketplace-entitlement-service.ts",
);
const store = read(
  "lib/george/operational-memory/redis-marketplace-entitlement-store.ts",
);
const route = read(
  "app/api/george/marketplace/entitlements/[formulaId]/route.ts",
);
const types = read("lib/george/operational-memory/types.ts");
const owners = read(
  "lib/george/operational-memory/canonical-owners.ts",
);

assert.match(types, /OperationalFormulaMarketplaceTier/);
assert.match(types, /requiredTier\?: OperationalFormulaMarketplaceTier/);
assert.match(types, /includedWithTier\?: boolean/);
assert.match(types, /purchasable\?: boolean/);

assert.match(service, /createMarketplaceEntitlementService/);
assert.match(service, /source: "owner"/);
assert.match(service, /store\.getActive/);
assert.match(service, /includedWithTier === true/);
assert.match(service, /tierAllows/);
assert.match(service, /currentTier: SubscriberTier/);
assert.doesNotMatch(service, /stripe|checkout|paymentIntent/i);

assert.match(store, /createRedisMarketplaceEntitlementStore/);
assert.match(store, /status: "revoked"/);
assert.match(store, /expiresAt/);

assert.match(route, /readGeorgeSession/);
assert.match(route, /session\.tier/);
assert.match(route, /createMarketplaceEntitlementService/);
assert.doesNotMatch(route, /stripe|checkout|paymentIntent/i);

assert.match(owners, /MarketplaceEntitlementService/);
assert.match(owners, /createRedisMarketplaceEntitlementStore/);

console.log("GEORGE marketplace entitlement qualification passed");
