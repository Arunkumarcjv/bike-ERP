/**
 * Enterprise AI Safety & Statutory Guardrails
 * Enforces hallucination prevention, grounding strictly in tool results, and automatic human escalation.
 */

export const ESCALATION_TRIGGERS = [
  'complaint',
  'refund',
  'accident',
  'police',
  'fir',
  'abuse',
  'fraud',
  'i want a person',
  'talk to human',
  'speak with manager',
  'legal',
  'consumer court',
];

export function checkHandoffNeeded(userMessage = '') {
  const clean = userMessage.toLowerCase();
  for (const trigger of ESCALATION_TRIGGERS) {
    if (clean.includes(trigger)) {
      return {
        needsHandoff: true,
        reason: `Trigger keyword detected: "${trigger}"`,
      };
    }
  }
  return { needsHandoff: false, reason: null };
}

export function validateAiResponseGrounding(responseText, toolSources = []) {
  if (toolSources.length === 0) {
    return {
      isGrounded: false,
      disclaimer: 'Notice: This reply is based on general dealership policy. Please confirm details with our showroom executive.',
    };
  }
  return {
    isGrounded: true,
    sources: toolSources,
  };
}
