import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  BatteryCharging, 
  Plus, 
  Navigation,
  ShieldCheck
} from 'lucide-react';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

const SAMPLE_SOS_REQUESTS = [
  {
    id: 'rsa-001',
    ticketNo: 'SOS/2627/0014',
    customerName: 'Kavitha Murthy',
    phone: '+91 98451 90811',
    landmark: 'Near Silk Board Flyover, Outer Ring Road, Bangalore',
    gps: '12.9172° N, 77.6228° E',
    breakdownType: 'BATTERY_DEAD', // FLAT_TYRE, BATTERY_DEAD, MECHANICAL, ACCIDENT
    vehicle: 'Royal Enfield Meteor 350 (KA-01-EQ-5590)',
    technicianName: 'Manoj Kumar (Tech Team A)',
    towTruckAssigned: 'Tow Van #KA-01-T-882',
    etaMinutes: 18,
    status: 'DISPATCHED', // LOGGED, DISPATCHED, REACHED, RESOLVED_ON_SPOT, TOWED
    isAmcCovered: true,
    chargesPaise: 0,
    loggedAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'rsa-002',
    ticketNo: 'SOS/2627/0015',
    customerName: 'Sanjay Reddy',
    phone: '+91 99002 44331',
    landmark: 'Bangalore-Mysore Expressway Toll Plaza (NICE Junction)',
    gps: '12.8711° N, 77.4820° E',
    breakdownType: 'MECHANICAL',
    vehicle: 'Royal Enfield Himalayan 450 (KA-01-NJ-8810)',
    technicianName: 'Suresh Gowda',
    towTruckAssigned: 'Hydraulic Flatbed Tow #KA-05-T-114',
    etaMinutes: 35,
    status: 'LOGGED',
    isAmcCovered: false,
    chargesPaise: 150000, // ₹1,500 towing charge
    loggedAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'rsa-003',
    ticketNo: 'SOS/2627/0012',
    customerName: 'Arun V.',
    phone: '+91 97401 55662',
    landmark: 'Indiranagar 100ft Road, near Domlur Bridge',
    gps: '12.9644° N, 77.6382° E',
    breakdownType: 'FLAT_TYRE',
    vehicle: 'Honda SP125 (KA-03-NQ-2211)',
    technicianName: 'Ramesh Kumar',
    towTruckAssigned: 'Mobile Service Scooter',
    etaMinutes: 0,
    status: 'RESOLVED_ON_SPOT',
    isAmcCovered: true,
    chargesPaise: 0,
    loggedAt: new Date(Date.now() - 120 * 60000).toISOString(),
  }
];

export function RoadsideAssistancePage() {
  const [requests, setRequests] = useState(SAMPLE_SOS_REQUESTS);
  const [selectedTicket, setSelectedTicket] = useState(SAMPLE_SOS_REQUESTS[0]);
  const [showLogModal, setShowLogModal] = useState(false);

  const updateStatus = (id, newStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    toast.success(`SOS ticket status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-red-600" />
            24x7 Roadside Assistance &amp; Towing Fleet (RSA)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Emergency SOS breakdown dispatch, live technician ETA tracking &amp; warranty/AMC complimentary check.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Log Incoming SOS Call
        </button>
      </div>

      {/* Live Active SOS Incident Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {requests.map(item => (
          <div
            key={item.id}
            onClick={() => setSelectedTicket(item)}
            className={`p-5 rounded-2xl border transition cursor-pointer space-y-4 bg-white dark:bg-slate-850 shadow-sm ${
              selectedTicket.id === item.id
                ? 'border-red-500 ring-2 ring-red-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded">
                  {item.ticketNo}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {item.customerName}
                </h3>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                item.status === 'RESOLVED_ON_SPOT' ? 'bg-emerald-100 text-emerald-800' :
                item.status === 'DISPATCHED' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                'bg-red-100 text-red-800'
              }`}>
                {item.status.replace('_', ' ')}
              </span>
            </div>

            <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                {item.breakdownType === 'BATTERY_DEAD' && <BatteryCharging className="w-4 h-4 text-amber-500" />}
                {item.breakdownType === 'MECHANICAL' && <Wrench className="w-4 h-4 text-red-500" />}
                {item.breakdownType === 'FLAT_TYRE' && <Truck className="w-4 h-4 text-blue-500" />}
                <span>{item.vehicle}</span>
              </div>

              <div className="flex items-start gap-1.5 text-slate-500 text-[11px]">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                <span>{item.landmark}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">ETA to Scene</span>
                <span className="font-bold font-mono text-red-600">
                  {item.etaMinutes > 0 ? `${item.etaMinutes} Mins` : 'Scene Reached'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Towing Charges</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {item.isAmcCovered ? (
                    <strong className="text-emerald-600">₹0 (AMC Covered)</strong>
                  ) : (
                    formatMoney(item.chargesPaise)
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
              <a
                href={`tel:${item.phone}`}
                className="flex items-center gap-1.5 text-emerald-600 font-bold hover:underline"
              >
                <Phone className="w-3.5 h-3.5" /> Call Customer
              </a>

              {item.status === 'DISPATCHED' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStatus(item.id, 'RESOLVED_ON_SPOT');
                  }}
                  className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-[11px]"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Ticket Technical Dispatch Dossier */}
      {selectedTicket && (
        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Active Incident Console</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {selectedTicket.ticketNo} — {selectedTicket.customerName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-600">
                GPS: {selectedTicket.gps}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-slate-400 block">Assigned Technician:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTicket.technicianName}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-slate-400 block">Towing Vehicle / Crane:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTicket.towTruckAssigned}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-slate-400 block">Warranty / AMC Eligibility:</span>
              <span className="font-bold text-emerald-600">
                {selectedTicket.isAmcCovered ? 'Verified Active Plan (Zero Charges)' : 'Standard Commercial Towing Rate'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoadsideAssistancePage;
