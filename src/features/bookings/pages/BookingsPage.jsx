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
  Search,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Summary Metrics
  const totalBookings = bookings.length;
  const totalTokenPaise = bookings.reduce((sum, b) => sum + (b.tokenAmountPaise || 0), 0);
  const allocatedCount = bookings.filter((b) => b.allocatedChassisNumber).length;
  const unallocatedCount = totalBookings - allocatedCount;

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !searchTerm ||
      b.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone?.includes(searchTerm) ||
      b.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.allocatedChassisNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ALLOCATED' && b.allocatedChassisNumber) ||
      (statusFilter === 'UNALLOCATED' && !b.allocatedChassisNumber) ||
      b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-xl font-bold text-text-main flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-primary shrink-0" />
            Vehicle Reservations &amp; Bookings
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Token receipts, single-unit chassis allocation gates and delivery reservations
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
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

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-card border border-border shadow-soft">
          <div className="text-xs text-text-muted">Total Reservations</div>
          <div className="text-2xl font-bold text-text-main mt-1 tabular-nums">{totalBookings} Active</div>
          <div className="text-[11px] text-text-muted mt-0.5">Confirmed showroom bookings</div>
        </div>

        <div className="bg-surface p-4 rounded-card border border-border shadow-soft">
          <div className="text-xs text-text-muted">Total Token Advances</div>
          <div className="text-2xl font-bold text-status-green mt-1 tabular-nums">
            {formatMoney(totalTokenPaise)}
          </div>
          <div className="text-[11px] text-status-green font-semibold mt-0.5">Adjustable in final invoice</div>
        </div>

        <div className="bg-surface p-4 rounded-card border border-border shadow-soft">
          <div className="text-xs text-text-muted">Chassis VIN Allocated</div>
          <div className="text-2xl font-bold text-primary mt-1 tabular-nums">
            {allocatedCount} of {totalBookings}
          </div>
          <div className="text-[11px] text-text-muted mt-0.5">Single-chassis locked to stock</div>
        </div>

        <div className="bg-surface p-4 rounded-card border border-border shadow-soft">
          <div className="text-xs text-text-muted">Awaiting VIN Allocation</div>
          <div className="text-2xl font-bold text-status-amber mt-1 tabular-nums">
            {unallocatedCount} Units
          </div>
          <div className="text-[11px] text-status-amber font-semibold mt-0.5">Pending stock intake or transfer</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-3 rounded-card border border-border shadow-soft">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 shrink-0" />
          <input
            type="text"
            placeholder="Search booking #, customer, phone, or VIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-input bg-surface-subtle border border-border text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: `All (${totalBookings})` },
            { id: 'CONFIRMED', label: 'Confirmed' },
            { id: 'ALLOCATED', label: `Allocated (${allocatedCount})` },
            { id: 'UNALLOCATED', label: `Awaiting VIN (${unallocatedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-button text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-subtle text-text-muted hover:text-text-main border border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="px-4 py-3 whitespace-nowrap">Booking #</th>
                <th className="px-4 py-3 whitespace-nowrap">Customer</th>
                <th className="px-4 py-3 whitespace-nowrap">Model &amp; Colour</th>
                <th className="px-4 py-3 whitespace-nowrap">Token Paid</th>
                <th className="px-4 py-3 whitespace-nowrap">Allocated Chassis (VIN)</th>
                <th className="px-4 py-3 whitespace-nowrap">Est. Delivery</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-right whitespace-nowrap pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-muted text-xs">
                    No bookings found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-primary whitespace-nowrap">
                      {booking.bookingNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-text-main">{booking.customerName}</div>
                      <div className="text-[11px] font-mono text-text-muted whitespace-nowrap mt-0.5">
                        {booking.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-text-main">{booking.modelName}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">{booking.colorName}</div>
                    </td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap">
                      <div className="font-bold text-status-green">
                        {formatMoney(booking.tokenAmountPaise)}
                      </div>
                      <div className="text-[10px] uppercase font-semibold text-text-muted mt-0.5">
                        {booking.paymentMode}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {booking.allocatedChassisNumber ? (
                        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-status-blue border border-blue-200 inline-flex items-center gap-1.5">
                          <Warehouse className="w-3.5 h-3.5 shrink-0" />
                          <span>{booking.allocatedChassisNumber}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-status-amber bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Awaiting VIN</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                      {formatDate(booking.tentativeDeliveryDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="xs"
                          variant="secondary"
                          icon={FileText}
                          onClick={() => {
                            setActiveBooking(booking);
                            setTokenReceiptOpen(true);
                          }}
                          title="Print or share token advance receipt"
                        >
                          Receipt
                        </Button>
                        <Button
                          size="xs"
                          variant="primary"
                          icon={Warehouse}
                          onClick={() => handleOpenAllocation(booking)}
                          title="Allocate single physical chassis VIN"
                        >
                          {booking.allocatedChassisNumber ? 'Re-allocate' : 'Allocate VIN'}
                        </Button>
                        <Button
                          size="xs"
                          variant="danger"
                          icon={XCircle}
                          onClick={() => {
                            setActiveBooking(booking);
                            setCancelModalOpen(true);
                          }}
                          title="Cancel booking reservation"
                        >
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
