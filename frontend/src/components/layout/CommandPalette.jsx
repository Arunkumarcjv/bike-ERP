import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { Search, User, Bike, FileText, ClipboardList, Wrench, X } from 'lucide-react';

export function CommandPalette() {
  const isOpen = useAppStore((state) => state.commandPaletteOpen);
  const setOpen = useAppStore((state) => state.setCommandPaletteOpen);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const customers = useAppStore((state) => state.customers || []);
  const vehicleStock = useAppStore((state) => state.vehicleStock || []);
  const invoices = useAppStore((state) => state.invoices || []);
  const leads = useAppStore((state) => state.leads || []);
  const jobCards = useAppStore((state) => state.jobCards || []);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matches = [];

    // Search customers
    customers.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.phone.includes(q)) {
        matches.push({
          type: 'Customer',
          icon: User,
          title: c.name,
          subtitle: `${c.phone} • ${c.loyaltyTier} Tier`,
          path: `/customers`,
        });
      }
    });

    // Search vehicles by chassis or model
    vehicleStock.forEach((v) => {
      if (v.chassisNumber.toLowerCase().includes(q) || v.modelName.toLowerCase().includes(q)) {
        matches.push({
          type: 'Vehicle',
          icon: Bike,
          title: `${v.modelName} (${v.colorName})`,
          subtitle: `VIN: ${v.chassisNumber} • Status: ${v.status}`,
          path: `/stock/vehicles`,
        });
      }
    });

    // Search invoices
    invoices.forEach((inv) => {
      if (inv.invoiceNumber.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q)) {
        matches.push({
          type: 'Invoice',
          icon: FileText,
          title: inv.invoiceNumber,
          subtitle: `${inv.customerName} • ₹${(inv.grandTotalPaise / 100).toLocaleString('en-IN')}`,
          path: `/billing`,
        });
      }
    });

    // Search job cards
    jobCards.forEach((jc) => {
      if (jc.jobCardNumber.toLowerCase().includes(q) || jc.registrationNumber.toLowerCase().includes(q)) {
        matches.push({
          type: 'Job Card',
          icon: Wrench,
          title: `${jc.jobCardNumber} (${jc.registrationNumber})`,
          subtitle: `${jc.customerName} • ${jc.stage.replace(/_/g, ' ')}`,
          path: `/service/jobs`,
        });
      }
    });

    // Search leads
    leads.forEach((l) => {
      if (l.customerName.toLowerCase().includes(q) || l.phone.includes(q)) {
        matches.push({
          type: 'Lead',
          icon: ClipboardList,
          title: l.customerName,
          subtitle: `${l.modelName} • Stage: ${l.stage}`,
          path: `/leads`,
        });
      }
    });

    return matches.slice(0, 10);
  }, [query, customers, vehicleStock, invoices, jobCards, leads]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-xl bg-surface rounded-card border border-border shadow-dialog overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-surface-subtle">
          <Search className="w-5 h-5 text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Type customer name, phone, VIN chassis, invoice #, registration..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-text-main placeholder-text-muted focus:outline-none"
          />
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded text-text-muted hover:text-text-main hover:bg-surface-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-xs text-text-muted">
              Search customers, bikes, chassis numbers, registration numbers, invoices, job cards...
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-text-muted">
              No matching records found for "{query}"
            </div>
          ) : (
            results.map((res, i) => {
              const Icon = res.icon;
              return (
                <button
                  key={i}
                  onClick={() => {
                    navigate(res.path);
                    setOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-button hover:bg-surface-subtle flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-surface-muted text-text-muted group-hover:text-primary transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text-main group-hover:text-primary transition-colors">
                        {res.title}
                      </div>
                      <div className="text-[11px] text-text-muted">{res.subtitle}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-surface-muted text-text-muted">
                    {res.type}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
