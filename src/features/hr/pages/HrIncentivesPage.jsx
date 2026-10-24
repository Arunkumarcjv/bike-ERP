import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { formatMoney } from '../../../lib/format';
import {
  UserCheck,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';

export function HrIncentivesPage() {
  const staffMembers = [
    {
      id: 'staff-1',
      name: 'Deepak Rao',
      role: 'Sales Executive',
      department: 'Sales',
      monthlyTargetUnits: 12,
      achievedUnits: 10,
      quotaAchievedPercent: 83,
      baseSalaryPaise: 2800000,
      incentiveCommissionPaise: 1850000, // ₹18,500
      totalPayoutPaise: 4650000,
      attendanceDays: 24,
    },
    {
      id: 'staff-2',
      name: 'Vikram Sethi',
      role: 'Sales Manager',
      department: 'Sales',
      monthlyTargetUnits: 30,
      achievedUnits: 28,
      quotaAchievedPercent: 93,
      baseSalaryPaise: 5500000,
      incentiveCommissionPaise: 4200000,
      totalPayoutPaise: 9700000,
      attendanceDays: 25,
    },
    {
      id: 'staff-3',
      name: 'Manoj Kumar',
      role: 'Technician',
      department: 'Workshop',
      monthlyTargetUnits: 60, // 60 jobs target
      achievedUnits: 68,
      quotaAchievedPercent: 113,
      baseSalaryPaise: 2500000,
      incentiveCommissionPaise: 2150000, // ₹21,500
      totalPayoutPaise: 4650000,
      attendanceDays: 26,
    },
    {
      id: 'staff-4',
      name: 'Ananya Sharma',
      role: 'Service Advisor',
      department: 'Service',
      monthlyTargetUnits: 120,
      achievedUnits: 115,
      quotaAchievedPercent: 96,
      baseSalaryPaise: 3200000,
      incentiveCommissionPaise: 1650000,
      totalPayoutPaise: 4850000,
      attendanceDays: 25,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Staff Incentives, Attendance & Productivity</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Commission slabs, technician job productivity benchmarks and monthly payroll previews
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={FileSpreadsheet}
          onClick={() => toast.success('Generated Payroll Incentive Disbursal Schedule PDF')}
        >
          Export Payroll Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Active Staff on Roll</div>
          <div className="text-2xl font-bold text-text-main mt-1 tabular-nums">28 Employees</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Average Target Achievement</div>
          <div className="text-2xl font-bold text-status-green mt-1 tabular-nums">96.2%</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Monthly Incentive Pool</div>
          <div className="text-2xl font-bold text-primary mt-1 tabular-nums">₹ 3.84 Lakhs</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Avg Attendance Rate</div>
          <div className="text-2xl font-bold text-text-main mt-1 tabular-nums">98.1%</div>
        </Card>
      </div>

      {/* Staff Productivity Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Staff Member</th>
                <th className="p-3.5">Role & Dept</th>
                <th className="p-3.5">Attendance</th>
                <th className="p-3.5">Target Quota</th>
                <th className="p-3.5">Achieved</th>
                <th className="p-3.5">Attainment %</th>
                <th className="p-3.5">Base Salary</th>
                <th className="p-3.5">Incentive Commission</th>
                <th className="p-3.5 text-right">Net Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {staffMembers.map((staff) => (
                <tr key={staff.id} className="hover:bg-surface-subtle/70 transition-colors">
                  <td className="p-3.5 font-bold text-text-main">{staff.name}</td>
                  <td className="p-3.5">
                    <div className="font-semibold text-text-main">{staff.role}</div>
                    <div className="text-[10px] text-text-muted">{staff.department}</div>
                  </td>
                  <td className="p-3.5 tabular-nums text-text-main font-medium">
                    {staff.attendanceDays} / 26 Days
                  </td>
                  <td className="p-3.5 tabular-nums text-text-muted">{staff.monthlyTargetUnits} Units/Jobs</td>
                  <td className="p-3.5 tabular-nums font-bold text-text-main">{staff.achievedUnits}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        staff.quotaAchievedPercent >= 100
                          ? 'bg-green-100 text-status-green'
                          : 'bg-blue-100 text-status-blue'
                      }`}
                    >
                      {staff.quotaAchievedPercent}%
                    </span>
                  </td>
                  <td className="p-3.5 tabular-nums text-text-muted">{formatMoney(staff.baseSalaryPaise)}</td>
                  <td className="p-3.5 tabular-nums font-semibold text-status-green">
                    {formatMoney(staff.incentiveCommissionPaise)}
                  </td>
                  <td className="p-3.5 text-right font-bold tabular-nums text-primary text-sm">
                    {formatMoney(staff.totalPayoutPaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
