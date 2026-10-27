import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowUpRight, CheckCircle2, CloudOff, RefreshCw, ServerCrash, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { useAppStore } from '../../../store';
import { backend } from '../../../services/api/backend';
import { formatDate, formatMoney } from '../../../lib/format';

const POLL_MS = 30_000;
const SWAGGER_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/v1\/?$/, '') + '/api/docs/';

const STATUS_META = {
  offline: { label: 'Offline demo data', className: 'bg-slate-100 text-slate-600', icon: CloudOff },
  disconnected: { label: 'Not connected', className: 'bg-amber-50 text-status-amber', icon: CloudOff },
  syncing: { label: 'Syncing…', className: 'bg-blue-50 text-status-blue', icon: RefreshCw },
  live: { label: 'Live · Django API', className: 'bg-green-50 text-status-green', icon: CheckCircle2 },
  error: { label: 'Server unreachable', className: 'bg-red-50 text-status-red', icon: ServerCrash },
};

function StatTile({ label, value, tone = 'text-text-main' }) {
  return (
    <div className="p-3 rounded bg-surface-subtle border border-border">
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-bold tabular-nums mt-0.5 ${tone}`}>{value}</div>
    </div>
  );
}

/**
 * Backend health, server-verified KPIs, API request log and audit trail. Falls back to the
 * local audit trail when the app runs without VITE_API_BASE_URL.
 */
export function SystemActivityPanel({ localMetrics }) {
  const navigate = useNavigate();
  const backendStatus = useAppStore((s) => s.backendStatus);
  const lastSyncedAt = useAppStore((s) => s.lastSyncedAt);
  const localAudit = useAppStore((s) => s.auditLogs || []);
  const refreshFromBackend = useAppStore((s) => s.refreshFromBackend);
  const [activity, setActivity] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const connected = backend.enabled() && backend.isLoggedIn();

  useEffect(() => {
    if (!connected) return undefined;
    let cancelled = false;
    const load = () =>
      Promise.all([backend.activity(), backend.dashboardSummary(useAppStore.getState().activeBranchId)])
        .then(([act, sum]) => {
          if (cancelled) return;
          setActivity(act);
          setSummary(sum);
          setError(null);
        })
        .catch((err) => !cancelled && setError(err.message));
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [connected, lastSyncedAt]);

  const meta = STATUS_META[backendStatus] || STATUS_META.offline;
  const StatusIcon = meta.icon;
  const auditRows = (connected ? activity?.recentAudit : localAudit) || [];
  const stats = activity?.requestStats24h;
  const reconciled = summary && summary.grossSalesTodayPaise === localMetrics.grossSalesTodayPaise;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>System Activity & Logs</CardTitle>
          <p className="text-xs text-text-muted mt-0.5">
            {connected
              ? `Tenant data synced ${lastSyncedAt ? formatDate(lastSyncedAt, 'HH:mm:ss') : '—'} · API logs (last 24h)`
              : 'Audit trail of actions on this device'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${meta.className}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {meta.label}
          </span>
          {connected && (
            <button
              onClick={refreshFromBackend}
              className="p-1.5 rounded hover:bg-surface-subtle text-text-muted"
              title="Re-sync from server"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {connected && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile label="API calls (24h)" value={stats?.total ?? '—'} />
              <StatTile
                label="Errors (4xx/5xx)"
                value={stats ? `${stats.errors} / ${stats.serverErrors}` : '—'}
                tone={stats?.serverErrors ? 'text-status-red' : 'text-text-main'}
              />
              <StatTile label="Avg latency" value={stats ? `${stats.avgDurationMs} ms` : '—'} />
              <StatTile
                label="Server-verified sales today"
                value={summary ? formatMoney(summary.grossSalesTodayPaise) : '—'}
                tone={summary && !reconciled ? 'text-status-amber' : 'text-status-green'}
              />
            </div>
            {summary && (
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <ShieldCheck className={`w-3.5 h-3.5 ${reconciled ? 'text-status-green' : 'text-status-amber'}`} />
                {reconciled
                  ? 'Dashboard KPIs match the server calculation.'
                  : 'Dashboard differs from server — a local change may still be syncing.'}
                <a href={SWAGGER_URL} target="_blank" rel="noreferrer" className="ml-auto text-primary hover:underline">
                  API docs (Swagger)
                </a>
              </div>
            )}
            {error && <div className="text-xs text-status-red">Could not load server activity: {error}</div>}
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Audit trail
            </div>
            <div className="divide-y divide-border/60 border border-border rounded">
              {auditRows.slice(0, 8).map((log) => (
                <div key={log.id} className="px-3 py-2 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-semibold text-text-main truncate">{log.action.replace(/_/g, ' ')}</div>
                    <div className="text-[10px] text-text-muted truncate">
                      {log.userName} · {log.entityType} {log.entityId}
                    </div>
                  </div>
                  <span className="text-[10px] text-text-muted whitespace-nowrap tabular-nums">
                    {formatDate(log.timestamp, 'dd MMM HH:mm')}
                  </span>
                </div>
              ))}
              {auditRows.length === 0 && (
                <div className="px-3 py-4 text-xs text-text-muted text-center">
                  {connected && activity && !activity.canViewLogs
                    ? 'Log details are visible to Super Admin and Accountant roles.'
                    : 'No activity recorded yet.'}
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/admin/audit-log')}
              className="mt-2 text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Full audit log <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {connected && (
            <div>
              <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                Recent API requests
              </div>
              <div className="divide-y divide-border/60 border border-border rounded">
                {(activity?.recentRequests || []).slice(0, 8).map((req) => (
                  <div key={req.id} className="px-3 py-2 flex items-center gap-2 text-xs">
                    <span className="font-mono text-[10px] font-bold w-12 text-text-muted">{req.method}</span>
                    <span className="font-mono text-[11px] text-text-main truncate flex-1">{req.path}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums ${
                        req.statusCode >= 500
                          ? 'bg-red-100 text-status-red'
                          : req.statusCode >= 400
                          ? 'bg-amber-100 text-status-amber'
                          : 'bg-green-100 text-status-green'
                      }`}
                    >
                      {req.statusCode}
                    </span>
                    <span className="text-[10px] text-text-muted tabular-nums w-12 text-right">{req.durationMs} ms</span>
                  </div>
                ))}
                {!activity?.recentRequests?.length && (
                  <div className="px-3 py-4 text-xs text-text-muted text-center">No requests logged yet.</div>
                )}
              </div>
            </div>
          )}

          {!backend.enabled() && (
            <div className="p-4 rounded border border-dashed border-border text-xs text-text-muted leading-relaxed">
              Running on offline demo data. Set <code className="font-mono">VITE_API_BASE_URL</code> (see backend/README.md)
              to connect the Django API — the dashboard then shows server-verified KPIs, API request logs and the
              tenant audit trail.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
