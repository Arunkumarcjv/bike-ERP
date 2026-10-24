import { aiClient } from '../ai/aiClient';

/**
 * 20 Scripted Multi-turn Eval Scenarios for Vennila Bike Showroom WhatsApp AI Assistant
 */
export const EVAL_SCENARIOS = [
  {
    id: 1,
    category: 'Service Booking',
    title: 'Service slot enquiry (English)',
    language: 'en',
    messages: [
      { role: 'user', content: 'Hi, I need to check available service slots for tomorrow.' },
    ],
    expectedIntent: 'check_service_slots',
    evalCriteria: (res) => res.toolCalls.some((t) => t.toolName === 'check_service_slots') && !res.needsHandoff,
  },
  {
    id: 2,
    category: 'Service Booking',
    title: 'Service slot enquiry (Tamil)',
    language: 'ta',
    messages: [
      { role: 'user', content: 'நாளைக்கு வண்டி சர்வீஸ் விட ஸ்லாட் இருக்கா?' },
    ],
    expectedIntent: 'check_service_slots',
    evalCriteria: (res) => res.toolCalls.some((t) => t.toolName === 'check_service_slots') && !res.needsHandoff,
  },
  {
    id: 3,
    category: 'Service Booking',
    title: 'Service booking flow with time confirmation (Tanglish)',
    language: 'tanglish',
    messages: [
      { role: 'user', content: 'Naalaiki 10:00 AM service slot venum bro, Hunter 350-ku.' },
    ],
    expectedIntent: 'check_service_slots',
    evalCriteria: (res) => res.toolCalls.some((t) => t.toolName === 'check_service_slots'),
  },
  {
    id: 4,
    category: 'Vehicle Sales',
    title: 'Bike enquiry under 1.5 Lakhs (English)',
    language: 'en',
    messages: [
      { role: 'user', content: 'Show me bikes available under 1.5 lakhs budget.' },
    ],
    expectedIntent: 'search_bikes_by_budget',
    evalCriteria: (res) => res.toolCalls.some((t) => t.toolName === 'search_bikes_by_budget') && res.reply.length > 20,
  },
  {
    id: 5,
    category: 'Vehicle Sales',
    title: 'High capacity bikes > 350cc (Himalayan / Classic)',
    language: 'en',
    messages: [
      { role: 'user', content: 'What is the price of Royal Enfield Himalayan 450 and Hunter 350?' },
    ],
    expectedIntent: 'search_bikes_by_budget',
    evalCriteria: (res) => res.toolCalls.some((t) => t.toolName === 'search_bikes_by_budget'),
  },
  {
    id: 6,
    category: 'Electric Vehicles',
    title: 'Electric scooter enquiry (Ather / iQube)',
    language: 'en',
    messages: [
      { role: 'user', content: 'Do you have electric scooters like Ather 450X or TVS iQube in stock?' },
    ],
    expectedIntent: 'search_bikes_by_budget',
    evalCriteria: (res) => res.toolCalls.some((t) => t.toolName === 'search_bikes_by_budget'),
  },
  {
    id: 7,
    category: 'Service Status',
    title: 'Live job status check by phone (English)',
    language: 'en',
    messages: [
      { role: 'user', content: 'Can you check status of my service job card for phone 9845012345?' },
    ],
    expectedIntent: 'query_job_status',
    evalCriteria: (res) => res.toolCalls.some((t) => t.toolName === 'query_job_status'),
  },
  {
    id: 8,
    category: 'Service Status',
    title: 'Live job status check with vehicle registration number',
    language: 'en',
    messages: [
      { role: 'user', content: 'What is the status of my bike KA-01-MJ-4589?' },
    ],
    expectedIntent: 'query_job_status',
    evalCriteria: (res) => res.toolCalls.some((t) => t.toolName === 'query_job_status'),
  },
  {
    id: 9,
    category: 'Vehicle Sales',
    title: 'Quotation request for Hunter 350 on-road price',
    language: 'en',
    messages: [
      { role: 'user', content: 'What is the on road price for Hunter 350 in Bangalore?' },
    ],
    expectedIntent: 'search_bikes_by_budget',
    evalCriteria: (res) => res.toolCalls.some((t) => t.toolName === 'search_bikes_by_budget'),
  },
  {
    id: 10,
    category: 'Safety & Guardrails',
    title: 'Complaint escalation - mechanic delay (Triggers Handoff)',
    language: 'en',
    messages: [
      { role: 'user', content: 'I have a serious complaint! Your mechanic promised delivery yesterday and has not answered my calls.' },
    ],
    expectedIntent: 'escalate_to_human_manager',
    evalCriteria: (res) => res.needsHandoff === true && res.sources.includes('Human Escalation Protocol'),
  },
  {
    id: 11,
    category: 'Safety & Guardrails',
    title: 'Complaint escalation - request to speak with manager',
    language: 'en',
    messages: [
      { role: 'user', content: 'I need to speak with manager right now regarding my booking.' },
    ],
    expectedIntent: 'escalate_to_human_manager',
    evalCriteria: (res) => res.needsHandoff === true,
  },
  {
    id: 12,
    category: 'Insurance',
    title: 'Insurance renewal enquiry',
    language: 'en',
    messages: [
      { role: 'user', content: 'My bike insurance policy renewal is due. How do I renew?' },
    ],
    expectedIntent: 'get_pending_renewals',
    evalCriteria: (res) => res.toolCalls.some((t) => t.toolName === 'get_pending_renewals'),
  },
  {
    id: 13,
    category: 'Showroom Visit',
    title: 'Test ride booking enquiry',
    language: 'tanglish',
    messages: [
      { role: 'user', content: 'Classic 350 test ride book panna mudiyuma showroom-la?' },
    ],
    expectedIntent: 'search_bikes_by_budget',
    evalCriteria: (res) => res.reply.length > 15,
  },
  {
    id: 14,
    category: 'Workshop Rules',
    title: 'Sunday service slot rejection (Closed on Sunday)',
    language: 'en',
    messages: [
      { role: 'user', content: 'I want a service slot for this coming Sunday 2026-11-01.' },
    ],
    expectedIntent: 'check_service_slots',
    evalCriteria: (res) => res.reply.toLowerCase().includes('sunday') || res.reply.toLowerCase().includes('closed'),
  },
  {
    id: 15,
    category: 'Pre-owned & Exchange',
    title: 'Exchange valuation inquiry for used bike',
    language: 'en',
    messages: [
      { role: 'user', content: 'Do you accept old bike exchange and what is the appraisal process?' },
    ],
    expectedIntent: 'general_faq',
    evalCriteria: (res) => res.reply.length > 20,
  },
  {
    id: 16,
    category: 'Warranty & Maintenance',
    title: 'Warranty AMC query',
    language: 'ta',
    messages: [
      { role: 'user', content: 'ஆண்டு பராமரிப்பு ஒப்பந்தம் (AMC) மற்றும் வாரண்டி சலுகைகள் என்ன?' },
    ],
    expectedIntent: 'general_faq',
    evalCriteria: (res) => res.reply.length > 10,
  },
  {
    id: 17,
    category: 'Inventory',
    title: 'Spare parts stock availability query',
    language: 'en',
    messages: [
      { role: 'user', content: 'Are engine oil and brake pads in stock for Hunter 350?' },
    ],
    expectedIntent: 'get_low_stock_parts',
    evalCriteria: (res) => res.toolCalls.some((t) => t.toolName === 'get_low_stock_parts') || res.reply.length > 20,
  },
  {
    id: 18,
    category: 'Safety & Guardrails',
    title: 'Refund request escalation (Financial Safety)',
    language: 'en',
    messages: [
      { role: 'user', content: 'I cancelled my booking and demand an immediate refund of my token advance.' },
    ],
    expectedIntent: 'escalate_to_human_manager',
    evalCriteria: (res) => res.needsHandoff === true,
  },
  {
    id: 19,
    category: 'Vehicle Finance',
    title: 'EMI calculator query for 36 months',
    language: 'en',
    messages: [
      { role: 'user', content: 'What is the approximate monthly EMI for a 2 lakh bike loan for 3 years?' },
    ],
    expectedIntent: 'search_bikes_by_budget',
    evalCriteria: (res) => res.reply.length > 20,
  },
  {
    id: 20,
    category: 'Customer Hospitality',
    title: 'Showroom location and working hours',
    language: 'en',
    messages: [
      { role: 'user', content: 'Where is your showroom located and what are your opening hours?' },
    ],
    expectedIntent: 'general_faq',
    evalCriteria: (res) => res.reply.includes('Bangalore') || res.reply.length > 20,
  },
];

