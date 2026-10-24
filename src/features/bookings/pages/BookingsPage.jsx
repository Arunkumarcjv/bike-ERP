import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { formatMoney, formatDate } from '../../../lib/format';
import {
  BookmarkCheck,
  PlusCircle,
  FileText,
  XCircle,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Repeat,
  Warehouse,
} from 'lucide-react';
import { toast } from 'sonner';

export function BookingsPage() {
  const state = useAppStore();
  const bookings = state.bookings || [];
  const vehicleStock = state.vehicleStock || [];
  const bikeCatalog = state.catalogs.bikes || [];
  const currentUser = state.currentUser;
  const allocateChassisToBooking = state.allocateChassisToBooking;
  const deallocateChassis = state.deallocateChassis;

  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [tokenReceiptOpen, setTokenReceiptOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [selectedChassis, setSelectedChassis] = useState('');
  const [cancelReason, setCancelReason] = useState('Customer opted for car purchase');

  // Available chassis for the active booking model
  const eligibleChassisUnits = vehicleStock.filter((v) => {
    if (!activeBooking) return false;
    return (
      v.modelId === activeBooking.modelId &&
      (v.status === 'IN_STOCK' || v.chassisNumber === activeBooking.allocatedChassisNumber)
    );
  });

  const handleOpenAllocation = (booking) => {
    setActiveBooking(booking);
    setSelectedChassis(booking.allocatedChassisNumber || eligibleChassisUnits[0]?.chassisNumber || '');
    setAllocationModalOpen(true);
  };

  const handleConfirmAllocation = () => {
    if (!selectedChassis) {
      toast.error('Select an available chassis unit');
      return;
    }

    try {
      allocateChassisToBooking(selectedChassis, activeBooking.id);
      setAllocationModalOpen(false);
      toast.success(`Chassis ${selectedChassis} successfully allocated to Booking ${activeBooking.bookingNumber}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancelBooking = () => {
    if (!activeBooking) return;
    if (activeBooking.allocatedUnitId) {
      deallocateChassis(activeBooking.allocatedUnitId);
    }

    state.updateLeadStage(activeBooking.id, 'CANCELLED');
    setCancelModalOpen(false);
    toast.warning(`Booking ${activeBooking.bookingNumber} cancellation submitted. Refund pending approver sign-off.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Vehicle Reservations & Bookings</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Token receipts, single-unit chassis allocation gates and delivery reservations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => toast.info('To create a booking, please convert an active lead or quotation.')}
          >
            Create New Booking
          </Button>
        </div>
      </div>

      {/* Bookings Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Booking #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Model & Colour</th>
                <th className="p-3.5">Token Paid</th>
                <th className="p-3.5">Allocated Chassis (VIN)</th>
                <th className="p-3.5">Est. Delivery</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-surface-subtle/70 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-primary">{booking.bookingNumber}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-text-main">{booking.customerName}</div>
                    <div className="text-[10px] text-text-muted">{booking.phone}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-text-main">{booking.modelName}</div>
                    <div className="text-[10px] text-text-muted">{booking.colorName}</div>
                  </td>
                  <td className="p-3.5 tabular-nums">
                    <div className="font-bold text-status-green">{formatMoney(booking.tokenAmountPaise)}</div>
                    <div className="text-[10px] text-text-muted">{booking.paymentMode}</div>
                  </td>
                  <td className="p-3.5">
                    {booking.allocatedChassisNumber ? (
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-status-blue border border-blue-200">
                        {booking.allocatedChassisNumber}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-status-amber bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Unallocated
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-text-muted">{formatDate(booking.tentativeDeliveryDate)}</td>
                  <td className="p-3.5">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={FileText}
                        onClick={() => {
                          setActiveBooking(booking);
                          setTokenReceiptOpen(true);
                        }}
                      >
                        Receipt
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Warehouse}
                        onClick={() => handleOpenAllocation(booking)}
                      >
                        {booking.allocatedChassisNumber ? 'Re-allocate' : 'Allocate Chassis'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={XCircle}
                        onClick={() => {
                          setActiveBooking(booking);
                          setCancelModalOpen(true);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Chassis Allocation Picker Modal (Blocks Double Allocation) */}
      <Modal
        isOpen={allocationModalOpen}
        onClose={() => setAllocationModalOpen(false)}
        title={activeBooking ? `Allocate VIN Chassis: ${activeBooking.bookingNumber}` : ''}
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-card bg-surface-subtle border border-border">
            <div className="font-semibold text-text-main">
              Vehicle Model: <strong>{activeBooking?.modelName}</strong> ({activeBooking?.colorName})
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">
              Customer: {activeBooking?.customerName}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-text-main mb-1.5">
              Select Free Physical Chassis / VIN from Warehouse Stock
            </label>
            {eligibleChassisUnits.length === 0 ? (
              <div className="p-4 text-center rounded bg-amber-50 border border-amber-200 text-status-amber">
                No free units of this model currently in stock! Please check in-transit consignments or initiate branch transfer.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {eligibleChassisUnits.map((unit) => {
                  const isCurrentAllocated = unit.allocatedBookingId === activeBooking?.id;
                  const isBlockedByOther =
                    unit.allocatedBookingId && unit.allocatedBookingId !== activeBooking?.id;

                  return (
                    <label
                      key={unit.id}
                      className={`p-3 rounded-card border flex items-center justify-between cursor-pointer transition-all ${
                        isBlockedByOther
                          ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                          : selectedChassis === unit.chassisNumber
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border bg-surface hover:bg-surface-subtle'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="chassisSelect"
                          disabled={isBlockedByOther}
                          checked={selectedChassis === unit.chassisNumber}
                          onChange={() => setSelectedChassis(unit.chassisNumber)}
                        />
                        <div>
                          <div className="font-mono font-bold text-text-main">{unit.chassisNumber}</div>
                          <div className="text-[10px] text-text-muted">
                            Engine: {unit.engineNumber} • Location: {unit.location}
                          </div>
                        </div>
                      </div>

                      {isCurrentAllocated ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-status-blue">
                          Current Allocation
                        </span>
                      ) : isBlockedByOther ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-status-red">
                          Blocked ({unit.allocatedBookingId})
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-status-green">
                          Free In Stock
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setAllocationModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmAllocation}
              disabled={eligibleChassisUnits.length === 0}
            >
              Lock Chassis Allocation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Token Receipt Printable Modal */}
      <Modal
        isOpen={tokenReceiptOpen}
        onClose={() => setTokenReceiptOpen(false)}
        title={activeBooking ? `Token Advance Receipt: ${activeBooking.bookingNumber}` : ''}
        size="md"
      >
        {activeBooking && (
          <div className="p-6 bg-white text-slate-900 border border-border rounded-card space-y-4 text-xs font-sans">
            <div className="text-center border-b pb-3">
              <h3 className="font-bold text-base text-navy-900">{state.dealership.name}</h3>
              <p className="text-[11px] text-slate-500">{state.dealership.headOffice}</p>
              <div className="text-[11px] font-mono text-slate-600 mt-1">
                GSTIN: {state.dealership.gstin}
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded">
              <div>
                <span className="text-[10px] text-slate-500 block">Receipt Voucher:</span>
                <span className="font-mono font-bold text-primary">{activeBooking.bookingNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Date of Advance:</span>
                <span className="font-bold">{formatDate(activeBooking.bookingDate)}</span>
              </div>
            </div>

            <div className="space-y-2 py-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Received from:</span>
                <span className="font-bold">{activeBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Mobile Phone:</span>
                <span className="font-medium">{activeBooking.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Model Reserved:</span>
                <span className="font-bold">{activeBooking.modelName} ({activeBooking.colorName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Reference:</span>
                <span className="font-mono">{activeBooking.paymentRef || activeBooking.paymentMode}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-bold">
                <span>Advance Token Amount:</span>
                <span className="text-emerald-700 tabular-nums">
                  {formatMoney(activeBooking.tokenAmountPaise)}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 border-t pt-2 italic leading-relaxed">
              * Note: Token is adjustable against final ex-showroom on-road invoice. Booking cancellation is subject to dealership refund approval policy.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="secondary" onClick={() => window.print()}>
                Print Receipt
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  toast.success(`Token receipt dispatched to ${activeBooking.phone} via WhatsApp`);
                  setTokenReceiptOpen(false);
                }}
              >
                Share on WhatsApp
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Booking Cancellation & Refund Request Modal */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelBooking}
        title="Cancel Vehicle Booking & Request Refund"
        message={`Are you sure you want to cancel booking ${activeBooking?.bookingNumber} for ${activeBooking?.customerName}? This will de-allocate chassis ${activeBooking?.allocatedChassisNumber || 'unit'} and require refund approval.`}
        confirmLabel="Confirm Cancellation"
        danger={true}
      />
    </div>
  );
}
