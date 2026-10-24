import React, { useState } from 'react';
import { 
  CheckSquare, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  Share2, 
  Smartphone, 
  Send, 
  Eye, 
  Plus, 
  Trash2,
  DollarSign
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

const SAMPLE_INSPECTION_ITEMS = [
  {
    id: 'dvi-tyre-rear',
    category: 'Tyres & Wheels',
    label: 'Rear Tyre Tread Depth',
    value: '1.2 mm',
    status: 'RED', // GREEN, AMBER, RED
    costPaise: 385000, // ₹3,850
    notes: 'Tread depth worn below legal 1.6mm limit. High risk of skidding during rain.',
    photo: true,
  },
  {
    id: 'dvi-brake-front',
    category: 'Braking System',
    label: 'Front Disc Brake Pads',
    value: '85% Worn',
    status: 'RED',
    costPaise: 145000, // ₹1,450
    notes: 'Brake pads down to metal backing plate. Immediate replacement mandatory.',
    photo: true,
  },
  {
    id: 'dvi-battery',
    category: 'Electricals',
    label: 'Battery Terminal & Voltage',
    value: '12.2 Volts',
    status: 'AMBER',
    costPaise: 280000, // ₹2,800
    notes: 'Slightly low holding voltage. Recommended for testing & possible replacement before monsoon.',
    photo: false,
  },
  {
    id: 'dvi-chain',
    category: 'Drive Transmission',
    label: 'Drive Chain & Sprockets',
    value: 'Normal Wear',
    status: 'GREEN',
    costPaise: 0,
    notes: 'Chain cleaned, tension set to 25mm, lubricated with Motul chain lube.',
    photo: false,
  },
  {
    id: 'dvi-fluid',
    category: 'Fluids',
    label: 'Brake Fluid Moisture Level',
    value: 'DOT 4 Moisture 3.5%',
    status: 'AMBER',
    costPaise: 45000, // ₹450
    notes: 'Moisture content elevated. Flushed fluid recommended to prevent spongy lever.',
    photo: false,
  }
];

export function DviPage() {
  const jobCards = useAppStore((state) => state.jobCards || []);
  const [selectedJcId, setSelectedJcId] = useState(jobCards[0]?.id || 'jc-2627-001');
  const [items, setItems] = useState(SAMPLE_INSPECTION_ITEMS);
  const [selectedPin, setSelectedPin] = useState(null);

  const selectedJobCard = jobCards.find(jc => jc.id === selectedJcId) || jobCards[0];

  const updateItemStatus = (id, newStatus) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      return { ...item, status: newStatus };
    }));
  };

  const handleSendApprovalLink = () => {
    const token = 'dvi-token-94821';
    const link = `${window.location.origin}/dvi/${token}`;
    navigator.clipboard?.writeText(link);
    toast.success(`Public DVI link generated and copied! WhatsApp notification triggered to ${selectedJobCard?.customerPhone || 'Customer'}.`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            Digital Vehicle Inspection (DVI)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Multimedia technician inspection with Green/Amber/Red indicators, damage markings &amp; instant WhatsApp customer sign-off.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSendApprovalLink}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
          >
            <Send className="w-4 h-4" />
            Send Customer WhatsApp Approval
          </button>
        </div>
      </div>

      {/* Vehicle Context Bar */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
            JC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedJobCard?.registrationNumber || 'KA-01-MJ-4050'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">
                {selectedJobCard?.modelName || 'Royal Enfield Classic 350'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Customer: {selectedJobCard?.customerName || 'Rahul Dravid'} • Odometer: 14,820 km
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Inspection Status:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            Awaiting Customer Sign-off
          </span>
        </div>
      </div>

      {/* Main Grid: Damage Marking Silhouette & Inspection Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Bike Silhouette & Exterior Damage Map */}
        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-600" />
            Exterior Body &amp; Dent Pin-Map
          </h2>
          <p className="text-xs text-slate-500">
            Click on bike schematic to mark pre-existing scratches, dents, or broken indicators.
          </p>

          {/* Bike Silhouette Schematic */}
          <div className="relative border border-slate-200 dark:border-slate-700 rounded-lg p-6 bg-slate-50 dark:bg-slate-900 flex items-center justify-center min-h-[220px]">
            <svg viewBox="0 0 400 200" className="w-full h-auto text-slate-400 dark:text-slate-600">
              {/* Simplified Motorcycle Outline */}
              <circle cx="80" cy="140" r="40" fill="none" stroke="currentColor" strokeWidth="4" />
              <circle cx="320" cy="140" r="40" fill="none" stroke="currentColor" strokeWidth="4" />
              <path d="M 80 140 L 160 140 L 220 100 L 180 60 L 120 70 Z" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M 220 100 L 320 140" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M 180 60 L 260 60 L 290 85" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M 260 60 L 280 40" fill="none" stroke="currentColor" strokeWidth="4" />
              <circle cx="80" cy="140" r="16" fill="currentColor" opacity="0.3" />
              <circle cx="320" cy="140" r="16" fill="currentColor" opacity="0.3" />
            </svg>

            {/* Damage Marker Pins */}
            <div 
              onClick={() => setSelectedPin('Exhaust scratch')}
              className="absolute left-[55%] top-[60%] w-6 h-6 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-lg animate-pulse"
              title="Exhaust shield scratch"
            >
              1
            </div>
            <div 
              onClick={() => setSelectedPin('Fuel tank chip')}
              className="absolute left-[45%] top-[30%] w-6 h-6 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-lg"
              title="Minor paint chip on tank"
            >
              2
            </div>
          </div>

          <div className="text-xs text-slate-500 space-y-1 pt-1">
            <p className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
              <strong>Pin #1:</strong> Deep scratch on silencer heat shield
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <strong>Pin #2:</strong> 5mm stone chip on fuel tank left decal
            </p>
          </div>
        </div>

        {/* Inspection Points Table & Estimates */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Technical Inspection Items ({items.length})
                </h3>
                <p className="text-xs text-slate-500">Green = OK, Amber = Monitor next service, Red = Urgent replacement</p>
              </div>

              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Supplementary Estimate: <span className="text-blue-600 font-bold">{formatMoney(items.filter(i => i.status !== 'GREEN').reduce((sum, i) => sum + i.costPaise, 0))}</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.label}
                        </span>
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {item.value}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{item.category}</span>
                    </div>

                    {/* Status Pill Selector */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateItemStatus(item.id, 'GREEN')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                          item.status === 'GREEN'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        Green (OK)
                      </button>
                      <button
                        onClick={() => updateItemStatus(item.id, 'AMBER')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                          item.status === 'AMBER'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        Amber (Monitor)
                      </button>
                      <button
                        onClick={() => updateItemStatus(item.id, 'RED')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                          item.status === 'RED'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        Red (Urgent)
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {item.notes}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-3 text-slate-500">
                      {item.photo && (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline">
                          <Eye className="w-3.5 h-3.5" /> 1 Photo Attached
                        </span>
                      )}
                    </div>

                    {item.costPaise > 0 && (
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Est: <span className="font-mono">{formatMoney(item.costPaise)}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DviPage;
