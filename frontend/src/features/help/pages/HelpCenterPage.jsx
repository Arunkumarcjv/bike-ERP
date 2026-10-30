import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Keyboard, 
  Compass, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  X,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

const KB_ARTICLES = [
  { id: 'kb-01', category: 'Showroom & Sales', title: 'How to allocate a physical chassis to a customer booking', content: 'Navigate to Bookings, click on the booking card, click "Allocate Chassis". The system checks the Vehicle Inventory and enforces double-allocation blocking so no chassis can be reserved twice.' },
  { id: 'kb-02', category: 'Showroom & Sales', title: 'How to handle used bike exchange valuations and refurbishments', content: 'Open Exchange under Finance. Enter customer registration, capture tyre and engine condition, compute fair market value, and assign refurbishment costs. Net value is deducted from new bike on-road price.' },
  { id: 'kb-03', category: 'Finance & Accounts', title: 'How to close the day and reconcile physical cash denominations', content: 'Open Accounts > Day-end Closing. Enter note and coin counts (₹500, ₹200, ₹100, etc.). System computes variance against expected till collections. If variance is non-zero, enter mandatory reason and dual sign.' },
  { id: 'kb-04', category: 'Workshop & Service', title: 'How to execute a 25-point PDI inspection and print gate pass', content: 'Open Operations > Delivery & PDI Desk. Verify all 25 safety items across engine, brakes, electricals and body. Collect customer digital signature on canvas pad. Delivery cannot complete if unresolved FAIL exists.' },
  { id: 'kb-05', category: 'Workshop & Service', title: 'How to send a Digital Vehicle Inspection (DVI) WhatsApp link', content: 'Open Workshop > Digital Inspection (DVI). Record tyre tread mm and brake wear %. Click "Send WhatsApp Approval". Customer receives mobile link with photos to approve or defer supplementary repairs.' },
  { id: 'kb-06', category: 'GST & Compliance', title: 'How to generate B2B e-Invoices and verify IRN QR codes', content: 'Navigate to GST > e-Invoice & e-Way Bill. Invoices for corporate clients with GSTIN are sent to the NIC IRP portal. The 64-character hash and digital signed QR code are returned automatically.' },
  { id: 'kb-07', category: 'Finance & Accounts', title: 'How to run bank reconciliation with CSV upload & auto-matching', content: 'Open Accounts > Bank Reconciliation. Click Upload Bank CSV. The auto-match engine compares amount, date (+/-3 days) and UTR number to match bank records with ERP journal entries.' },
  { id: 'kb-08', category: 'Governance & Admin', title: 'How dual-control approvals prevent unauthorized discounts', content: 'Discounts exceeding sales executive thresholds (₹2,000) trigger an approval ticket in the Approvals Center. The requester cannot approve their own ticket under strict dual-control separation of duties.' },
  { id: 'kb-09', category: 'Workshop & Service', title: 'How to file an OEM warranty reimbursement claim', content: 'Open Customer Care > Warranty AMC & Claims. Click "File OEM Warranty Claim", enter failed OEM part number, failure diagnostics, and attach photo. Status moves from FILED to SUBMITTED to REIMBURSED.' },
  { id: 'kb-10', category: 'Finance & Accounts', title: 'How to track 0-30, 31-60, 61-90 overdue receivables and PTP', content: 'Open Finance > Collections & Receivables. View customer ageing buckets. Set a Promise-to-Pay (PTP) date and send automated polite, firm, or formal WhatsApp reminders with dynamic UPI payment links.' },
  { id: 'kb-11', category: 'Customer Care & CRM', title: 'How to manage complaints escalation within 48h SLA', content: 'Complaints board has 5 stages. Tickets unaddressed after 24h escalate to the Service Manager; after 48h they escalate directly to the Dealer Principal.' },
  { id: 'kb-12', category: 'Administration & System', title: 'How to comply with DPDP Act 2023 customer data erasure', content: 'Open Admin > Privacy and Consent. Search customer profile. Click "Execute Data Erasure". PII is masked, while statutory tax invoices are preserved for 8 years under Section 128 Companies Act.' },
];

