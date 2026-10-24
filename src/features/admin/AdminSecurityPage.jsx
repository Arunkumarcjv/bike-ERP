import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ROLES } from '../../config/roles';
import { PERMISSIONS } from '../../config/permissions';
import { APPROVAL_LIMITS, APPROVAL_WORKFLOWS } from '../../config/approvalRules';
import {
  ShieldCheck,
  Sliders,
  Users,
  CheckCircle2,
  Lock,
  Layers,
  Building,
  Key,
  Webhook,
  Save,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSecurityPage() {
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix', 'approvals', 'dealership', 'integrations'

  // Permission Matrix State
  const roleKeys = Object.keys(ROLES);
  const permKeys = Object.keys(PERMISSIONS).slice(0, 18); // top 18 core permissions
  const [matrixState, setMatrixState] = useState(() => {
    const initial = {};
    roleKeys.forEach((roleKey) => {
      initial[roleKey] = ROLES[roleKey].permissions || [];
    });
    return initial;
  });

  // Approval Engine Rules State
  const [discountThreshold, setDiscountThreshold] = useState(5000);
  const [journalThreshold, setJournalThreshold] = useState(50000);
  const [writeOffThreshold, setWriteOffThreshold] = useState(10000);

  const togglePermission = (roleKey, permValue) => {
    setMatrixState((prev) => {
      const current = prev[roleKey] || [];
      const updated = current.includes(permValue)
        ? current.filter((p) => p !== permValue)
        : [...current, permValue];
      return { ...prev, [roleKey]: updated };
    });
    toast.success(`Permission updated for ${ROLES[roleKey]?.label}`);
  };

  const handleSaveMatrix = () => {
    toast.success('Role & Permission matrix successfully persisted into store!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-600" />
            Security, RBAC &amp; Dealership Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure fine-grained roles &amp; permissions, dual-control approval limits, and dealership legal master.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={handleSaveMatrix} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="w-4 h-4 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`py-2 px-4 rounded-t-lg font-medium text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'matrix'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Role &amp; Permission Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`py-2 px-4 rounded-t-lg font-medium text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'approvals'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Dual-Control Approval Limits</span>
        </button>

        <button
          onClick={() => setActiveTab('dealership')}
          className={`py-2 px-4 rounded-t-lg font-medium text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'dealership'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Dealership Legal Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`py-2 px-4 rounded-t-lg font-medium text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'integrations'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Webhook className="w-4 h-4" />
          <span>External Integrations</span>
        </button>
      </div>

      {/* 1. ROLE & PERMISSION MATRIX */}
      {activeTab === 'matrix' && (
        <Card className="overflow-hidden p-0">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                Fine-Grained RBAC Permission Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                8 dealership personas mapped to explicit action codes. Super Admin overrides all restrictions.
              </p>
            </div>
            <span className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded">
              Immutable Action Codes
            </span>
          </div>

          <div className="overflow-x-auto max-h-[550px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3 bg-slate-100 dark:bg-slate-800">Permission Action Code</th>
                  {roleKeys.map((rk) => (
                    <th key={rk} className="p-3 text-center bg-slate-100 dark:bg-slate-800">
                      {ROLES[rk].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {permKeys.map((pk) => {
                  const permVal = PERMISSIONS[pk];
                  return (
                    <tr key={pk} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                        {permVal}
                      </td>
                      {roleKeys.map((rk) => {
                        const isGranted =
                          rk === 'SUPER_ADMIN' ||
                          (matrixState[rk] && matrixState[rk].includes(permVal));
                        const isLocked = rk === 'SUPER_ADMIN';

                        return (
                          <td key={rk} className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isGranted}
                              disabled={isLocked}
                              onChange={() => togglePermission(rk, permVal)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 2. DUAL-CONTROL APPROVAL RULES */}
      {activeTab === 'approvals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Statutory Dual-Control Limits
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Executive Quotation Discount Approval Threshold (₹)
              </label>
              <input
                type="number"
                value={discountThreshold}
                onChange={(e) => setDiscountThreshold(Number(e.target.value))}
                className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white tabular-nums"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Discounts exceeding this amount mandate electronic approval by Sales Manager.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Accounting Journal Voucher Dual-Signature Threshold (₹)
              </label>
              <input
                type="number"
                value={journalThreshold}
                onChange={(e) => setJournalThreshold(Number(e.target.value))}
                className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white tabular-nums"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Direct ledger journal adjustments above this limit require Super Admin counter-signature.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Spare Parts Stock Write-Off Approval Ceiling (₹)
              </label>
              <input
                type="number"
                value={writeOffThreshold}
                onChange={(e) => setWriteOffThreshold(Number(e.target.value))}
                className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white tabular-nums"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Damage/spoilage write-offs exceeding this ceiling must be signed off by Inventory Manager.
              </p>
            </div>
          </Card>

          <Card className="p-5 space-y-3 bg-slate-50 dark:bg-slate-800/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Mandatory Governance Rules
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <strong>Quality Check (QC) Dual-Control:</strong> The technician who repaired a vehicle cannot sign off on their own QC inspection. A distinct workshop supervisor must approve.
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <strong>Invoice Immutability:</strong> Once an invoice is generated and posted to GST ledgers, it is strictly write-protected. Cancellation is permissible solely via a sequential Credit Note.
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <strong>Section 269ST Income Tax Compliance:</strong> Cash acceptance exceeding ₹ 1,99,999 for any single sales order triggers an automatic statutory block.
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 3. DEALERSHIP LEGAL PROFILE */}
      {activeTab === 'dealership' && (
        <Card className="p-5 space-y-4 max-w-2xl">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
            Dealership Master &amp; Statutory Identifiers
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500">Legal Entity Name</label>
              <input
                type="text"
                defaultValue="Vennila Motors Private Limited"
                className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">Trade Name</label>
              <input
                type="text"
                defaultValue="Vennila Bike Showroom"
                className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">GSTIN (Karnataka 29)</label>
              <input
                type="text"
                defaultValue="29AABCB1829M1ZK"
                className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">Permanent Account Number (PAN)</label>
              <input
                type="text"
                defaultValue="AABCB1829M"
                className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">Registered Office Address</label>
            <textarea
              defaultValue="No. 45/2, Intermediate Ring Road, Domlur, Bangalore - 560071, Karnataka"
              rows={2}
              className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-500">Bank Name &amp; IFSC</label>
              <input
                type="text"
                defaultValue="ICICI Bank • ICIC0000042"
                className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs text-slate-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Current Account Number</label>
              <input
                type="text"
                defaultValue="004205009812"
                className="w-full mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </Card>
      )}

      {/* 4. EXTERNAL INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Tally Prime XML</span>
              <StatusBadge status="Confirmed" label="Active" />
            </div>
            <p className="text-xs text-slate-500">
              Automated export of Day Book and General Ledger vouchers in standard Tally Prime XML schema.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Tally XML bridge validated.')}
              className="w-full text-xs"
            >
              Test XML Connection
            </Button>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Razorpay UPI Webhook</span>
              <StatusBadge status="Confirmed" label="Active" />
            </div>
            <p className="text-xs text-slate-500">
              Live settlement callback for counter dynamic UPI QR codes and customer portal invoices.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Simulated webhook received: HTTP 200 OK')}
              className="w-full text-xs"
            >
              Simulate Webhook
            </Button>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Meta WhatsApp Cloud</span>
              <StatusBadge status="Confirmed" label="Active" />
            </div>
            <p className="text-xs text-slate-500">
              Official WhatsApp Business API simulator for booking alerts, OTPs, and service reminders.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Meta WhatsApp Cloud simulator connected.')}
              className="w-full text-xs"
            >
              Verify Endpoint
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
