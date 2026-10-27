import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { formatMoney } from '../../../lib/format';
import { TrendingUp, FileCheck, Wrench, ReceiptIndianRupee, ArrowUpRight } from 'lucide-react';

export function DashboardKpis({ metrics }) {
  const navigate = useNavigate();

  const kpis = [
    {
      id: 'gross-sales',
      title: 'Gross Sales Today',
      value: formatMoney(metrics.grossSalesTodayPaise),
      subtext: `${metrics.invoicesClosedCount} invoices posted today`,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-blue-50',
      link: '/billing',
    },
    {
      id: 'invoices-target',
      title: 'Invoices vs Target',
      value: `${metrics.vehicleTargetPercentage}%`,
      subtext: `${metrics.vehicleInvoicesCount} of ${metrics.dailyVehicleTarget} vehicles (${metrics.serviceInvoicesCount} service/parts)`,
      icon: FileCheck,
      color: 'text-status-green',
      bgColor: 'bg-green-50',
      link: '/billing',
    },
    {
      id: 'bay-utilisation',
      title: 'Service Bay Utilisation',
      value: `${metrics.bayUtilisationPercentage}%`,
      subtext: metrics.baySubtext || `${metrics.activeBaysCount} active / ${metrics.readyBaysCount} available (${metrics.bayStats?.total || 12} total)`,
      icon: Wrench,
      color: 'text-status-amber',
      bgColor: 'bg-amber-50',
      link: '/service/bays',
    },
    {
      id: 'gst-output',
      title: 'GST Output Today',
      value: formatMoney(metrics.gstOutputTodayPaise),
      subtext: `Net liability ${formatMoney(metrics.netGstPayableTodayPaise)} (ITC credited)`,
      icon: ReceiptIndianRupee,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      link: '/gst',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.id}
            hover
            onClick={() => navigate(kpi.link)}
            className="p-5 relative group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {kpi.title}
                </p>
                {/* STRICT RULE: KPI numbers MUST be crisp tabular Inter font, NOT monospace */}
                <h3 className="text-2xl font-bold text-text-main mt-1 tabular-nums">
                  {kpi.value}
                </h3>
                <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                  <span>{kpi.subtext}</span>
                </p>
              </div>

              <div className={`p-3 rounded-card ${kpi.bgColor} ${kpi.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted">
              <span>View detailed ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
