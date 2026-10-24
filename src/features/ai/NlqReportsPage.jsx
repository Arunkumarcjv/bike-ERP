import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store';
import { aiClient } from '../../services/ai/aiClient';
import { exportToExcel } from '../../lib/download';
import {
  FileSpreadsheet,
  Search,
  Sparkles,
  Download,
  Database,
  ArrowRight,
  Code,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

export default function NlqReportsPage() {
  const store = useStore();
  const [query, setQuery] = useState('Show all pending insurance renewals expiring soon');
  const [reportData, setReportData] = useState(() =>
    aiClient.translateNlq('Show all pending insurance renewals expiring soon', store)
  );

  const handleRunNlq = (customQuery = null) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    try {
      const result = aiClient.translateNlq(q, store);
      setReportData(result);
      if (customQuery) setQuery(customQuery);
      toast.success(`Generated report: ${result.title}`);
    } catch (err) {
      toast.error('Query translation failed: ' + err.message);
    }
  };

  const handleExportExcel = () => {
    if (!reportData) return;
    const exportRows = reportData.rows.map((row) => {
      const obj = {};
      reportData.columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
    exportToExcel(exportRows, reportData.title.replace(/\s+/g, '_'));
    toast.success('Report successfully exported to Excel (.xlsx)!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            Natural-Language Executive Reporting
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate custom operational and financial reports instantly by asking plain English questions.
          </p>
        </div>

        {reportData && (
          <Button variant="outline" onClick={handleExportExcel} className="self-start md:self-auto">
            <Download className="w-4 h-4 mr-2 text-emerald-600" />
            Export to Excel (.xlsx)
          </Button>
        )}
      </div>

      {/* Query Bar */}
      <Card className="p-4 bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. 'Show spare parts below reorder level' or 'Show all delivered sales orders'..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunNlq()}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>
          <Button
            variant="primary"
            onClick={() => handleRunNlq()}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Generate Report
          </Button>
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Examples:</span>
          <button
            onClick={() => handleRunNlq('Show all pending insurance renewals expiring soon')}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 transition"
          >
            Insurance Renewals
          </button>
          <button
            onClick={() => handleRunNlq('List critical spare parts below safety reorder level')}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 transition"
          >
            Parts Below Reorder
          </button>
          <button
            onClick={() => handleRunNlq('Show all showroom vehicle sales orders and deliveries')}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 transition"
          >
            Sales Orders Register
          </button>
          <button
            onClick={() => handleRunNlq('Workshop job cards and active service stages')}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 transition"
          >
            Active Job Cards
          </button>
        </div>
      </Card>

      {/* Generated Report View */}
      {reportData && (
        <div className="space-y-4">
          {/* Metadata & Summary Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {reportData.title}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 font-mono text-xs text-slate-500">
                <Code className="w-3.5 h-3.5 text-blue-500" />
                <span>{reportData.sqlEquivalent}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {reportData.metrics?.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-right"
                >
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">{m.label}</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* TanStack Table Card */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    {reportData.columns.map((col, idx) => (
                      <th key={idx} className="p-3 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reportData.rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={reportData.columns.length}
                        className="p-8 text-center text-slate-400"
                      >
                        No matching records found for this natural language filter.
                      </td>
                    </tr>
                  ) : (
                    reportData.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`p-3 whitespace-nowrap text-slate-800 dark:text-slate-200 ${
                              cIdx === 0 ? 'font-mono font-medium text-slate-900 dark:text-white' : ''
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {reportData.rows.length} rows</span>
              <span>Direct live projection from browser IndexedDB store</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
