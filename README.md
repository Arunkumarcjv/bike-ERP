# BikeERP — Enterprise Two-Wheeler Showroom & Service Workshop ERP

> **dealership**: Vennila Bike Showroom (Bangalore Central Flagship)  
> **GSTIN**: `29AABCB1829M1ZK` (State Code: 29 Karnataka)  
> **Architecture**: Pure frontend on typed service layer over seeded Zustand store with browser persistence (`IndexedDB` / `localStorage`). Zero backend required; 100% ready for swap to Django REST API without modifying UI.

---

## 🚀 Quick Start

### 1. Install & Run Dev Server
```bash
cd bikeerp-frontend
npm install
npm run dev
```
The application will be live at `http://localhost:5173`.

### 2. Run Test Suite
```bash
npm test
```
Executes all 40 Vitest unit and integration tests asserting:
- Multi-tier vehicle and spare parts GST calculations (HSN 8711 / 8714 / SAC 9987)
- On-road pricing breakdown with statutory fees and round-off
- Gap-free sequential invoice numbering (`VI/2627/00001`)
- Workshop bay appointment slot quotas & Sunday holiday restrictions
- Role-based access control (RBAC) permissions matrix
- Cross-screen financial reconciliation (Sales Order == Invoiced Total == Ledger Debits/Credits)
- D1: Approvals dual-control blocker (requester strictly prohibited from self-approval)
- D4: PDI checklist gatekeeper (any unresolved FAIL blocks gate pass issuance)
- D19: Ageing bucket grouping (0-30, 31-60, 61-90, 90+)
- D22: Day-end cash closing denomination calculation & variance detection
- D25: Section 206C(1F) 1% TCS threshold verification for high-value sales (>₹10 Lakhs)

### 3. Production Build
```bash
npm run build
```
Generates production-optimized bundle in `dist/`.

---

## 🔑 Demo Identities & Switchers

| Persona / Role | Demo User | Key Responsibilities | Access Highlights |
|---|---|---|---|
| **Super Admin** | **Rajesh Varma** | Dealership Owner & Director | Full access, system settings, approval overrides |
| **Sales Manager** | Anand Kumar | Showroom Sales Lead | Discount approvals, order booking, pipeline KPIs |
| **Sales Executive** | Vikram Malhotra | Counter Sales & Quotations | Quotations, test rides, lead follow-ups |
| **Service Manager** | Suresh G. | Workshop Operations Head | Bay scheduling, technician assign, dual QC sign-off |
| **Service Advisor** | Ramesh Babu | Front-Desk Service Reception | Customer intake, job card creation, estimate quotes |
| **Technician** | Karthik Raja | Master Mechanic | Mobile "My Jobs", parts requisition, repair checklists |
| **Accountant** | Pooja Iyer | Financial Controller | Billing, GST filings (GSTR-1/3B), Day Book, Tally export |
| **Inventory Manager** | Sunil Hegde | Warehouse & Parts Manager | Vehicle stock, spare parts reorder, GRN purchase intake |

> **Role Switcher**: Click the user profile pill in the top-right of the topbar to instantly switch roles and inspect permission-gated views.

---

## 🏛️ System Architecture & Financial Rules

1. **Integer Paise Storage**: All currency is stored strictly in integer paise (`amountPaise`). Floating-point mathematics are strictly prohibited in financial selectors to eliminate rounding anomalies.
2. **Dynamic Tax Engine**: Taxes are calculated from the effective-dated `taxRules` catalog. Rates are never hardcoded. Missing rules trigger an explicit CA confirmation warning rather than silent errors.
3. **Sequential Gap-Free Invoicing**: Format `VI/2627/00001` (max 16 characters). Invoices are strictly immutable once posted. Cancellation is executed exclusively through a sequential Credit Note.
4. **Chassis Allocation Integrity**: 17-character VINs are unique and strictly guarded against double-allocation across active bookings and sales orders.
5. **Section 269ST Statutory Protection**: Cash collections of ₹ 2,00,000 or greater trigger an immediate statutory compliance block.
6. **Immutable Audit Trail**: Every create, edit, approve, cancel, or post operation is recorded via store middleware (`auditMiddleware.js`) capturing user, timestamp, action, entity ID, and previous/new state diffs.
7. **DPDP Act 2023 Compliance**: Customer records and OCR studio specifically prohibit the collection or storage of Aadhaar numbers; only Driving Licences and RC books are accepted.

