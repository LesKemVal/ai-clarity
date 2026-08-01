import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const service = read(
  "lib/george/operational-memory/publication-lifecycle-service.ts",
);
const route = read(
  "app/api/george/operational-memory/formulas/[formulaId]/route.ts",
);
const owners = read(
  "lib/george/operational-memory/canonical-owners.ts",
);
const types = read("lib/george/operational-memory/types.ts");

for (const state of [
  "draft",
  "verification_requested",
  "verified",
  "published",
  "marketplace_listed",
  "retired",
  "withdrawn",
]) {
  assert.match(types, new RegExp(`'${state}'`));
}

for (const transition of [
  "request_verification",
  "mark_verified",
  "publish",
  "list_marketplace",
  "unlist_marketplace",
  "retire",
  "withdraw",
]) {
  assert.match(service, new RegExp(`"${transition}"`));
}

assert.match(
  service,
  /BRANESX verification is required before publication can be marked verified/,
);
assert.match(
  service,
  /Marketplace-ready metadata is required before listing/,
);
assert.match(
  service,
  /invalidateOperationalFormulaPublicationVerification/,
);
assert.match(
  route,
  /createOperationalFormulaPublicationLifecycleService/,
);
assert.match(
  route,
  /Publication transitions cannot be combined with metadata changes/,
);
assert.match(
  owners,
  /OperationalFormulaPublicationLifecycleService/,
);

console.log("GEORGE publication lifecycle qualification passed");
