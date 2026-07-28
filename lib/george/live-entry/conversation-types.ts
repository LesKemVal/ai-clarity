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
      "Build a clear, persuasive position supported by the right facts, proof, and framing.",
    initialization:
      "GEORGE will help shape the case around the people involved, what matters to them, and the decision you need.",
  },
  {
    id: "prep-my-interview",
    title: "Prep My Interview",
    group: "work",
    description:
      "Prepare for the questions, proof, pressure, and decision behind an important interview.",
    initialization:
      "GEORGE will prepare the strongest evidence, likely questions, difficult moments, and the outcome you are pursuing.",
  },
  {
    id: "negotiate-a-sale",
    title: "Negotiate a Sale",
    group: "work",
    description:
      "Understand the buyer, protect value, answer resistance, and move toward a concrete commitment.",
    initialization:
      "GEORGE will prepare your value, proof, boundaries, objections, leverage, and next-best outcome.",
  },
  {
    id: "lead-my-meeting",
    title: "Lead My Meeting",
    group: "work",
    description:
      "Guide a meeting toward clarity, alignment, decisions, ownership, and useful next actions.",
    initialization:
      "GEORGE will prepare the participants, decisions, pressure points, agenda, and actions the meeting must produce.",
  },
  {
    id: "present-my-proposal",
    title: "Present My Proposal",
    group: "work",
    description:
      "Present an idea, plan, offer, or recommendation so the audience can understand and act on it.",
    initialization:
      "GEORGE will prepare the proposal around the audience, evidence, objections, decision, and requested action.",
  },
  {
    id: "handle-tough-questions",
    title: "Handle Tough Questions",
    group: "work",
    description:
      "Prepare clear, credible responses for pressure, objections, skepticism, and unfamiliar questions.",
    initialization:
      "GEORGE will identify what may be tested, the proof available, the risks, and the strongest response strategy.",
  },
  {
    id: "ask-for-a-raise",
    title: "Ask for a Raise",
    group: "work",
    description:
      "Prepare the evidence, positioning, timing, and language for a compensation conversation.",
    initialization:
      "GEORGE will help organize your value, results, request, alternatives, and response to resistance.",
  },
  {
    id: "other-work",
    title: "Other",
    group: "work",
    description:
      "Describe another work or professional conversation you want GEORGE to help you prepare.",
    initialization:
      "GEORGE will identify the specific conversation and shape the briefing around what you need to accomplish.",
  },
  {
    id: "have-a-difficult-conversation",
    title: "Have a Difficult Conversation",
    group: "personal",
    description:
      "Prepare careful language for tension, accountability, boundaries, repair, or an important truth.",
    initialization:
      "GEORGE will help protect the relationship, the facts, your boundaries, and the result you need from the conversation.",
  },
  {
    id: "resolve-a-conflict",
    title: "Resolve a Conflict",
    group: "personal",
    description:
      "Clarify what is actually disputed and prepare a path toward understanding or workable resolution.",
    initialization:
      "GEORGE will identify the disagreement, interests, pressure, misunderstandings, and possible resolution paths.",
  },
  {
    id: "set-a-boundary",
    title: "Set a Boundary",
    group: "personal",
    description:
      "State what must change while remaining clear, calm, and prepared for the other person’s response.",
    initialization:
      "GEORGE will help define the boundary, reason, consequence, tone, and response to likely resistance.",
  },
  {
    id: "deliver-difficult-news",
    title: "Deliver Difficult News",
    group: "personal",
    description:
      "Communicate a hard decision, change, or truth with clarity, care, and appropriate responsibility.",
    initialization:
      "GEORGE will help sequence the facts, impact, explanation, empathy, and next steps.",
  },
  {
    id: "ask-for-something-important",
    title: "Ask for Something Important",
    group: "personal",
    description:
      "Prepare a meaningful request so the other person understands what you need and why it matters.",
    initialization:
      "GEORGE will help clarify the request, relationship, reason, likely concerns, and acceptable alternatives.",
  },
  {
    id: "support-someone",
    title: "Support Someone",
    group: "personal",
    description:
      "Prepare to listen, respond, and be useful during an emotionally important conversation.",
    initialization:
      "GEORGE will help you understand what support may be needed, what not to assume, and how to remain present.",
  },
  {
    id: "other-personal",
    title: "Other",
    group: "personal",
    description:
      "Describe another personal conversation you want GEORGE to help you prepare.",
    initialization:
      "GEORGE will identify the specific situation and shape the briefing around the people, pressure, and objective.",
  },
  {
    id: "explain-a-complex-topic",
    title: "Explain a Complex Topic",
    group: "speaking",
    description:
      "Make a difficult subject understandable without losing the facts, meaning, or necessary depth.",
    initialization:
      "GEORGE will adapt the explanation to the audience, familiarity, cognitive level, time, and intended result.",
  },
  {
    id: "deliver-a-keynote",
    title: "Deliver a Keynote",
    group: "speaking",
    description:
      "Build and deliver a memorable message with a clear arc, proof, stories, and deliberate close.",
    initialization:
      "GEORGE will shape the keynote around the occasion, audience, message, timing, emotional arc, and takeaway.",
  },
  {
    id: "create-a-broadcast-script",
    title: "Create a Broadcast Script",
    group: "speaking",
    description:
      "Build a structured script for a recorded or live broadcast that can adapt during delivery.",
    initialization:
      "GEORGE will prepare the script around the audience, topic, required points, timing, format, and call to action.",
  },
  {
    id: "record-a-podcast",
    title: "Record a Podcast",
    group: "speaking",
    description:
      "Prepare a structured spoken experience that remains natural, useful, and easy to follow.",
    initialization:
      "GEORGE will shape the episode around the listener, format, topic, stories, transitions, timing, and conclusion.",
  },
  {
    id: "teach-a-lesson",
    title: "Teach a Lesson",
    group: "speaking",
    description:
      "Turn knowledge into a clear learning sequence with explanation, examples, and understanding checks.",
    initialization:
      "GEORGE will adapt the lesson to the learners, starting familiarity, target capability, time, and examples.",
  },
  {
    id: "train-my-team",
    title: "Train My Team",
    group: "speaking",
    description:
      "Prepare practical instruction that helps a team understand, practice, and apply a capability.",
    initialization:
      "GEORGE will shape training around the team, current ability, required behavior, examples, practice, and assessment.",
  },
  {
    id: "lead-a-workshop",
    title: "Lead a Workshop",
    group: "speaking",
    description:
      "Guide participants through explanation, discussion, exercises, decisions, and useful outputs.",
    initialization:
      "GEORGE will prepare the workshop around the participants, objective, timing, activities, decisions, and deliverables.",
  },
  {
    id: "other-speaking",
    title: "Other",
    group: "speaking",
    description:
      "Describe another speaking, teaching, or content task you want GEORGE to help you prepare.",
    initialization:
      "GEORGE will identify the specific communication task and shape the briefing around the audience and objective.",
  },
]);

export function getConversationType(id: string | null | undefined) {
  return (
    CONVERSATION_TYPES.find((conversationType) => conversationType.id === id) ||
    null
  );
}
