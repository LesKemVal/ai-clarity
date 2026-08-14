import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

const store = read("lib/george/session/store.ts");
const normal = read("app/george/page.tsx");
const liveEntry = read("app/george/live-entry/LiveEntryClient.tsx");
const entryResolution = read("lib/george/live-entry/entry-resolution.ts");
const library = read("app/george/library/OperationalLibraryClient.tsx");
const preparation = read("lib/george/live-runtime/live-preparation-controller.ts");

assert.match(store, /preparationSessionId\?: string/);
assert.match(store, /surface\?: GeorgeSessionSurface/);
assert.match(store, /export type GeorgeSessionSurface/);
assert.match(store, /export function updateSessionLinkage/);
assert.match(store, /syncSessionToServer\(updatedSession\)/);

assert.match(normal, /updateSessionLinkage\(normalSessionId/);
assert.match(normal, /surface: "preparation"/);
assert.match(normal, /surface: "live"/);
assert.match(normal, /surface: "post_live"/);
assert.match(normal, /preparationSessionId: session\.preparationSessionId/);
assert.match(normal, /preLiveSessionIdRef\.current/);
assert.doesNotMatch(normal, /createSession\("live"/);

assert.match(preparation, /preparationSessionId: string/);
assert.match(preparation, /normalSessionId\?: string/);
assert.match(liveEntry, /validateLiveEntryPreparationReturn/);
assert.match(entryResolution, /if \(!candidate \|\| !preparationSessionId\) return null/);
assert.match(entryResolution, /activeNormalSessionId === normalSessionId/);
assert.match(entryResolution, /candidate\.relations\.normalSessionId === normalSessionId/);
assert.match(entryResolution, /storedPreparation\?\.preparationSessionId/);
assert.match(liveEntry, /georgeSessionId:/);
assert.match(liveEntry, /preparationSessionId:/);

assert.match(library, /GEORGE_LIVE_PREP_RETURN_STATE/);
assert.match(library, /getActiveSessionIdForMode\("normal"\)/);
assert.match(library, /updateSessionLinkage\(sessionId/);
assert.match(library, /georgeSessionId:/);

assert.match(normal, /const beginNextRepeatedConversation = \(\) =>/);
assert.match(normal, /beginNextLiveConversation\(/);
assert.match(normal, /const finishActiveBriefing = \(\) =>/);
assert.match(normal, /const askWithinActiveBriefing = \(\) =>/);

console.log("GEORGE session continuity qualification passed");
