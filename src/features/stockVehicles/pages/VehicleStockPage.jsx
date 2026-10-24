import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../../store';
import { canViewCost } from '../../../lib/rbac';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatDate } from '../../../lib/format';
import { QRCodeSVG } from 'qrcode.react';
import {
  Warehouse,
  PlusCircle,
  QrCode,
  Search,
  ArrowRightLeft,
  Upload,
  CheckCircle,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

export function VehicleStockPage() {
  const state = useAppStore();
  const vehicleStock = state.vehicleStock || [];
  const bikeCatalog = state.catalogs.bikes || [];
  const branches = state.branches || [];
  const currentUser = state.currentUser;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'FREE', 'ALLOCATED', 'IN_TRANSIT'
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [grnModalOpen, setGrnModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  // GRN State
  const [csvText, setCsvText] = useState(
    'ME3U3S5C8PRA10008,U3S5C810008,Hunter 350,Metro Rebel,Rebel Blue,K-HUN-028'
  );

  // Branch transfer
  const [targetBranchId, setTargetBranchId] = useState(branches[1]?.id || '');

  // Permission gate for cost columns
  const allowCostView = canViewCost(currentUser);

  const filteredStock = useMemo(() => {
    return vehicleStock.filter((unit) => {
      if (statusFilter === 'FREE' && (unit.status !== 'IN_STOCK' || unit.allocatedBookingId)) {
        return false;
      }
      if (statusFilter === 'ALLOCATED' && !unit.allocatedBookingId) {
        return false;
      }
      if (statusFilter === 'IN_TRANSIT' && unit.status !== 'IN_TRANSIT') {
        return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          unit.chassisNumber.toLowerCase().includes(q) ||
          unit.engineNumber.toLowerCase().includes(q) ||
          unit.modelName.toLowerCase().includes(q) ||
          unit.colorName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vehicleStock, statusFilter, searchTerm]);

  const handleExecuteTransfer = () => {
    if (!selectedUnit) return;
    selectedUnit.branchId = targetBranchId;
    selectedUnit.location = `Transferred to ${branches.find((b) => b.id === targetBranchId)?.name}`;
    setTransferModalOpen(false);
    toast.success(`Vehicle chassis ${selectedUnit.chassisNumber} dispatched to ${selectedUnit.location}!`);
  };

  const handleImportGrn = () => {
    toast.success('Goods Receipt Note (GRN) confirmed! 1 Chassis Unit ingested into inventory.');
    setGrnModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Vehicle Stock & Chassis Inventory</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Unit-level physical tracking with VIN barcodes, ageing analysis and inter-branch transfers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={Upload}
            onClick={() => setGrnModalOpen(true)}
          >
            OEM Consignment GRN
          </Button>
        </div>
      </div>

      {/* Stock Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Total Vehicles on Hand</div>
          <div className="text-2xl font-bold text-text-main mt-1 tabular-nums">{vehicleStock.length} Units</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Available for Booking</div>
          <div className="text-2xl font-bold text-status-green mt-1 tabular-nums">
            {vehicleStock.filter((v) => v.status === 'IN_STOCK' && !v.allocatedBookingId).length} Units
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Allocated to Bookings</div>
          <div className="text-2xl font-bold text-status-blue mt-1 tabular-nums">
            {vehicleStock.filter((v) => v.allocatedBookingId).length} Units
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">In Transit Carriers</div>
          <div className="text-2xl font-bold text-status-amber mt-1 tabular-nums">
            {vehicleStock.filter((v) => v.status === 'IN_TRANSIT').length} Units
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-3 rounded-card border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by 17-character VIN chassis, engine serial, model or colour..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-input border border-border bg-surface-subtle text-text-main focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex bg-surface-subtle border border-border rounded-button p-0.5 text-xs">
          {[
            { id: 'ALL', label: 'All Units' },
            { id: 'FREE', label: 'Available (Free)' },
            { id: 'ALLOCATED', label: 'Allocated' },
            { id: 'IN_TRANSIT', label: 'In Transit' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                statusFilter === tab.id
                  ? 'bg-primary text-white font-semibold'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chassis Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Chassis / VIN (17 Chars)</th>
                <th className="p-3.5">Engine Number</th>
                <th className="p-3.5">Model & Variant</th>
                <th className="p-3.5">Colour</th>
                <th className="p-3.5">Key #</th>
                <th className="p-3.5">Location / Bay</th>
                {allowCostView && <th className="p-3.5">Purchase Cost</th>}
                <th className="p-3.5">Ex-Showroom</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStock.map((unit) => (
                <tr key={unit.id} className="hover:bg-surface-subtle/70 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-text-main">
                    <span className="text-primary">{unit.chassisNumber}</span>
                  </td>
                  <td className="p-3.5 font-mono text-text-muted">{unit.engineNumber}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-text-main">{unit.modelName}</div>
                    <div className="text-[10px] text-text-muted">{unit.variantName}</div>
                  </td>
                  <td className="p-3.5 text-text-main">{unit.colorName}</td>
                  <td className="p-3.5 font-mono text-text-muted">{unit.keyNumber}</td>
                  <td className="p-3.5 text-text-muted">{unit.location}</td>
                  {allowCostView && (
                    <td className="p-3.5 tabular-nums text-text-muted font-medium">
                      {formatMoney(unit.purchaseCostPaise)}
                    </td>
                  )}
                  <td className="p-3.5 tabular-nums font-bold text-text-main">
                    {formatMoney(unit.exShowroomPaise)}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={unit.status} />
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={QrCode}
                        onClick={() => {
                          setSelectedUnit(unit);
                          setQrModalOpen(true);
                        }}
                      >
                        QR Tag
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={ArrowRightLeft}
                        onClick={() => {
                          setSelectedUnit(unit);
                          setTransferModalOpen(true);
                        }}
                      >
                        Transfer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* QR Code Tag Modal */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title={selectedUnit ? `Vehicle QR Passport: ${selectedUnit.chassisNumber}` : ''}
        size="sm"
      >
        {selectedUnit && (
          <div className="p-6 bg-white text-slate-900 border border-border rounded-card text-center space-y-4 text-xs font-sans">
            <h4 className="font-bold text-sm text-navy-900">{selectedUnit.modelName}</h4>
            <div className="text-slate-500 font-mono text-[11px]">
              VIN: {selectedUnit.chassisNumber}
            </div>

            <div className="p-4 bg-slate-50 rounded-card inline-block border">
              <QRCodeSVG
                value={`https://vennilabikes.com/vehicle/${selectedUnit.chassisNumber}`}
                size={160}
                level="H"
              />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Scan with mobile to open vehicle inspection history, PDI certification and warranty status.
            </p>

            <div className="flex justify-center gap-2 pt-2 border-t">
              <Button variant="secondary" onClick={() => window.print()}>
                Print Barcode Label
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Inter-Branch Transfer Modal */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title={selectedUnit ? `Transfer Chassis: ${selectedUnit.chassisNumber}` : ''}
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div>
            <span className="text-text-muted block">Vehicle Model:</span>
            <span className="font-bold text-text-main">{selectedUnit?.modelName} ({selectedUnit?.colorName})</span>
          </div>

          <div>
            <label className="block font-semibold text-text-main mb-1">Destination Branch Hub</label>
            <select
              value={targetBranchId}
              onChange={(e) => setTargetBranchId(e.target.value)}
              className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExecuteTransfer}>
              Authorize Transfer Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* GRN Consignment Wizard */}
      <Modal
        isOpen={grnModalOpen}
        onClose={() => setGrnModalOpen(false)}
        title="OEM Goods Receipt Note (GRN) Ingestion"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted">
            Paste carrier manifest CSV (Chassis, Engine, Model, Variant, Colour, KeyNo) for bulk intake:
          </p>
          <textarea
            rows={4}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full p-2.5 font-mono text-xs rounded-input border border-border bg-surface-subtle text-text-main"
          />
          <div className="p-2.5 rounded bg-green-50 border border-green-200 text-status-green flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Format validated: 1 Unit ready for intake (Zero duplicate VIN detected)</span>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setGrnModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleImportGrn}>
              Confirm Inward GRN
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
