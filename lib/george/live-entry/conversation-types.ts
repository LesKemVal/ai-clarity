export type ConversationTypeGroup = "work" | "personal" | "speaking";

export type ConversationType = {
  id: string;
  title: string;
  group: ConversationTypeGroup;
  description: string;
  initialization: string;
};

export const CONVERSATION_TYPE_GROUP_LABELS: Record<
  ConversationTypeGroup,
  string
> = {
  work: "Work and professional",
  personal: "Personal and important",
  speaking: "Speaking, teaching, and content",
};

export const CONVERSATION_TYPES: readonly ConversationType[] = Object.freeze([
  {
    id: "make-my-case",
    title: "Make My Case",
    group: "work",
    description:
      "Build a clear, persuasive position supported by the right facts, proof, and framing, into your conversation — in your voice.",
    initialization:
      "GEORGE will help shape the case around the people involved, what matters to them, and the decision you need.",
  },
  {
    id: "prep-my-interview",
    title: "Prep My Interview",
    group: "work",
    description:
      "Prepare for the questions, proof, pressure, and decision behind an important interview — in your voice.",
    initialization:
      "GEORGE will prepare the strongest evidence, likely questions, difficult moments, and the outcome you are pursuing.",
  },
  {
    id: "negotiate-a-sale",
    title: "Negotiate a Sale",
    group: "work",
    description:
      "Understand the buyer, protect value, answer resistance, and move toward a concrete commitment — in your voice.",
    initialization:
      "GEORGE will prepare your value, proof, boundaries, objections, leverage, and next-best outcome.",
  },
  {
    id: "lead-my-meeting",
    title: "Lead My Meeting",
    group: "work",
    description:
      "Guide a meeting toward clarity, alignment, decisions, ownership, and useful next actions — in your voice.",
    initialization:
      "GEORGE will prepare the participants, decisions, pressure points, agenda, and actions the meeting must produce.",
  },
  {
    id: "present-my-proposal",
    title: "Present My Proposal",
    group: "work",
    description:
      "Present an idea, plan, offer, or recommendation so the audience can understand and act on it — in your voice.",
    initialization:
      "GEORGE will prepare the proposal around the audience, evidence, objections, decision, and requested action.",
  },
  {
    id: "handle-tough-questions",
    title: "Handle Tough Questions",
    group: "work",
    description:
      "Prepare clear, credible responses for pressure, objections, skepticism, and unfamiliar questions — in your voice.",
    initialization:
      "GEORGE will identify what may be tested, the proof available, the risks, and the strongest response strategy.",
  },
  {
    id: "ask-for-a-raise",
    title: "Ask for a Raise",
    group: "work",
    description:
      "Prepare the evidence, positioning, timing, and language for a compensation conversation — in your voice.",
    initialization:
      "GEORGE will help organize your value, results, request, alternatives, and response to resistance.",
  },
  {
    id: "set-professional-appointment",
    title: "Set a Professional Appointment",
    group: "work",
    description:
      "Prepare a clear request, establish relevance, and secure a professional appointment — in your voice.",
    initialization:
      "GEORGE will help identify the person, purpose, value, timing, likely resistance, and strongest appointment request.",
  },
  {
    id: "sell-anything",
    title: "Sell Anything",
    group: "work",
    description:
      "Build a persuasive sales conversation around value, proof, need, resistance, and commitment — in your voice.",
    initialization:
      "GEORGE will help define the offer, buyer, value, proof, objections, leverage, and next commitment.",
  },
  {
    id: "make-a-civil-case",
    title: "Make a Civil Case",
    group: "work",
    description:
      "Build a clear, organized civil argument from the available facts, case law, and public information — in your voice.",
    initialization:
      "GEORGE provides general legal information and communication support, not legal advice or legal representation. GEORGE will help organize the facts, applicable law, public information, arguments, weaknesses, and requested outcome.",
  },
  {
    id: "make-a-criminal-case",
    title: "Make a Criminal Case",
    group: "work",
    description:
      "Organize facts, evidence, applicable law, and arguments to explain or analyze a criminal matter — in your voice.",
    initialization:
      "GEORGE provides general legal information and communication support, not legal advice or legal representation. GEORGE will help organize the facts, evidence, applicable law, arguments, weaknesses, and intended explanation.",
  },
  {
    id: "hold-a-political-debate",
    title: "Hold a Political Debate",
    group: "speaking",
    description:
      "Build and defend a political position using evidence, framing, rebuttal, and disciplined reasoning — in your voice.",
    initialization:
      "GEORGE will prepare the position, audience, evidence, likely opposition, rebuttals, vulnerabilities, and desired conclusion.",
  },
  {
    id: "articulate-thermonuclear-physics",
    title: "Articulate Thermonuclear Physics",
    group: "speaking",
    description:
      "Present thermonuclear physics with technical accuracy, logical structure, and audience-appropriate depth — in your voice.",
    initialization:
      "GEORGE will shape the explanation around the audience, scientific depth, required concepts, examples, and intended understanding.",
  },
  {
    id: "explain-basketball-theory",
    title: "Explain Basketball Theory",
    group: "speaking",
    description:
      "Explain basketball systems, spacing, movement, decision-making, matchups, and strategic principles — in your voice.",
    initialization:
      "GEORGE will shape the explanation around the audience, level of play, tactical concepts, examples, and intended understanding.",
  },
  {
    id: "explain-history-of-any-sport",
    title: "Explain the History of Any Sport",
    group: "speaking",
    description:
      "Explain how a sport developed through its people, rules, institutions, culture, and defining moments — in your voice.",
    initialization:
      "GEORGE will identify the sport, period, audience, major developments, central figures, cultural context, and intended depth.",
  },
  {
    id: "explain-pop-culture",
    title: "Explain Pop Culture",
    group: "speaking",
    description:
      "Explain a pop-culture subject through its origins, meaning, influence, audience, and broader context — in your voice.",
    initialization:
      "GEORGE will identify the subject, period, audience, cultural context, major influences, competing interpretations, and intended depth.",
  },
  {
    id: "other-work",
    title: "Other",
    group: "work",
    description:
      "Describe another work or professional conversation you want GEORGE to help you prepare — in your voice.",
    initialization:
      "GEORGE will identify the specific conversation and shape the briefing around what you need to accomplish.",
  },
  {
    id: "have-a-difficult-conversation",
    title: "Have a Difficult Conversation",
    group: "personal",
    description:
      "Prepare careful language for tension, accountability, boundaries, repair, or an important truth — in your voice.",
    initialization:
      "GEORGE will help protect the relationship, the facts, your boundaries, and the result you need from the conversation.",
  },
  {
    id: "resolve-a-conflict",
    title: "Resolve a Conflict",
    group: "personal",
    description:
      "Clarify what is actually disputed and prepare a path toward understanding or workable resolution — in your voice.",
    initialization:
      "GEORGE will identify the disagreement, interests, pressure, misunderstandings, and possible resolution paths.",
  },
  {
    id: "set-a-boundary",
    title: "Set a Boundary",
    group: "personal",
    description:
      "State what must change while remaining clear, calm, and prepared for the other person’s response — in your voice.",
    initialization:
      "GEORGE will help define the boundary, reason, consequence, tone, and response to likely resistance.",
  },
  {
    id: "ask-for-something-important",
    title: "Ask for Something Important",
    group: "personal",
    description:
      "Prepare a meaningful request so the other person understands what you need and why it matters — in your voice.",
    initialization:
      "GEORGE will help clarify the request, relationship, reason, likely concerns, and acceptable alternatives.",
  },
  {
    id: "other-personal",
    title: "Other",
    group: "personal",
    description:
      "Describe another personal conversation you want GEORGE to help you prepare — in your voice.",
    initialization:
      "GEORGE will identify the specific situation and shape the briefing around the people, pressure, and objective.",
  },
  {
    id: "deliver-a-keynote",
    title: "Deliver a Keynote",
    group: "speaking",
    description:
      "Build and deliver a memorable message with a clear arc, proof, stories, and deliberate close — in your voice.",
    initialization:
      "GEORGE will shape the keynote around the occasion, audience, message, timing, emotional arc, and takeaway.",
  },
  {
    id: "create-a-broadcast-script",
    title: "Create a Broadcast Script",
    group: "speaking",
    description:
      "Build a structured script for a recorded or live broadcast that can adapt during delivery — in your voice.",
    initialization:
      "GEORGE will prepare the script around the audience, topic, required points, timing, format, and call to action.",
  },
  {
    id: "record-a-podcast",
    title: "Record a Podcast",
    group: "speaking",
    description:
      "Prepare a structured spoken experience that remains natural, useful, and easy to follow — in your voice.",
    initialization:
      "GEORGE will shape the episode around the listener, format, topic, stories, transitions, timing, and conclusion.",
  },
  {
    id: "teach-a-lesson",
    title: "Teach a Lesson",
    group: "speaking",
    description:
      "Turn knowledge into a clear learning sequence with explanation, examples, and understanding checks — in your voice.",
    initialization:
      "GEORGE will adapt the lesson to the learners, starting familiarity, target capability, time, and examples.",
  },
  {
    id: "lead-a-workshop",
    title: "Lead a Workshop",
    group: "speaking",
    description:
      "Guide participants through explanation, discussion, exercises, decisions, and useful outputs — in your voice.",
    initialization:
      "GEORGE will prepare the workshop around the participants, objective, timing, activities, decisions, and deliverables.",
  },
  {
    id: "other-speaking",
    title: "Other",
    group: "speaking",
    description:
      "Describe another speaking, teaching, or content task you want GEORGE to help you prepare — in your voice.",
    initialization:
      "GEORGE will identify the specific communication task and shape the briefing around the audience and objective.",
  },

  {
    id: "set-appointment",
    title: "Set Appointment",
    group: "work",
    description:
      "Build interest, trust, relevance, and commitment, into your conversation — in your voice.",
    initialization:
      "GEORGE will help establish relevance, earn attention, handle resistance, and secure a clear time and next step.",
  },
  {
    id: "secure-financing",
    title: "Secure Financing",
    group: "work",
    description:
      "Build credibility, financial confidence, preparation, and lender trust, into your conversation — in your voice.",
    initialization:
      "GEORGE will help organize the purpose, numbers, repayment case, risks, supporting proof, and financing request.",
  },
  {
    id: "discuss-a-loan",
    title: "Discuss a Loan",
    group: "work",
    description:
      "Build clarity, readiness, credibility, and informed questions, into your conversation — in your voice.",
    initialization:
      "GEORGE will help clarify the loan purpose, terms, affordability, documentation, concerns, and next steps.",
  },
  {
    id: "handle-objections",
    title: "Handle Objections",
    group: "work",
    description:
      "Build understanding, credibility, confidence, and forward movement, into your conversation — in your voice.",
    initialization:
      "GEORGE will help identify the real objection, respond with proof, preserve trust, and move toward a decision.",
  },
  {
    id: "discovery-call",
    title: "Discovery Call",
    group: "work",
    description:
      "Build understanding, qualification, trust, and opportunity, into your conversation — in your voice.",
    initialization:
      "GEORGE will help uncover needs, priorities, constraints, decision authority, urgency, and the right next step.",
  },
  {
    id: "close-the-sale",
    title: "Close the Sale",
    group: "work",
    description:
      "Build value, confidence, urgency, and commitment, into your conversation — in your voice.",
    initialization:
      "GEORGE will help confirm value, resolve remaining resistance, protect the relationship, and ask for commitment.",
  },
  {
    id: "client-follow-up",
    title: "Client Follow-Up",
    group: "work",
    description:
      "Build continuity, relevance, trust, and clear next steps, into your conversation — in your voice.",
    initialization:
      "GEORGE will help reconnect the prior conversation, restore momentum, clarify value, and secure the next action.",
  },
  {
    id: "request-a-promotion",
    title: "Request a Promotion",
    group: "work",
    description:
      "Build evidence, leadership, value, and executive confidence, into your conversation — in your voice.",
    initialization:
      "GEORGE will help organize results, expanded responsibility, leadership proof, readiness, and the promotion request.",
  },
  {
    id: "salary-negotiation",
    title: "Salary Negotiation",
    group: "work",
    description:
      "Build leverage, evidence, confidence, and persuasive value, into your conversation — in your voice.",
    initialization:
      "GEORGE will help establish market value, performance proof, priorities, boundaries, alternatives, and the ask.",
  },
  {
    id: "networking-conversation",
    title: "Networking Conversation",
    group: "work",
    description:
      "Build authentic connection, credibility, relevance, and opportunity, into your conversation — in your voice.",
    initialization:
      "GEORGE will help shape the introduction, common ground, useful exchange, memorable value, and follow-up.",
  },
  {
    id: "executive-presentation",
    title: "Executive Presentation",
    group: "speaking",
    description:
      "Build authority, clarity, evidence, and executive confidence, into your conversation — in your voice.",
    initialization:
      "GEORGE will help organize the decision, essential evidence, risks, recommendation, and concise executive framing.",
  },
  {
    id: "budget-discussion",
    title: "Budget Discussion",
    group: "work",
    description:
      "Build transparency, priorities, tradeoffs, and informed decisions, into your conversation — in your voice.",
    initialization:
      "GEORGE will help organize the numbers, constraints, priorities, alternatives, risks, and requested decision.",
  },
  {
    id: "vendor-negotiation",
    title: "Vendor Negotiation",
    group: "work",
    description:
      "Build leverage, clarity, value, and durable agreement, into your conversation — in your voice.",
    initialization:
      "GEORGE will help define requirements, pricing leverage, service expectations, boundaries, concessions, and alternatives.",
  },
  {
    id: "partnership-discussion",
    title: "Partnership Discussion",
    group: "work",
    description:
      "Build alignment, mutual value, trust, and shared commitment, into your conversation — in your voice.",
    initialization:
      "GEORGE will help clarify contribution, incentives, responsibilities, risks, expectations, and the path forward.",
  },
  {
    id: "retain-a-client",
    title: "Retain a Client",
    group: "work",
    description:
      "Build understanding, confidence, renewed value, and long-term commitment, into your conversation — in your voice.",
    initialization:
      "GEORGE will help identify the cause of dissatisfaction, restore trust, demonstrate value, and propose a credible recovery.",
  },
  {
    id: "resolve-customer-complaint",
    title: "Resolve Customer Complaint",
    group: "work",
    description:
      "Build understanding, accountability, resolution, and customer trust, into your conversation — in your voice.",
    initialization:
      "GEORGE will help uncover the failure, acknowledge impact, explain responsibly, offer resolution, and preserve trust.",
  },
  {
    id: "ask-for-referral",
    title: "Ask for a Referral",
    group: "work",
    description:
      "Build trust, relevance, confidence, and a natural request, into your conversation — in your voice.",
    initialization:
      "GEORGE will help establish earned value, identify the right introduction, make the request, and simplify the next step.",
  },
  {
    id: "real-estate-offer",
    title: "Make a Real Estate Offer",
    group: "work",
    description:
      "Build preparation, leverage, confidence, and a credible offer, into your conversation — in your voice.",
    initialization:
      "GEORGE will help organize value, market evidence, terms, contingencies, boundaries, and negotiation strategy.",
  },
  {
    id: "insurance-claim",
    title: "Discuss an Insurance Claim",
    group: "work",
    description:
      "Build documentation, clarity, persistence, and a credible resolution case, into your conversation — in your voice.",
    initialization:
      "GEORGE will help organize the event, policy basis, evidence, damages, prior communication, and requested resolution.",
  },
  {
    id: "contract-discussion",
    title: "Discuss a Contract",
    group: "work",
    description:
      "Build clarity, informed questions, boundaries, and mutual understanding, into your conversation — in your voice.",
    initialization:
      "GEORGE will help identify obligations, unclear terms, risks, priorities, proposed changes, and unresolved questions.",
  },
  {
    id: "performance-review",
    title: "Performance Review",
    group: "work",
    description:
      "Build evidence, reflection, confidence, and forward direction, into your conversation — in your voice.",
    initialization:
      "GEORGE will help organize results, lessons, concerns, goals, growth opportunities, and the next performance period.",
  },
  {
    id: "ask-for-feedback",
    title: "Ask for Feedback",
    group: "work",
    description:
      "Build openness, specificity, trust, and useful learning, into your conversation — in your voice.",
    initialization:
      "GEORGE will help ask for clear observations, examples, priorities, and practical ways to improve.",
  },
  {
    id: "give-feedback",
    title: "Give Feedback",
    group: "work",
    description:
      "Build clarity, fairness, evidence, and improvement, into your conversation — in your voice.",
    initialization:
      "GEORGE will help separate facts from assumptions, explain impact, preserve dignity, and define the needed change.",
  },
  {
    id: "address-underperformance",
    title: "Address Underperformance",
    group: "work",
    description:
      "Build accountability, clarity, support, and measurable expectations, into your conversation — in your voice.",
    initialization:
      "GEORGE will help identify the gap, evidence, expectations, available support, consequences, and follow-up.",
  },
  {
    id: "manage-up",
    title: "Manage Up",
    group: "work",
    description:
      "Build alignment, credibility, foresight, and executive confidence, into your conversation — in your voice.",
    initialization:
      "GEORGE will help frame priorities, risks, decisions, recommendations, and what leadership needs to know.",
  },
  {
    id: "delegate-work",
    title: "Delegate Work",
    group: "work",
    description:
      "Build ownership, clarity, authority, and successful execution, into your conversation — in your voice.",
    initialization:
      "GEORGE will help define the outcome, boundaries, resources, checkpoints, and decision authority.",
  },
  {
    id: "align-on-priorities",
    title: "Align on Priorities",
    group: "work",
    description:
      "Build focus, tradeoff clarity, ownership, and coordinated action, into your conversation — in your voice.",
    initialization:
      "GEORGE will help compare urgency, impact, dependencies, constraints, and the order of execution.",
  },
  {
    id: "project-kickoff",
    title: "Project Kickoff",
    group: "work",
    description:
      "Build shared purpose, roles, expectations, and momentum, into your conversation — in your voice.",
    initialization:
      "GEORGE will help prepare the objective, scope, responsibilities, risks, milestones, and next actions.",
  },
  {
    id: "deliver-a-status-update",
    title: "Deliver a Status Update",
    group: "work",
    description:
      "Build concise truth, context, confidence, and decision value, into your conversation — in your voice.",
    initialization:
      "GEORGE will help organize progress, evidence, blockers, risks, decisions, and immediate next steps.",
  },
  {
    id: "crisis-communication",
    title: "Crisis Communication",
    group: "work",
    description:
      "Build calm, factual clarity, responsibility, and coordinated action, into your conversation — in your voice.",
    initialization:
      "GEORGE will help establish what is known, what is uncertain, who is affected, what is being done, and what happens next.",
  },
  {
    id: "investor-pitch",
    title: "Investor Pitch",
    group: "work",
    description:
      "Build conviction, evidence, opportunity, and investor confidence, into your conversation — in your voice.",
    initialization:
      "GEORGE will help organize the problem, market, solution, traction, economics, team, risks, and investment request.",
  },
  {
    id: "fundraising-meeting",
    title: "Fundraising Meeting",
    group: "work",
    description:
      "Build trust, financial credibility, mission alignment, and commitment, into your conversation — in your voice.",
    initialization:
      "GEORGE will help prepare the purpose, use of funds, proof, urgency, stakeholder value, and requested commitment.",
  },
  {
    id: "contract-renewal",
    title: "Contract Renewal",
    group: "work",
    description:
      "Build retained value, proof, relationship strength, and renewed commitment, into your conversation — in your voice.",
    initialization:
      "GEORGE will help demonstrate outcomes, resolve concerns, protect value, and secure the next agreement.",
  },
  {
    id: "price-increase",
    title: "Communicate a Price Increase",
    group: "work",
    description:
      "Build value clarity, fairness, confidence, and customer retention, into your conversation — in your voice.",
    initialization:
      "GEORGE will help explain the change, reinforce value, anticipate resistance, and preserve the relationship.",
  },
  {
    id: "collections-call",
    title: "Collections Call",
    group: "work",
    description:
      "Build firmness, respect, clarity, and a workable payment commitment, into your conversation — in your voice.",
    initialization:
      "GEORGE will help establish the balance, understand constraints, protect boundaries, and secure a concrete next step.",
  },
  {
    id: "customer-success-review",
    title: "Customer Success Review",
    group: "work",
    description:
      "Build evidence, partnership, retained value, and expansion opportunity, into your conversation — in your voice.",
    initialization:
      "GEORGE will help review outcomes, usage, obstacles, priorities, satisfaction, and the next success plan.",
  },
  {
    id: "product-demo",
    title: "Product Demo",
    group: "work",
    description:
      "Build relevance, understanding, proof, and buying confidence, into your conversation — in your voice.",
    initialization:
      "GEORGE will help connect capabilities to the audience's needs, demonstrate value, answer questions, and define next steps.",
  },
  {
    id: "press-interview",
    title: "Press Interview",
    group: "speaking",
    description:
      "Build message discipline, credibility, clarity, and controlled public understanding, into your conversation — in your voice.",
    initialization:
      "GEORGE will help prepare core messages, difficult questions, evidence, boundaries, bridges, and quotable language.",
  },
  {
    id: "media-interview",
    title: "Media Interview",
    group: "speaking",
    description:
      "Build composure, message control, public trust, and useful clarity, into your conversation — in your voice.",
    initialization:
      "GEORGE will help anticipate framing, prepare concise answers, avoid speculation, and return to the central message.",
  },
  {
    id: "public-comment",
    title: "Deliver Public Comment",
    group: "speaking",
    description:
      "Build relevance, brevity, evidence, and civic persuasion, into your conversation — in your voice.",
    initialization:
      "GEORGE will help structure the issue, personal stake, proof, requested action, and closing statement.",
  },
  {
    id: "panel-discussion",
    title: "Panel Discussion",
    group: "speaking",
    description:
      "Build presence, concise insight, useful contrast, and memorable contribution, into your conversation — in your voice.",
    initialization:
      "GEORGE will help prepare positions, examples, transitions, disagreements, audience value, and closing thoughts.",
  },
  {
    id: "moderate-a-discussion",
    title: "Moderate a Discussion",
    group: "speaking",
    description:
      "Build structure, fairness, momentum, and productive participation, into your conversation — in your voice.",
    initialization:
      "GEORGE will help sequence questions, balance voices, manage time, redirect tension, and produce useful conclusions.",
  },
  {
    id: "parent-teacher-conference",
    title: "Parent-Teacher Conference",
    group: "personal",
    description:
      "Build shared understanding, advocacy, evidence, and a practical support plan, into your conversation — in your voice.",
    initialization:
      "GEORGE will help clarify observations, concerns, strengths, responsibilities, resources, and follow-up.",
  },
  {
    id: "therapy-conversation",
    title: "Therapy Conversation",
    group: "personal",
    description:
      "Build honesty, reflection, emotional clarity, and useful therapeutic focus, into your conversation — in your voice.",
    initialization:
      "GEORGE will help organize what happened, what you felt, recurring patterns, questions, and what you want help understanding.",
  },
  {
    id: "family-decision",
    title: "Family Decision",
    group: "personal",
    description:
      "Build shared facts, fairness, priorities, and a workable family decision, into your conversation — in your voice.",
    initialization:
      "GEORGE will help identify the decision, affected people, concerns, constraints, options, and responsibilities.",
  },
  {
    id: "apologize-and-repair",
    title: "Apologize and Repair",
    group: "personal",
    description:
      "Build responsibility, sincerity, understanding, and relationship repair, into your conversation — in your voice.",
    initialization:
      "GEORGE will help acknowledge the action, explain without excusing, understand impact, make amends, and rebuild trust.",
  },
  {
    id: "end-a-relationship",
    title: "End a Relationship",
    group: "personal",
    description:
      "Build honesty, care, boundaries, and emotional safety, into your conversation — in your voice.",
    initialization:
      "GEORGE will help state the decision, explain what is appropriate, protect boundaries, and prepare for likely responses.",
  },
  {
    id: "co-parenting-conversation",
    title: "Co-Parenting Conversation",
    group: "personal",
    description:
      "Build child-centered clarity, boundaries, coordination, and reduced conflict, into your conversation — in your voice.",
    initialization:
      "GEORGE will help separate parenting needs from personal conflict, clarify responsibilities, and define practical agreements.",
  },
  {
    id: "estate-planning-discussion",
    title: "Estate Planning Discussion",
    group: "personal",
    description:
      "Build clarity, dignity, family understanding, and responsible preparation, into your conversation — in your voice.",
    initialization:
      "GEORGE will help organize wishes, roles, assets, concerns, questions, and professional follow-up.",
  },
  {
    id: "insurance-appeal",
    title: "Insurance Appeal",
    group: "personal",
    description:
      "Build factual support, policy clarity, persistence, and a specific requested resolution, into your conversation — in your voice.",
    initialization:
      "GEORGE will help organize the decision, documentation, policy language, impact, questions, and appeal request.",
  },
  {
    id: "housing-negotiation",
    title: "Housing Negotiation",
    group: "personal",
    description:
      "Build evidence, fairness, boundaries, and a workable housing agreement, into your conversation — in your voice.",
    initialization:
      "GEORGE will help prepare the issue, lease or ownership facts, costs, alternatives, responsibilities, and requested terms.",
  },
]);

export function getConversationType(id: string | null | undefined) {
  return (
    CONVERSATION_TYPES.find((conversationType) => conversationType.id === id) ||
    null
  );
}
