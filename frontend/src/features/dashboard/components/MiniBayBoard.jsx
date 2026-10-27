import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { useAppStore } from '../../../store';
import { selectBayStats } from '../../../store/selectors/bayStats';
import { ArrowUpRight } from 'lucide-react';

export function MiniBayBoard({ bays = [] }) {
  const navigate = useNavigate();
  const state = useAppStore();
  const stats = selectBayStats(state);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Workshop Bay Allocation (12 Bays)</CardTitle>
          <p className="text-xs text-text-muted mt-0.5">
            {stats.utilisation}% Utilisation • {stats.occupied} Active / {stats.available} Available
          </p>
        </div>
        <button
          onClick={() => navigate('/service/bays')}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>Live Board</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        {/* 12-Bay Visual Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 my-2">
          {bays.map((bay) => {
            let statusStyle = 'bg-surface-subtle border-border text-text-muted';
            let dotColor = 'bg-slate-400';

            if (bay.status === 'OCCUPIED') {
              if (bay.slaStatus === 'BREACHED') {
                statusStyle = 'bg-red-50 border-red-200 text-status-red ring-1 ring-status-red';
                dotColor = 'bg-status-red animate-ping';
              } else {
                statusStyle = 'bg-blue-50 border-blue-200 text-status-blue';
                dotColor = 'bg-status-blue';
              }
            } else if (bay.status === 'FREE') {
              statusStyle = 'bg-green-50 border-green-200 text-status-green';
              dotColor = 'bg-status-green';
            } else if (bay.status === 'MAINTENANCE') {
              statusStyle = 'bg-surface-muted border-border text-text-subtle';
              dotColor = 'bg-slate-400';
            }

            return (
              <div
                key={bay.bayNumber}
                onClick={() => navigate('/service/bays')}
                className={`p-2 rounded-button border text-center cursor-pointer transition-all hover:scale-105 ${statusStyle}`}
                title={`Bay #${bay.bayNumber} - ${bay.status} ${bay.modelName ? `(${bay.modelName})` : ''}`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span>#{String(bay.bayNumber).padStart(2, '0')}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                </div>
                <div className="text-[11px] font-semibold truncate mt-1">
                  {bay.status === 'OCCUPIED' ? bay.modelName || 'Service' : bay.status}
                </div>
                <div className="text-[9px] text-text-muted truncate mt-0.5">
                  {bay.technicianName ? bay.technicianName.split(' ')[0] : bay.type}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend Row - Strict Invariant: categories are mutually exclusive & ALWAYS sum to total */}
        <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5" title="Bays with active in-progress mechanical work">
            <span className="w-2 h-2 rounded-full bg-status-blue" />
            <span className="text-text-muted">Occupied:</span>
            <strong className="text-text-main tabular-nums">{stats.occupied}</strong>
          </div>
          <div className="flex items-center gap-1.5" title="Bays waiting for spare parts delivery">
            <span className="w-2 h-2 rounded-full bg-status-amber" />
            <span className="text-text-muted">Waiting Parts:</span>
            <strong className="text-text-main tabular-nums">{stats.waitingParts}</strong>
          </div>
          <div className="flex items-center gap-1.5" title="Bays undergoing supervisor quality check">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-text-muted">QC:</span>
            <strong className="text-text-main tabular-nums">{stats.qualityCheck}</strong>
          </div>
          <div className="flex items-center gap-1.5" title="Bays with ready vehicles awaiting delivery">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-text-muted">Ready:</span>
            <strong className="text-text-main tabular-nums">{stats.readyForDelivery}</strong>
          </div>
          <div className="flex items-center gap-1.5" title="Free and ready for allocation">
            <span className="w-2 h-2 rounded-full bg-status-green" />
            <span className="text-text-muted">Available:</span>
            <strong className="text-text-main tabular-nums">{stats.available}</strong>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
