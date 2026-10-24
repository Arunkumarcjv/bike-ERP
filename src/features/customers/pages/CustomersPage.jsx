import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Drawer } from '../../../components/ui/Drawer';
import { formatMoney, formatPhone, formatDate } from '../../../lib/format';
import {
  Users,
  Search,
  Bike,
  ShieldCheck,
  Calendar,
  Clock,
  Wrench,
  FileText,
  Star,
  Sparkles,
  Phone,
  MessageSquare,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner';

export function CustomersPage() {
  const customers = useAppStore((state) => state.customers || []);
  const currentUser = useAppStore((state) => state.currentUser);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW', 'BIKES', 'CONSENT', 'VAULT', 'TIMELINE'

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const q = searchTerm.toLowerCase();

    return customers.filter((c) => {
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone.includes(q);
      const matchReg = c.vehicles?.some((v) => v.registrationNumber.toLowerCase().includes(q));
      return matchName || matchPhone || matchReg;
    });
  }, [customers, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Customer 360 & Relationship Hub</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Single view of customer profiles, bike ownership, consent logs, document vault and AI churn risk
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 bg-surface p-3 rounded-card border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer name, phone number (+91), or registration (KA-03-JM-4921)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-input border border-border bg-surface-subtle text-text-main focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Phone Number</th>
                <th className="p-3.5">City / Location</th>
                <th className="p-3.5">Registered Bikes</th>
                <th className="p-3.5">Loyalty Tier</th>
                <th className="p-3.5">Lifetime Value (LTV)</th>
                <th className="p-3.5">AI Churn Risk</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredCustomers.map((cust) => {
                const primaryVehicle = cust.vehicles?.[0];
                return (
                  <tr
                    key={cust.id}
                    onClick={() => {
                      setSelectedCustomer(cust);
                      setActiveTab('OVERVIEW');
                    }}
                    className="hover:bg-surface-subtle/70 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 font-bold text-text-main">{cust.name}</td>
                    <td className="p-3.5 font-mono text-text-muted">{formatPhone(cust.phone)}</td>
                    <td className="p-3.5 text-text-muted">{cust.city}</td>
                    <td className="p-3.5">
                      {primaryVehicle ? (
                        <div>
                          <div className="font-semibold text-primary">{primaryVehicle.modelName}</div>
                          <div className="text-[10px] font-mono text-text-muted">
                            {primaryVehicle.registrationNumber}
                          </div>
                        </div>
                      ) : (
                        <span className="text-text-muted italic">No vehicle</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cust.loyaltyTier === 'Platinum'
                            ? 'bg-purple-100 text-purple-700'
                            : cust.loyaltyTier === 'Gold'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {cust.loyaltyTier}
                      </span>
                    </td>
                    <td className="p-3.5 tabular-nums font-semibold text-text-main">
                      {formatMoney(cust.ltvPaise)}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={cust.churnRisk} />
                    </td>
                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setActiveTab('OVERVIEW');
                        }}
                      >
                        Customer 360
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Customer 360 Drawer */}
      <Drawer
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer ? `Customer 360: ${selectedCustomer.name}` : ''}
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6 text-xs">
            {/* Top Bio Banner */}
            <div className="p-5 rounded-card bg-surface-subtle border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-text-main">{selectedCustomer.name}</h3>
                <div className="text-text-muted mt-1 flex flex-wrap items-center gap-3">
                  <span>{formatPhone(selectedCustomer.phone)}</span>
                  <span>•</span>
                  <span>{selectedCustomer.email || 'No email registered'}</span>
                  <span>•</span>
                  <span>{selectedCustomer.address}, {selectedCustomer.city} - {selectedCustomer.pincode}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-text-muted uppercase font-semibold">Lifetime Value</div>
                <div className="text-xl font-bold text-primary tabular-nums mt-0.5">
                  {formatMoney(selectedCustomer.ltvPaise)}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">
                  Loyalty Points: <strong className="text-text-main">{selectedCustomer.loyaltyPoints}</strong>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Tabs */}
            <div className="flex border-b border-border space-x-2">
              {[
                { id: 'OVERVIEW', label: 'Overview & AI Next-Action' },
                { id: 'BIKES', label: `Garage Bikes (${selectedCustomer.vehicles?.length || 0})` },
                { id: 'CONSENT', label: 'Consent Records (Opt-in)' },
                { id: 'VAULT', label: 'Document Vault' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-primary/5 rounded-t'
                      : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview & AI Next Best Action */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-4">
                {/* AI Next Best Action Card */}
                <Card className="p-4 bg-blue-50/50 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary uppercase tracking-wide">
                      AI Next-Best-Action Recommendation
                    </span>
                  </div>
                  <p className="text-text-main leading-relaxed">
                    {selectedCustomer.churnRisk === 'HIGH'
                      ? 'Customer is overdue for periodic maintenance. High risk of migrating to unorganized local workshop. Recommend 1-click WhatsApp service reminder with complimentary water wash voucher.'
                      : 'Customer demonstrates high loyalty (CSAT 5/5). Eligible for VIP preview of Himalayan 450 tubeless accessory kit or exchange upgrade appraisal.'}
                  </p>
                  <div className="mt-3 pt-3 border-t border-blue-200 flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      icon={MessageSquare}
                      onClick={() => toast.success(`WhatsApp reminder sent to ${selectedCustomer.name}`)}
                    >
                      Trigger 1-Click WhatsApp Reminder
                    </Button>
                  </div>
                </Card>

                {/* CSAT / NPS Score */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <span className="text-text-muted uppercase text-[10px] font-semibold block">
                      Customer Satisfaction (CSAT)
                    </span>
                    <div className="text-xl font-bold text-text-main mt-1 flex items-center gap-1.5">
                      <span>{selectedCustomer.csatScore} / 5</span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <span className="text-text-muted uppercase text-[10px] font-semibold block">
                      Predictive Churn Risk
                    </span>
                    <div className="mt-1">
                      <StatusBadge status={selectedCustomer.churnRisk} />
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Tab 2: Registered Garage Bikes */}
            {activeTab === 'BIKES' && (
              <div className="space-y-3">
                {selectedCustomer.vehicles?.map((bike, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded bg-blue-50 text-primary">
                          <Bike className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-text-main">{bike.modelName}</h4>
                          <div className="font-mono text-[11px] text-text-muted">
                            Reg: <strong>{bike.registrationNumber}</strong> | VIN: {bike.chassisNumber}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-status-green">
                        Active Warranty
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-3 text-[11px]">
                      <div>
                        <span className="text-text-muted block">Odometer:</span>
                        <span className="font-bold tabular-nums text-text-main">{bike.odometerKm} KM</span>
                      </div>
                      <div>
                        <span className="text-text-muted block">Avg Daily Usage:</span>
                        <span className="font-bold tabular-nums text-text-main">{bike.avgDailyKm} KM / Day</span>
                      </div>
                      <div>
                        <span className="text-text-muted block">Last Serviced:</span>
                        <span className="font-medium text-text-main">{formatDate(bike.lastServiceDate)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Tab 3: Consent Records (Append-only Opt-In Tracker) */}
            {activeTab === 'CONSENT' && (
              <Card className="p-4 space-y-4">
                <div className="border-b border-border pb-3">
                  <h4 className="font-bold text-text-main">DPDP Statutory Customer Consent Register</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Immutable consent audit record under Digital Personal Data Protection guidelines.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded bg-surface-subtle border border-border">
                    <div>
                      <div className="font-semibold text-text-main">WhatsApp Transactional Updates</div>
                      <div className="text-[10px] text-text-muted">Job card updates, invoice PDFs, OTP approvals</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-status-green">
                      {selectedCustomer.consent?.marketingWhatsapp ? 'OPTED IN' : 'OPTED OUT'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded bg-surface-subtle border border-border">
                    <div>
                      <div className="font-semibold text-text-main">Service Due Reminders</div>
                      <div className="text-[10px] text-text-muted">KM and date-based maintenance notifications</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-status-green">
                      {selectedCustomer.consent?.serviceReminders ? 'OPTED IN' : 'OPTED OUT'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded bg-surface-subtle border border-border">
                    <div>
                      <div className="font-semibold text-text-main">Promotional Schemes & Festival SMS</div>
                      <div className="text-[10px] text-text-muted">Exchange bonuses, seasonal offers</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-text-muted">
                      {selectedCustomer.consent?.promotionalSms ? 'OPTED IN' : 'OPTED OUT'}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-text-muted italic pt-2">
                  Last updated on {formatDate(selectedCustomer.consent?.updatedAt)} via Digital Portal OTP
                </div>
              </Card>
            )}

            {/* Tab 4: Document Vault (Strict rule: No Aadhaar Number field) */}
            {activeTab === 'VAULT' && (
              <Card className="p-4 space-y-3">
                <div className="border-b border-border pb-3">
                  <h4 className="font-bold text-text-main">Customer KYC & Vehicle Document Vault</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Verified Driving Licence, Vehicle RC and Insurance policy copies. (Aadhaar numbers are never stored).
                  </p>
                </div>

                <div className="space-y-2">
                  {selectedCustomer.documents?.length === 0 ? (
                    <div className="py-6 text-center text-text-muted italic">No documents attached yet</div>
                  ) : (
                    selectedCustomer.documents?.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded bg-surface-subtle border border-border"
                      >
                        <div className="flex items-center gap-2.5">
                          <FolderOpen className="w-4 h-4 text-primary" />
                          <div>
                            <span className="font-bold text-text-main">{doc.name}</span>
                            <div className="text-[10px] text-text-muted">{doc.type.replace(/_/g, ' ')}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-status-green bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          Verified
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
