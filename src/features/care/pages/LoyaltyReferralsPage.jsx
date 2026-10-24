import React, { useState } from 'react';
import { 
  Gift, 
  Award, 
  QrCode, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Share2, 
  CreditCard, 
  Sparkles,
  Search
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

const SAMPLE_MEMBERS = [
  {
    id: 'mem-001',
    customerName: 'Rohit Chandran',
    phone: '+91 98860 99441',
    tier: 'PLATINUM', // SILVER, GOLD, PLATINUM
    pointsBalance: 3450,
    lifetimeSpendPaise: 42500000, // ₹4,25,000
    referralCode: 'ROHIT-ROYAL',
    referralCount: 3,
    referralEarningsPaise: 300000,
    pointsExpiringSoon: 450,
    cardNo: 'VEN-PLT-8841',
    history: [
      { date: '2026-10-15', desc: 'Points earned on 1st Free Service Consumables', points: '+180' },
      { date: '2026-09-20', desc: 'Referral bonus from Deepak Kumar booking', points: '+1000' },
      { date: '2026-08-10', desc: 'Points earned on Himalayan 450 Purchase', points: '+778' },
    ]
  },
  {
    id: 'mem-002',
    customerName: 'Ananya Sharma',
    phone: '+91 98450 12345',
    tier: 'GOLD',
    pointsBalance: 1200,
    lifetimeSpendPaise: 18500000,
    referralCode: 'ANANYA-BIKE',
    referralCount: 1,
    referralEarningsPaise: 100000,
    pointsExpiringSoon: 0,
    cardNo: 'VEN-GLD-1902',
    history: [
      { date: '2026-10-02', desc: 'Redeemed on Riding Helmet purchase', points: '-500' },
      { date: '2026-09-12', desc: 'Earned on Accessories purchase', points: '+240' }
    ]
  },
  {
    id: 'mem-003',
    customerName: 'Arjun Das',
    phone: '+91 98440 77123',
    tier: 'SILVER',
    pointsBalance: 680,
    lifetimeSpendPaise: 9500000,
    referralCode: 'ARJUN-350',
    referralCount: 0,
    referralEarningsPaise: 0,
    pointsExpiringSoon: 120,
    cardNo: 'VEN-SLV-0491',
    history: [
      { date: '2026-10-18', desc: 'Welcome points on Hunter 350 Booking', points: '+500' },
      { date: '2026-10-18', desc: 'Points earned on Crash Guard addition', points: '+180' }
    ]
  }
];

export function LoyaltyReferralsPage() {
  const [members, setMembers] = useState(SAMPLE_MEMBERS);
  const [selectedMember, setSelectedMember] = useState(SAMPLE_MEMBERS[0]);
  const [search, setSearch] = useState('');

  const handleCopyReferral = (code) => {
    navigator.clipboard?.writeText(`https://bikeerpshowroom.com/refer/${code}`);
    toast.success(`Referral link for code "${code}" copied to clipboard!`);
  };

  const filteredMembers = members.filter(m => 
    m.customerName.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.includes(search) ||
    m.referralCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-600" />
            Loyalty Rewards &amp; Referral Program
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Silver, Gold &amp; Platinum member tiers, automated points accumulation engine, QR member cards &amp; referral rewards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search member, phone or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Tier Rules Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Silver Tier</span>
            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">Spend &lt; ₹1.5L</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">1 pt per ₹100 service spend • 5% off accessories</p>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">Gold Tier</span>
            <span className="text-[10px] bg-amber-200 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono">Spend ₹1.5L - ₹3L</span>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">1.5x points multiplier • Free bike polish annually</p>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-300 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase">Platinum Tier</span>
            <span className="text-[10px] bg-purple-200 dark:bg-purple-900/60 px-1.5 py-0.5 rounded font-mono">Spend &gt; ₹3L</span>
          </div>
          <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">2x points multiplier • Priority workshop bay &amp; free pickup</p>
        </div>
      </div>

      {/* Main Grid: Digital Member Card + Points Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Digital QR Member Card */}
        <div className="space-y-4">
          <div className={`p-6 rounded-2xl shadow-xl text-white space-y-4 relative overflow-hidden ${
            selectedMember.tier === 'PLATINUM' ? 'bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900' :
            selectedMember.tier === 'GOLD' ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-stone-900' :
            'bg-gradient-to-br from-slate-600 to-slate-800'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                  Bike ERP Privilege Club
                </span>
                <h3 className="text-lg font-black mt-0.5">{selectedMember.customerName}</h3>
                <span className="text-xs font-mono opacity-90">{selectedMember.cardNo}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-white/20 backdrop-blur-md">
                {selectedMember.tier}
              </span>
            </div>

            <div className="flex justify-between items-end pt-4">
              <div>
                <span className="text-[10px] opacity-75 uppercase block">Redeemable Balance</span>
                <span className="text-2xl font-black font-mono">
                  {selectedMember.pointsBalance} Pts
                </span>
                <div className="text-[10px] opacity-80 mt-0.5">Worth {formatMoney(selectedMember.pointsBalance * 100)} discount</div>
              </div>

              <div className="p-1.5 bg-white rounded-lg shadow-md">
                <QRCodeSVG 
                  value={`BIKE ERP|MEMBER:${selectedMember.cardNo}|PTS:${selectedMember.pointsBalance}`} 
                  size={64} 
                />
              </div>
            </div>
          </div>

          {/* Referral Card */}
          <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                Referral Program Engine
              </h3>
              <span className="text-xs font-bold text-emerald-600 font-mono">
                {selectedMember.referralCount} Referred
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Personal Referral Code</span>
                <span className="text-sm font-mono font-black text-slate-900 dark:text-white">
                  {selectedMember.referralCode}
                </span>
              </div>
              <button
                onClick={() => handleCopyReferral(selectedMember.referralCode)}
                className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Copy Link
              </button>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1">
              <p>• Referrer receives <strong>₹1,000 service credit</strong> upon bike delivery.</p>
              <p>• Friend receives <strong>₹500 accessory discount</strong> on booking.</p>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Member Directory & Transaction Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Member Selection Strip */}
          <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 overflow-x-auto">
            {filteredMembers.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMember(m)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  selectedMember.id === m.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {m.customerName} ({m.tier})
              </button>
            ))}
          </div>

          {/* Points Ledger */}
          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Points Accumulation &amp; Redemption Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Points expire strictly 12 months after earning date under policy compliance.
                </p>
              </div>

              {selectedMember.pointsExpiringSoon > 0 && (
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedMember.pointsExpiringSoon} Pts expire in 30 days
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {selectedMember.history.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">{item.desc}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                  </div>

                  <span className={`text-sm font-mono font-bold ${
                    item.points.startsWith('+') ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {item.points} Pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoyaltyReferralsPage;
