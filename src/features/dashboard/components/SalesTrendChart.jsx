import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export function SalesTrendChart({ trendData = [], hourlyData = [] }) {
  const [viewMode, setViewMode] = useState('7DAYS'); // '7DAYS' or 'HOURLY'

  // Use dynamic hourly data computed from today's invoice timestamps up to current hour
  const displayHourlyData = hourlyData.length > 0 ? hourlyData : [
    { hour: '09 AM', revenue: 0, count: 0 },
    { hour: '10 AM', revenue: 0, count: 0 },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Showroom Revenue Trajectory</CardTitle>
          <p className="text-xs text-text-muted mt-0.5">
            {viewMode === '7DAYS'
              ? '7-Day Invoiced Sales Revenue (Derived from posted records)'
              : "Today's Invoiced Revenue by Hour (Up to current time)"}
          </p>
        </div>
        <div className="flex bg-surface-subtle border border-border rounded-button p-0.5 text-xs">
          <button
            onClick={() => setViewMode('7DAYS')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              viewMode === '7DAYS' ? 'bg-surface shadow-xs text-primary font-semibold' : 'text-text-muted'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setViewMode('HOURLY')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              viewMode === 'HOURLY' ? 'bg-surface shadow-xs text-primary font-semibold' : 'text-text-muted'
            }`}
          >
            Today Hourly
          </button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-[260px] pt-4">
        <ResponsiveContainer width="100%" height={260}>
          {viewMode === '7DAYS' ? (
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis
                domain={[0, 'auto']}
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(val) => `₹${val >= 100000 ? `${(val / 100000).toFixed(1)}L` : val}`}
              />
              <Tooltip
                formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                contentStyle={{ backgroundColor: '#0B1F4B', borderRadius: 8, color: '#FFF', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="revenueRupees"
                stroke="#2563EB"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#salesGrad)"
              />
            </AreaChart>
          ) : (
            <BarChart data={displayHourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis
                domain={[0, 'auto']}
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(val) => `₹${val >= 100000 ? `${(val / 100000).toFixed(1)}L` : val}`}
              />
              <Tooltip
                formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Invoiced']}
                contentStyle={{ backgroundColor: '#0B1F4B', borderRadius: 8, color: '#FFF', fontSize: 12 }}
              />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