const KEYBOARD_SHORTCUTS = [
  { key: 'Ctrl + K / Cmd + K', desc: 'Open Global Command Palette search' },
  { key: 'Ctrl + /', desc: 'Toggle Dark / Light Theme' },
  { key: 'Alt + D', desc: 'Jump to Main Operations Dashboard' },
  { key: 'Alt + B', desc: 'Open Live Service Bays Board' },
  { key: 'Alt + P', desc: 'Quick POS Accessories Counter' },
  { key: 'Esc', desc: 'Close any active modal or drawer' },
];

export function HelpCenterPage() {
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [tourStep, setTourStep] = useState(1);

  const filtered = KB_ARTICLES.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.content.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            Dealership Knowledge Base &amp; Help Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search 20+ operational workflows, inspect system keyboard shortcuts, and launch the interactive product walkthrough tour.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-850 border rounded-lg hover:bg-slate-50 shadow-sm"
          >
            <Keyboard className="w-4 h-4 text-slate-500" />
            Keyboard Shortcuts
          </button>
          <button
            onClick={() => {
              setTourStep(1);
              setShowTourModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
          >
            <Compass className="w-4 h-4" />
            Interactive Onboarding Tour
          </button>
        </div>
      </div>

      {/* Search Input Banner */}
      <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white text-center space-y-4 shadow-xl">
        <h2 className="text-xl font-black">How can we help you operate AKASH Bajaj today?</h2>
        <div className="relative max-w-xl mx-auto">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks (e.g. allocate chassis, close day, e-invoice, PDI)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-white text-slate-900 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Knowledge Base Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(article => (
          <div
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                {article.category}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {article.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
                {article.content}
              </p>
            </div>

            <div className="pt-2 border-t flex items-center justify-between text-xs text-blue-600 font-bold">
              <span>Read Step-by-Step Guide</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start pb-2 border-b">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{selectedArticle.category}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{selectedArticle.title}</h3>
              </div>
              <button onClick={() => setSelectedArticle(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {selectedArticle.content}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-blue-600" />
                AKASH Bajaj Keyboard Shortcuts
              </h3>
              <button onClick={() => setShowShortcutsModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y">
              {KEYBOARD_SHORTCUTS.map(sc => (
                <div key={sc.key} className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">{sc.desc}</span>
                  <span className="px-2 py-1 font-mono font-bold bg-slate-100 dark:bg-slate-800 rounded text-slate-900 dark:text-white">
                    {sc.key}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-200"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Interactive Tour Modal */}
      {showTourModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-blue-600 uppercase text-[10px]">
                Product Tour (Step {tourStep} of 4)
              </span>
              <button onClick={() => setShowTourModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {tourStep === 1 && (
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">1. Core Dealership Operations</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Manage walk-in leads, quotations, booking deposits, and strict double-allocation protected vehicle inventory.
                </p>
              </div>
            )}
            {tourStep === 2 && (
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. Workshop &amp; Live Bays Board</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Track 12 service bays in real-time with mutual-exclusion utilisation stats, digital inspections (DVI), and technician my-jobs view.
                </p>
              </div>
            )}
            {tourStep === 3 && (
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">3. Statutory GST &amp; Accounting</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  GST rules by cc and fuel category, day-end cash counter, bank reconciliation, TDS withholding, and NIC e-Invoicing.
                </p>
              </div>
            )}
            {tourStep === 4 && (
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">4. AI Intelligence &amp; Multi-channel Care</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Multilingual voice assistant (EN/TA/HI), automated WhatsApp customer service, warranty claims, and DPDP privacy governance.
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t">
              <button
                disabled={tourStep === 1}
                onClick={() => setTourStep(tourStep - 1)}
                className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
              >
                Previous
              </button>

              {tourStep < 4 ? (
                <button
                  onClick={() => setTourStep(tourStep + 1)}
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg"
                >
                  Next Step &rarr;
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowTourModal(false);
                    toast.success('Tour completed! Explore all 22 modules from the sidebar.');
                  }}
                  className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg"
                >
                  Finish Tour
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HelpCenterPage;
