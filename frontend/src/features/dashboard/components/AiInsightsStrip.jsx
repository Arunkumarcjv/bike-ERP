import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Sparkles, ArrowRight, TrendingUp, AlertTriangle, UserCheck } from 'lucide-react';

export function AiInsightsStrip() {
  const navigate = useNavigate();

  const insights = [
    {
      id: 'ins-1',
      type: 'LEAD_SURGE',
      icon: TrendingUp,
      badge: 'Demand Forecast',
      title: 'Hunter 350 Festive Surge Predicted',
      description: 'Incoming enquiry velocity suggests 18 units demand in next 10 days. Recommend buffer PO of 6 units.',
      actionLabel: 'Review PO Reorders',
      actionLink: '/purchases',
      color: 'text-primary',
      bgBadge: 'bg-blue-100 text-primary',
    },
    {
      id: 'ins-2',
      type: 'CHURN_RISK',
      icon: AlertTriangle,
      badge: 'Churn Prevention',
      title: '14 Customers Due for 2nd Free Service',
      description: 'Neha Verma & 13 others have crossed 4,000 km threshold. Automated WhatsApp service reminder ready.',
      actionLabel: 'Launch Reminders',
      actionLink: '/crm',
      color: 'text-status-amber',
      bgBadge: 'bg-amber-100 text-status-amber',
    },
    {
      id: 'ins-3',
      type: 'DISCOUNT_GATE',
      icon: UserCheck,
      badge: 'Approval Gate',
      title: 'High Close Probability Quotation',
      description: 'Sanjay Reddy (Himalayan 450) has 92% close probability if ₹5,000 discount request is authorized today.',
      actionLabel: 'Open Quotation Approval',
      actionLink: '/quotations',
      color: 'text-status-green',
      bgBadge: 'bg-green-100 text-status-green',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          AI Copilot Proactive Insights
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((ins) => {
          const Icon = ins.icon;
          return (
            <Card key={ins.id} className="p-4 flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ins.bgBadge}`}>
                    {ins.badge}
                  </span>
                  <Icon className={`w-4 h-4 ${ins.color}`} />
                </div>
                <h4 className="text-xs font-bold text-text-main mb-1">{ins.title}</h4>
                <p className="text-[11px] text-text-muted leading-relaxed">{ins.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => navigate(ins.actionLink)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
                >
                  <span>{ins.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
