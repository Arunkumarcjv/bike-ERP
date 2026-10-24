# Architectural Decision Records (ADR) - BikeERP

## ADR 01: Client-Side Typed Service Layer with Local State Persistence
- **Context**: The application operates in the browser with zero backend dependencies during Phase 0-P8, but must be architected so that swapping to a production Django REST Framework API requires zero UI rewrites.
- **Decision**: All business interactions pass through an asynchronous API service layer (`src/services/api/*`) that returns typed promises. The service layer reads and writes to a unified Zustand store backed by LocalStorage and IndexedDB via `zustand/middleware/persist`.
- **Consequences**: Fast local testing, zero network round-trip overhead for offline demoing, and complete isolation between presentation components and persistence mechanisms.

## ADR 02: Integer Paise Currency Representation
- **Context**: JavaScript IEEE 754 floating-point arithmetic introduces rounding anomalies (e.g. `0.1 + 0.2 === 0.30000000000000004`). In an automobile dealership where vehicle totals reach ₹3,50,000+ with 18%-40% GST splits, float rounding breaks financial audit reconciliation.
- **Decision**: All financial figures across catalogs, quotations, bookings, invoices, and accounting ledgers are stored strictly as integer paise (1 Rupee = 100 paise). All computations execute with standard integer arithmetic and half-up rounding. Formatting functions convert paise to Rupees on display (`lib/format.js`).
- **Consequences**: 100% deterministic tax splits, zero-penny discrepancy across sales, billing, and accounting ledgers.

## ADR 03: Tax Rules Stored as Effective-Dated Data
- **Context**: Indian GST rates on motor vehicles depend on engine displacement (petrol <= 350cc vs > 350cc), electric propulsion (5%), spare parts categories, and labour SAC codes (9987). Hardcoding tax percentages in logic violates compliance and prevents historical reconciliation.
- **Decision**: Tax rates are modeled as records in a `taxRules` catalog with effective dates, category codes, CC thresholds, fuel types, and HSN/SAC numbers. A missing rule triggers an explicit calculation error rather than silently defaulting. Every rule in demo seed is tagged `CONFIRM WITH CA`.

## ADR 04: Immutable Audit Trail Middleware
- **Context**: Automobile retail and statutory GST compliance mandates tamper-evident tracking of discount approvals, stock transfers, chassis allocations, and invoice postings.
- **Decision**: All state mutations for key entities pass through a Zustand store middleware (`src/store/auditMiddleware.js`) that automatically logs `timestamp`, `userId`, `actionType`, `entityId`, `oldValue`, `newValue`, and mock client IP address into an append-only audit ledger.

## ADR 05: Single Source of Truth & Computed Metrics
- **Context**: Discrepancies between dashboard badges, kanban counts, bay utilization, and financial summaries degrade trust in ERP software.
- **Decision**: No KPI counter or status badge is hardcoded. All values are calculated on-the-fly using memoized store selectors (`src/store/selectors/*`). If a job card status changes, bay utilization, revenue projections, and customer timeline update atomically.
