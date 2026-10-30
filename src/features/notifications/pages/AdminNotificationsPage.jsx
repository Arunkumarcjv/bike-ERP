import React, { useState } from 'react';
import { 
  Bell, 
  Settings, 
  Moon, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Clock, 
  Save, 
  AlertTriangle, 
  Plus, 
  Check, 
  Users, 
  Sliders
} from 'lucide-react';
import { ROLES } from '../../../config/roles';
import { toast } from 'sonner';

const DEFAULT_EVENT_RULES = [
  {
    id: 'rule-sla-breach',
    name: 'Service Bay SLA Breach',
    event: 'SLA_BREACH',
    description: 'Triggered when job card exceeds promised turnaround or bay idle limit',
    roles: [ROLES.SERVICE_MANAGER, ROLES.SERVICE_ADVISOR],
    channels: { inApp: true, whatsapp: true, push: true },
    urgent: true,
  },
  {
    id: 'rule-approval-pending',
    name: 'Approval Request Pending',
    event: 'APPROVAL_PENDING',
    description: 'Triggered when discount, invoice cancellation, or high-value PO requires sign-off',
    roles: [ROLES.SUPER_ADMIN, ROLES.SALES_MANAGER],
    channels: { inApp: true, whatsapp: true, push: false },
    urgent: true,
  },
  {
    id: 'rule-low-stock',
    name: 'Critical Reorder Threshold',
    event: 'LOW_STOCK',
    description: 'Triggered when spare part quantity falls strictly below reorder level',
    roles: [ROLES.INVENTORY_MANAGER, ROLES.SERVICE_MANAGER],
    channels: { inApp: true, whatsapp: false, push: false },
    urgent: false,
  },
  {
    id: 'rule-lead-uncontacted',
    name: 'Uncontacted Digital Lead (>2 Hours)',
    event: 'LEAD_UNCONTACTED',
    description: 'Escalation when web/social lead remains in Fresh status for more than 120 mins',
    roles: [ROLES.SALES_MANAGER, ROLES.SALES_EXECUTIVE],
    channels: { inApp: true, whatsapp: true, push: true },
    urgent: true,
  },
  {
    id: 'rule-booking-cancelled',
    name: 'Booking Cancellation Alert',
    event: 'BOOKING_CANCELLED',
    description: 'Triggered when customer requests vehicle booking cancellation & deposit refund',
    roles: [ROLES.SALES_MANAGER, ROLES.ACCOUNTANT],
    channels: { inApp: true, whatsapp: true, push: false },
    urgent: true,
  },
  {
    id: 'rule-complaint-logged',
    name: 'Customer Grievance / High Severity Complaint',
    event: 'NEW_COMPLAINT',
    description: 'Triggered when an escalated complaint or rating <= 3 survey is submitted',
    roles: [ROLES.SUPER_ADMIN, ROLES.SERVICE_MANAGER, ROLES.SALES_MANAGER],
    channels: { inApp: true, whatsapp: true, push: true },
    urgent: true,
  },
];

export function AdminNotificationsPage() {
  const [rules, setRules] = useState(DEFAULT_EVENT_RULES);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietStart, setQuietStart] = useState('21:00');
  const [quietEnd, setQuietEnd] = useState('08:00');
  const [dailyDigestEnabled, setDailyDigestEnabled] = useState(true);
  const [digestTime, setDigestTime] = useState('09:00');

  const toggleChannel = (ruleId, channelKey) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      return {
        ...r,
        channels: {
          ...r.channels,
          [channelKey]: !r.channels[channelKey]
        }
      };
    }));
  };

  const handleSaveSettings = () => {
    toast.success('Notification routing policies and quiet hours updated successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Notification Rules & Routing Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure automated event triggers, role dispatch matrix, quiet hours, and batch digests.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
        >
          <Save className="w-4 h-4" />
          Save Rules
        </button>
      </div>

      {/* Global Policies: Quiet Hours & Daily Digest */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quiet Hours Policy */}
        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quiet Hours (IST)</h3>
                <p className="text-xs text-slate-500">Mutes non-urgent WhatsApp and Push alerts during off-hours</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={quietHoursEnabled}
                onChange={() => setQuietHoursEnabled(!quietHoursEnabled)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          {quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Mute Starts (IST)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="time"
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Mute Ends (IST)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="time"
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <p className="col-span-2 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Critical security alarms and OTPs bypass quiet hours automatically.
              </p>
            </div>
          )}
        </div>

        {/* Daily Digest Policy */}
        <div className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Operational Digest</h3>
                <p className="text-xs text-slate-500">Bundles low-priority notices into a single morning briefing</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dailyDigestEnabled}
                onChange={() => setDailyDigestEnabled(!dailyDigestEnabled)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          {dailyDigestEnabled && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Delivery Time (IST)
                </span>
                <span className="text-[11px] text-slate-500">Scheduled automated summary sent to staff inbox</span>
              </div>
              <input
                type="time"
                value={digestTime}
                onChange={(e) => setDigestTime(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Event Routing Rules Table */}
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Event Trigger & Dispatch Rules
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select which channels and roles are notified when critical operational events happen.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {rules.map((rule) => (
            <div key={rule.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {rule.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {rule.event}
                  </span>
                  {rule.urgent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                      High Priority
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {rule.description}
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Recipients: {rule.roles.join(', ')}
                  </span>
                </div>
              </div>

              {/* Channels Selector */}
              <div className="flex items-center gap-3 shrink-0">
                {/* In-app */}
                <button
                  onClick={() => toggleChannel(rule.id, 'inApp')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    rule.channels.inApp
                      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                      : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>In-App</span>
                  {rule.channels.inApp && <Check className="w-3 h-3 text-blue-600" />}
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => toggleChannel(rule.id, 'whatsapp')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    rule.channels.whatsapp
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                  {rule.channels.whatsapp && <Check className="w-3 h-3 text-emerald-600" />}
                </button>

                {/* Browser Push */}
                <button
                  onClick={() => toggleChannel(rule.id, 'push')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    rule.channels.push
                      ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
                      : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Push</span>
                  {rule.channels.push && <Check className="w-3 h-3 text-purple-600" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminNotificationsPage;
