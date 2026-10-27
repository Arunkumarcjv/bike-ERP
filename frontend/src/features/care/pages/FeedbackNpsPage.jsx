import React, { useState } from 'react';
import { 
  Star, 
  Smile, 
  Meh, 
  Frown, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  Send, 
  Filter, 
  MessageSquare
} from 'lucide-react';
import { formatDate } from '../../../lib/format';
import { toast } from 'sonner';

const SAMPLE_FEEDBACK = [
  {
    id: 'fb-01',
    customerName: 'Priya Singh',
    phone: '+91 98450 12345',
    type: 'DELIVERY', // DELIVERY or SERVICE
    vehicle: 'Royal Enfield Himalayan 450',
    rating: 5,
    npsScore: 10, // 0 to 10
    comment: 'Flawless delivery experience by Deepak! Vehicle was polished, all documents ready on time.',
    date: '2026-10-24',
    escalatedToComplaint: false,
  },
  {
    id: 'fb-02',
    customerName: 'Girish Patil',
    phone: '+91 97402 33445',
    type: 'SERVICE',
    vehicle: 'Honda SP125',
    rating: 2,
    npsScore: 3,
    comment: 'Service took 4 hours more than promised and water wash was poorly done. Chain was not greased.',
    date: '2026-10-23',
    escalatedToComplaint: true,
    complaintOwner: 'Karthik Raja (Service Manager)',
  },
  {
    id: 'fb-03',
    customerName: 'Arjun Das',
    phone: '+91 98860 99441',
    type: 'DELIVERY',
    vehicle: 'Royal Enfield Hunter 350',
    rating: 5,
    npsScore: 10,
    comment: 'PDI was detailed and explained clearly. Excellent tea and showroom ambiance.',
    date: '2026-10-22',
    escalatedToComplaint: false,
  },
  {
    id: 'fb-04',
    customerName: 'Ramesh Shenoy',
    phone: '+91 99001 55667',
    type: 'SERVICE',
    vehicle: 'TVS iQube EV',
    rating: 3,
    npsScore: 5,
    comment: 'Good staff but software update took too long due to OEM server slowness.',
    date: '2026-10-21',
    escalatedToComplaint: true,
    complaintOwner: 'Ananya Sharma',
  },
  {
    id: 'fb-05',
    customerName: 'Anil Deshmukh',
    phone: '+91 98440 88991',
    type: 'SERVICE',
    vehicle: 'Royal Enfield Classic 350',
    rating: 5,
    npsScore: 9,
    comment: 'Manoj Kumar did fantastic tuning on the tappets. Bike feels brand new.',
    date: '2026-10-20',
    escalatedToComplaint: false,
  }
];

export function FeedbackNpsPage() {
  const [feedbackList, setFeedbackList] = useState(SAMPLE_FEEDBACK);
  const [filterType, setFilterType] = useState('ALL');

  // Compute NPS: % Promoters (9-10) - % Detractors (0-6)
  const totalResponses = feedbackList.length;
  const promoters = feedbackList.filter(f => f.npsScore >= 9).length;
  const passives = feedbackList.filter(f => f.npsScore >= 7 && f.npsScore <= 8).length;
  const detractors = feedbackList.filter(f => f.npsScore <= 6).length;

  const npsScore = Math.round(((promoters - detractors) / totalResponses) * 100);
  const averageCsat = (feedbackList.reduce((sum, f) => sum + f.rating, 0) / totalResponses).toFixed(1);

  const handleManualEscalation = (item) => {
    toast.success(`Complaint task created for ${item.customerName}! Assigned to Service Manager.`);
    setFeedbackList(prev => prev.map(f => f.id === item.id ? { ...f, escalatedToComplaint: true, complaintOwner: 'Service Manager' } : f));
  };

  const filtered = feedbackList.filter(f => filterType === 'ALL' || f.type === filterType);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            Customer Feedback &amp; Net Promoter Score (NPS)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated WhatsApp post-delivery and post-service survey sentiment, CSAT rating &amp; low-score complaint escalation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'DELIVERY', 'SERVICE'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                filterType === type
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {type === 'ALL' ? 'All Surveys' : `${type} Surveys`}
            </button>
          ))}
        </div>
      </div>

      {/* NPS Scoreboard Gauge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Net Promoter Score */}
        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Net Promoter Score (NPS)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-600 font-mono">+{npsScore}</span>
              <span className="text-xs text-slate-400">(-100 to +100)</span>
            </div>
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-2">
            World-class benchmark (&gt; +50)
          </div>
        </div>

        {/* CSAT Star Average */}
        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Average CSAT Rating</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{averageCsat}</span>
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Based on {totalResponses} verified customers</div>
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Sentiment Breakdown</span>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-emerald-600">
              <span className="flex items-center gap-1"><Smile className="w-3.5 h-3.5" /> Promoters (9-10)</span>
              <strong className="font-mono">{promoters} ({Math.round(promoters/totalResponses*100)}%)</strong>
            </div>
            <div className="flex justify-between items-center text-amber-500">
              <span className="flex items-center gap-1"><Meh className="w-3.5 h-3.5" /> Passives (7-8)</span>
              <strong className="font-mono">{passives} ({Math.round(passives/totalResponses*100)}%)</strong>
            </div>
            <div className="flex justify-between items-center text-red-500">
              <span className="flex items-center gap-1"><Frown className="w-3.5 h-3.5" /> Detractors (0-6)</span>
              <strong className="font-mono">{detractors} ({Math.round(detractors/totalResponses*100)}%)</strong>
            </div>
          </div>
        </div>

        {/* Auto Escalation Engine */}
        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Negative Rating Escalation</span>
            <div className="text-xl font-bold text-red-600 mt-1">
              {feedbackList.filter(f => f.rating <= 3).length} Auto-Logged
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Ratings &le; 3 stars create urgent complaint tickets within 60 seconds automatically.
          </p>
        </div>
      </div>

      {/* Survey Feed Table */}
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-500 uppercase tracking-wider">
          Recent Survey Responses ({filtered.length})
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map(item => (
            <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.type === 'DELIVERY' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.type}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.customerName}
                  </h3>
                  <div className="flex text-amber-500">
                    {Array.from({ length: item.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                  "{item.comment}"
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Vehicle: {item.vehicle}</span>
                  <span>•</span>
                  <span>Date: {item.date}</span>
                </div>
              </div>

              {/* Status & Escalation Action */}
              <div className="flex items-center gap-3 shrink-0">
                {item.rating <= 3 ? (
                  item.escalatedToComplaint ? (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-red-100 text-red-800">
                        <AlertTriangle className="w-3.5 h-3.5" /> Complaint Active
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.complaintOwner}</div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleManualEscalation(item)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm"
                    >
                      Escalate to Complaint
                    </button>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Satisfied Customer
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeedbackNpsPage;