---

## 📦 Complete Module Directory

### 🛵 Operations & Showroom Floor
- `/` — **Executive Dashboard**: Live IST clock, revenue KPIs, sales trend chart, top models, mini-bay board.
- `/leads` — **Leads & Enquiries**: Kanban board, AI lead scoring (Hot/Warm/Cold), duplicate phone detection.
- `/leads/sources` — **Lead Sources & ROI**: Inflow channels, cost per lead (CPL), CAC and conversion attribution.
- `/leads/telecall` — **Telecalling Console**: Agent queue, `tel:` click-to-call, objection handling scripts, follow-up calendar sync.
- `/quotations` — **On-Road Pricing**: Quotation builder, discount approval limits, WhatsApp quote share, A4 PDF.
- `/bookings` — **Vehicle Bookings**: Token receipts, single-chassis picker, cancellation/refund approval gate.
- `/test-rides` — **Demo Fleet**: Test ride calendar, Driving Licence check, customer feedback capture.
- `/sales` — **Vehicle Orders**: 6-step order tracker, commercial terms, chassis allocation.
- `/delivery` — **Delivery & PDI Desk**: 5-stage queue board, 25-point PDI checklist, 10 mandatory handover documents, signature pad, A5 gate pass with QR.
- `/showroom` — **Digital Showroom (Kiosk)**: Tablet-first kiosk, inline SVG colour tinting, 3-bike comparison matrix, on-road calculator, PIN-locked customer mode.
- `/sales/fleet` — **Fleet & B2B Sales**: Corporate accounts, volume discount slabs (3%-7%), batch delivery tracking, RCM GST flag, bulk AMC.
- `/counter/accessories` — **Accessories Counter (POS)**: Fast billing UI, barcode scanner, popular bundles, 80mm thermal slip, shift opening cash reconciliation.
- `/stock/vehicles` — **Vehicle Inventory**: 17-character VIN registry, passport QR codes, inter-branch transfer.
- `/stock/parts` — **Spare Parts**: Rack/bin tracking, MRP, low stock triggers (`currentStock < reorderLevel`), barcode printing.
- `/purchases` — **Purchases & GRN**: OEM purchase orders, in-transit consignments, receiving verification.
- `/customers` — **Customer 360**: Unified profile, owned bikes, DPDP consent tracking, document vault.

### 🔧 Workshop & Service Center
- `/service` — **Appointments**: 48/day bay capacity quotas, Sunday holiday closure blocker.
- `/service/jobs` — **Job Cards Kanban**: 8-stage repair pipeline, WhatsApp OTP estimate approval, dual-control QC sign-off, gate pass.
- `/service/bays` — **12-Bay Live Board**: Real-time bay occupancy, countdown timers, SLA breach alerts.
- `/service/dvi` — **Digital Vehicle Inspection (DVI)**: Bike damage pin-map, green/amber/red condition tags, estimate generation.
- `/dvi/:token` — **Public Customer DVI Approval**: External mobile approval portal with itemized estimate toggles & signature signoff.
- `/service/pickup-drop` — **Pickup & Drop**: Transit driver dispatch, route windows, customer handover OTP verification, AMC free waiver.
- `/service/recalls` — **Recalls & Service Bulletins**: OEM technical bulletins, VIN matching, auto WhatsApp advisory, completion progress.
- `/service/my-jobs` — **Technician Mobile View**: Large touch targets (>= 44px), parts requisition, submit for QC.
- `/warranty` — **Warranty & AMC Claims**: OEM claims lifecycle (Filed > Submitted > Approved > Reimbursed), 3 AMC tiers, recovery dashboard.

