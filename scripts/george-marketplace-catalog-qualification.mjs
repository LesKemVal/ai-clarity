import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const service = read(
  "lib/george/operational-memory/marketplace-catalog-service.ts",
);
const route = read(
  "app/api/george/marketplace/catalog/route.ts",
);
const owners = read(
  "lib/george/operational-memory/canonical-owners.ts",
);

assert.match(service, /createMarketplaceCatalogService/);
assert.match(service, /formulaLibrary\.listAccessible/);
assert.match(service, /marketplace_listed/);
assert.match(service, /verification\?\.verified !== true/);
assert.match(service, /formula\.status === "retired"/);
assert.match(service, /query\.roomType/);
assert.match(service, /query\.objectiveType/);
assert.match(service, /query\.search/);
assert.doesNotMatch(service, /stripe|payment|entitlement/i);

assert.match(route, /createMarketplaceCatalogService/);
assert.match(route, /createRedisOperationalFormulaLibrary/);
assert.match(route, /readGeorgeSession/);
assert.match(route, /entries/);
assert.doesNotMatch(route, /checkout|payment|entitlement/i);

assert.match(owners, /MarketplaceCatalogService/);
assert.match(owners, /createMarketplaceCatalogService/);

console.log("GEORGE marketplace catalog qualification passed");
