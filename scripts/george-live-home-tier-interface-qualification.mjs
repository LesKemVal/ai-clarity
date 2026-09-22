import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}
const section = (source, start, end) => {
  const startIndex = source.indexOf(start)
  const endIndex = source.indexOf(end, startIndex + start.length)
  return startIndex >= 0 && endIndex > startIndex
    ? source.slice(startIndex, endIndex)
    : ''
}

const homepage = read('components/home/HomeConversationTypeSurface.tsx')
const liveHomeRoute = read('app/george/live-home/page.tsx')
const sessionRoute = read('app/api/session/route.ts')
const sessionAuthority = read('lib/security/george-session.ts')
const subscriberStore = read('lib/subscriptions/subscriber-store.ts')

const tiers = section(
  homepage,
  'const HOMEPAGE_INTELLIGENCE_TIERS = [',
  '] as const;',
)
const hydration = section(
  homepage,
  '  useEffect(() => {\n    let cancelled = false;',
  '  useEffect(\n    () => () => {',
)
const selection = section(
  homepage,
  '  function selectHomepageMissionTier(',
  '  const activeFormula = useMemo(() => {',
)
const renderedSurface = section(homepage, '  return (\n    <section', '\n  );\n}')
const actionRow = section(
  renderedSurface,
  '<div className="mt-4 flex min-w-0 items-center justify-between gap-3">',
  '{phase === "decision" && (',
)

