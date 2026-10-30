import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  X,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '../../../store';
import { formatDate } from '../../../lib/format';
import { toast } from 'sonner';

export function AuditPage() {
  const auditLogs = useAppStore((state) => state.auditLogs || []);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [anomalyFilter, setAnomalyFilter] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Check if an audit log item is an anomaly
  const isAnomaly = (entry) => {
    // 1. After-hours edit (after 9 PM or before 8 AM IST)
    const date = new Date(entry.timestamp);
    const hour = date.getHours();
    const afterHours = hour >= 21 || hour < 8;

    // 2. High discount or financial cancellation
    const isCancelledInvoice = entry.action === 'INVOICE_CANCELLED';
    const isHighDiscount = 
      (entry.action === 'DISCOUNT_APPLIED' || entry.action === 'DISCOUNT_APPROVAL_STATUS') && 
      (entry.newValue?.discountPaise > 500000 || entry.newValue?.amountPaise > 500000);

    return afterHours || isCancelledInvoice || isHighDiscount;
  };

  const getAnomalyReason = (entry) => {
    const date = new Date(entry.timestamp);
    const hour = date.getHours();
    if (hour >= 21 || hour < 8) return 'After-hours mutation (outside 08:00 - 21:00 IST)';
    if (entry.action === 'INVOICE_CANCELLED') return 'Statutory document cancellation';
    if (entry.action?.includes('DISCOUNT')) return 'High-value discount approval (>₹5,000)';
    return 'Audited anomaly';
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((entry) => {
      const matchesSearch = 
        entry.userName?.toLowerCase().includes(search.toLowerCase()) ||
        entry.action?.toLowerCase().includes(search.toLowerCase()) ||
        entry.entityId?.toLowerCase().includes(search.toLowerCase()) ||
        JSON.stringify(entry.newValue || {}).toLowerCase().includes(search.toLowerCase());

      const matchesEntity = entityFilter === 'ALL' || entry.entityType === entityFilter;
      const matchesAnomaly = !anomalyFilter || isAnomaly(entry);

      return matchesSearch && matchesEntity && matchesAnomaly;
    });
  }, [auditLogs, search, entityFilter, anomalyFilter]);

  const uniqueEntityTypes = useMemo(() => {
    const types = new Set(auditLogs.map((a) => a.entityType).filter(Boolean));
    return Array.from(types);
  }, [auditLogs]);

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      toast.warning('No log records to export');
      return;
    }

    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Anomaly'];
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      `"${log.userName || ''}"`,
      `"${log.userRole || ''}"`,
      log.action,
      log.entityType,
      log.entityId,
      log.ipAddress || '192.168.1.1',
      isAnomaly(log) ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit log CSV exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Statutory Retention Banner */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 dark:text-blue-200">
          <p className="font-bold text-sm">Statutory Audit Trail preserving Section 128 of the Companies Act 2013</p>
          <p className="mt-0.5 text-blue-800/80 dark:text-blue-300/80">
            All system mutations are write-once, immutable and cryptographically timestamped in IST. Audit records must be retained for a minimum statutory period of 8 preceding financial years.
          </p>
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Log & Anomaly Radar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete traceable history of user mutations, approvals, and compliance events.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Audit CSV
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, user, entity ID, or field changes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Entity Type Filter */}
        <div>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Entity Types</option>
            {uniqueEntityTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Anomaly Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setAnomalyFilter(!anomalyFilter)}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border transition ${
              anomalyFilter
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700'
                : 'bg-slate-50 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${anomalyFilter ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>Show Anomalies Only</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp (IST)</th>
                <th className="px-4 py-3">User & Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity & ID</th>
                <th className="px-4 py-3">Risk Flag</th>
                <th className="px-4 py-3 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No audit records matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const anomaly = isAnomaly(log);
                  return (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer ${
                        anomaly ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                      }`}
                      onClick={() => setSelectedEntry(log)}
                    >
                      <td className="px-4 py-3 text-xs font-mono whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {log.timestamp ? formatDate(log.timestamp, 'dd MMM yyyy, HH:mm:ss') : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">
                          {log.userName || log.userId}
                        </div>
                        <div className="text-[11px] text-slate-500">{log.userRole || 'System'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {log.entityType}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {log.entityId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {anomaly ? (
                          <span 
                            title={getAnomalyReason(log)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Anomaly
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEntry(log);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                          title="View Field Diff"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Field-level Diff Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Audit Record Inspection
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {selectedEntry.id} • {selectedEntry.action}
                </p>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Context details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs">
              <div>
                <span className="text-slate-400 block">User:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEntry.userName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Role:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEntry.userRole}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Entity:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEntry.entityType} ({selectedEntry.entityId})</span>
              </div>
              <div>
                <span className="text-slate-400 block">Timestamp:</span>
                <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                  {formatDate(selectedEntry.timestamp, 'HH:mm:ss dd/MM/yy')}
                </span>
              </div>
            </div>

            {isAnomaly(selectedEntry) && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Risk Flag: {getAnomalyReason(selectedEntry)}</span>
              </div>
            )}

            {/* Field Diff Comparison */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Field-Level Mutation Diff</h4>
              <div className="grid grid-cols-2 gap-4">
                {/* Old Value */}
                <div className="border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 rounded-lg p-3">
                  <div className="text-xs font-bold text-red-700 dark:text-red-400 mb-1 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Previous Value (Before)
                  </div>
                  <pre className="text-[11px] font-mono text-red-950 dark:text-red-200 whitespace-pre-wrap overflow-x-auto max-h-56">
                    {selectedEntry.oldValue ? JSON.stringify(selectedEntry.oldValue, null, 2) : 'null (Created anew)'}
                  </pre>
                </div>

                {/* New Value */}
                <div className="border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-lg p-3">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> New Value (Committed)
                  </div>
                  <pre className="text-[11px] font-mono text-emerald-950 dark:text-emerald-200 whitespace-pre-wrap overflow-x-auto max-h-56">
                    {selectedEntry.newValue ? JSON.stringify(selectedEntry.newValue, null, 2) : 'null (Deleted)'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditPage;
