// Exports the frontend demo seed to backend/fixtures/demo_seed.json so `manage.py seed_demo`
// loads exactly the data the UI shows. Run with: npm run export:seed
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getInitialSeedData } from '../src/data/seed';
import { ROLE_PRESETS } from '../src/config/roles';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// The backend lives next to the frontend folder: <repo>/backend
const out = resolve(root, '../backend/fixtures/demo_seed.json');
const seed = getInitialSeedData();

const KEYS = [
  'dealership', 'branches', 'customers', 'vehicleStock', 'partsStock', 'leads', 'quotations', 'bookings',
  'salesOrders', 'bays', 'jobCards', 'appointments', 'invoices', 'approvals', 'notifications',
];

const payload = { exportedAt: new Date().toISOString(), users: ROLE_PRESETS };
for (const key of KEYS) payload[key] = seed[key] ?? [];

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(payload, null, 1));
console.log(`Wrote ${out}`);
