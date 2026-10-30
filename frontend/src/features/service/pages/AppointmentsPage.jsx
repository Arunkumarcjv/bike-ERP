import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { getAvailableSlotsForDate, isDateBlockedForService } from '../../../lib/slots';
import { formatDate } from '../../../lib/format';
import { relativeDateString } from '../../../lib/dates';
import {
  CalendarClock,
  PlusCircle,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FilePlus2,
  ExternalLink,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export function AppointmentsPage() {
  const navigate = useNavigate();
  const appointments = useAppStore((state) => state.appointments || []);
  const jobCards = useAppStore((state) => state.jobCards || []);
  const cancelAppointment = useAppStore((state) => state.cancelAppointment);
  // Was hardcoded to 2026-10-26, which hid every booking made on any other day.
  const [selectedDate, setSelectedDate] = useState(relativeDateString(0));
  const isSundayBlocked = isDateBlockedForService(selectedDate);
  const slots = getAvailableSlotsForDate(selectedDate, appointments);

  // Booking opens the full Create Vehicle Service Job Card form for the selected date.
  const startBooking = () => {
    if (isSundayBlocked) {
      toast.error('Workshop is closed on Sundays for routine periodic maintenance.');
      return;
    }
    navigate(`/service/jobs/new?book=1&date=${selectedDate}`);
  };

  const openJobCard = (apt) => {
    const card = jobCards.find((jc) => jc.id === apt.jobCardId);
    if (card?.stage === 'DRAFT') navigate(`/service/jobs/new?draft=${card.id}`);
    else if (card) navigate('/service/jobs');
    else navigate(`/service/jobs/new?appointment=${apt.id}`);
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
          onClick={startBooking}
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
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {appointments.filter((a) => a.date === selectedDate).length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-text-muted">
                    No appointments on this date.
                  </td>
                </tr>
              )}
              {appointments
                .filter((a) => a.date === selectedDate)
                .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
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
                    <td className="p-3.5 text-right whitespace-nowrap">
                      {apt.status === 'CANCELLED' ? (
                        <span className="text-text-muted">—</span>
                      ) : apt.jobCardId ? (
                        <button
                          onClick={() => openJobCard(apt)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View Job Card
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <Button size="sm" variant="primary" icon={FilePlus2} onClick={() => openJobCard(apt)}>
                            Create Job Card
                          </Button>
                          <button
                            onClick={() => {
                              cancelAppointment(apt.id);
                              toast.info(`Appointment for ${apt.customerName} cancelled.`);
                            }}
                            className="p-1.5 rounded text-text-muted hover:text-status-red hover:bg-red-50"
                            title="Cancel appointment"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
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
