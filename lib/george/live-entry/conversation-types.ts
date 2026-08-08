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
      "Present your position clearly, organize the facts, answer challenges, expose weaknesses, persuade listeners, and make your case understood.",
    initialization:
      "GEORGE will help shape the case around the people involved, what matters to them, and the decision you need.",
  },
  {
    id: "prep-my-interview",
    title: "Prep My Interview",
    group: "work",
    description:
      "Build rapport, ask or answer confidently, demonstrate capability, communicate expectations, strengthen credibility, and make a lasting impression.",
    initialization:
      "GEORGE will prepare the strongest evidence, likely questions, difficult moments, and the outcome you are pursuing.",
  },
  {
    id: "negotiate-a-sale",
    title: "Negotiate a Sale",
    group: "work",
    description:
      "Communicate value, protect your position, answer resistance, negotiate terms, build trust, and earn commitment.",
    initialization:
      "GEORGE will prepare your value, proof, boundaries, objections, leverage, and next-best outcome.",
  },
  {
    id: "lead-my-meeting",
    title: "Lead My Meeting",
    group: "work",
    description:
      "Establish direction, hold attention, answer questions, resolve concerns, build alignment, influence decisions, and move the room.",
    initialization:
      "GEORGE will prepare the participants, decisions, pressure points, agenda, and actions the meeting must produce.",
  },
  {
    id: "present-my-proposal",
    title: "Present My Proposal",
    group: "work",
    description:
      "Capture attention, explain the proposal, defend recommendations, answer scrutiny, resolve concerns, persuade stakeholders, and earn support.",
    initialization:
      "GEORGE will prepare the proposal around the audience, evidence, objections, decision, and requested action.",
  },
  {
    id: "handle-tough-questions",
    title: "Handle Tough Questions",
    group: "work",
    description:
      "Answer directly, explain complexity, withstand pressure, protect credibility, regain control, and keep the conversation moving.",
    initialization:
      "GEORGE will identify what may be tested, the proof available, the risks, and the strongest response strategy.",
  },
  {
    id: "ask-for-a-raise",
    title: "Ask for a Raise",
    group: "work",
    description:
      "Communicate your value, demonstrate impact, justify compensation, answer resistance, negotiate confidently, and strengthen your position.",
    initialization:
      "GEORGE will help organize your value, results, request, alternatives, and response to resistance.",
  },
  {
    id: "set-professional-appointment",
    title: "Set a Professional Appointment",
    group: "work",
    description:
      "Establish relevance, communicate value, answer hesitation, create interest, earn trust, and secure the meeting.",
    initialization:
      "GEORGE will help identify the person, purpose, value, timing, likely resistance, and strongest appointment request.",
  },
  {
    id: "sell-anything",
    title: "Sell Anything",
    group: "work",
    description:
      "Build rapport, uncover needs, communicate value, answer objections, create urgency, earn trust, and secure commitment.",
    initialization:
      "GEORGE will help define the offer, buyer, value, proof, objections, leverage, and next commitment.",
  },
  {
    id: "make-a-civil-case",
    title: "Make a Civil Case",
    group: "work",
    description:
      "Present the facts clearly, explain the law, challenge opposing claims, answer scrutiny, establish credibility, and persuade the listener.",
    initialization:
      "GEORGE provides general legal information and communication support, not legal advice or legal representation. GEORGE will help organize the facts, applicable law, public information, arguments, weaknesses, and requested outcome.",
  },
  {
    id: "make-a-criminal-case",
    title: "Make a Criminal Case",
    group: "work",
    description:
      "Present evidence clearly, explain the issues, test competing claims, answer scrutiny, expose uncertainty, and make the argument understood.",
    initialization:
      "GEORGE provides general legal information and communication support, not legal advice or legal representation. GEORGE will help organize the facts, evidence, applicable law, arguments, weaknesses, and intended explanation.",
  },
  {
    id: "hold-a-political-debate",
    title: "Hold a Political Debate",
    group: "speaking",
    description:
      "Frame your position, defend principles, answer opposition, challenge assumptions, persuade the audience, and control the debate.",
    initialization:
      "GEORGE will prepare the position, audience, evidence, likely opposition, rebuttals, vulnerabilities, and desired conclusion.",
  },
  {
    id: "articulate-thermonuclear-physics",
    title: "Articulate Thermonuclear Physics",
    group: "speaking",
    description:
      "Explain complex science clearly, define essential concepts, answer technical questions, correct misunderstanding, hold attention, and deepen understanding.",
    initialization:
      "GEORGE will shape the explanation around the audience, scientific depth, required concepts, examples, and intended understanding.",
  },
  {
    id: "explain-basketball-theory",
    title: "Explain Basketball Theory",
    group: "speaking",
    description:
      "Explain strategy clearly, connect movement and purpose, answer questions, reveal patterns, hold attention, and deepen understanding.",
    initialization:
      "GEORGE will shape the explanation around the audience, level of play, tactical concepts, examples, and intended understanding.",
  },
  {
    id: "explain-history-of-any-sport",
    title: "Explain the History of Any Sport",
    group: "speaking",
    description:
      "Tell the story clearly, connect people and events, explain change, answer questions, hold attention, and make history meaningful.",
    initialization:
      "GEORGE will identify the sport, period, audience, major developments, central figures, cultural context, and intended depth.",
  },
  {
    id: "explain-pop-culture",
    title: "Explain Pop Culture",
    group: "speaking",
    description:
      "Explain the subject clearly, reveal context, connect meaning and influence, answer questions, challenge assumptions, and hold attention.",
    initialization:
      "GEORGE will identify the subject, period, audience, cultural context, major influences, competing interpretations, and intended depth.",
  },
  {
    id: "other-work",
    title: "Other",
    group: "work",
    description:
      "Communicate clearly, answer questions, navigate pressure, build trust, influence outcomes, and move the conversation forward.",
    initialization:
      "GEORGE will identify the specific conversation and shape the briefing around what you need to accomplish.",
  },
  {
    id: "have-a-difficult-conversation",
    title: "Have a Difficult Conversation",
    group: "personal",
    description:
      "Speak honestly, navigate emotion, reduce misunderstanding, answer difficult reactions, protect trust, and move the conversation forward.",
    initialization:
      "GEORGE will help protect the relationship, the facts, your boundaries, and the result you need from the conversation.",
  },
  {
    id: "resolve-a-conflict",
    title: "Resolve a Conflict",
    group: "personal",
    description:
      "Clarify disagreement, reduce tension, answer concerns, rebuild understanding, restore trust, and reach resolution.",
    initialization:
      "GEORGE will identify the disagreement, interests, pressure, misunderstandings, and possible resolution paths.",
  },
  {
    id: "set-a-boundary",
    title: "Set a Boundary",
    group: "personal",
    description:
      "State the boundary clearly, explain its importance, answer resistance, remain composed, protect your position, and preserve respect.",
    initialization:
      "GEORGE will help define the boundary, reason, consequence, tone, and response to likely resistance.",
  },
  {
    id: "ask-for-something-important",
    title: "Ask for Something Important",
    group: "personal",
    description:
      "Express what you need, explain why it matters, answer concerns, build understanding, strengthen trust, and earn consideration.",
    initialization:
      "GEORGE will help clarify the request, relationship, reason, likely concerns, and acceptable alternatives.",
  },
  {
    id: "other-personal",
    title: "Other",
    group: "personal",
    description:
      "Express yourself clearly, navigate emotion, answer concerns, build understanding, protect trust, and move forward.",
    initialization:
      "GEORGE will identify the specific situation and shape the briefing around the people, pressure, and objective.",
  },
  {
    id: "deliver-a-keynote",
    title: "Deliver a Keynote",
    group: "speaking",
    description:
      "Capture attention, communicate meaning, tell memorable stories, hold the room, inspire action, and leave a lasting impression.",
    initialization:
      "GEORGE will shape the keynote around the occasion, audience, message, timing, emotional arc, and takeaway.",
  },
  {
    id: "create-a-broadcast-script",
    title: "Create a Broadcast Script",
    group: "speaking",
    description:
      "Open strongly, communicate clearly, maintain pace, guide attention, reinforce the message, and inspire response.",
    initialization:
      "GEORGE will prepare the script around the audience, topic, required points, timing, format, and call to action.",
  },
  {
    id: "record-a-podcast",
    title: "Record a Podcast",
    group: "speaking",
    description:
      "Build connection, guide the discussion, explain ideas naturally, ask meaningful questions, hold attention, and leave listeners thinking.",
    initialization:
      "GEORGE will shape the episode around the listener, format, topic, stories, transitions, timing, and conclusion.",
  },
  {
    id: "teach-a-lesson",
    title: "Teach a Lesson",
    group: "speaking",
    description:
      "Gain attention, explain clearly, answer questions, reveal understanding, correct confusion, and make learning memorable.",
    initialization:
      "GEORGE will adapt the lesson to the learners, starting familiarity, target capability, time, and examples.",
  },
  {
    id: "lead-a-workshop",
    title: "Lead a Workshop",
    group: "speaking",
    description:
      "Set direction, invite participation, explain clearly, guide discussion, resolve confusion, and move the group toward useful results.",
    initialization:
      "GEORGE will prepare the workshop around the participants, objective, timing, activities, decisions, and deliverables.",
  },
  {
    id: "other-speaking",
    title: "Other",
    group: "speaking",
    description:
      "Capture attention, communicate clearly, answer questions, hold the audience, strengthen understanding, and leave an impression.",
    initialization:
      "GEORGE will identify the specific communication task and shape the briefing around the audience and objective.",
  },

  {
    id: "set-appointment",
    title: "Set Appointment",
    group: "work",
    description:
      "Open naturally, establish relevance, answer hesitation, create interest, build trust, and secure the appointment.",
    initialization:
      "GEORGE will help establish relevance, earn attention, handle resistance, and secure a clear time and next step.",
  },
  {
    id: "secure-financing",
    title: "Secure Financing",
    group: "work",
    description:
      "Communicate the opportunity, justify the request, explain repayment, answer scrutiny, reduce risk, and build lender confidence.",
    initialization:
      "GEORGE will help organize the purpose, numbers, repayment case, risks, supporting proof, and financing request.",
  },
  {
    id: "discuss-a-loan",
    title: "Discuss a Loan",
    group: "work",
    description:
      "Explain the need, clarify the numbers, answer financial questions, discuss terms, address risk, and build confidence.",
    initialization:
      "GEORGE will help clarify the loan purpose, terms, affordability, documentation, concerns, and next steps.",
  },
  {
    id: "handle-objections",
    title: "Handle Objections",
    group: "work",
    description:
      "Expose the real concern, answer directly, reframe value, restore confidence, overcome resistance, and move the conversation forward.",
    initialization:
      "GEORGE will help identify the real objection, respond with proof, preserve trust, and move toward a decision.",
  },
  {
    id: "discovery-call",
    title: "Discovery Call",
    group: "work",
    description:
      "Build rapport, ask meaningful questions, uncover priorities, clarify needs, establish relevance, and earn the next conversation.",
    initialization:
      "GEORGE will help uncover needs, priorities, constraints, decision authority, urgency, and the right next step.",
  },
  {
    id: "close-the-sale",
    title: "Close the Sale",
    group: "work",
    description:
      "Confirm value, resolve final concerns, answer hesitation, reinforce trust, create certainty, and earn commitment.",
    initialization:
      "GEORGE will help confirm value, resolve remaining resistance, protect the relationship, and ask for commitment.",
  },
  {
    id: "client-follow-up",
    title: "Client Follow-Up",
    group: "work",
    description:
      "Reconnect naturally, reinforce value, answer concerns, restore momentum, strengthen trust, and secure the next step.",
    initialization:
      "GEORGE will help reconnect the prior conversation, restore momentum, clarify value, and secure the next action.",
  },
  {
    id: "request-a-promotion",
    title: "Request a Promotion",
    group: "work",
    description:
      "Demonstrate impact, communicate readiness, justify advancement, answer concerns, strengthen credibility, and earn serious consideration.",
    initialization:
      "GEORGE will help organize results, expanded responsibility, leadership proof, readiness, and the promotion request.",
  },
  {
    id: "salary-negotiation",
    title: "Salary Negotiation",
    group: "work",
    description:
      "Communicate your value, justify expectations, answer objections, negotiate confidently, protect your position, and reach agreement.",
    initialization:
      "GEORGE will help establish market value, performance proof, priorities, boundaries, alternatives, and the ask.",
  },
  {
    id: "networking-conversation",
    title: "Networking Conversation",
    group: "work",
    description:
      "Build rapport, communicate value naturally, ask meaningful questions, create connection, earn trust, and open opportunity.",
    initialization:
      "GEORGE will help shape the introduction, common ground, useful exchange, memorable value, and follow-up.",
  },
  {
    id: "executive-presentation",
    title: "Executive Presentation",
    group: "speaking",
    description:
      "Command attention, communicate strategy, explain complexity, answer scrutiny, build confidence, and influence decisions.",
    initialization:
      "GEORGE will help organize the decision, essential evidence, risks, recommendation, and concise executive framing.",
  },
  {
    id: "budget-discussion",
    title: "Budget Discussion",
    group: "work",
    description:
      "Communicate clearly, justify priorities, defend recommendations, answer scrutiny, explain tradeoffs, persuade stakeholders, and build confidence.",
    initialization:
      "GEORGE will help organize the numbers, constraints, priorities, alternatives, risks, and requested decision.",
  },
  {
    id: "vendor-negotiation",
    title: "Vendor Negotiation",
    group: "work",
    description:
      "Clarify needs, communicate value, challenge terms, answer resistance, protect leverage, and reach a workable agreement.",
    initialization:
      "GEORGE will help define requirements, pricing leverage, service expectations, boundaries, concessions, and alternatives.",
  },
  {
    id: "partnership-discussion",
    title: "Partnership Discussion",
    group: "work",
    description:
      "Establish shared value, clarify expectations, answer concerns, expose risk, build trust, and create alignment.",
    initialization:
      "GEORGE will help clarify contribution, incentives, responsibilities, risks, expectations, and the path forward.",
  },
  {
    id: "retain-a-client",
    title: "Retain a Client",
    group: "work",
    description:
      "Address concerns, restore confidence, reinforce value, rebuild trust, recover momentum, and preserve the relationship.",
    initialization:
      "GEORGE will help identify the cause of dissatisfaction, restore trust, demonstrate value, and propose a credible recovery.",
  },
  {
    id: "resolve-customer-complaint",
    title: "Resolve Customer Complaint",
    group: "work",
    description:
      "Acknowledge impact, answer concerns, explain resolution, restore confidence, rebuild trust, and preserve the relationship.",
    initialization:
      "GEORGE will help uncover the failure, acknowledge impact, explain responsibly, offer resolution, and preserve trust.",
  },
  {
    id: "ask-for-referral",
    title: "Ask for a Referral",
    group: "work",
    description:
      "Reinforce value, express appreciation, make the request naturally, answer hesitation, preserve trust, and earn the introduction.",
    initialization:
      "GEORGE will help establish earned value, identify the right introduction, make the request, and simplify the next step.",
  },
  {
    id: "real-estate-offer",
    title: "Make a Real Estate Offer",
    group: "work",
    description:
      "Communicate seriousness, justify the offer, answer concerns, negotiate terms, protect leverage, and strengthen acceptance.",
    initialization:
      "GEORGE will help organize value, market evidence, terms, contingencies, boundaries, and negotiation strategy.",
  },
  {
    id: "insurance-claim",
    title: "Discuss an Insurance Claim",
    group: "work",
    description:
      "Explain the loss clearly, establish the facts, answer scrutiny, challenge resistance, protect credibility, and pursue fair resolution.",
    initialization:
      "GEORGE will help organize the event, policy basis, evidence, damages, prior communication, and requested resolution.",
  },
  {
    id: "contract-discussion",
    title: "Discuss a Contract",
    group: "work",
    description:
      "Clarify terms, explain priorities, question ambiguity, answer concerns, negotiate protections, and reach mutual understanding.",
    initialization:
      "GEORGE will help identify obligations, unclear terms, risks, priorities, proposed changes, and unresolved questions.",
  },
  {
    id: "performance-review",
    title: "Performance Review",
    group: "work",
    description:
      "Demonstrate impact or highlight achievement, discuss performance honestly, address concerns, explain expectations, strengthen accountability, and define what follows.",
    initialization:
      "GEORGE will help organize results, lessons, concerns, goals, growth opportunities, and the next performance period.",
  },
  {
    id: "ask-for-feedback",
    title: "Ask for Feedback",
    group: "work",
    description:
      "Invite honesty, ask useful questions, clarify meaning, answer concerns, protect trust, and leave with greater understanding.",
    initialization:
      "GEORGE will help ask for clear observations, examples, priorities, and practical ways to improve.",
  },
  {
    id: "give-feedback",
    title: "Give Feedback",
    group: "work",
    description:
      "Speak clearly, explain impact, answer reactions, preserve dignity, encourage improvement, and strengthen accountability.",
    initialization:
      "GEORGE will help separate facts from assumptions, explain impact, preserve dignity, and define the needed change.",
  },
  {
    id: "address-underperformance",
    title: "Address Underperformance",
    group: "work",
    description:
      "State concerns clearly, explain impact, answer resistance, establish expectations, reinforce consequences, and restore accountability.",
    initialization:
      "GEORGE will help identify the gap, evidence, expectations, available support, consequences, and follow-up.",
  },
  {
    id: "manage-up",
    title: "Manage Up",
    group: "work",
    description:
      "Communicate priorities, explain constraints, answer concerns, influence direction, build trust, and strengthen alignment.",
    initialization:
      "GEORGE will help frame priorities, risks, decisions, recommendations, and what leadership needs to know.",
  },
  {
    id: "delegate-work",
    title: "Delegate Work",
    group: "work",
    description:
      "Explain the objective, establish ownership, clarify expectations, answer questions, build confidence, and secure commitment.",
    initialization:
      "GEORGE will help define the outcome, boundaries, resources, checkpoints, and decision authority.",
  },
  {
    id: "align-on-priorities",
    title: "Align on Priorities",
    group: "work",
    description:
      "Clarify what matters, explain tradeoffs, challenge assumptions, resolve disagreement, build alignment, and establish direction.",
    initialization:
      "GEORGE will help compare urgency, impact, dependencies, constraints, and the order of execution.",
  },
  {
    id: "project-kickoff",
    title: "Project Kickoff",
    group: "work",
    description:
      "Establish direction, clarify responsibilities, communicate priorities, answer concerns, build alignment, and create momentum.",
    initialization:
      "GEORGE will help prepare the objective, scope, responsibilities, risks, milestones, and next actions.",
  },
  {
    id: "deliver-a-status-update",
    title: "Deliver a Status Update",
    group: "work",
    description:
      "Communicate progress clearly, explain delays, answer questions, surface risks, maintain confidence, and reinforce direction.",
    initialization:
      "GEORGE will help organize progress, evidence, blockers, risks, decisions, and immediate next steps.",
  },
  {
    id: "crisis-communication",
    title: "Crisis Communication",
    group: "work",
    description:
      "Establish calm, communicate facts, answer urgent questions, correct misinformation, maintain credibility, and guide the response.",
    initialization:
      "GEORGE will help establish what is known, what is uncertain, who is affected, what is being done, and what happens next.",
  },
  {
    id: "investor-pitch",
    title: "Investor Pitch",
    group: "work",
    description:
      "Capture attention, communicate conviction, explain opportunity, defend assumptions, answer scrutiny, address risk, and build investor confidence.",
    initialization:
      "GEORGE will help organize the problem, market, solution, traction, economics, team, risks, and investment request.",
  },
  {
    id: "fundraising-meeting",
    title: "Fundraising Meeting",
    group: "work",
    description:
      "Communicate the mission, explain the need, demonstrate impact, answer scrutiny, build trust, and inspire commitment.",
    initialization:
      "GEORGE will help prepare the purpose, use of funds, proof, urgency, stakeholder value, and requested commitment.",
  },
  {
    id: "contract-renewal",
    title: "Contract Renewal",
    group: "work",
    description:
      "Reinforce value, address concerns, explain terms, negotiate changes, preserve trust, and earn renewal.",
    initialization:
      "GEORGE will help demonstrate outcomes, resolve concerns, protect value, and secure the next agreement.",
  },
  {
    id: "price-increase",
    title: "Communicate a Price Increase",
    group: "work",
    description:
      "Explain the change clearly, reinforce value, answer resistance, protect credibility, preserve trust, and retain commitment.",
    initialization:
      "GEORGE will help explain the change, reinforce value, anticipate resistance, and preserve the relationship.",
  },
  {
    id: "collections-call",
    title: "Collections Call",
    group: "work",
    description:
      "State the obligation clearly, answer concerns, maintain respect, establish urgency, negotiate resolution, and secure commitment.",
    initialization:
      "GEORGE will help establish the balance, understand constraints, protect boundaries, and secure a concrete next step.",
  },
  {
    id: "customer-success-review",
    title: "Customer Success Review",
    group: "work",
    description:
      "Demonstrate value, discuss outcomes, answer concerns, uncover priorities, strengthen trust, and expand the relationship.",
    initialization:
      "GEORGE will help review outcomes, usage, obstacles, priorities, satisfaction, and the next success plan.",
  },
  {
    id: "product-demo",
    title: "Product Demo",
    group: "work",
    description:
      "Capture interest, reveal value, connect features to needs, answer questions, overcome doubt, and inspire action.",
    initialization:
      "GEORGE will help connect capabilities to the audience's needs, demonstrate value, answer questions, and define next steps.",
  },
  {
    id: "press-interview",
    title: "Press Interview",
    group: "speaking",
    description:
      "Control the message, answer difficult questions, communicate clearly, remain composed, protect credibility, and shape understanding.",
    initialization:
      "GEORGE will help prepare core messages, difficult questions, evidence, boundaries, bridges, and quotable language.",
  },
  {
    id: "media-interview",
    title: "Media Interview",
    group: "speaking",
    description:
      "Build connection, communicate the message, answer pressure, redirect distractions, maintain composure, and strengthen credibility.",
    initialization:
      "GEORGE will help anticipate framing, prepare concise answers, avoid speculation, and return to the central message.",
  },
  {
    id: "public-comment",
    title: "Deliver Public Comment",
    group: "speaking",
    description:
      "State your position clearly, explain its importance, support it with facts, hold attention, persuade listeners, and inspire action.",
    initialization:
      "GEORGE will help structure the issue, personal stake, proof, requested action, and closing statement.",
  },
  {
    id: "panel-discussion",
    title: "Panel Discussion",
    group: "speaking",
    description:
      "Enter naturally, communicate insight, answer challenges, build on ideas, hold attention, and strengthen the discussion.",
    initialization:
      "GEORGE will help prepare positions, examples, transitions, disagreements, audience value, and closing thoughts.",
  },
  {
    id: "moderate-a-discussion",
    title: "Moderate a Discussion",
    group: "speaking",
    description:
      "Establish focus, invite useful voices, ask meaningful questions, manage tension, clarify ideas, and move the room.",
    initialization:
      "GEORGE will help sequence questions, balance voices, manage time, redirect tension, and produce useful conclusions.",
  },
  {
    id: "parent-teacher-conference",
    title: "Parent-Teacher Conference",
    group: "personal",
    description:
      "Discuss progress clearly, ask meaningful questions, explain concerns, answer expectations, build partnership, and support the student.",
    initialization:
      "GEORGE will help clarify observations, concerns, strengths, responsibilities, resources, and follow-up.",
  },
  {
    id: "therapy-conversation",
    title: "Therapy Conversation",
    group: "personal",
    description:
      "Express yourself honestly, explore difficult thoughts, answer meaningful questions, clarify emotion, build understanding, and move toward insight.",
    initialization:
      "GEORGE will help organize what happened, what you felt, recurring patterns, questions, and what you want help understanding.",
  },
  {
    id: "family-decision",
    title: "Family Decision",
    group: "personal",
    description:
      "Express priorities, explain concerns, resolve disagreement, protect relationships, build understanding, and reach family alignment.",
    initialization:
      "GEORGE will help identify the decision, affected people, concerns, constraints, options, and responsibilities.",
  },
  {
    id: "apologize-and-repair",
    title: "Apologize and Repair",
    group: "personal",
    description:
      "Acknowledge harm, speak honestly, answer difficult reactions, accept responsibility, rebuild trust, and repair the relationship.",
    initialization:
      "GEORGE will help acknowledge the action, explain without excusing, understand impact, make amends, and rebuild trust.",
  },
  {
    id: "end-a-relationship",
    title: "End a Relationship",
    group: "personal",
    description:
      "Speak honestly, communicate the decision, answer difficult reactions, maintain dignity, protect boundaries, and bring closure.",
    initialization:
      "GEORGE will help state the decision, explain what is appropriate, protect boundaries, and prepare for likely responses.",
  },
  {
    id: "co-parenting-conversation",
    title: "Co-Parenting Conversation",
    group: "personal",
    description:
      "Keep focus on the child, communicate needs clearly, answer concerns, reduce conflict, build cooperation, and preserve stability.",
    initialization:
      "GEORGE will help separate parenting needs from personal conflict, clarify responsibilities, and define practical agreements.",
  },
  {
    id: "estate-planning-discussion",
    title: "Estate Planning Discussion",
    group: "personal",
    description:
      "Explain your wishes, clarify priorities, answer difficult questions, address concerns, build understanding, and preserve trust.",
    initialization:
      "GEORGE will help organize wishes, roles, assets, concerns, questions, and professional follow-up.",
  },
  {
    id: "insurance-appeal",
    title: "Insurance Appeal",
    group: "personal",
    description:
      "Present the facts clearly, challenge the decision, answer scrutiny, explain impact, maintain credibility, and pursue reconsideration.",
    initialization:
      "GEORGE will help organize the decision, documentation, policy language, impact, questions, and appeal request.",
  },
  {
    id: "housing-negotiation",
    title: "Housing Negotiation",
    group: "personal",
    description:
      "Communicate your position, explain priorities, answer concerns, negotiate terms, protect leverage, and reach agreement.",
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

/**
 * GEORGE's starting operational understanding for a conversation type.
 * These are working assumptions, not user-selected objectives; Preparation
 * carries them forward so the user can correct or refine them.
 */
export function getConversationTypeBaselineAssumptions(
  id: string | null | undefined,
): readonly string[] {
  const conversationId = String(id || "").trim().toLowerCase();

  if (
    /sale|sales|appointment|discovery|objection|client|customer|product-demo|renewal|price-increase|collections|referral/.test(
      conversationId,
    )
  ) {
    return [
      "Trust matters.",
      "Discovery matters.",
      "Resistance is expected.",
      "Value must become clear.",
      "The conversation should move toward a concrete next step.",
    ];
  }

  if (/interview|promotion|salary|performance-review|feedback/.test(conversationId)) {
    return [
      "Evidence matters.",
      "Credibility matters.",
      "Difficult questions are expected.",
      "Confidence and recovery matter.",
    ];
  }

  if (/investor|fundrais|financing|loan/.test(conversationId)) {
    return [
      "Evidence and financial clarity matter.",
      "Risk questions are expected.",
      "Confidence matters.",
      "The conversation should earn a clear next commitment.",
    ];
  }

  if (/negotiat|contract|housing|vendor|budget|partnership|real-estate/.test(conversationId)) {
    return [
      "Interests may differ.",
      "Resistance is expected.",
      "Leverage and boundaries matter.",
      "Tradeoffs should be made explicit.",
    ];
  }

  if (/meeting|executive|kickoff|status|crisis|manage-up|delegate|align/.test(conversationId)) {
    return [
      "Alignment matters.",
      "Important decisions should become explicit.",
      "Stakeholders and risks need to stay visible.",
      "The conversation should end with clear actions.",
    ];
  }

  if (/teach|workshop|keynote|broadcast|podcast|explain|debate|presentation|panel|media|press|comment/.test(conversationId)) {
    return [
      "The audience's understanding matters.",
      "Clarity and pacing matter.",
      "Questions and shifts in attention are expected.",
      "The intended takeaway should remain clear.",
    ];
  }

  if (/case|legal|criminal|civil|appeal|deposition/.test(conversationId)) {
    return [
      "Facts and evidence matter.",
      "Scrutiny is expected.",
      "The argument must remain clear and bounded.",
      "The requested outcome should stay explicit.",
    ];
  }

  if (/conflict|difficult|boundary|relationship|family|therapy|apologize|repair|co-parenting|estate/.test(conversationId)) {
    return [
      "Trust and clarity matter.",
      "Emotion or resistance may shape the exchange.",
      "Boundaries should remain clear.",
      "The conversation should move toward a workable resolution.",
    ];
  }

  return [
    "The people and context matter.",
    "Relevant evidence should stay close at hand.",
    "Questions or resistance are possible.",
    "The conversation should move toward a clear next step.",
  ];
}
