import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatDate } from '../../../lib/format';
import {
  Award,
  PlusCircle,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  XCircle,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';

export function WarrantyAmcPage() {
  const [activeTab, setActiveTab] = useState('CLAIMS'); // 'CLAIMS', 'AMC_PLANS', 'DASHBOARD'
  const [showFileClaimModal, setShowFileClaimModal] = useState(false);

  const [warrantyClaims, setWarrantyClaims] = useState([
    {
      id: 'wcl-001',
      claimNumber: 'WCL/2627/00012',
      customerName: 'Sunil Hegde',
      registrationNumber: 'KA-05-MH-2211',
      modelName: 'Honda SP125',
      failedPart: 'Fuel Injector Solenoid Valve',
      failureReason: 'Premature coil burnout at 7,600 KM within 2-year factory warranty',
      claimAmountPaise: 380000, // ₹3,800
      oemName: 'Honda Motorcycle & Scooter India (HMSI)',
      status: 'REIMBURSED', // FILED, SUBMITTED, APPROVED, REJECTED, REIMBURSED
      filedDate: new Date(Date.now() - 25 * 86400000).toISOString(),
      ageingDays: 25,
      creditNoteNo: 'CN/HMSI/9941',
    },
    {
      id: 'wcl-002',
      claimNumber: 'WCL/2627/00013',
      customerName: 'Arvind V.',
      registrationNumber: 'KA-53-NQ-3344',
      modelName: 'Ather 450X EV',
      failedPart: 'BMS Telematics Controller',
      failureReason: 'Firmware sync fault under 3-year Ather Pro battery & electric warranty',
      claimAmountPaise: 850000, // ₹8,500
      oemName: 'Ather Energy Ltd',
      status: 'SUBMITTED',
      filedDate: new Date(Date.now() - 6 * 86400000).toISOString(),
      ageingDays: 6,
      creditNoteNo: null,
    },
    {
      id: 'wcl-003',
      claimNumber: 'WCL/2627/00014',
      customerName: 'Meenakshi Sundaram',
      registrationNumber: 'KA-01-EQ-9102',
      modelName: 'Royal Enfield Classic 350',
      failedPart: 'Alternator Stator Assembly',
      failureReason: 'Charging voltage drop below 13.2V',
      claimAmountPaise: 420000, // ₹4,200
      oemName: 'Royal Enfield',
      status: 'FILED',
      filedDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      ageingDays: 2,
      creditNoteNo: null,
    },
    {
      id: 'wcl-004',
      claimNumber: 'WCL/2627/00010',
      customerName: 'Kishore Kumar',
      registrationNumber: 'KA-04-AB-1100',
      modelName: 'TVS Apache RTR 160 4V',
      failedPart: 'Rear Brake Master Cylinder',
      failureReason: 'Fluid seal weeping',
      claimAmountPaise: 180000, // ₹1,800
      oemName: 'TVS Motor Company',
      status: 'REJECTED',
      rejectionReason: 'Late filing > 30 days from job card closure',
      filedDate: new Date(Date.now() - 40 * 86400000).toISOString(),
      ageingDays: 40,
      creditNoteNo: null,
    }
  ]);

  const amcPlans = [
    {
      id: 'amc-silver',
      title: 'Silver Maintenance Shield',
      tier: 'SILVER',
      pricePaise: 249900, // ₹2,499 / year
      servicesIncluded: '2 Free Comprehensive General Services + Engine Oil Top-Up + 5% Parts Discount',
      redemptions: '2 of 2 services per year',
      coverageDays: 365,
      activeSubscribers: 215,
    },
    {
      id: 'amc-gold',
      title: 'Bike ERP Gold Rider Annual Care',
      tier: 'GOLD',
      pricePaise: 499900, // ₹4,999 / year
      servicesIncluded: '3 Free Comprehensive Services + 1 Teflon Machine Polish + 10% Consumables Discount',
      redemptions: '3 services + 1 polish',
      coverageDays: 365,
      activeSubscribers: 142,
    },
    {
      id: 'amc-platinum',
      title: 'Bike ERP Platinum Elite Care (350cc+ & EV)',
      tier: 'PLATINUM',
      pricePaise: 799900, // ₹7,999 / year
      servicesIncluded: '4 Comprehensive Services + Unlimited Tubeless Punctures + Free Pick & Drop + 15% Accessories Off',
      redemptions: '4 services + unlimited punctures',
      coverageDays: 365,
      activeSubscribers: 89,
    },
  ];

  const pendingReimbursementPaise = warrantyClaims
    .filter(c => c.status === 'SUBMITTED' || c.status === 'APPROVED' || c.status === 'FILED')
    .reduce((sum, c) => sum + c.claimAmountPaise, 0);

  const reimbursedTotalPaise = warrantyClaims
    .filter(c => c.status === 'REIMBURSED')
    .reduce((sum, c) => sum + c.claimAmountPaise, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Warranty, AMC &amp; OEM Reimbursement Claims
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manufacturer reimbursement claims, warranty tenure verification, and customer recurring AMC maintenance packages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => setShowFileClaimModal(true)}
          >
            File OEM Warranty Claim
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface">
          <div className="text-xs text-text-muted">Pending OEM Recovery</div>
          <div className="text-lg font-bold text-amber-600 mt-1 tabular-nums">
            {formatMoney(pendingReimbursementPaise)}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">3 active claims awaiting credit</div>
        </Card>

        <Card className="p-4 bg-surface">
          <div className="text-xs text-text-muted">Reimbursed This FY</div>
          <div className="text-lg font-bold text-emerald-600 mt-1 tabular-nums">
            {formatMoney(reimbursedTotalPaise)}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">Settled via OEM credit notes</div>
        </Card>

        <Card className="p-4 bg-surface">
          <div className="text-xs text-text-muted">Average Credit TAT</div>
          <div className="text-lg font-bold text-primary mt-1">18 Days</div>
          <div className="text-[11px] text-text-muted mt-0.5">Submission to credit note</div>
        </Card>

        <Card className="p-4 bg-surface">
          <div className="text-xs text-text-muted">Active AMC Subscriptions</div>
          <div className="text-lg font-bold text-indigo-600 mt-1">446 Customers</div>
          <div className="text-[11px] text-text-muted mt-0.5">Annual contracts in force</div>
        </Card>
      </div>

      {/* Toggle View Tabs */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab('CLAIMS')}
          className={`px-4 py-2 font-semibold text-xs border-b-2 transition-colors ${
            activeTab === 'CLAIMS'
              ? 'border-primary text-primary bg-primary/5 rounded-t'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          OEM Claims Lifecycle ({warrantyClaims.length})
        </button>
        <button
          onClick={() => setActiveTab('AMC_PLANS')}
          className={`px-4 py-2 font-semibold text-xs border-b-2 transition-colors ${
            activeTab === 'AMC_PLANS'
              ? 'border-primary text-primary bg-primary/5 rounded-t'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          AMC Maintenance Packages ({amcPlans.length})
        </button>
      </div>

      {activeTab === 'CLAIMS' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                  <th className="p-3.5">Claim #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Vehicle &amp; Reg #</th>
                  <th className="p-3.5">Defective OEM Part</th>
                  <th className="p-3.5">Manufacturer</th>
                  <th className="p-3.5">Claim Amount</th>
                  <th className="p-3.5">Ageing</th>
                  <th className="p-3.5">OEM Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {warrantyClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-primary">{claim.claimNumber}</td>
                    <td className="p-3.5 font-bold text-text-main">{claim.customerName}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-text-main">{claim.modelName}</div>
                      <div className="font-mono text-[10px] text-text-muted">{claim.registrationNumber}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-text-main">{claim.failedPart}</div>
                      <div className="text-[10px] text-text-muted">{claim.failureReason}</div>
                    </td>
                    <td className="p-3.5 text-text-muted">{claim.oemName}</td>
                    <td className="p-3.5 tabular-nums font-bold text-text-main">
                      {formatMoney(claim.claimAmountPaise)}
                    </td>
                    <td className="p-3.5 text-text-muted">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        claim.ageingDays > 30 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {claim.ageingDays}d
                      </span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={claim.status} />
                      {claim.rejectionReason && (
                        <div className="text-[10px] text-red-600 mt-0.5">{claim.rejectionReason}</div>
                      )}
                      {claim.creditNoteNo && (
                        <div className="text-[10px] font-mono text-emerald-600 mt-0.5">{claim.creditNoteNo}</div>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {claim.status === 'FILED' && (
                        <button
                          onClick={() => {
                            setWarrantyClaims(prev => prev.map(c => c.id === claim.id ? { ...c, status: 'SUBMITTED' } : c));
                            toast.success(`Claim ${claim.claimNumber} marked as Submitted to OEM.`);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                        >
                          Submit OEM
                        </button>
                      )}
                      {claim.status === 'SUBMITTED' && (
                        <button
                          onClick={() => {
                            setWarrantyClaims(prev => prev.map(c => c.id === claim.id ? { ...c, status: 'REIMBURSED', creditNoteNo: `CN/OEM/${Date.now().toString().slice(-4)}` } : c));
                            toast.success(`Credit note recorded for ${claim.claimNumber}!`);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100"
                        >
                          Record CN
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {amcPlans.map((plan) => (
            <Card key={plan.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                      {plan.tier}
                    </span>
                    <h3 className="font-bold text-sm text-text-main mt-1">{plan.title}</h3>
                    <div className="text-xs text-text-muted mt-0.5">{plan.redemptions}</div>
                  </div>
                  <span className="text-base font-bold text-primary tabular-nums">
                    {formatMoney(plan.pricePaise)}
                  </span>
                </div>
                <div className="mt-4 p-3 rounded bg-surface-subtle border border-border text-xs text-text-main leading-relaxed">
                  {plan.servicesIncluded}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-muted">
                  Active: <strong className="text-text-main">{plan.activeSubscribers} Subscriptions</strong>
                </span>
                <Button 
                  size="sm" 
                  variant="primary"
                  onClick={() => toast.success(`Initiated enrollment wizard for ${plan.title}`)}
                >
                  Enroll
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* File OEM Claim Modal */}
      {showFileClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              File Defective Part Warranty Claim
            </h3>
            <p className="text-xs text-slate-500">
              Attach technical inspection notes, defective part photo &amp; submit to OEM portal.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowFileClaimModal(false);
                toast.success('Warranty claim registered in FILED status. Ready for OEM portal batch export.');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Customer / Vehicle Reg #</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-01-MJ-4050 (Rahul Dravid)"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Defective OEM Part Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fuel Pump High Pressure Solenoid"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Claim Value (Paise or ₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 3500"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Failure Reason &amp; Diagnostic Details</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe failure under factory warranty limits..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFileClaimModal(false)}
                  className="px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  Save &amp; File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WarrantyAmcPage;