### 🤝 Customer Care & Relationship
- `/care/complaints` — **Complaints Redressal**: 5-stage SLA Kanban, 48h resolution clock, automatic escalation ladder.
- `/care/feedback` — **Feedback & NPS**: NPS gauge, CSAT averages, rating <=3 auto grievance ticket creation.
- `/care/loyalty` — **Loyalty & Referrals**: Silver/Gold/Platinum tiers, 12-month points ledger, QR member card, referral rewards.
- `/care/rsa` — **Roadside Assistance (RSA)**: SOS breakdown board, tow truck dispatch, live ETA timer, AMC zero-cost check.
- `/documents` — **Document Vault**: Customer/vehicle folders, masked KYC (DPDP compliant), 30-day insurance/PUC expiry alerts.

### 💳 Billing, Compliance & Accounts
- `/billing` — **Billing & GST Invoices**: Invoice generator, CGST/SGST/IGST splits, Section 269ST cash blocker, thermal slip & A4 print, UPI QR.
- `/finance/collections` — **Collections & Receivables**: 0-30, 31-60, 61-90, 90+ ageing buckets, Promise-to-Pay (PTP) tracker, WhatsApp reminders, UPI QR.
- `/accounting` — **Accounting & Ledgers**: Chart of Accounts, Journal vouchers (live Debits==Credits validation), Day Book, Trial Balance, P&L, Tally Prime XML export.
- `/accounting/expenses` — **Expenses & Petty Cash**: Petty cash float replenishment, multi-tier approval limits (<=₹2K / <=₹10K / >₹10K), input tax credit (ITC).
- `/accounting/bank-recon` — **Bank Reconciliation**: Statement CSV auto-match, transit entries, statutory BRS report.
- `/accounting/day-end` — **Day-End Cash Closing**: Physical cash denomination counter, expected system variance detection, mandatory justification, cashier & manager dual sign-off lock.
- `/accounting/budget` — **Budget & Cash Flow Forecast**: Department budget variance, 30/60/90-day cash flow forecast with 70%/100%/120% scenario band.
- `/accounting/assets` — **Fixed Assets Register**: Workshop machinery, fixtures, SLM/WDV depreciation schedules, monthly GL post.
- `/gst` — **GST Compliance**: GSTR-1 (Table 4/5), GSTR-3B, Table 12 HSN summary, offline JSON export.
- `/gst/tds-tcs` — **TDS & TCS Compliance**: Sections 194C/J/I withholding ledger, Section 206C(1F) 1% TCS on >₹10L vehicles, Form 26Q prep.
- `/gst/einvoice` — **e-Invoice & e-Way Bill**: NIC 64-character IRN hash, signed QR code, e-Way bills for movements >₹50K.
- `/gst/calendar` — **Compliance Calendar**: Monthly GST, TDS, PF, ESIC, RTO trade certificate calendar with 3-day proactive alert banners.
- `/reports/deal-profitability` — **Deal Profitability**: `cost.view` restricted, factory invoice vs ex-showroom margin, accessory margin, negative deal warnings.
- `/insurance-rto` — **Insurance & RTO**: Form 20/21 data sheets, HSRP status, RC tracker, policy renewals.
- `/vehicle-finance` — **Vehicle Loans**: HDFC, ICICI, Bajaj, Tata finance pipeline, EMI calculator.
- `/exchange` — **Used Bike Exchange**: AI trade-in appraisal, condition scoring, refurbishment ledger.

### 🤖 AI Suite & Omnichannel WhatsApp
- `/ai` — **Unified AI Hub & Toolkit**:
  - **AI Upsell Advisor**: Contextual accessory & AMC recommendations during billing.
  - **Bay Optimiser**: Predictive slot allocation and bottleneck resolution.
  - **Computer Vision Damage Scanner**: Automatic scratch and dent detection from photos.
  - **Sales Call NLP Summariser**: Voice-to-text transcript analysis, sentiment and action items.
  - **Multilingual Voice Assistant**: Voice intake in English, Tamil, and Hindi.
  - **Marketing Poster Generator**: Dealership promotional creative and WhatsApp copy copywriter.
  - **Dealer Principal EOD Digest**: Executive daily audio-ready executive briefing.
  - `/ai/whatsapp-simulator` — **WhatsApp AI Assistant**: Smartphone simulator supporting English, Tamil, and Tanglish. Deterministic store tools, live execution inspector, guardrails, and **20-Scenario Multi-turn Benchmark Eval Suite** (100% pass rate).
  - `/ai/copilot` — **Dealership Copilot**: Staff chat terminal with tool calls, source grounding chips, and quick queries.
  - `/ai/ocr` — **OCR Studio**: Simulated optical recognition for RC books, Driving Licences, and Vendor GST Invoices with confidence bars and DPDP compliance notices.
  - `/ai/reports` — **Natural Language Reporting**: Plain-English queries translated into dynamic tables with Excel (`.xlsx`) export.
