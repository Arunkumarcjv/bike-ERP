import { AI_TOOLS, executeAiTool } from './tools';
import { checkHandoffNeeded, validateAiResponseGrounding } from './guardrails';
import { formatMoney } from '../../lib/format';

/**
 * Enterprise AI Client & Predictive Engine for Bike ERP Showroom
 */

export const aiClient = {
  /**
   * Multi-turn chat assistant with tool calling and multilingual support
   */
  async chat({ messages, language = 'en', onToolCall = null }) {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    
    // 1. Guardrail Safety Check
    const handoff = checkHandoffNeeded(lastUserMessage);
    if (handoff.needsHandoff) {
      const toolLog = {
        name: 'escalate_to_human_manager',
        args: { reason: handoff.reason, customerText: lastUserMessage },
        result: { status: 'Escalated', manager: 'Suresh G. (Service Head)' },
        durationMs: 45,
      };
      if (onToolCall) onToolCall(toolLog);

      let text = `I understand this requires human intervention. I have immediately alerted our Service Manager, Suresh G., who will contact you shortly regarding: "${handoff.reason}".`;
      if (language === 'ta') {
        text = `மன்னிக்கவும், உங்கள் கோரிக்கை எங்கள் சேவை மேலாளர் சுரேஷ் அவர்களுக்கு அனுப்பப்பட்டுள்ளது. உடனடியாக உங்களை தொடர்புகொள்வார்.`;
      } else if (language === 'tanglish') {
        text = `Purinjuthu sir. Unga complaint-ah Service Manager Suresh-kitta escalate panniten. Immediate-ah call pannuvanga.`;
      }

      return {
        reply: text,
        needsHandoff: true,
        handoffReason: handoff.reason,
        toolCalls: [toolLog],
        isGrounded: true,
        sources: ['Human Escalation Protocol'],
      };
    }

    // 2. Intent Analysis & Tool Selection
    const lower = lastUserMessage.toLowerCase();
    const toolLogs = [];
    const sources = [];
    let reply = '';

    // A. Service slot checking / Booking flow
    if (lower.includes('slot') || lower.includes('service book') || lower.includes('appointment') || lower.includes('available time') || lower.includes('service time') || lower.includes('serivce') || lower.includes('servicing')) {
      // Determine date - default tomorrow if not specified
      const dateMatch = lastUserMessage.match(/\d{4}-\d{2}-\d{2}/);
      let targetDate = dateMatch ? dateMatch[0] : null;
      if (!targetDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        targetDate = tomorrow.toISOString().split('T')[0];
      }

      const res = executeAiTool('check_service_slots', { date: targetDate });
      toolLogs.push(res);
      if (onToolCall) onToolCall(res);
      sources.push('Workshop Bay Calendar');

      if (!res.result.isOpen) {
        if (language === 'ta') {
          reply = `ஞாயிற்றுக்கிழமைகளில் (${targetDate}) எங்கள் பட்டறை விடுமுறை. தயவுசெய்து திங்கள் முதல் சனிக்கிழமை வரை ஒரு தேதியைத் தேர்ந்தெடுக்கவும்.`;
        } else if (language === 'tanglish') {
          reply = `Sunday (${targetDate}) workshop leave sir. Monday to Saturday la vera date sollunga, book pannidalam!`;
        } else {
          reply = `Our workshop is closed on Sundays (${targetDate}) for facility maintenance. Please choose any date from Monday to Saturday!`;
        }
      } else {
        const openList = res.result.openSlotsList?.slice(0, 4).join(', ') || '10:00 AM, 02:00 PM';
        if (language === 'ta') {
          reply = `${targetDate} அன்று ${res.result.remainingCapacity} இடங்கள் உள்ளன. கிடைக்கும் நேரங்கள்: ${openList}. உங்கள் வண்டி மாடல் மற்றும் விரும்பிய நேரத்தை கூறவும்!`;
        } else if (language === 'tanglish') {
          reply = `${targetDate} la ${res.result.remainingCapacity} slots available-ah irukku. Timing: ${openList}. Unga bike model and time sonna உடனே book pannidren!`;
        } else {
          reply = `We have ${res.result.remainingCapacity} slots open on ${targetDate}. Available timings include: ${openList}. Would you like me to reserve one for you?`;
        }
      }
    }
    // B. Bike enquiries by budget or fuel
    else if (lower.includes('budget') || lower.includes('under') || lower.includes('lakh') || lower.includes('price') || lower.includes('electric') || lower.includes('ev') || lower.includes('scooter') || lower.includes('350') || lower.includes('bike') || lower.includes('hunter') || lower.includes('classic') || lower.includes('himalayan')) {
      let maxBudget = 25000000; // 2.5 L
      if (lower.includes('1.5') || lower.includes('1.5l') || lower.includes('150000')) maxBudget = 15000000;
      if (lower.includes('2') || lower.includes('2l') || lower.includes('200000')) maxBudget = 20000000;
      if (lower.includes('3') || lower.includes('3l') || lower.includes('300000')) maxBudget = 30000000;

      const fuel = lower.includes('electric') || lower.includes('ev') ? 'electric' : 'any';
      const res = executeAiTool('search_bikes_by_budget', { maxBudgetPaise: maxBudget, fuelType: fuel });
      toolLogs.push(res);
      if (onToolCall) onToolCall(res);
      sources.push('Vehicle Stock & Catalog');

      const bikes = res.result.results || [];
      if (bikes.length === 0) {
        reply = `We currently do not have vehicles matching that exact filter in ready stock, but our showroom executive can place an advance factory order.`;
      } else {
        const listText = bikes.map((b) => `• ${b.brand} ${b.model} (${b.engineCc ? b.engineCc + 'cc' : 'Electric'}) - Ex-Showroom ${b.exShowroomFormatted}`).join('\n');
        if (language === 'ta') {
          reply = `உங்கள் பட்ஜெட்டில் பரிந்துரைக்கப்படும் பைக்குகள்:\n${listText}\n\nடெஸ்ட் ரைடு செய்ய விரும்புகிறீர்களா?`;
        } else if (language === 'tanglish') {
          reply = `Unga budget-la best options itho sir:\n${listText}\n\nTest ride book panna ungala showroom-ku invite panrom!`;
        } else {
          reply = `Here are the top models available within your budget at Bike ERP Showroom:\n${listText}\n\nWould you like a detailed on-road price quotation or a test ride?`;
        }
      }
    }
    // C. Job status query
    else if (lower.includes('job') || lower.includes('status') || lower.includes('ready') || lower.includes('delivery') || lower.includes('service update') || lower.includes('ka-') || lower.includes('ka01')) {
      const phoneDigits = lastUserMessage.replace(/\D/g, '');
      const regMatch = lastUserMessage.match(/[A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{1,2}[-\s]?\d{4}/i);
      const reg = regMatch ? regMatch[0] : null;

      const res = executeAiTool('query_job_status', { phone: phoneDigits || '9845012345', regNumber: reg });
      toolLogs.push(res);
      if (onToolCall) onToolCall(res);
      sources.push('Workshop Job Card System');

      if (res.result.found) {
        const j = res.result.jobs[0];
        if (language === 'ta') {
          reply = `ஜாப் கார்டு #${j.jobCardNumber} (${j.bikeModel}): தற்போது "${j.stage}" நிலையில் உள்ளது. டெக்னீசியன்: ${j.technician}. தோராயமாக தயாராகும் நேரம்: ${j.estimatedReadyTime}.`;
        } else if (language === 'tanglish') {
          reply = `Job Card #${j.jobCardNumber} (${j.bikeModel}): Current status "${j.stage}". Technician ${j.technician} paathuttu irukanga. Ready time: ${j.estimatedReadyTime}.`;
        } else {
          reply = `Your Job Card #${j.jobCardNumber} for ${j.bikeModel} (${j.regNumber}) is currently in **${j.stage}**. Technician: ${j.technician}. Estimated completion: ${j.estimatedReadyTime}. Total estimated bill: ${j.estimatedCostFormatted}.`;
        }
      } else {
        reply = `I could not locate an active job card for those details. Please provide your 10-digit phone number registered during vehicle drop-off.`;
      }
    }
    // D. Low stock spare parts
    else if (lower.includes('stock') || lower.includes('inventory') || lower.includes('shortage') || lower.includes('reorder')) {
      const res = executeAiTool('get_low_stock_parts', {});
      toolLogs.push(res);
      if (onToolCall) onToolCall(res);
      sources.push('Parts Inventory Store');

      const parts = res.result.items || [];
      reply = `Found **${res.result.totalCriticalItems}** parts below safety reorder level. Top shortages:\n` +
        parts.slice(0, 4).map((p) => `• [${p.partNumber}] ${p.name}: Current ${p.currentStock} pcs (Reorder at ${p.reorderLevel}) - Rack ${p.rackLocation}`).join('\n');
    }
    // E. Pending insurance renewals
    else if (lower.includes('insurance') || lower.includes('renewal') || lower.includes('policy')) {
      const res = executeAiTool('get_pending_renewals', {});
      toolLogs.push(res);
      if (onToolCall) onToolCall(res);
      sources.push('Insurance Ledger');

      const pols = res.result.renewals || [];
      reply = `We have **${res.result.count}** policies expiring soon:\n` +
        pols.map((p) => `• ${p.customerName} (${p.bikeModel}) - Expiring: ${p.expiryDate} - ${p.insurer}`).join('\n') +
        `\n\nAutomated WhatsApp renewal reminders can be dispatched from the CRM panel.`;
    }
    // F. General KPI explanation or greeting
    else if (lower.includes('margin') || lower.includes('dsi') || lower.includes('absorption')) {
      const res = executeAiTool('explain_kpi', { kpiName: lastUserMessage });
      toolLogs.push(res);
      if (onToolCall) onToolCall(res);
      sources.push('Financial BI Dictionary');

      reply = `**${res.result.kpi}**\n\n• **Formula:** \`${res.result.formula}\`\n• **Current Benchmark:** ${res.result.currentBenchmark}\n• **Analysis:** ${res.result.interpretation}`;
    }
    // Default helpful response
    else {
      sources.push('Bike ERP Knowledge Base');
      if (language === 'ta') {
        reply = `வணக்கம்! வெண்ணிலா பைக் ஷோரூம் AI உதவியாளர். நான் பைக் விவரங்கள், சர்வீஸ் ஸ்லாட் முன்பதிவு, மற்றும் ஜாப் கார்டு நிலையை சரிபார்க்க உதவ முடியும். நான் உங்களுக்கு எவ்வாறு உதவலாம்?`;
      } else if (language === 'tanglish') {
        reply = `Vanakkam! Bike ERP Showroom AI assistant here. Bike price, service booking, or job card status check panna ungalukku help pannalam. Enna venum sollunga!`;
      } else {
        reply = `Hello! I am the Bike ERP Showroom AI Assistant. I can help you check vehicle prices, book service appointments, track live job cards, or monitor workshop stock. How may I assist you today?`;
      }
    }

    const grounding = validateAiResponseGrounding(reply, sources);

    return {
      reply,
      needsHandoff: false,
      toolCalls: toolLogs,
      isGrounded: grounding.isGrounded,
      sources: grounding.sources || ['General Showroom Guidelines'],
    };
  },

  /**
   * Predictive Lead Scoring Model
   */
  scoreLead(lead = {}) {
    let score = 50;
    const factors = [];

    // Engagement signals
    if (lead.hasTestRidden) {
      score += 25;
      factors.push({ label: 'Completed Test Ride', impact: '+25', type: 'positive' });
    }
    if (lead.budgetVerified) {
      score += 15;
      factors.push({ label: 'Pre-Approved Finance / Cash Verified', impact: '+15', type: 'positive' });
    }
    if (lead.source === 'Walk-in' || lead.source === 'Showroom Visit') {
      score += 10;
      factors.push({ label: 'Direct Showroom Walk-in', impact: '+10', type: 'positive' });
    }
    if (lead.exchangeRequired) {
      score += 5;
      factors.push({ label: 'Pre-owned Exchange Intent', impact: '+5', type: 'positive' });
    }
    if (lead.daysInactive > 7) {
      score -= 20;
      factors.push({ label: 'No Contact for > 7 Days', impact: '-20', type: 'negative' });
    }

    score = Math.max(5, Math.min(99, score));
    const tier = score >= 75 ? 'Hot' : score >= 45 ? 'Warm' : 'Cold';
    const conversionProb = Math.round(score * 0.85);

    return {
      score,
      tier,
      conversionProbPercent: conversionProb,
      factors,
      recommendedAction:
        score >= 75
          ? 'Call immediately with discount token offer & ready chassis VIN.'
          : score >= 45
          ? 'Schedule doorstep test ride or share WhatsApp brochure.'
          : 'Enroll into automated bi-weekly WhatsApp nurture drip.',
    };
  },

  /**
   * Customer Churn Risk Prediction
   */
  predictChurn(customer = {}) {
    const daysSinceService = customer.daysSinceLastService || 140;
    let churnRisk = Math.min(95, Math.max(10, Math.round((daysSinceService / 180) * 80)));
    const riskLevel = churnRisk > 70 ? 'High' : churnRisk > 40 ? 'Medium' : 'Low';

    return {
      riskPercent: churnRisk,
      riskLevel,
      lastServiceDaysAgo: daysSinceService,
      recommendedIntervention:
        riskLevel === 'High'
          ? 'Send 15% Labor Discount WhatsApp voucher for overdue 3rd Free/Paid Service.'
          : 'Include in monthly monsoon health checkup campaign.',
    };
  },

  /**
   * Simulated OCR Field Extractor (Strictly DPDP Compliant: Zero Aadhaar storage)
   */
  async extractDocument(docType = 'rc', preset = null) {
    await new Promise((r) => setTimeout(r, 600));

    if (docType === 'rc') {
      return {
        docType: 'Vehicle Registration Certificate (Form 23)',
        confidence: 0.96,
        dpdpNotice: 'DPDP Act 2023 Compliant: Government IDs processed locally; Aadhaar numbers strictly redacted.',
        fields: [
          { key: 'Registration Number', value: preset?.reg || 'KA-01-MJ-4589', confidence: 0.98 },
          { key: 'Owner Name', value: preset?.name || 'Rohan Mehta', confidence: 0.95 },
          { key: 'Chassis Number (VIN)', value: preset?.vin || 'ME3J350ERKA108922', confidence: 0.97 },
          { key: 'Engine Number', value: preset?.engine || 'J350E108922', confidence: 0.94 },
          { key: 'Maker & Model', value: 'Royal Enfield Hunter 350 Dapper Ash', confidence: 0.96 },
          { key: 'Registration Date', value: '2023-04-12', confidence: 0.93 },
          { key: 'Fuel & Emission', value: 'PETROL / BHARAT STAGE VI', confidence: 0.99 },
          { key: 'Hypothecated To', value: 'HDFC Bank Ltd.', confidence: 0.91 },
        ],
      };
    }

    if (docType === 'dl') {
      return {
        docType: 'Driving Licence (Form 7)',
        confidence: 0.94,
        dpdpNotice: 'DPDP Act 2023 Compliant: Aadhaar number not scanned or retained.',
        fields: [
          { key: 'Licence Number', value: 'KA-01-2018-0045812', confidence: 0.98 },
          { key: 'Holder Name', value: preset?.name || 'Arjun Das', confidence: 0.97 },
          { key: 'Date of Birth', value: '1992-08-14', confidence: 0.92 },
          { key: 'Vehicle Class Allowed', value: 'MCWG (Motorcycle with Gear) & LMV', confidence: 0.99 },
          { key: 'Licence Validity', value: '2038-08-13', confidence: 0.96 },
          { key: 'Blood Group', value: 'O+ve', confidence: 0.88 },
        ],
      };
    }

    // Vendor Invoice
    return {
      docType: 'OEM / Vendor Spare Parts Tax Invoice',
      confidence: 0.95,
      dpdpNotice: 'Statutory GST Tax Invoice OCR Extractor',
      fields: [
        { key: 'Vendor Legal Name', value: 'Exide Industries Limited', confidence: 0.99 },
        { key: 'Vendor GSTIN', value: '29AABCE2891J1ZT', confidence: 0.98 },
        { key: 'Invoice Number', value: 'EX/BLR/26-27/0819', confidence: 0.96 },
        { key: 'Invoice Date', value: '2026-10-18', confidence: 0.94 },
        { key: 'HSN Code', value: '8507 (Electric Accumulators)', confidence: 0.97 },
        { key: 'Total Taxable Value', value: '₹ 1,42,800.00', confidence: 0.95 },
        { key: 'CGST 14% + SGST 14%', value: '₹ 39,984.00 (Total 28%)', confidence: 0.96 },
        { key: 'Gross Invoice Total', value: '₹ 1,82,784.00', confidence: 0.98 },
      ],
    };
  },

  /**
   * Natural Language Query to Tabular Report Translator
   */
  translateNlq(query = '', storeState = {}) {
    const q = query.toLowerCase();

    // Query 1: Pending insurance renewals
    if (q.includes('insurance') || q.includes('renew')) {
      const items = storeState.insurancePolicies || [];
      return {
        title: 'Expiring Insurance Policies (Next 30 Days)',
        sqlEquivalent: "SELECT policy_no, customer_name, bike_model, expiry_date, insurer FROM insurance_policies WHERE status = 'Expiring Soon'",
        columns: ['Policy No', 'Customer Name', 'Phone', 'Bike Model', 'Expiry Date', 'Insurer', 'Status'],
        rows: items.map((p) => [
          p.policyNumber,
          p.customerName,
          p.customerPhone,
          p.bikeModel,
          p.expiryDate,
          p.insurer,
          p.status,
        ]),
        metrics: [
          { label: 'Total Policies', value: items.length },
          { label: 'Expiring Soon', value: items.filter((x) => x.status === 'Expiring Soon').length },
        ],
      };
    }

    // Query 2: Low stock parts
    if (q.includes('part') || q.includes('stock') || q.includes('reorder')) {
      const items = (storeState.spareParts || []).filter((p) => p.currentStock < p.reorderLevel);
      return {
        title: 'Spare Parts Below Safety Reorder Level',
        sqlEquivalent: 'SELECT part_number, name, current_stock, reorder_level, rack_location, mrp_paise FROM spare_parts WHERE current_stock < reorder_level',
        columns: ['Part Number', 'Name', 'Category', 'Stock Qty', 'Reorder Level', 'Rack Bin', 'MRP'],
        rows: items.map((p) => [
          p.partNumber,
          p.name,
          p.category,
          p.currentStock,
          p.reorderLevel,
          p.rackLocation,
          formatMoney(p.mrpPaise),
        ]),
        metrics: [
          { label: 'Critical SKUs', value: items.length },
          { label: 'Action', value: 'PO Drafted' },
        ],
      };
    }

    // Query 3: Sales orders / delivered bikes
    if (q.includes('sales') || q.includes('order') || q.includes('deliver') || q.includes('revenue')) {
      const items = storeState.salesOrders || [];
      return {
        title: 'Showroom Vehicle Sales & Delivery Register',
        sqlEquivalent: 'SELECT order_number, customer_name, bike_model, status, total_amount_paise FROM sales_orders ORDER BY created_at DESC',
        columns: ['Order No', 'Customer', 'Bike Model', 'VIN', 'Status', 'On-Road Price', 'Payment'],
        rows: items.map((o) => [
          o.orderNumber,
          o.customerName,
          o.bikeModel,
          o.chassisNumber || 'Pending Allocation',
          o.status,
          formatMoney(o.totalOnRoadPaise || 21500000),
          o.paymentStatus || 'Settled',
        ]),
        metrics: [
          { label: 'Total Orders', value: items.length },
          { label: 'Delivered', value: items.filter((x) => x.status === 'Delivered').length },
        ],
      };
    }

    // Default: Technician jobs
    const items = storeState.jobCards || [];
    return {
      title: 'Workshop Job Cards Activity & Stage Register',
      sqlEquivalent: 'SELECT job_card_no, customer_name, bike_model, stage, technician_name FROM job_cards',
      columns: ['Job Card No', 'Customer', 'Reg No', 'Bike Model', 'Stage', 'Technician', 'Est Cost'],
      rows: items.map((j) => [
        j.jobCardNumber,
        j.customerName,
        j.regNumber,
        j.bikeModel,
        j.stage,
        j.technicianName || 'Master Tech',
        formatMoney(j.estimatedCostPaise || 240000),
      ]),
      metrics: [
        { label: 'Active Jobs', value: items.length },
        { label: 'Ready for Delivery', value: items.filter((x) => x.stage === 'Ready for Delivery').length },
      ],
    };
  },
};
