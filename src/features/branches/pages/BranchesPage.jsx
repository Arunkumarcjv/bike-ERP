import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { formatMoney } from '../../../lib/format';
import {
  GitFork,
  MapPin,
  Building2,
  Wrench,
  Bike,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export function BranchesPage() {
  const branches = useAppStore((state) => state.branches || []);
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const setActiveBranch = useAppStore((state) => state.setActiveBranch);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Multi-Branch Dealership Network & Hubs</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Unified inventory visibility, inter-branch logistics and performance comparison across Bangalore
          </p>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {branches.map((b) => {
          const isActive = b.id === activeBranchId;
          return (
            <Card
              key={b.id}
              className={`p-5 flex flex-col justify-between ${
                isActive ? 'border-primary ring-2 ring-primary/20 shadow-soft' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Building2 className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                    <span className="font-bold text-sm text-text-main">{b.name}</span>
                  </div>
                  {b.isHeadquarters && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-status-blue">
                      HQ
                    </span>
                  )}
                </div>

                <div className="py-3 space-y-2 text-xs">
                  <div className="text-text-muted leading-relaxed">{b.address}</div>
                  <div className="text-[11px] font-mono text-text-main font-semibold">
                    GSTIN: {b.gstin}
                  </div>
                  <div className="pt-2 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-surface-subtle border border-border">
                      <span className="text-text-muted block">Workshop Bays:</span>
                      <strong className="text-text-main tabular-nums text-sm">{b.bays} Bays</strong>
                    </div>
                    <div className="p-2 rounded bg-surface-subtle border border-border">
                      <span className="text-text-muted block">Type:</span>
                      <strong className="text-primary truncate block">{b.type.split(' ')[0]}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                {isActive ? (
                  <span className="text-xs font-bold text-status-green flex items-center gap-1.5 py-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>Active Session Hub</span>
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setActiveBranch(b.id);
                      toast.success(`Switched active operational session to ${b.name}`);
                    }}
                  >
                    Switch to this Hub
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
