import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { getAvailableSlotsForDate, isDateBlockedForService } from '../../../lib/slots';
import { formatTimeOnly, formatDate } from '../../../lib/format';
import {
  CalendarClock,
  PlusCircle,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Bike,
} from 'lucide-react';
import { toast } from 'sonner';

export function AppointmentsPage() {
  const servicePackages = useAppStore((state) => state.catalogs.servicePackages || []);
  const [selectedDate, setSelectedDate] = useState('2026-10-26');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [regNo, setRegNo] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('08:30 - 09:30');
  const [selectedPkg, setSelectedPkg] = useState(servicePackages[0]?.id || '');

  const [appointments, setAppointments] = useState([
    {
      id: 'apt-001',
      customerName: 'Rohan Mehta',
      phone: '+91 98450 12345',
      registrationNumber: 'KA-03-JM-4921',
      modelName: 'Hunter 350',
      date: '2026-10-26',
      timeSlot: '08:30 - 09:30',
      packageName: 'General Minor Service (Express)',
      status: 'CONFIRMED',
    },
    {
      id: 'apt-002',
      customerName: 'Priya Singh',
      phone: '+91 98450 12345',
      registrationNumber: 'KA-03-EV-8840',
      modelName: 'TVS iQube EV',
      date: '2026-10-26',
      timeSlot: '09:30 - 10:30',
      packageName: 'EV Diagnostics & Battery Health Audit',
      status: 'CONFIRMED',
    },
    {
      id: 'apt-003',
      customerName: 'Arjun Das',
      phone: '+91 97412 88901',
      registrationNumber: 'KA-53-MJ-1049',
      modelName: 'Classic 350',
      date: '2026-10-26',
      timeSlot: '10:30 - 11:30',
      packageName: 'Comprehensive Major Service',
      status: 'CONFIRMED',
    },
  ]);

  const isSundayBlocked = isDateBlockedForService(selectedDate);
  const slots = getAvailableSlotsForDate(selectedDate, appointments);

  const handleBookAppointment = (e) => {
    e.preventDefault();
    if (isSundayBlocked) {
      toast.error('Workshop is closed on Sundays for routine periodic maintenance.');
      return;
    }

    const pkg = servicePackages.find((p) => p.id === selectedPkg);

    const newApt = {
      id: `apt-${Date.now()}`,
      customerName,
      phone,
      registrationNumber: regNo.toUpperCase(),
      modelName: 'Royal Enfield / Honda',
      date: selectedDate,
      timeSlot: selectedSlot,
      packageName: pkg ? pkg.name : 'General Service',
      status: 'CONFIRMED',
    };

    setAppointments([...appointments, newApt]);
    setBookingModalOpen(false);
    toast.success(`Service appointment confirmed for ${customerName} at ${selectedSlot}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Workshop Service Appointments & Capacity</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Strict bay slot capacity quotas (12 bays), operating hours & Sunday holiday rules
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => setBookingModalOpen(true)}
        >
          Book Service Appointment
        </Button>
      </div>

      {/* Date Selector Banner */}
      <div className="flex items-center justify-between p-4 bg-surface rounded-card border border-border shadow-soft">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <label className="text-xs font-semibold text-text-main block">Appointment Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs p-1.5 rounded border border-border bg-surface-subtle text-text-main font-semibold"
            />
          </div>
        </div>

        {isSundayBlocked ? (
          <div className="flex items-center gap-2 p-2 rounded bg-amber-50 border border-amber-200 text-status-amber text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Sundays are closed for general servicing (emergency towing only)</span>
          </div>
        ) : (
          <div className="text-right">
            <span className="text-xs text-text-muted block">Daily Booking Cap:</span>
            <span className="text-base font-bold text-status-green tabular-nums">48 Slots / Day</span>
          </div>
        )}
      </div>

      {/* Live Slot Capacity Grid */}
      {!isSundayBlocked && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {slots.map((s) => (
            <Card
              key={s.slot}
              className={`p-3 text-center ${
                s.isFull ? 'bg-red-50 border-red-200' : 'hover:border-primary/50'
              }`}
            >
              <div className="font-bold text-xs text-text-main">{s.slot}</div>
              <div
                className={`text-sm font-bold mt-1.5 tabular-nums ${
                  s.isFull ? 'text-status-red' : 'text-status-green'
                }`}
              >
                {s.availableBays} Bays Left
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">
                {s.bookedCount} / {s.capacity} Booked
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Scheduled Appointments Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Scheduled Appointments ({formatDate(selectedDate)})</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Mobile Phone</th>
                <th className="p-3.5">Registration #</th>
                <th className="p-3.5">Model</th>
                <th className="p-3.5">Time Slot</th>
                <th className="p-3.5">Service Package</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {appointments
                .filter((a) => a.date === selectedDate)
                .map((apt) => (
                  <tr key={apt.id} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="p-3.5 font-bold text-text-main">{apt.customerName}</td>
                    <td className="p-3.5 font-mono text-text-muted">{apt.phone}</td>
                    <td className="p-3.5 font-mono font-bold text-primary">{apt.registrationNumber}</td>
                    <td className="p-3.5 text-text-main">{apt.modelName}</td>
                    <td className="p-3.5 font-medium tabular-nums">{apt.timeSlot}</td>
                    <td className="p-3.5 text-text-muted">{apt.packageName}</td>
                    <td className="p-3.5">
                      <StatusBadge status={apt.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="Schedule Service Workshop Appointment"
        size="md"
      >
        <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-text-main mb-1">Customer Full Name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Rohith V."
              className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-main mb-1">Mobile Phone (+91)</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9845012345"
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              />
            </div>
            <div>
              <label className="block font-semibold text-text-main mb-1">Registration (KA-XX-XX-XXXX)</label>
              <input
                type="text"
                required
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="KA-03-JM-4921"
                className="w-full p-2.5 font-mono uppercase rounded-input border border-border bg-surface-subtle text-text-main"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-main mb-1">Time Slot Window</label>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              >
                {slots.map((s) => (
                  <option key={s.slot} value={s.slot} disabled={s.isFull}>
                    {s.slot} ({s.availableBays} bays left)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-text-main mb-1">Service Package</label>
              <select
                value={selectedPkg}
                onChange={(e) => setSelectedPkg(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              >
                {servicePackages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
