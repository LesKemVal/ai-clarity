import fs from "node:fs";

const header = fs.readFileSync("components/BxPageHeader.tsx", "utf8");
const roleFirst = fs.readFileSync("components/home/HomeConversationTypeSurface.tsx", "utf8");
const liveEntry = fs.readFileSync("app/george/live-entry/LiveEntryClient.tsx", "utf8");

const checks = [
  ["shared explicit onBack first", header.includes("if (onBack) {")],
  ["shared browser history back", header.includes("window.history.length > 1") && header.includes("router.back()")],
  ["shared fallback href", header.includes("router.push(backHref || '/')")],
  ["no forced GEORGE redirect", !header.includes("if (backLabel === 'GEORGE')")],
  ["role-first owns transition back", roleFirst.includes("onBack={goBack}") && roleFirst.includes("function goBack()")],
  ["traditional question surface owns back", liveEntry.includes("onBack={goBackFromLiveEntryQuestionSurface}")],
  ["traditional mechanics owns back", liveEntry.includes("onBack={goBackFromMechanics}")],
];

for (const [label, passed] of checks) {
  if (!passed) {
    console.error(`FAIL: ${label}`);
    process.exit(1);
  }
  console.log(`PASS: ${label}`);
}

console.log("GEORGE back-navigation qualification passed");
