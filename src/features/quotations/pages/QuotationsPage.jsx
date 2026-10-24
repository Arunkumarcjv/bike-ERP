import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../../store';
import { calculateOnRoadPrice } from '../../../lib/onRoadPrice';
import { calculateEmi } from '../../../lib/emi';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { Drawer } from '../../../components/ui/Drawer';
import { BikeThumb } from '../../../components/domain/BikeThumb';
import { formatMoney, formatDate } from '../../../lib/format';
import {
  FileSpreadsheet,
  PlusCircle,
  FileDown,
  MessageSquare,
  Calculator,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

export function QuotationsPage() {
  const state = useAppStore();
  const quotations = state.quotations || [];
  const bikeCatalog = state.catalogs.bikes || [];
  const currentUser = state.currentUser;
  const updateDiscountStatus = state.updateDiscountStatus;
  const addQuotation = state.addQuotation;

  // Builder modal state
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedBikeId, setSelectedBikeId] = useState(bikeCatalog[0]?.id || '');
  const [selectedVariantId, setSelectedVariantId] = useState(bikeCatalog[0]?.variants[0]?.id || '');
  const [selectedColor, setSelectedColor] = useState(bikeCatalog[0]?.colors[0]?.name || '');
  const [customerName, setCustomerName] = useState('Anand Murthy');
  const [customerPhone, setCustomerPhone] = useState('+91 98451 90214');
  const [discountRupees, setDiscountRupees] = useState(0);

  // Active detail & preview
  const [activeQuotation, setActiveQuotation] = useState(null);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  // EMI calculator drawer
  const [emiDrawerOpen, setEmiDrawerOpen] = useState(false);
  const [emiDownPaymentRupees, setEmiDownPaymentRupees] = useState(40000);
  const [emiTenureMonths, setEmiTenureMonths] = useState(36);
  const [emiRate, setEmiRate] = useState(10.5);

  const selectedBike = bikeCatalog.find((b) => b.id === selectedBikeId) || bikeCatalog[0];
  const selectedVariant = selectedBike.variants.find((v) => v.id === selectedVariantId) || selectedBike.variants[0];

  // Dynamic price engine computation
  const currentPricing = useMemo(() => {
    const baseExShowroom = selectedBike.exShowroomPaise + (selectedVariant?.priceDiffPaise || 0);
    const discountPaise = Number(discountRupees) * 100;

    return calculateOnRoadPrice({
      exShowroomPaise: baseExShowroom,
      displacementCc: selectedBike.displacementCc,
      fuelType: selectedBike.fuelType,
      selectedAccessories: [
        { id: 'acc-1', name: 'Engine Crash Guard', pricePaise: 385000 },
      ],
      applicableOffers: [
        { id: 'off-1', code: 'DEALER_SCHEME', title: 'Dealership Festive Allowance', discountPaise: 200000 },
      ],
      approvedDiscountPaise: discountPaise,
    });
  }, [selectedBike, selectedVariant, discountRupees]);

  // EMI simulation
  const loanPrincipalPaise = Math.max(
    0,
    currentPricing.netOnRoadPricePaise - Number(emiDownPaymentRupees) * 100
  );
  const emiDetails = calculateEmi({
    principalPaise: loanPrincipalPaise,
    annualInterestRatePercent: Number(emiRate),
    tenureMonths: Number(emiTenureMonths),
  });

  const handleCreateQuotation = (e) => {
    e.preventDefault();
    const discountPaise = Number(discountRupees) * 100;

    // Gate: If discount > ₹2,000 (executive limit), marked PENDING_APPROVAL
    const requiresApproval = discountPaise > 200000;
    const discountStatus = requiresApproval ? 'PENDING_APPROVAL' : 'APPROVED';

    const newQ = {
      id: `qt-${Date.now()}`,
      quotationNumber: `QT/2627/${String(quotations.length + 1).padStart(5, '0')}`,
      leadId: `lead-gen-${Date.now()}`,
      customerName,
      phone: customerPhone,
      modelId: selectedBike.id,
      modelName: `${selectedBike.brand} ${selectedBike.model}`,
      variantName: selectedVariant.name,
      colorName: selectedColor,
      exShowroomPaise: currentPricing.exShowroomPaise,
      roadTaxPaise: currentPricing.roadTaxPaise,
      rtoFeePaise: currentPricing.rtoFeePaise,
      insurancePaise: currentPricing.insurancePaise,
      handlingPaise: currentPricing.handlingPaise,
      accessoriesPaise: currentPricing.accessoriesTotalPaise,
      discountPaise: currentPricing.approvedDiscountPaise,
      discountStatus,
      netOnRoadPricePaise: currentPricing.netOnRoadPricePaise,
      validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Sales Staff',
    };

    addQuotation(newQ);
    setBuilderOpen(false);

    if (requiresApproval) {
      toast.warning(
        `Quotation ${newQ.quotationNumber} logged with ₹${Number(discountRupees).toLocaleString('en-IN')} discount. Pending Sales Manager Gate!`
      );
    } else {
      toast.success(`Quotation ${newQ.quotationNumber} generated successfully!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Vehicle Quotations & On-Road Engine</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Statutory tax calculation with approval gates and instant WhatsApp generation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={Calculator}
            onClick={() => setEmiDrawerOpen(true)}
          >
            EMI Calculator
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => setBuilderOpen(true)}
          >
            New Quotation Builder
          </Button>
        </div>
      </div>

      {/* Quotation List Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Quotation #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Bike Model & Variant</th>
                <th className="p-3.5">Colour</th>
                <th className="p-3.5">Ex-Showroom</th>
                <th className="p-3.5">Net On-Road</th>
                <th className="p-3.5">Discount Status</th>
                <th className="p-3.5">Valid Until</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {quotations.map((q) => (
                <tr
                  key={q.id}
                  onClick={() => setActiveQuotation(q)}
                  className="hover:bg-surface-subtle/70 transition-colors cursor-pointer"
                >
                  <td className="p-3.5 font-mono font-bold text-primary">{q.quotationNumber}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-text-main">{q.customerName}</div>
                    <div className="text-[10px] text-text-muted">{q.phone}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-medium text-text-main">{q.modelName}</div>
                    <div className="text-[10px] text-text-muted">{q.variantName}</div>
                  </td>
                  <td className="p-3.5 text-text-main">{q.colorName}</td>
                  <td className="p-3.5 tabular-nums text-text-muted">{formatMoney(q.exShowroomPaise)}</td>
                  <td className="p-3.5 tabular-nums font-bold text-text-main">
                    {formatMoney(q.netOnRoadPricePaise)}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={q.discountStatus} />
                  </td>
                  <td className="p-3.5 text-text-muted">{formatDate(q.validUntil)}</td>
                  <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={FileDown}
                        onClick={() => {
                          setActiveQuotation(q);
                          setPdfPreviewOpen(true);
                        }}
                      >
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={MessageSquare}
                        onClick={() => {
                          toast.success(`Quotation sent to ${q.customerName} on WhatsApp!`);
                        }}
                      >
                        Share
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Comprehensive Quotation Builder Modal */}
      <Modal
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        title="Interactive On-Road Price Quotation Builder"
        size="xl"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Form: Vehicle & Customer Configuration */}
            <div className="space-y-4">
              <div className="p-3 bg-surface-subtle rounded-card border border-border">
                <h4 className="font-semibold text-text-main mb-2">1. Customer Identification</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-text-muted block">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-2 rounded-input border border-border bg-surface text-text-main"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-text-muted block">Mobile Phone (+91)</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full p-2 rounded-input border border-border bg-surface text-text-main"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-surface-subtle rounded-card border border-border">
                <h4 className="font-semibold text-text-main mb-2">2. Vehicle & Variant</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-text-muted block">Bike Model</label>
                    <select
                      value={selectedBikeId}
                      onChange={(e) => {
                        const newBikeId = e.target.value;
                        setSelectedBikeId(newBikeId);
                        const b = bikeCatalog.find((x) => x.id === newBikeId);
                        setSelectedVariantId(b?.variants[0]?.id || '');
                        setSelectedColor(b?.colors[0]?.name || '');
                      }}
                      className="w-full p-2 rounded-input border border-border bg-surface text-text-main"
                    >
                      {bikeCatalog.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.brand} {b.model} ({b.displacementCc > 0 ? `${b.displacementCc}cc` : 'EV'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-text-muted block">Variant Specification</label>
                    <select
                      value={selectedVariantId}
                      onChange={(e) => setSelectedVariantId(e.target.value)}
                      className="w-full p-2 rounded-input border border-border bg-surface text-text-main"
                    >
                      {selectedBike.variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.priceDiffPaise >= 0 ? '+' : ''}
                          {formatMoney(v.priceDiffPaise)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-text-muted block">Colour Option</label>
                    <select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-full p-2 rounded-input border border-border bg-surface text-text-main"
                    >
                      {selectedBike.colors.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-surface-subtle rounded-card border border-border">
                <h4 className="font-semibold text-text-main mb-2">3. Dealership Discount</h4>
                <div>
                  <label className="text-[11px] text-text-muted block">
                    Special Cash Discount (₹ Rupees)
                  </label>
                  <input
                    type="number"
                    value={discountRupees}
                    onChange={(e) => setDiscountRupees(Number(e.target.value))}
                    className="w-full p-2 rounded-input border border-border bg-surface text-text-main"
                  />
                  <div className="mt-1 text-[10px] text-text-muted">
                    {Number(discountRupees) > 2000 ? (
                      <span className="text-status-amber font-semibold">
                        Discount &gt; ₹2,000 exceeds Sales Executive limit. Creates pending Manager Approval Gate.
                      </span>
                    ) : (
                      <span className="text-status-green">
                        Auto-approved within standard Sales Executive discretion (≤ ₹2,000).
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live Statutory On-Road Calculation Sheet */}
            <div className="bg-surface-subtle p-4 rounded-card border border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="font-bold text-sm text-text-main">
                      {selectedBike.brand} {selectedBike.model}
                    </h3>
                    <div className="text-[11px] text-text-muted">
                      {selectedVariant.name} • {selectedColor}
                    </div>
                  </div>
                  <BikeThumb
                    bodyType={selectedBike.bodyType}
                    color={
                      selectedBike.colors.find((c) => c.name === selectedColor)?.hex || '#2563EB'
                    }
                    className="w-16 h-10"
                  />
                </div>

                {/* Line Item Breakdown with Rule Tags */}
                <div className="divide-y divide-border/60 py-3 space-y-2">
                  {currentPricing.lines.map((line, idx) => (
                    <div key={idx} className="pt-2 flex items-start justify-between text-xs">
                      <div>
                        <div
                          className={`font-semibold ${
                            line.isDeduction ? 'text-status-green' : 'text-text-main'
                          }`}
                        >
                          {line.label}
                        </div>
                        <div className="text-[10px] text-text-muted italic">{line.ruleUsed}</div>
                      </div>
                      <div
                        className={`tabular-nums font-bold ${
                          line.isDeduction ? 'text-status-green' : 'text-text-main'
                        }`}
                      >
                        {line.isDeduction ? '- ' : ''}
                        {formatMoney(line.amountPaise)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Payable */}
              <div className="pt-4 border-t-2 border-border mt-4">
                <div className="flex items-center justify-between text-base font-bold text-text-main">
                  <span>Net On-Road Price:</span>
                  <span className="text-primary tabular-nums">
                    {formatMoney(currentPricing.netOnRoadPricePaise)}
                  </span>
                </div>
                <div className="text-[10px] text-text-muted mt-1 text-right">
                  Price valid for 7 days. Subject to RTO tariff updates.
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setBuilderOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Official Quotation
            </Button>
          </div>
        </form>
      </Modal>

      {/* PDF Printable Quotation Modal */}
      <Modal
        isOpen={pdfPreviewOpen}
        onClose={() => setPdfPreviewOpen(false)}
        title={activeQuotation ? `Quotation Sheet: ${activeQuotation.quotationNumber}` : ''}
        size="lg"
      >
        {activeQuotation && (
          <div className="p-6 bg-white text-slate-900 font-sans space-y-6 border border-border rounded-card">
            {/* Letterhead */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-navy-900">{state.dealership.name}</h2>
                <p className="text-xs text-slate-500">{state.dealership.headOffice}</p>
                <p className="text-xs text-slate-500 font-mono">
                  GSTIN: {state.dealership.gstin} | State: Karnataka (29)
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-primary font-mono">
                  {activeQuotation.quotationNumber}
                </div>
                <div className="text-xs text-slate-500">Date: {formatDate(activeQuotation.createdAt)}</div>
                <div className="text-xs text-slate-500">Valid Till: {formatDate(activeQuotation.validUntil)}</div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-slate-500 block uppercase text-[10px]">Quote Prepared For:</span>
                <span className="font-bold text-sm text-slate-800">{activeQuotation.customerName}</span>
                <div className="text-slate-600">{activeQuotation.phone}</div>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block uppercase text-[10px]">Vehicle Configuration:</span>
                <span className="font-bold text-sm text-slate-800">{activeQuotation.modelName}</span>
                <div className="text-slate-600">Variant: {activeQuotation.variantName} | Color: {activeQuotation.colorName}</div>
              </div>
            </div>

            {/* Price Table */}
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2 border border-slate-200">Component</th>
                  <th className="p-2 border border-slate-200 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-slate-200">Ex-Showroom Price (Incl. GST)</td>
                  <td className="p-2 border border-slate-200 text-right tabular-nums">
                    {formatMoney(activeQuotation.exShowroomPaise)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-200">Life Time Road Tax (Karnataka LTT)</td>
                  <td className="p-2 border border-slate-200 text-right tabular-nums">
                    {formatMoney(activeQuotation.roadTaxPaise)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-200">RTO Registration, Smart Card & HSRP</td>
                  <td className="p-2 border border-slate-200 text-right tabular-nums">
                    {formatMoney(activeQuotation.rtoFeePaise)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-200">Comprehensive Insurance (1-Yr OD + 5-Yr TP)</td>
                  <td className="p-2 border border-slate-200 text-right tabular-nums">
                    {formatMoney(activeQuotation.insurancePaise)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-200">Showroom Handling & Logistics</td>
                  <td className="p-2 border border-slate-200 text-right tabular-nums">
                    {formatMoney(activeQuotation.handlingPaise)}
                  </td>
                </tr>
                {activeQuotation.accessoriesPaise > 0 && (
                  <tr>
                    <td className="p-2 border border-slate-200">Accessories Fitted</td>
                    <td className="p-2 border border-slate-200 text-right tabular-nums">
                      {formatMoney(activeQuotation.accessoriesPaise)}
                    </td>
                  </tr>
                )}
                {activeQuotation.discountPaise > 0 && (
                  <tr className="text-emerald-700 font-semibold bg-emerald-50">
                    <td className="p-2 border border-slate-200">Special Approved Dealership Discount</td>
                    <td className="p-2 border border-slate-200 text-right tabular-nums">
                      - {formatMoney(activeQuotation.discountPaise)}
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-100 font-bold text-sm">
                  <td className="p-2.5 border border-slate-200">Total Net On-Road Price</td>
                  <td className="p-2.5 border border-slate-200 text-right text-primary tabular-nums">
                    {formatMoney(activeQuotation.netOnRoadPricePaise)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Approval Gate status */}
            {activeQuotation.discountStatus === 'PENDING_APPROVAL' && (
              <div className="p-3 rounded bg-amber-50 border border-amber-200 text-status-amber text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Discount pending authorization by Sales Manager / Admin. Cannot convert to booking.</span>
                </div>
                {currentUser?.role === 'Sales Manager' || currentUser?.role === 'Super Admin' ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      updateDiscountStatus(activeQuotation.id, 'APPROVED', currentUser.name);
                      setPdfPreviewOpen(false);
                      toast.success(`Discount approved by ${currentUser.name}!`);
                    }}
                  >
                    Authorize Discount
                  </Button>
                ) : null}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="secondary" onClick={() => window.print()}>
                Print / Save PDF
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  toast.success(`Quotation PDF dispatched to ${activeQuotation.phone} via WhatsApp`);
                  setPdfPreviewOpen(false);
                }}
              >
                Send via WhatsApp
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* EMI Side Panel */}
      <Drawer
        isOpen={emiDrawerOpen}
        onClose={() => setEmiDrawerOpen(false)}
        title="Two-Wheeler Loan EMI Side Panel"
        size="md"
      >
        <div className="space-y-6 text-xs">
          <p className="text-text-muted">
            Configure down payment and interest rate to calculate live monthly instalments.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-text-muted block font-semibold mb-1">
                Vehicle On-Road Price Reference
              </label>
              <div className="text-lg font-bold text-text-main tabular-nums">
                {formatMoney(currentPricing.netOnRoadPricePaise)}
              </div>
            </div>

            <div>
              <label className="text-text-muted block font-semibold mb-1">
                Down Payment (₹ Rupees)
              </label>
              <input
                type="number"
                value={emiDownPaymentRupees}
                onChange={(e) => setEmiDownPaymentRupees(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              />
            </div>

            <div>
              <label className="text-text-muted block font-semibold mb-1">
                Financing Tenure (Months)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[12, 24, 36, 48].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setEmiTenureMonths(m)}
                    className={`py-2 rounded-button border font-semibold ${
                      emiTenureMonths === m
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-surface-subtle text-text-main'
                    }`}
                  >
                    {m}M
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-text-muted block font-semibold mb-1">
                Annual Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.25"
                value={emiRate}
                onChange={(e) => setEmiRate(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              />
            </div>
          </div>

          {/* Computed EMI Card */}
          <Card className="p-5 bg-blue-50 border-blue-200">
            <div className="text-xs text-text-muted uppercase font-semibold">
              Monthly Equated Instalment
            </div>
            <div className="text-2xl font-bold text-primary mt-1 tabular-nums">
              {formatMoney(emiDetails.monthlyEmiPaise)} / mo
            </div>

            <div className="mt-4 pt-3 border-t border-blue-200 grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-text-muted block">Loan Principal:</span>
                <span className="font-bold text-text-main tabular-nums">
                  {formatMoney(emiDetails.principalPaise)}
                </span>
              </div>
              <div>
                <span className="text-text-muted block">Total Interest:</span>
                <span className="font-bold text-text-main tabular-nums">
                  {formatMoney(emiDetails.totalInterestPaise)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </Drawer>
    </div>
  );
}