/**
 * Execute automated eval run
 */
export async function runWhatsAppEvalSuite(onProgress = null) {
  const results = [];
  for (let i = 0; i < EVAL_SCENARIOS.length; i++) {
    const scenario = EVAL_SCENARIOS[i];
    const start = performance.now();
    try {
      const response = await aiClient.chat({
        messages: scenario.messages,
        language: scenario.language,
      });
      const durationMs = Math.round(performance.now() - start);
      const passed = scenario.evalCriteria(response);

      const evalItem = {
        scenarioId: scenario.id,
        category: scenario.category,
        title: scenario.title,
        language: scenario.language,
        durationMs,
        passed,
        toolCalls: response.toolCalls?.map((t) => t.toolName) || [],
        needsHandoff: response.needsHandoff,
        replySample: response.reply?.slice(0, 100) + '...',
      };
      results.push(evalItem);
      if (onProgress) onProgress(i + 1, EVAL_SCENARIOS.length, evalItem);
    } catch (err) {
      results.push({
        scenarioId: scenario.id,
        category: scenario.category,
        title: scenario.title,
        language: scenario.language,
        durationMs: 0,
        passed: false,
        error: err.message,
      });
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  return {
    total: EVAL_SCENARIOS.length,
    passed: passedCount,
    failed: EVAL_SCENARIOS.length - passedCount,
    passRatePercent: Math.round((passedCount / EVAL_SCENARIOS.length) * 100),
    results,
  };
}
