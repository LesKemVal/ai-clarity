import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const client = fs.readFileSync(
  path.join(root, "app/george/library/OperationalLibraryClient.tsx"),
  "utf8",
);

assert.match(client, /async function transitionFormulaPublication/);
assert.match(client, /publicationTransition: transition/);
assert.match(client, /function publicationActions/);
assert.match(client, /Request verification/);
assert.match(client, /Confirm BRANESX verification/);
assert.match(client, /List marketplace/);
assert.match(client, /Unlist/);
assert.match(client, /Retire/);
assert.match(client, /Withdraw/);
assert.match(client, /publicationState\(formula\)\.replaceAll/);
assert.doesNotMatch(
  client,
  /verification:\s*\{[\s\S]*verified:\s*true/,
  "Operational Library UI must not create BRANESX verification",
);

console.log("GEORGE publication lifecycle UI qualification passed");