assert(
  (tiers.match(/shortLabel:/g) || []).length === 3 &&
    tiers.includes('shortLabel: "S"') &&
    tiers.includes('shortLabel: "I"') &&
    tiers.includes('shortLabel: "B"'),
  'the tier row is not defined by exactly S, I, and B',
)
assert(
  tiers.includes('explanation: "Fast, focused support."') &&
    tiers.includes('explanation: "Deeper reasoning and adaptation."') &&
    tiers.includes('"Highest available reasoning for complex or consequential conversations."'),
  'one or more required tier explanations are missing',
)
assert(
  actionRow.includes('onPointerEnter={(event) => {') &&
    actionRow.includes('event.pointerType !== "touch"') &&
    actionRow.includes('onFocus={() => discloseMissionTier(tier.id)}') &&
    actionRow.includes('onPointerDown={(event) => {') &&
    selection.includes('const mobileTap = lastTierPointerTypeRef.current === "touch"') &&
    homepage.includes('setTimeout(() => {') &&
    homepage.includes('}, 2400);') &&
    actionRow.includes('role="tooltip"'),
  'hover, keyboard-focus, and temporary mobile-tap disclosures are not all present',
)
assert(
  actionRow.includes('type="button"') &&
    actionRow.includes('role="group"') &&
    actionRow.includes('aria-label="Intelligence level"') &&
    actionRow.includes('aria-label={`${tier.label} tier${') &&
    actionRow.includes('aria-describedby={`homepage-tier-explanation-${tier.id}`}') &&
    actionRow.includes('aria-pressed={selected}') &&
    actionRow.includes('focus-visible:ring-2') &&
    actionRow.includes('onKeyDown={() => {') &&
    actionRow.includes('h-11 w-11') &&
    actionRow.includes('h-8 w-8'),
  'semantic, keyboard, accessible-state, focus, or practical touch-target behavior is missing',
)
assert(
  actionRow.includes('border-[#7EA1FF]/72 bg-[#172347] text-white') &&
    actionRow.includes('border-white/[0.09] bg-white/[0.02] text-white/30 opacity-55'),
  'selected emphasis or inactive-tier recession is missing',
)
assert(
    selection.includes('homepageTierRank(tier) <= homepageTierRank(entitledMissionTier)') &&
    selection.includes('setMissionTier(tier)') &&
    selection.includes('window.localStorage.setItem(selectedTierStorageKeyRef.current, tier)') &&
    selection.indexOf('if (!available)') < selection.indexOf('setMissionTier(tier)') &&
    !selection.includes('setOptionalQuestion(') &&
    !selection.includes('setOptionalAnswer(') &&
    !selection.includes('clearPreparationSession('),
  'available-tier selection does not activate locally while preserving the briefing',
)
assert(
  selection.includes('if (!available)') &&
    selection.includes('window.location.assign(`/activate?tier=${tier}&intent=be-${tier}`)') &&
    selection.indexOf('if (!available)') < selection.indexOf('window.location.assign') &&
    !actionRow.includes('<a') &&
    !actionRow.includes('Upgrade'),
  'access review is not restricted to an intentional locked-tier selection',
)
assert(
  homepage.includes('useState<HomepageMissionTier | null>(\n    null,') &&
    hydration.includes('const grantedTier: HomepageMissionTier = isHomepageMissionTier(') &&
    hydration.includes('setEntitledMissionTier(grantedTier)') &&
    hydration.includes('setMissionTier(selectedTier)') &&
    hydration.includes('? persistedSelection\n            : grantedTier') &&
    !hydration.includes('setMissionTier("smart")'),
  'Brilliant authority can still visibly initialize or regress to Smart',
)
assert(
  hydration.includes('fetch("/api/session", { cache: "no-store" })') &&
    hydration.includes('if (!response.ok)') &&
    hydration.includes('const selectionStorageKey = homepageSelectedTierStorageKey(payload)') &&
    hydration.includes('window.localStorage.getItem(selectionStorageKey)') &&
    hydration.includes('homepageTierRank(persistedSelection) <= homepageTierRank(grantedTier)') &&
    hydration.includes('selectedTierStorageKeyRef.current = selectionStorageKey') &&
    hydration.includes('window.localStorage.setItem("george_tier", grantedTier)') &&
    (homepage.match(/setEntitledMissionTier\(/g) || []).length === 1 &&
    sessionRoute.includes('const session = await readGeorgeSession(req)') &&
    sessionRoute.includes('tier: session.tier') &&
    sessionAuthority.includes('getSubscriberByEmail(parsed.email)') &&
    sessionAuthority.includes('subscriber.currentTier !== parsed.tier') &&
    subscriberStore.includes("export type SubscriberTier = 'smart' | 'intelligent' | 'brilliant'"),
  'the homepage can fabricate tier entitlement instead of consuming session/subscriber authority',
)
assert(
  !homepage.includes('Keep Smart, or review Brilliant access. Your briefing will remain here.') &&
    !homepage.includes('Your briefing will remain here.') &&
    !homepage.includes('requestedMissionTier') &&
    !homepage.includes('homepageTierLabel(') &&
    !actionRow.includes('role="status"'),
  'the redundant persistent Keep Smart / Upgrade panel or its panel-only state remains',
)
assert(
  actionRow.indexOf('HOMEPAGE_INTELLIGENCE_TIERS.map') >= 0 &&
    actionRow.indexOf('optionalAnswer.trim()') >
      actionRow.indexOf('HOMEPAGE_INTELLIGENCE_TIERS.map') &&
    actionRow.includes('{optionalAnswer.trim() ? "Submit" : "Skip"}') &&
    actionRow.includes('flex min-w-0 items-center justify-between gap-3') &&
    actionRow.includes('relative flex shrink-0 items-center gap-1') &&
    actionRow.includes('w-[min(18rem,calc(100vw-3rem))]'),
  'the single SKIP/SUBMIT control, tier controls, or mobile overflow protections left the approved action row',
)
assert(
  liveHomeRoute.includes('<HomeConversationTypeSurface />') &&
    !liveHomeRoute.includes('TierAccessPanel') &&
    !liveHomeRoute.includes('Upgrade') &&
    (homepage.match(/\/activate\?tier=/g) || []).length === 1,
  'a new route or persistent access surface was introduced',
)

console.log('GEORGE live-home LH-3A3k3 tier interface qualification: PASS')
