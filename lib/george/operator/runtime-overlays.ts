export type GeorgeRuntimeOverlayId =
  | 'GRASSROOTS_ADOPTION'
  | 'CAMPUS_ADOPTION'
  | 'FIELD_ADOPTION'
  | 'ENTERPRISE_ALPHA'

export type GeorgeRuntimeOverlayTier = 'intelligent' | 'brilliant'

export type GeorgeLocationSignal = {
  city?: string
  region?: string
  country?: string
  latitude?: number
  longitude?: number
  source?: 'user_provided' | 'browser_permission' | 'profile' | 'unknown'
}

export type GeorgeRuntimeOverlay = {
  id: GeorgeRuntimeOverlayId
  code: string
  title: string
  tier: GeorgeRuntimeOverlayTier
  objective: string
  operationalGoal: string
  completionModel: string[]
  posture: {
    tone: string
    pacing: string
    pressure: string
    trustModel: string
  }
  prepDefaults: {
    room: string
    cadence: string
    language: string
    controlWords: string
  }
  runtimePriorities: string[]
  likelyUsers: string[]
  localOpportunityModel: string[]
  outreachFrame: string
  pressureModel: string[]
  userSignalPrompts: string[]
}

export const GEORGE_RUNTIME_OVERLAYS: Record<string, GeorgeRuntimeOverlay> = {
  'GEORGE-GRASSROOTS': {
    id: 'GRASSROOTS_ADOPTION',
    code: 'GEORGE-GRASSROOTS',
    title: 'Grassroots GEORGE Adoption',
    tier: 'brilliant',
    objective:
      'Help the user get GEORGE into the hands of people who can benefit from operational intelligence in real life.',
    operationalGoal:
      'Identify reachable high-need user groups, demonstrate GEORGE without hype, collect signal, and convert the strongest opportunities into adoption.',
    completionModel: [
      'Identify the user groups the operator can realistically reach first.',
      'Choose one high-probability adoption lane instead of chasing everyone.',
      'Create a simple demonstration path that proves usefulness quickly.',
      'Help the operator share/install GEORGE with people who need it most.',
      'Collect signal from reactions, use cases, objections, and actual retention.',
    ],
    posture: {
      tone: 'calm, useful, direct, non-salesy',
      pacing: 'balanced',
      pressure: 'trust before persuasion',
      trustModel: 'prove usefulness through a real moment, not a pitch',
    },
    prepDefaults: {
      room: 'Everyday Conversation',
      cadence: 'Balanced',
      language: 'English',
      controlWords: 'hmm, right, let me think, one second, show them',
    },
    runtimePriorities: [
      'discover user leverage',
      'match adoption path to user ability',
      'focus on high-need groups',
      'demonstrate utility quickly',
      'avoid hype and pressure',
      'capture useful signal',
    ],
    likelyUsers: [
      'job seekers',
      'students',
      'CDL drivers and trainees',
      'veterans',
      'workers under pressure',
      'small business owners',
      'creators',
      'people preparing for interviews or difficult conversations',
    ],
    localOpportunityModel: [
      'job centers and workforce offices',
      'community colleges and training programs',
      'truck stops, CDL schools, and logistics communities',
      'churches and neighborhood organizations',
      'libraries and community resource centers',
      'small businesses with customer-facing workers',
      'local creator, speaker, and entrepreneur groups',
    ],
    outreachFrame:
      'GEORGE helps people think, speak, prepare, and move better when real life requires it.',
    pressureModel: [
      'User may be nervous about sharing something new.',
      'Recipient may think this is just another chatbot.',
      'Best proof comes from one useful interaction, not explanation.',
      'Operator may have unique access through location, work, trust, or community.',
    ],
    userSignalPrompts: [
      'What city, workplace, school, or community can you realistically reach first?',
      'Who do you already know that faces pressure in conversations, work, school, or decisions?',
      'Where can you demonstrate GEORGE in less than two minutes?',
      'What group trusts you enough to actually try something you recommend?',
      'What reaction did you get when someone used GEORGE?',
    ],
  },

  'GEORGE-CAMPUS': {
    id: 'CAMPUS_ADOPTION',
    code: 'GEORGE-CAMPUS',
    title: 'Campus GEORGE Adoption',
    tier: 'intelligent',
    objective:
      'Help the user bring GEORGE to students, job seekers, speakers, and campus groups that need communication and execution support.',
    operationalGoal:
      'Find student use cases where GEORGE immediately improves preparation, interviews, public speaking, studying, or pressure handling.',
    completionModel: [
      'Pick the strongest campus user group.',
      'Create a clear first-use scenario.',
      'Demonstrate GEORGE around interviews, studying, debate, or presentations.',
      'Turn early adopters into visible proof.',
    ],
    posture: {
      tone: 'clear, encouraging, practical, not corny',
      pacing: 'sharp',
      pressure: 'confidence without performance theater',
      trustModel: 'show how GEORGE helps before asking anyone to believe in it',
    },
    prepDefaults: {
      room: 'Interview',
      cadence: 'Sharp',
      language: 'English',
      controlWords: 'hmm, right, let me think, line, shorter',
    },
    runtimePriorities: ['interview readiness', 'public speaking', 'study clarity', 'peer adoption', 'visible usefulness'],
    likelyUsers: ['students', 'internship seekers', 'debate clubs', 'student creators', 'public speakers', 'campus organizations'],
    localOpportunityModel: [
      'campus career centers',
      'community college student groups',
      'debate and public speaking groups',
      'internship and job-prep programs',
      'student creator communities',
      'libraries and tutoring centers',
    ],
    outreachFrame:
      'GEORGE helps students prepare, speak clearly, and handle pressure in moments that affect opportunity.',
    pressureModel: ['Students resist boring tools.', 'The first use must feel immediately useful.', 'Social proof matters.'],
    userSignalPrompts: [
      'Which campus or training program can you actually reach?',
      'Which campus group would understand GEORGE fastest?',
      'What pressure moment do students around you face most often?',
      'Can you demo GEORGE before an interview, presentation, or debate?',
    ],
  },

  'GEORGE-FIELD': {
    id: 'FIELD_ADOPTION',
    code: 'GEORGE-FIELD',
    title: 'Field GEORGE Adoption',
    tier: 'intelligent',
    objective:
      'Help the user introduce GEORGE to practical workers, operators, drivers, contractors, and people who need useful support without complexity.',
    operationalGoal:
      'Make GEORGE feel useful, simple, and trustworthy to people who do not want a complicated AI product.',
    completionModel: [
      'Identify a practical pressure point.',
      'Use plain language and short demonstrations.',
      'Avoid tech jargon.',
      'Show how GEORGE helps with work, decisions, conflict, or communication.',
    ],
    posture: {
      tone: 'plain, direct, respectful, useful',
      pacing: 'measured',
      pressure: 'low-friction trust',
      trustModel: 'make the tool useful before describing the technology',
    },
    prepDefaults: {
      room: 'Everyday Conversation',
      cadence: 'Measured',
      language: 'English',
      controlWords: 'hold on, shorter, say it plain, help me respond',
    },
    runtimePriorities: ['plain usefulness', 'low friction', 'workplace pressure', 'communication help', 'mobile install'],
    likelyUsers: ['drivers', 'warehouse workers', 'contractors', 'service workers', 'field operators', 'small crews'],
    localOpportunityModel: [
      'truck stops and CDL schools',
      'warehouses and logistics hubs',
      'contractor and service-worker networks',
      'union halls and workforce programs',
      'small crews and local operators',
      'adult education and licensing programs',
    ],
    outreachFrame:
      'GEORGE helps people handle decisions, conversations, and pressure without making technology the center of attention.',
    pressureModel: ['Users may distrust hype.', 'Short practical demonstrations matter.', 'Mobile install must be simple.'],
    userSignalPrompts: [
      'What kind of workers or operators are near you?',
      'Where do people around you need help thinking or speaking under pressure?',
      'Can you show GEORGE solving one practical problem in under two minutes?',
      'What words would make GEORGE sound useful instead of techy to this group?',
    ],
  },

  'GEORGE-ENTERPRISE-ALPHA': {
    id: 'ENTERPRISE_ALPHA',
    code: 'GEORGE-ENTERPRISE-ALPHA',
    title: 'Enterprise Alpha GEORGE Adoption',
    tier: 'brilliant',
    objective:
      'Help the user position GEORGE as operational runtime infrastructure for teams, organizations, and professional environments.',
    operationalGoal:
      'Identify where GEORGE can improve communication, preparation, execution, and continuity for organizations without sounding like a generic chatbot.',
    completionModel: [
      'Map the organization’s pressure points.',
      'Identify one high-value communication workflow.',
      'Demonstrate GEORGE through the workflow.',
      'Collect objections and integration requirements.',
      'Package the strongest use case for follow-up.',
    ],
    posture: {
      tone: 'executive, restrained, precise, useful',
      pacing: 'balanced',
      pressure: 'proof before scale',
      trustModel: 'show operational value inside one workflow before discussing infrastructure',
    },
    prepDefaults: {
      room: 'Meeting',
      cadence: 'Balanced',
      language: 'English',
      controlWords: 'one second, clarify, shorter, next move, hold',
    },
    runtimePriorities: ['workflow fit', 'continuity value', 'team usefulness', 'risk reduction', 'deployment readiness'],
    likelyUsers: ['founders', 'sales teams', 'managers', 'trainers', 'nonprofits', 'workforce programs', 'professional services'],
    localOpportunityModel: [
      'small business associations',
      'nonprofits and workforce organizations',
      'professional service firms',
      'sales teams and training groups',
      'founder and entrepreneur communities',
      'city, civic, and community organizations',
    ],
    outreachFrame:
      'GEORGE is an operational intelligence layer that helps people prepare, communicate, decide, and continue work with more consistency.',
    pressureModel: ['Organizations need proof.', 'Avoid broad claims.', 'One strong workflow beats a platform pitch.'],
    userSignalPrompts: [
      'What organization near you already has communication pressure or training needs?',
      'What organization already trusts you enough to hear this clearly?',
      'Where does communication failure cost time, money, or opportunity?',
      'What workflow can GEORGE improve immediately?',
    ],
  },
}

export function resolveRuntimeOverlay(code?: string | null) {
  if (!code) return null
  return GEORGE_RUNTIME_OVERLAYS[code.trim().toUpperCase()] || null
}

export function buildGeographicOpportunityPrompt(
  overlay: GeorgeRuntimeOverlay,
  location?: GeorgeLocationSignal | null
) {
  const place = [location?.city, location?.region, location?.country].filter(Boolean).join(', ')
  const locationLine = place
    ? `Known user location/context: ${place}.`
    : 'Location is unknown. Ask the user for their city, region, workplace, school, or reachable community before assuming local opportunities.'

  return [
    locationLine,
    `Overlay objective: ${overlay.objective}`,
    `Operational goal: ${overlay.operationalGoal}`,
    `Local opportunity model: ${overlay.localOpportunityModel.join('; ')}.`,
    'Use geography only to identify realistic adoption opportunities the user can actually reach. Do not stereotype the user or the community. Ask for confirmation when local context is uncertain.',
  ].join('\n')
}
