import React, { useState } from 'react';
import { 
  MessageSquareWarning, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  ChevronRight, 
  Phone, 
  Plus, 
  Search, 
  ShieldAlert,
  X
} from 'lucide-react';
import { formatDate } from '../../../lib/format';
import { toast } from 'sonner';

const COMPLAINT_STAGES = [
  { id: 'OPEN', label: 'Open', color: 'border-red-500 text-red-700 bg-red-50 dark:bg-red-950/40' },
  { id: 'ASSIGNED', label: 'Assigned', color: 'border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/40' },
  { id: 'UNDER_INVESTIGATION', label: 'Under Investigation', color: 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/40' },
  { id: 'RESOLUTION_PROPOSED', label: 'Resolution Proposed', color: 'border-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-950/40' },
  { id: 'CLOSED', label: 'Closed & Verified', color: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40' },
];

const SAMPLE_COMPLAINTS = [
  {
    id: 'cmp-001',
    ticketNo: 'CMP/2627/0042',
    customerName: 'Vinay Bhaskar',
    phone: '+91 98451 88440',
    vehicle: 'Royal Enfield Hunter 350 (KA-01-MJ-9912)',
    category: 'Service Quality',
    issue: 'Engine oil leakage observed immediately after 2nd general service.',
    stage: 'OPEN',
    createdAt: new Date(Date.now() - 32 * 3600000).toISOString(), // 32 hours ago
    slaHoursRemaining: 16,
    escalationLevel: 'SERVICE_MANAGER', // ADVISOR (<24h), SERVICE_MANAGER (24-48h), PRINCIPAL (>48h)
    assignedTo: 'Karthik Raja (Service Manager)',
  },
  {
    id: 'cmp-002',
    ticketNo: 'CMP/2627/0043',
    customerName: 'Aishwarya Raman',
    phone: '+91 97401 22990',
    vehicle: 'TVS iQube EV (KA-03-EV-1144)',
    category: 'Billing Discrepancy',
    issue: 'Discrepancy in extended warranty charging amount compared to sales quote.',
    stage: 'ASSIGNED',
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    slaHoursRemaining: 38,
    escalationLevel: 'ADVISOR',
    assignedTo: 'Deepak Rao (Sales Executive)',
  },
  {
    id: 'cmp-003',
    ticketNo: 'CMP/2627/0040',
    customerName: 'Kishore Kumar',
    phone: '+91 98860 11234',
    vehicle: 'Honda SP125 (KA-05-AB-5511)',
    category: 'Part Delay',
    issue: 'Rear shock absorber replacement part delayed over 14 days.',
    stage: 'UNDER_INVESTIGATION',
    createdAt: new Date(Date.now() - 52 * 3600000).toISOString(), // 52 hours ago -> SLA breach!
    slaHoursRemaining: -4,
    escalationLevel: 'DEALER_PRINCIPAL',
    assignedTo: 'Rajesh Varma (Dealer Principal)',
  },
  {
    id: 'cmp-004',
    ticketNo: 'CMP/2627/0039',
    customerName: 'Sanjay Reddy',
    phone: '+91 99002 44331',
    vehicle: 'Royal Enfield Himalayan 450 (KA-01-NJ-8810)',
    category: 'Delivery PDI',
    issue: 'Small scratch on exhaust heat shield noted during handover.',
    stage: 'CLOSED',
    createdAt: new Date(Date.now() - 90 * 3600000).toISOString(),
    slaHoursRemaining: 0,
    escalationLevel: 'RESOLVED',
    assignedTo: 'Ananya Sharma',
    resolutionNote: 'Free heat shield replacement completed under dealer goodwill. Customer signed satisfaction note.',
  }
];

export function ComplaintsPage() {
  const [complaints, setComplaints] = useState(SAMPLE_COMPLAINTS);
  const [search, setSearch] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionText, setResolutionText] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  const handleAdvanceStage = (complaintId, nextStage) => {
    setComplaints(prev => prev.map(c => {
      if (c.id !== complaintId) return c;
      return { ...c, stage: nextStage };
    }));
    toast.success(`Complaint moved to ${nextStage}`);
  };

  const handleCloseComplaint = (e) => {
    e.preventDefault();
    if (!resolutionText.trim()) {
      toast.error('Please enter a resolution summary');
      return;
    }

    setComplaints(prev => prev.map(c => {
      if (c.id !== selectedComplaint.id) return c;
      return { 
        ...c, 
        stage: 'CLOSED', 
        resolutionNote: resolutionText.trim(),
        escalationLevel: 'RESOLVED'
      };
    }));

    toast.success(`Complaint ${selectedComplaint.ticketNo} closed and resolution recorded!`);
    setSelectedComplaint(null);
    setResolutionText('');
  };

  const filtered = complaints.filter(c => 
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.ticketNo.toLowerCase().includes(search.toLowerCase()) ||
    c.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-red-500" />
            Customer Grievance &amp; Complaints Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            5-stage SLA resolution Kanban, 24h/48h auto-escalation ladder &amp; customer sign-off verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Log New Grievance
          </button>
        </div>
      </div>

      {/* SLA Escalation Policy Banner */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>
            <strong>Resolution Escalation Ladder:</strong> Service Advisor (0-24h) <ChevronRight className="w-3 h-3 inline" /> Service Manager (24-48h) <ChevronRight className="w-3 h-3 inline" /> <strong className="text-red-600">Dealer Principal (&gt;48h Breach)</strong>
          </span>
        </div>
        <span className="font-semibold text-slate-500">Max SLA: 48 Hours</span>
      </div>

      {/* 5-Stage Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {COMPLAINT_STAGES.map(stage => {
          const ticketsInStage = filtered.filter(c => c.stage === stage.id);
          return (
            <div 
              key={stage.id} 
              className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[650px] overflow-hidden"
            >
              <div className={`p-3 border-b border-l-4 font-bold text-xs flex items-center justify-between ${stage.color}`}>
                <span>{stage.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-[11px] font-mono">
                  {ticketsInStage.length}
                </span>
              </div>

              <div className="p-3 overflow-y-auto space-y-3 flex-1">
                {ticketsInStage.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400">
                    No tickets
                  </div>
                ) : (
                  ticketsInStage.map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedComplaint(ticket)}
                      className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md transition cursor-pointer space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-600">
                          {ticket.ticketNo}
                        </span>
                        {ticket.slaHoursRemaining < 0 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                            SLA BREACH
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {ticket.slaHoursRemaining}h left
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-slate-900 dark:text-white">
                        {ticket.customerName}
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                        {ticket.issue}
                      </p>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="truncate max-w-[120px]">{ticket.assignedTo}</span>
                        <span className="font-semibold text-blue-600">{ticket.category}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolution & Escalation Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600">{selectedComplaint.ticketNo}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedComplaint.customerName} — {selectedComplaint.category}
                </h3>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <p><strong>Vehicle:</strong> {selectedComplaint.vehicle}</p>
              <p><strong>Phone:</strong> {selectedComplaint.phone}</p>
              <p><strong>Owner:</strong> {selectedComplaint.assignedTo}</p>
              <p><strong>Issue Reported:</strong> {selectedComplaint.issue}</p>
            </div>

            {selectedComplaint.escalationLevel === 'DEALER_PRINCIPAL' && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs flex items-center gap-2 text-red-800 dark:text-red-300 font-semibold">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>Ticket escalated to Dealer Principal due to 48-hour SLA breach!</span>
              </div>
            )}

            {selectedComplaint.stage !== 'CLOSED' ? (
              <form onSubmit={handleCloseComplaint} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Resolution Note (Customer Sign-off Required)
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe action taken, goodwill discount, or part replacement..."
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = 
                        selectedComplaint.stage === 'OPEN' ? 'ASSIGNED' :
                        selectedComplaint.stage === 'ASSIGNED' ? 'UNDER_INVESTIGATION' : 'RESOLUTION_PROPOSED';
                      handleAdvanceStage(selectedComplaint.id, next);
                      setSelectedComplaint(null);
                    }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200"
                  >
                    Advance to Next Stage
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-sm"
                  >
                    Resolve &amp; Close Ticket
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs space-y-1 text-emerald-950 dark:text-emerald-200">
                <span className="font-bold flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" /> Resolution Completed
                </span>
                <p>{selectedComplaint.resolutionNote}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintsPage;