- `/whatsapp` — **Staff WhatsApp Inbox**: 24-hour Meta messaging window, human takeover toggle, template manager.
- `/marketing` — **Marketing Campaigns**: 3-step broadcast wizard, consent validation, dual-control campaign approval.
- `/crm` — **CRM & Reminders**: Automated KM/date service alerts, customer grievance tickets with SLA timers.
- `/oem/scorecard` — **OEM Scorecard & Schemes**: Monthly wholesale/retail targets, incentive slab ladder payout projection, CSI/SSI/FTFR metrics.

### 🛡️ Administration & Platform Extras
- `/admin/approvals` — **Dual-Control Approvals Center**: SLA timers, requester self-approval block, discount/refund/expense workflows.
- `/admin/users` — **User Management**: Staff accounts, 2FA requirements, lockout protection, branch assignment.
- `/admin/roles` — **RBAC Role Matrix**: Visual functional area permission matrix, clone role, system lock protection.
- `/admin/audit-log` — **Immutable Audit Trail**: Field-level before/after JSON diff modal, after-hours and high-discount anomaly detector.
- `/admin/notifications` — **Notification Rules Center**: Event dispatch rules, quiet hours (9 PM - 8 AM IST), daily 9 AM digest.
- `/admin/integrations` — **Integrations Hub**: Tally Prime, Zoho Books, Razorpay, Meta Ads, WhatsApp Cloud API, webhook simulator.
- `/admin/data-exchange` — **Import/Export Center**: 5-step import wizard (template, upload, validate, error log, commit), bulk exports.
- `/admin/privacy` — **Privacy & Consent (DPDP)**: Append-only consent ledger, opt-outs, Right-to-be-Forgotten anonymizer preserving statutory tax invoices.
- `/admin/templates` — **Templates & Custom Fields**: Live A4 print preview with bilingual terms, zero-migration custom fields.
- `/tasks` — **Unified Tasks & Appointments**: Aggregate CRM follow-ups, test rides, PDI, collections, complaints; monthly calendar.
- `/help` — **Help Center & Product Tour**: 20+ operational playbooks, keyboard shortcuts modal, interactive 4-step onboarding tour.
- `/hr` — **HR & Incentives**: Attendance tracking, sales quota achievement, commission slabs, net payroll.
- `/branches` — **Multi-Branch Network**: Switch between Bangalore Flagship, Indiranagar, and Whitefield hubs.
- `/portal` — **Customer Lounge**: Mobile-first customer portal with mock phone OTP login, My Garage digital RC, live job tracker with progress stepper, online UPI pay, and appointment booking.


---

## 🎨 Design System
Defined in `src/styles/tokens.css` and mapped in `tailwind.config.js`:
- **Sidebar**: Deep navy (`#0B1F4B`) with active blue pill (`#2563EB`).
- **Surface**: Light blue-grey (`#F3F7FD`) with white card surfaces and 12px border radius.
- **Dark Mode**: Navy-tinted surfaces (`#0F172A` / `#1E293B`) via data-theme attribute.
- **Typography**: Inter for general UI with tabular numbers (`tabular-nums`) for currency amounts. JetBrains Mono used exclusively for Chassis VINs, Engine numbers, registration numbers, and document codes.

---

*Built cleanly from scratch with React 19, Vite, Tailwind CSS, Zustand, and TanStack Table.*
