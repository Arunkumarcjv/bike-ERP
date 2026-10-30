# AKASH Bajaj — Django Backend

Multi-tenant REST API for the AKASH Bajaj React app: Django 6 + DRF, PostgreSQL, JWT auth,
Swagger/OpenAPI docs, request and audit logging, and a dashboard API that the React
dashboard reads from.

## Quick start (Windows / PowerShell)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
copy .env.example .env          # then set DB_PASSWORD (and DJANGO_SECRET_KEY)

# create the database once (PostgreSQL 18 shown)
& "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres bike_erp

.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py seed_demo                  # tenant "bike-erp"
.venv\Scripts\python manage.py seed_demo --tenant demo-motors --name "Demo Motors"   # optional 2nd tenant
.venv\Scripts\python manage.py createsuperuser            # optional: platform admin for /admin
.venv\Scripts\python manage.py runserver 8000
```

Then connect the frontend. In the `frontend` folder, create `.env.local` with:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Then run `npm run dev` from `frontend`. The app now requires login. Every demo persona uses password
`password123`, and users with 2FA (e.g. Super Admin `rajesh.varma@akashbajaj.com`) use OTP `123456`.
Users of the second tenant have `+demo-motors` in their emails (e.g. `deepak.rao+demo-motors@akashbajaj.com`).

Without `VITE_API_BASE_URL` the frontend still runs on its offline seed data, as before.

| URL | What |
|---|---|
| http://localhost:8000/api/docs/ | Swagger UI (click **Authorize**, paste the `access` token) |
| http://localhost:8000/api/redoc/ | ReDoc |
| http://localhost:8000/api/schema/ | OpenAPI 3 schema |
| http://localhost:8000/admin/ | Django admin |

## Multi-tenancy

- **Shared schema, row-level isolation.** Every business table has a `tenant` FK, and all querysets filter on it.
- **Tenant resolution.** The JWT carries a `tenant_id` claim. `TenantJWTAuthentication` checks that it matches the
  user's tenant and sets `request.tenant`. Tenant users cannot reach another tenant's data. A foreign id returns 404.
- **Platform staff.** Superusers have no tenant. They can manage tenants at `/api/v1/platform/tenants/` and act inside a
  tenant by sending the `X-Tenant: <slug>` header.
- **IDs.** Records keep the frontend's string ids (`jc-2627-001`, `br-blr-central`) as a per-tenant `ref`, exposed as
  `id`. Two tenants can therefore hold the same ids.
- **Extra fields.** The frontend's extra attributes that the server does not query are stored in a `data` JSON column
  and round-tripped unchanged.

## Business rules enforced server-side

- **Invoices.** Numbers are gap-free per tenant (`VI/2627/00001`), allocated under a row lock. Posted invoices are
  immutable: `PATCH`/`DELETE` return 405.
- **Approvals.** Dual control: the requester cannot approve their own request, and a rejection needs a reason.
- **Bays.** An occupied bay cannot be overwritten. Moving a job card to a new bay frees its previous one.
- **Chassis.** Double allocation is blocked.
- **Role permissions.** Writes check the user's role (`HasRole`, mirroring `frontend/src/config/permissions.js`).
  Logs are visible to Super Admin and Accountant only.

## Logs

| Where | What |
|---|---|
| `logs/app.log` | App, auth, audit and error events (rotating, 5 × 5 MB) |
| `logs/requests.log` | One line per API call: method, path, status, latency, user, tenant |
| `RequestLog` table → `GET /api/v1/request-logs/` | Same data, queryable. Shown on the dashboard |
| `AuditLog` table → `GET /api/v1/audit-logs/` | Business audit trail with before/after values. Read-only |

Prune old request logs with `python manage.py prune_logs --days 30`. Audit logs are never pruned.

## Dashboard API

- `GET /api/v1/dashboard/bootstrap/` returns every store collection in the frontend's shape and is loaded right
  after login. The app re-syncs it every 60 s.
- `GET /api/v1/dashboard/summary/` returns KPIs computed server-side, ported from
  `frontend/src/store/selectors/dashboard.js`. The dashboard shows it as "server-verified".
- `GET /api/v1/dashboard/activity/` returns API health for the last 24 h, recent requests and the recent audit
  trail.

## Demo data

`backend/fixtures/demo_seed.json` is exported from the frontend seed with `npm run export:seed` (run in `frontend`).
`seed_demo` shifts all its dates so the export day becomes today, which keeps the "today" KPIs populated.

## Tests

```powershell
$env:DB_ENGINE="sqlite"; .venv\Scripts\python manage.py test tests
```

The tests cover JWT + 2FA, tenant isolation, invoice numbering, dual control, bay and chassis rules, the dashboard
endpoints, logging and Swagger. `DB_ENGINE=sqlite` is meant for tests and quick local runs only. PostgreSQL is the
default and the target database.
