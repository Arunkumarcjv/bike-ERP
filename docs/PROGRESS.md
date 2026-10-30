# AKASH Bajaj Implementation Progress Tracker

## Step 0: Initial Audit Matrix
| Module Requested | Status | Existing / Target File Path | Strategy |
|---|---|---|---|
| **A1. Blank Sidebar Item Fix** | Bug Found | `src/config/navigation.js`, `locales/*.json` | Add `labelKey: 'nav.warranty_claims'`, update translations & test |
| **A2. Unified Bay Selector** | Inconsistent | `src/store/selectors/bayStats.js` | Create single `selectBayStats`, use across dashboard, mini-bay, and LiveBays |
| **A3. Realistic Today Seed Data** | Under-seeded | `src/data/seed.js`, `src/data/factories/` | Generate 4-7 vehicle invoices & 8-15 service invoices today up to current IST hour |
| **A4. Admin Sidebar Items** | Partial | `src/features/admin/`, `src/config/navigation.js` | Unify Users, Roles, Audit, Approvals, Notifications into visible navigation |
| **A5. Scalable Sidebar** | Basic | `src/components/layout/Sidebar.jsx` | Add search filter, pinned items, collapsible groups, live count badges |
| **A6. Reconciliation Test Suite** | 22 tests | `src/tests/` | Add tests for Bay sum = 12, invoice limits, inventory reorder, store integrity |
| **D1. Approvals Center** | Partial | `src/features/approvals/pages/ApprovalsPage.jsx` | Build dedicated 3-tab SLA-aware approvals hub with shared service |
| **D2. Users, Roles & Audit** | Partial | `src/features/admin/pages/UsersPage.jsx`, `RolesPage.jsx`, `AuditPage.jsx` | Dedicated pages for user 2FA/lockout, permission matrix, and anomaly diffs |
| **D3. Notification Center & Admin** | Partial | `src/features/notifications/` | Add rule configurator per role/event, quiet hours & daily digest |
| **D4. Delivery & PDI Desk** | Partial | `src/features/delivery/pages/DeliveryDeskPage.jsx` | 5-stage queue board, 25-item checklist, document checklist, signature pad, gate pass |
| **D5. Digital Vehicle Inspection (DVI)** | Missing | `src/features/service/pages/DviPage.jsx`, `DviCustomerApprovalPage.jsx` | Green/amber/red systems, photo storage, public customer approval token route |
| **D6. Warranty, AMC & OEM Claims** | Partial | `src/features/warranty/pages/WarrantyClaimsPage.jsx` | OEM claims lifecycle (Filed > Submitted > Approved > Reimbursed), ageing dashboard |
| **D7. Pickup and Drop** | Missing | `src/features/service/pages/PickupDropPage.jsx` | Driver assignment, time windows, route list, customer handover OTP |
| **D8. Recalls & Service Bulletins** | Missing | `src/features/service/pages/RecallsPage.jsx` | Bulletin entry, VIN matching, auto WhatsApp preview, completion tracking |
| **D9. Accessories Counter (POS)** | Missing | `src/features/counter/pages/AccessoriesCounterPage.jsx` | Fast billing UI, barcode scanner, cart, bundles, 80mm slip, shift reconciliation |
| **D10. Digital Showroom** | Missing | `src/features/showroom/pages/DigitalShowroomPage.jsx` | Tablet-first, 3-bike comparison, SVG tint picker, on-road calculator, customer mode |
| **D11. Fleet and B2B Sales** | Missing | `src/features/sales/pages/FleetSalesPage.jsx` | Corporate GST accounts, bulk discount slabs, delivery batches, fleet service contracts |
| **D12. OEM Schemes & Scorecard** | Missing | `src/features/oem/pages/OemScorecardPage.jsx` | Slabs, progress tracking, payout projection, CSI/SSI/TAT scorecard |
| **D13. Complaints & Feedback NPS** | Partial | `src/features/care/pages/ComplaintsPage.jsx`, `FeedbackNpsPage.jsx` | 5-stage SLA Kanban, escalation ladder, NPS/CSAT surveys, rating<=3 task creator |
| **D14. Loyalty and Referrals** | Missing | `src/features/care/pages/LoyaltyReferralsPage.jsx` | Silver/Gold/Platinum tiers, earn/redeem ledger, QR member card, referral rewards |
| **D15. Roadside Assistance (RSA)** | Missing | `src/features/care/pages/RoadsideAssistancePage.jsx` | SOS breakdown board, tow driver dispatch, ETA timer, AMC free eligibility |
| **D16. Document Vault** | Missing | `src/features/documents/pages/DocumentVaultPage.jsx` | Customer/vehicle/deal folders, KYC/RC/insurance/Form 21, drag-drop IndexedDB, audit log |
| **D17. Lead Sources Hub & Telecall** | Missing | `src/features/leads/pages/LeadSourcesPage.jsx`, `TelecallingConsolePage.jsx` | Inflow log, CPL, auto-assign rules, telecalling queue with tel: click-to-call & scripts |
| **D18. Deal Profitability** | Missing | `src/features/reports/pages/DealProfitabilityPage.jsx` | Requires cost.view, ex-showroom/accessories/insurance/exchange margins, ties to GL |
| **D19. Collections & Receivables** | Missing | `src/features/finance/pages/CollectionsReceivablesPage.jsx` | 0-30, 31-60, 61-90, 90+ ageing buckets, promise-to-pay tracker, WhatsApp templates |
| **D20. Expenses & Petty Cash** | Missing | `src/features/accounting/pages/ExpensesPettyCashPage.jsx` | Expense categories, voucher upload, approval limit, cash replenishment, input GST |
| **D21. Bank Reconciliation** | Missing | `src/features/accounting/pages/BankReconciliationPage.jsx` | CSV bank statement import, auto-match amount/date/ref, reconciliation statement |
| **D22. Day-end Closing** | Missing | `src/features/accounting/pages/DayEndClosingPage.jsx` | Denomination cash counter, expected vs counted variance, manager sign-off lock |
| **D23. Budget & Cash Flow Forecast** | Missing | `src/features/accounting/pages/BudgetCashFlowPage.jsx` | Department budget vs actual, 30/60/90-day cash flow forecast with confidence band |
| **D24. Fixed Assets Register** | Missing | `src/features/accounting/pages/FixedAssetsPage.jsx` | Register, SLM/WDV depreciation schedules, disposal journals |
| **D25. TDS & TCS Compliance** | Missing | `src/features/gst/pages/TdsTcsCompliancePage.jsx` | Section deduction ledger, challan tracker, TCS high-value vehicle flag |
| **D26. e-Invoice & e-Way Bill** | Missing | `src/features/gst/pages/EInvoiceWayBillPage.jsx` | Turnover threshold setting, IRN generation status, e-way bill registry |
| **D27. Compliance Calendar** | Missing | `src/features/gst/pages/ComplianceCalendarPage.jsx` | Monthly GST/TDS returns, trade cert, PUC, insurance statutory reminders |
| **E1-E8. AI Additions** | Missing | `src/features/ai/components/` & `pages/` | Upsell suggestions, bay optimiser, photo damage detection, voice assistant, poster creator |
| **F1. Integrations Hub** | Partial | `src/features/admin/pages/IntegrationsHubPage.jsx` | Tally/Zoho/Razorpay/Meta cards, API key generation, webhook simulator & delivery logs |
| **F2. Import/Export Center** | Missing | `src/features/admin/pages/DataExchangePage.jsx` | CSV/Excel upload with validation, error reports, commit step, all entity exports |
| **F3. Privacy & Consent Center** | Missing | `src/features/admin/pages/PrivacyConsentPage.jsx` | Append-only consent ledger, opt-outs, data erasure workflow keeping tax invoices |
| **F4. Tasks & Calendar** | Missing | `src/features/tasks/pages/TasksCalendarPage.jsx` | Unified tasks across all modules, calendar view of appointments/test rides/deliveries |
| **F5. Templates & Custom Fields** | Missing | `src/features/admin/pages/TemplatesCustomFieldsPage.jsx` | Invoice/quotation/job card live preview editor, custom fields on entities |
| **F6. Help Center & Tour** | Missing | `src/features/help/pages/HelpCenterPage.jsx` | Searchable knowledge base, keyboard shortcut drawer, zero-dependency onboarding tour |

