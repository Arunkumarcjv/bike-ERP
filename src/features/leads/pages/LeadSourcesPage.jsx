import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Shuffle, 
  Sliders, 
  CheckCircle2, 
  ArrowUpRight, 
  Settings, 
  Layers
} from 'lucide-react';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

const SAMPLE_SOURCES = [
  {
    id: 'src-walkin',
    name: 'Showroom Walk-in',
    leadsCount: 142,
    bookingsCount: 38,
    conversionRate: 26.8,
    monthlySpendPaise: 0,
    cplPaise: 0,
    qualityRating: 'EXCELLENT',
  },
  {
    id: 'src-meta',
    name: 'Meta Ads (Facebook & Instagram)',
    leadsCount: 220,
    bookingsCount: 24,
    conversionRate: 10.9,
    monthlySpendPaise: 4500000, // ₹45,000
    cplPaise: 20400, // ₹204
    qualityRating: 'GOOD',
  },
  {
    id: 'src-google',
    name: 'Google Search & Maps (Near Me)',
    leadsCount: 95,
    bookingsCount: 18,
    conversionRate: 18.9,
    monthlySpendPaise: 3500000, // ₹35,000
    cplPaise: 36800, // ₹368
    qualityRating: 'EXCELLENT',
  },
  {
    id: 'src-bikewale',
    name: 'BikeWale Lead Network',
    leadsCount: 88,
    bookingsCount: 11,
    conversionRate: 12.5,
    monthlySpendPaise: 2200000,
    cplPaise: 25000,
    qualityRating: 'AVERAGE',
  },
  {
    id: 'src-zigwheels',
    name: 'ZigWheels Marketplace',
    leadsCount: 64,
    bookingsCount: 7,
    conversionRate: 10.9,
    monthlySpendPaise: 1800000,
    cplPaise: 28100,
    qualityRating: 'AVERAGE',
  },
  {
    id: 'src-oem',
    name: 'OEM Brand Official Website Portal',
    leadsCount: 110,
    bookingsCount: 28,
    conversionRate: 25.5,
    monthlySpendPaise: 0,
    cplPaise: 0,
    qualityRating: 'EXCELLENT',
  },
  {
    id: 'src-wa',
    name: 'WhatsApp QR & Direct Inbound',
    leadsCount: 135,
    bookingsCount: 32,
    conversionRate: 23.7,
    monthlySpendPaise: 500000,
    cplPaise: 3700,
    qualityRating: 'EXCELLENT',
  }
];

export function LeadSourcesPage() {
  const [sources, setSources] = useState(SAMPLE_SOURCES);
  const [routingRule, setRoutingRule] = useState('ROUND_ROBIN'); // 'ROUND_ROBIN', 'BRANCH', 'LANGUAGE'

  const handleSaveRouting = () => {
    toast.success(`Lead auto-assignment rule updated to ${routingRule}`);
  };

  const totalLeads = sources.reduce((sum, s) => sum + s.leadsCount, 0);
  const totalBookings = sources.reduce((sum, s) => sum + s.bookingsCount, 0);
  const overallConversion = ((totalBookings / totalLeads) * 100).toFixed(1);
  const totalAdSpendPaise = sources.reduce((sum, s) => sum + s.monthlySpendPaise, 0);
  const overallCplPaise = Math.round(totalAdSpendPaise / totalLeads);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Lead Sources Hub &amp; Attribution Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track multi-channel inquiry inflow, cost per lead (CPL), ROI conversion rates &amp; configure auto-assignment policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs flex items-center gap-2">
            <span className="text-slate-500">Active Rule:</span>
            <strong className="text-blue-600">{routingRule.replace('_', ' ')}</strong>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">Monthly Inflow Volume</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalLeads} Leads</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across 7 marketing channels</div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">Converted Bookings</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{totalBookings} Bookings</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{overallConversion}% Overall Conversion</div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">Blended Cost Per Lead (CPL)</div>
          <div className="text-2xl font-black text-blue-600 font-mono mt-1">{formatMoney(overallCplPaise)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Includes paid ad spend</div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500">Digital Ad Budget Spend</div>
          <div className="text-2xl font-black text-purple-600 font-mono mt-1">{formatMoney(totalAdSpendPaise)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Meta, Google &amp; Aggregators</div>
        </div>
      </div>

      {/* Auto-Assignment Policy Switcher */}
      <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shuffle className="w-4 h-4 text-blue-600" />
            Automated Inbound Lead Dispatch Policy
          </h2>
          <button
            onClick={handleSaveRouting}
            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
          >
            Apply Policy
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {[
            { id: 'ROUND_ROBIN', label: 'Fair Round-Robin', desc: 'Evenly cycles incoming leads sequentially to available sales executives' },
            { id: 'BRANCH', label: 'Pincode / Branch-Based', desc: 'Directs customer to closest showroom (Central, South, Whitefield)' },
            { id: 'LANGUAGE', label: 'Language & Skill Match', desc: 'Matches Kannada, Tamil, Hindi preference from IVR or WhatsApp intro' },
          ].map(opt => (
            <div
              key={opt.id}
              onClick={() => setRoutingRule(opt.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition space-y-1 ${
                routingRule === opt.id
                  ? 'bg-blue-50/70 border-blue-500 dark:bg-blue-950/40 dark:border-blue-700 shadow-sm'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{opt.label}</span>
                {routingRule === opt.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-500">{opt.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sources Performance Breakdown Table */}
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-500 uppercase tracking-wider">
          Channel Volume &amp; Acquisition Efficiency
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 font-semibold text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Source Channel</th>
                <th className="p-3.5">Leads Captured</th>
                <th className="p-3.5">Bookings Closed</th>
                <th className="p-3.5">Conversion %</th>
                <th className="p-3.5">Monthly Ad Spend</th>
                <th className="p-3.5">Cost Per Lead (CPL)</th>
                <th className="p-3.5 text-right">Lead Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sources.map(src => (
                <tr key={src.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {src.name}
                  </td>
                  <td className="p-3.5 font-bold font-mono">{src.leadsCount}</td>
                  <td className="p-3.5 font-bold font-mono text-emerald-600">{src.bookingsCount}</td>
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-blue-600">{src.conversionRate}%</span>
                  </td>
                  <td className="p-3.5 font-mono">{formatMoney(src.monthlySpendPaise)}</td>
                  <td className="p-3.5 font-mono font-bold">
                    {src.cplPaise > 0 ? formatMoney(src.cplPaise) : 'Free / Organic'}
                  </td>
                  <td className="p-3.5 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      src.qualityRating === 'EXCELLENT' ? 'bg-emerald-100 text-emerald-800' :
                      src.qualityRating === 'GOOD' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {src.qualityRating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LeadSourcesPage;
