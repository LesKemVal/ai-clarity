import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const types = fs.readFileSync(
  path.join(root, "lib/george/operational-memory/types.ts"),
  "utf8",
);
const policy = fs.readFileSync(
  path.join(
    root,
    "lib/george/operational-memory/marketplace-governance-policy.ts",
  ),
  "utf8",
);
const owners = fs.readFileSync(
  path.join(root, "lib/george/operational-memory/canonical-owners.ts"),
  "utf8",
);

assert.match(types, /OperationalFormulaOwnership/);
assert.match(types, /kind: "co_owned"/);
assert.match(types, /OperationalAssetCommercialPolicy/);
assert.match(policy, /publicationAuthority: "user"/);
assert.match(policy, /priceAuthority: "BRANESX"/);
assert.match(policy, /canUserControlScriptCommerce/);
assert.match(owners, /marketplace-governance-policy/);

console.log("GEORGE marketplace governance qualification: PASS");
