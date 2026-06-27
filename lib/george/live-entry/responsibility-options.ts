export function getConversationResponsibilityOptions(signal: string) {
  const clean = String(signal || '').toLowerCase()

  if (/interview|hired|hire|job|candidate|recruit|offer|amazon|warehouse|fulfillment/.test(clean)) {
    return ['Interviewee', 'Hiring Manager', 'Recruiter', 'Panel Member', 'Observer']
  }

  if (/investor|fund|raise|capital|vc|venture|valuation|term/.test(clean)) {
    return ['Founder', 'CEO', 'President', 'CFO', 'Investor', 'Advisor', 'Board Member']
  }

  if (/sell|sale|close|client|customer|buyer|proposal|demo/.test(clean)) {
    return ['Sales Lead', 'Account Executive', 'Customer', 'Decision Maker', 'Technical Evaluator']
  }

  if (/negotiat|deal|agreement|terms|price|contract|settlement/.test(clean)) {
    return ['Lead Negotiator', 'Decision Maker', 'Buyer', 'Seller', 'Advisor', 'Observer']
  }

  if (/doctor|medical|patient|diagnosis|treatment|symptom|care/.test(clean)) {
    return ['Patient', 'Caregiver', 'Physician', 'Specialist', 'Advocate']
  }

  if (/conflict|resolve|repair|apology|relationship|family|team/.test(clean)) {
    return ['Mediator', 'Parent', 'Partner', 'Manager', 'Employee', 'Friend']
  }

  return ['Presenter', 'Decision Maker', 'Participant', 'Advisor', 'Observer']
}
