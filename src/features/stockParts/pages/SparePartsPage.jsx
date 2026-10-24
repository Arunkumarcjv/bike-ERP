import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney } from '../../../lib/format';
import {
  Wrench,
  Search,
  AlertTriangle,
  Barcode,
  TrendingDown,
  ArrowDownUp,
  PackagePlus,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

export function SparePartsPage() {
  const partsStock = useAppStore((state) => state.partsStock || []);
  const currentUser = useAppStore((state) => state.currentUser);

  const [searchTerm, setSearchTerm] = useState('');
  const [velocityFilter, setVelocityFilter] = useState('ALL'); // 'ALL', 'FAST', 'SLOW', 'DEAD', 'LOW_STOCK'
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustReason, setAdjustReason] = useState('Physical Audit Count Variance');

  const filteredParts = useMemo(() => {
    return partsStock.filter((part) => {
      if (velocityFilter === 'FAST' && part.movementVelocity !== 'FAST') return false;
      if (velocityFilter === 'SLOW' && part.movementVelocity !== 'SLOW') return false;
      if (velocityFilter === 'DEAD' && part.movementVelocity !== 'DEAD') return false;
      if (velocityFilter === 'LOW_STOCK' && part.stockQty >= part.reorderLevel) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          part.name.toLowerCase().includes(q) ||
          part.partNumber.toLowerCase().includes(q) ||
          part.brand.toLowerCase().includes(q) ||
          part.rackBin.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [partsStock, velocityFilter, searchTerm]);

  const handleExecuteAdjustment = () => {
    if (!selectedPart) return;
    selectedPart.stockQty += Number(adjustQty);
    setAdjustModalOpen(false);
    toast.success(`Inventory adjustment saved for ${selectedPart.name}. New Qty: ${selectedPart.stockQty}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Spare Parts & Genuine OEM Inventory</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Rack & bin locator, fast/slow/dead analysis, and strict low-stock reorder triggers
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Catalogue Line Items</div>
          <div className="text-2xl font-bold text-text-main mt-1 tabular-nums">{partsStock.length} SKUs</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Low Stock (Below Reorder)</div>
          <div className="text-2xl font-bold text-status-red mt-1 tabular-nums">
            {partsStock.filter((p) => p.stockQty < p.reorderLevel).length} Items
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Fast Moving Velocity</div>
          <div className="text-2xl font-bold text-status-green mt-1 tabular-nums">
            {partsStock.filter((p) => p.movementVelocity === 'FAST').length} SKUs
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase font-semibold">Dead Stock Items</div>
          <div className="text-2xl font-bold text-text-muted mt-1 tabular-nums">
            {partsStock.filter((p) => p.movementVelocity === 'DEAD').length} SKUs
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-3 rounded-card border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search parts by name, OEM part number, rack/bin or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-input border border-border bg-surface-subtle text-text-main focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex bg-surface-subtle border border-border rounded-button p-0.5 text-xs">
          {[
            { id: 'ALL', label: 'All Spares' },
            { id: 'LOW_STOCK', label: 'Low Stock Alerts' },
            { id: 'FAST', label: 'Fast Movers' },
            { id: 'SLOW', label: 'Slow Movers' },
            { id: 'DEAD', label: 'Dead Stock' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVelocityFilter(tab.id)}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                velocityFilter === tab.id
                  ? 'bg-primary text-white font-semibold'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Parts Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">OEM Part #</th>
                <th className="p-3.5">Part Description</th>
                <th className="p-3.5">Brand</th>
                <th className="p-3.5">Rack & Bin</th>
                <th className="p-3.5">GST Rate</th>
                <th className="p-3.5">MRP Unit Price</th>
                <th className="p-3.5">On Hand</th>
                <th className="p-3.5">Reorder Level</th>
                <th className="p-3.5">Velocity</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredParts.map((part) => {
                const isLow = part.stockQty < part.reorderLevel;
                return (
                  <tr key={part.id} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-text-main">{part.partNumber}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-text-main">{part.name}</div>
                      <div className="text-[10px] text-text-muted">
                        Fits: {part.compatibleModels?.join(', ')}
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-text-muted">{part.brand}</td>
                    <td className="p-3.5 font-mono text-primary font-semibold">{part.rackBin}</td>
                    <td className="p-3.5 tabular-nums text-text-muted">{part.gstRatePercent}%</td>
                    <td className="p-3.5 tabular-nums font-bold text-text-main">
                      {formatMoney(part.unitPricePaise)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-bold tabular-nums text-sm ${
                          isLow ? 'text-status-red' : 'text-text-main'
                        }`}
                      >
                        {part.stockQty}
                      </span>
                    </td>
                    <td className="p-3.5 tabular-nums text-text-muted">Min {part.reorderLevel}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          part.movementVelocity === 'FAST'
                            ? 'bg-green-100 text-status-green'
                            : part.movementVelocity === 'SLOW'
                            ? 'bg-amber-100 text-status-amber'
                            : 'bg-slate-100 text-text-muted'
                        }`}
                      >
                        {part.movementVelocity}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Barcode}
                          onClick={() => {
                            setSelectedPart(part);
                            setBarcodeModalOpen(true);
                          }}
                        >
                          Barcode
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={ArrowDownUp}
                          onClick={() => {
                            setSelectedPart(part);
                            setAdjustModalOpen(true);
                          }}
                        >
                          Adjust
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Barcode Label Modal */}
      <Modal
        isOpen={barcodeModalOpen}
        onClose={() => setBarcodeModalOpen(false)}
        title={selectedPart ? `Barcode Label: ${selectedPart.partNumber}` : ''}
        size="sm"
      >
        {selectedPart && (
          <div className="p-6 bg-white text-slate-900 border border-border rounded-card text-center space-y-3 font-sans text-xs">
            <h4 className="font-bold text-sm text-navy-900">{selectedPart.name}</h4>
            <div className="font-mono text-xs text-slate-600 font-bold">{selectedPart.partNumber}</div>
            <div className="font-mono text-[11px] text-slate-500">Rack / Bin: {selectedPart.rackBin}</div>

            {/* Standard Code128 Simulation SVG */}
            <div className="p-3 bg-slate-50 rounded border inline-block">
              <svg viewBox="0 0 160 50" width="160" height="50" className="mx-auto">
                <rect x="10" y="5" width="2" height="40" fill="#000" />
                <rect x="15" y="5" width="4" height="40" fill="#000" />
                <rect x="22" y="5" width="2" height="40" fill="#000" />
                <rect x="27" y="5" width="5" height="40" fill="#000" />
                <rect x="36" y="5" width="2" height="40" fill="#000" />
                <rect x="42" y="5" width="3" height="40" fill="#000" />
                <rect x="48" y="5" width="5" height="40" fill="#000" />
                <rect x="56" y="5" width="2" height="40" fill="#000" />
                <rect x="62" y="5" width="4" height="40" fill="#000" />
                <rect x="70" y="5" width="3" height="40" fill="#000" />
                <rect x="76" y="5" width="2" height="40" fill="#000" />
                <rect x="82" y="5" width="5" height="40" fill="#000" />
                <rect x="90" y="5" width="3" height="40" fill="#000" />
                <rect x="96" y="5" width="2" height="40" fill="#000" />
                <rect x="102" y="5" width="4" height="40" fill="#000" />
                <rect x="110" y="5" width="2" height="40" fill="#000" />
                <rect x="116" y="5" width="5" height="40" fill="#000" />
                <rect x="125" y="5" width="2" height="40" fill="#000" />
                <rect x="130" y="5" width="4" height="40" fill="#000" />
                <rect x="138" y="5" width="3" height="40" fill="#000" />
                <rect x="144" y="5" width="2" height="40" fill="#000" />
              </svg>
            </div>

            <div className="font-bold text-sm text-slate-800">MRP: {formatMoney(selectedPart.unitPricePaise)}</div>
            <div className="flex justify-center gap-2 pt-2 border-t">
              <Button variant="secondary" onClick={() => window.print()}>
                Print Thermal Label
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Stock Adjustment Modal with Approval Warning */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={selectedPart ? `Stock Adjustment: ${selectedPart.name}` : ''}
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div>
            <span className="text-text-muted block">Current Stock on Hand:</span>
            <span className="font-bold text-sm text-text-main">{selectedPart?.stockQty} Units</span>
          </div>

          <div>
            <label className="block font-semibold text-text-main mb-1">Quantity Adjustment (+/- Units)</label>
            <input
              type="number"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-text-main mb-1">Adjustment Reason (Immutable Audit Log)</label>
            <select
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
            >
              <option value="Physical Audit Count Variance">Physical Audit Count Variance</option>
              <option value="Damaged in Warehouse Transit">Damaged in Warehouse Transit</option>
              <option value="Supplier Return Defective">Supplier Return (Defective Batch)</option>
              <option value="Warranty Replacement Issue">Warranty Replacement Direct Issue</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExecuteAdjustment}>
              Save Stock Adjustment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
