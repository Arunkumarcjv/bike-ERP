import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../store';
import { exportToExcel } from '../../lib/download';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  User,
  Activity,
  Code,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AuditLogPage() {
  const store = useStore();
  const rawLogs = store.auditLogs || [];

  // Seed default audit records if empty for realistic demo
  const logs = rawLogs.length > 0 ? rawLogs : [
    {
      id: 'AUD-9012',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      user: 'Rajesh Varma (Super Admin)',
      action: 'INVOICE_POSTED',
      entity: 'INVOICE',
      entityId: 'VI/2627/00001',
      ip: '192.168.1.42',
      oldValue: { status: 'Draft', totalPaise: 19480000 },
      newValue: { status: 'Posted', totalPaise: 19480000, gstr1FilingStatus: 'Ready' },
    },
    {
      id: 'AUD-9011',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      user: 'Pooja Iyer (Accounts)',
      action: 'JOURNAL_VOUCHER_POSTED',
      entity: 'ACCOUNTING',
      entityId: 'JV-2026-081',
      ip: '192.168.1.18',
      oldValue: { status: 'Draft' },
      newValue: { status: 'Approved', totalDebit: 5400000, totalCredit: 5400000 },
    },
    {
      id: 'AUD-9010',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      user: 'Suresh G. (Service Head)',
      action: 'QC_INSPECTION_SIGNED',
      entity: 'JOB_CARD',
      entityId: 'JC-2627-0042',
      ip: '192.168.1.25',
      oldValue: { qcPassed: false, stage: 'Inspection' },
      newValue: { qcPassed: true, stage: 'Ready for Delivery', inspector: 'Suresh G.' },
    },
    {
      id: 'AUD-9009',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      user: 'Sunil Hegde (Inventory)',
      action: 'STOCK_ADJUSTMENT',
      entity: 'SPARE_PART',
      entityId: 'PART-ENG-001',
      ip: '192.168.1.30',
      oldValue: { currentStock: 12 },
      newValue: { currentStock: 15, reason: 'Physical stock tally correction' },
    },
    {
      id: 'AUD-9008',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      user: 'Anand Kumar (Sales Mgr)',
      action: 'DISCOUNT_APPROVED',
      entity: 'QUOTATION',
      entityId: 'QT-2026-104',
      ip: '192.168.1.12',
      oldValue: { discountPaise: 0, status: 'Approval_Pending' },
      newValue: { discountPaise: 350000, status: 'Approved' },
    },
  ];

  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [activeDiffLog, setActiveDiffLog] = useState(null);

  const filteredLogs = logs.filter((log) => {
    if (selectedEntity !== 'ALL' && log.entity !== selectedEntity) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        log.user?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q) ||
        log.entityId?.toLowerCase().includes(q) ||
        log.id?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleExport = () => {
    const rows = filteredLogs.map((l) => ({
      LogId: l.id,
      Timestamp: l.timestamp,
      User: l.user,
      Action: l.action,
      Entity: l.entity,
      EntityId: l.entityId,
      IPAddress: l.ip,
    }));
    exportToExcel(rows, 'Immutable_Audit_Log_Export');
    toast.success('Audit log exported successfully to Excel!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-6 h-6 text-indigo-600" />
            Immutable Statutory Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tamper-evident record of all create, update, approve, post, and delete events captured by store middleware.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Audit CSV / Excel
          </Button>
        </div>
      </div>

      {/* Filter Strip */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by User, Action, Entity ID, or Log Ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Entity Types</option>
              <option value="INVOICE">Invoices</option>
              <option value="ACCOUNTING">Accounting / Journals</option>
              <option value="JOB_CARD">Job Cards</option>
              <option value="SPARE_PART">Spare Parts</option>
              <option value="QUOTATION">Quotations</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Audit Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Log ID</th>
                <th className="p-3">Timestamp (IST)</th>
                <th className="p-3">Actor / User</th>
                <th className="p-3">Action Performed</th>
                <th className="p-3">Entity Type</th>
                <th className="p-3">Entity ID</th>
                <th className="p-3">IP Origin</th>
                <th className="p-3 text-right">Payload Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No audit records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500">{log.id}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">{log.user}</td>
                    <td className="p-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {log.action}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.entity}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-900 dark:text-white font-medium">
                      {log.entityId}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{log.ip}</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveDiffLog(log)}
                        className="text-[11px] h-7 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Inspect Diff
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Diff Inspector Modal */}
      {activeDiffLog && (
        <Modal
          isOpen={!!activeDiffLog}
          onClose={() => setActiveDiffLog(null)}
          title={`Audit Payload Inspector — ${activeDiffLog.id}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400 block">User:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{activeDiffLog.user}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Action:</span>
                <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                  {activeDiffLog.action}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Entity:</span>
                <span className="font-mono text-slate-800 dark:text-white">{activeDiffLog.entity} ({activeDiffLog.entityId})</span>
              </div>
              <div>
                <span className="text-slate-400 block">Timestamp:</span>
                <span className="text-slate-800 dark:text-white">{activeDiffLog.timestamp}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-red-600 uppercase mb-1">
                  Previous State (Old Value)
                </div>
                <pre className="p-3 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-200 rounded-lg text-xs font-mono overflow-x-auto border border-red-200 dark:border-red-900/40 max-h-60">
                  {JSON.stringify(activeDiffLog.oldValue || { state: 'Initial Creation' }, null, 2)}
                </pre>
              </div>

              <div>
                <div className="text-xs font-bold text-emerald-600 uppercase mb-1">
                  Updated State (New Value)
                </div>
                <pre className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 rounded-lg text-xs font-mono overflow-x-auto border border-emerald-200 dark:border-emerald-900/40 max-h-60">
                  {JSON.stringify(activeDiffLog.newValue || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <Button variant="outline" onClick={() => setActiveDiffLog(null)}>
                Close Inspector
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