---

## Checkpoint Log
- **Part A Completed**: Fixed A1 blank sidebar label + verified en/ta/hi i18n; implemented A2 `selectBayStats` selector guaranteeing mutually-exclusive bay sum = 12 & utilisation; populated A3 realistic today seed records (5 vehicle invoices, 10 service invoices, hourly timestamps <= current time, 30-day history); scalable A5 sidebar with real-time search, pinned section, collapsible persistence, and live count badges; A6 reconciliation test suite passing (30/30 tests green); production build verified (0 errors).
- **Part D Completed (All 27 Modules)**: Built Approvals Center (D1) with dual-control blocker, Users/Roles/Audit (D2), Notification Admin (D3), Delivery Desk (D4) with 25-point PDI, DVI inspection (D5) & public customer portal, Warranty/AMC/OEM Claims (D6), Pickup & Drop (D7), Recalls & Service Bulletins (D8), Accessories POS (D9) with 80mm slip, Digital Showroom (D10) with 3-bike comparator, Fleet & B2B Sales (D11), OEM Scorecard (D12), Complaints & Feedback NPS (D13), Loyalty & Referrals (D14), Roadside Assistance (D15), Document Vault (D16) with masked KYC, Lead Sources & Telecalling Console (D17), Deal Profitability (D18), Collections & Receivables (D19) with ageing buckets, Expenses & Petty Cash (D20), Bank Reconciliation (D21), Day-End Closing (D22) with denomination counter & dual signoff, Budget & Cash Flow Forecast (D23), Fixed Assets Register (D24) with SLM/WDV depreciation, TDS & TCS Compliance (D25) with Section 206C(1F) vehicle sales check, e-Invoice & e-Way Bill (D26) with 64-char IRN hash, and Compliance Calendar (D27).
- **Part E Completed (AI Suite)**: Built unified `AiToolkitPage.jsx` integrating Upsell Advisor (E1), Bay Optimiser (E2), Computer Vision Damage Scanner (E3), Sales Call NLP Summariser (E4), Multilingual Voice Assistant (E5), Marketing Poster Generator (E6), and Dealer Principal EOD Digest (E8). Integrated as primary tab in `AiSuitePage.jsx`.
- **Part F Completed (Platform Extras)**: Built Integrations Hub (F1) with webhook simulator, Data Exchange / Import-Export Center (F2) with 5-stage validation wizard, Privacy & Consent Center (F3) with DPDP erasure respecting 8-year statutory tax retention, Unified Tasks & Appointments Calendar (F4), Document Templates & Custom Fields (F5) with live A4 preview, and Help Center (F6) with 20+ operational playbooks, keyboard shortcuts, and interactive product tour.
- **Verification & Testing**:
  - `npm run build`: Production bundle succeeded with zero errors (3,051 modules transformed, 22.03s build time).
  - `npm test`: 40/40 tests passing across 9 test suites (`tax`, `rbac`, `invoiceNumbering`, `navigation`, `onRoadPrice`, `bayStats`, `slots`, `reconciliation`, `newModules`).

