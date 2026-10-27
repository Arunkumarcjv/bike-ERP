import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getInitialSeedData } from '../data/seed';
import { createAuditEntry } from './auditMiddleware';
import { ROLE_PRESETS } from '../config/roles';
import { backend, syncToBackend } from '../services/api/backend';

const todayKey = () => new Date().toDateString();

// Highest numeric suffix of VI/2627/NNNNN so new numbers never collide with existing ones.
function nextInvoiceSequence(invoices) {
  return (
    invoices.reduce((max, inv) => {
      const n = Number(String(inv.invoiceNumber || '').split('/').pop());
      return Number.isFinite(n) && n > max ? n : max;
    }, 0) + 1
  );
}

const replaceById = (list, item) => list.map((x) => (x.id === item.id ? { ...x, ...item } : x));

export const useAppStore = create(
  persist(
    (set, get) => ({
      ...getInitialSeedData(),
      seededOn: todayKey(),
      backendStatus: backend.enabled() ? 'disconnected' : 'offline', // offline | disconnected | syncing | live | error
      lastSyncedAt: null,

      // Theme & UI state
      theme: 'light', // 'light' or 'dark'
      sidebarCollapsed: false,
      commandPaletteOpen: false,

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      // Auth & Branch Switcher
      loginAsRole: (rolePresetId) => {
        const found = ROLE_PRESETS.find((r) => r.id === rolePresetId) || ROLE_PRESETS[0];
        set({ currentUser: found });
      },
      setActiveBranch: (branchId) => {
        set({ activeBranchId: branchId });
      },

      // Backend (Django) session
      hydrateFromBackend: (data) => {
        const keys = [
          'customers', 'leads', 'quotations', 'bookings', 'salesOrders', 'vehicleStock', 'partsStock', 'jobCards',
          'bays', 'invoices', 'approvals', 'notifications', 'branches', 'auditLogs',
        ];
        const patch = {};
        keys.forEach((k) => {
          if (Array.isArray(data[k])) patch[k] = data[k];
        });
        const persona = data.currentUser && ROLE_PRESETS.find((r) => r.id === data.currentUser.id);
        const branches = patch.branches || get().branches;
        set({
          ...patch,
          ...(data.currentUser ? { currentUser: { ...persona, ...data.currentUser } } : {}),
          activeBranchId: branches.some((b) => b.id === get().activeBranchId)
            ? get().activeBranchId
            : data.activeBranchId || get().activeBranchId,
          ...(data.tenant ? { dealership: { ...get().dealership, ...data.tenant.profile, name: data.tenant.name } } : {}),
          backendStatus: 'live',
          lastSyncedAt: new Date().toISOString(),
        });
      },
      refreshFromBackend: async () => {
        if (!backend.enabled() || !backend.isLoggedIn()) return false;
        set({ backendStatus: 'syncing' });
        try {
          get().hydrateFromBackend(await backend.bootstrap());
          return true;
        } catch {
          set({ backendStatus: backend.isLoggedIn() ? 'error' : 'disconnected' });
          return false;
        }
      },
      logout: async () => {
        await backend.logout();
        set({
          ...getInitialSeedData(),
          seededOn: todayKey(),
          backendStatus: backend.enabled() ? 'disconnected' : 'offline',
          lastSyncedAt: null,
        });
      },

      // Audit Logging Action
      logAudit: (action, entityType, entityId, oldValue, newValue) => {
        const user = get().currentUser;
        const entry = createAuditEntry({
          userId: user?.id || 'system',
          userName: user?.name || 'System',
          userRole: user?.role || 'System',
          action,
          entityType,
          entityId,
          oldValue,
          newValue,
        });
        set((state) => ({ auditLogs: [entry, ...state.auditLogs] }));
      },

      // Leads Actions
      addLead: (leadData) => {
        const newLead = {
          id: `lead-${Date.now()}`,
          createdAt: new Date().toISOString(),
          stage: 'ENQUIRY',
          ...leadData,
        };
        set((state) => ({ leads: [newLead, ...state.leads] }));
        get().logAudit('LEAD_CREATED', 'LEAD', newLead.id, null, newLead);
        syncToBackend('Lead', () => backend.createLead(newLead), (saved) =>
          set((state) => ({ leads: replaceById(state.leads, saved) }))
        );
        return newLead;
      },
      updateLeadStage: (leadId, newStage) => {
        const state = get();
        const oldLead = state.leads.find((l) => l.id === leadId);
        if (!oldLead) return;

        set({
          leads: state.leads.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)),
        });
        get().logAudit('LEAD_STAGE_UPDATED', 'LEAD', leadId, { stage: oldLead.stage }, { stage: newStage });
        syncToBackend('Lead stage', () => backend.updateLead(leadId, { stage: newStage }));
      },

      // Quotations Actions
      addQuotation: (quotation) => {
        set((state) => ({ quotations: [quotation, ...state.quotations] }));
        get().logAudit('QUOTATION_CREATED', 'QUOTATION', quotation.id, null, quotation);
        syncToBackend('Quotation', () => backend.createQuotation(quotation));
      },
      updateDiscountStatus: (quotationId, status, approverName) => {
        const state = get();
        const old = state.quotations.find((q) => q.id === quotationId);
        set({
          quotations: state.quotations.map((q) =>
            q.id === quotationId ? { ...q, discountStatus: status, approvedBy: approverName } : q
          ),
        });
        get().logAudit('DISCOUNT_APPROVAL_STATUS', 'QUOTATION', quotationId, { status: old?.discountStatus }, { status });
        syncToBackend('Discount status', () =>
          backend.updateQuotation(quotationId, { discountStatus: status, approvedBy: approverName })
        );
      },

      // Bookings & Allocation Actions (Strict double-allocation protection)
      allocateChassisToBooking: (chassisNumber, bookingId) => {
        const state = get();
        // 1. Verify chassis exists
        const unit = state.vehicleStock.find((v) => v.chassisNumber === chassisNumber);
        if (!unit) throw new Error(`Chassis ${chassisNumber} not found in inventory`);

        // 2. Block double-allocation
        if (unit.allocatedBookingId && unit.allocatedBookingId !== bookingId) {
          throw new Error(
            `Chassis ${chassisNumber} is already allocated to Active Booking ${unit.allocatedBookingId}. Double allocation blocked.`
          );
        }

        const oldUnitState = { ...unit };
        const updatedUnit = {
          ...unit,
          status: 'ALLOCATED',
          allocatedBookingId: bookingId,
        };
        // A booking holds one chassis: release the unit it held before (if any).
        const previousUnitId = state.bookings.find((b) => b.id === bookingId)?.allocatedUnitId;

        set({
          vehicleStock: state.vehicleStock.map((v) => {
            if (v.chassisNumber === chassisNumber) return updatedUnit;
            if (previousUnitId && v.id === previousUnitId) return { ...v, status: 'IN_STOCK', allocatedBookingId: null };
            return v;
          }),
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, allocatedUnitId: unit.id, allocatedChassisNumber: chassisNumber } : b
          ),
        });

        get().logAudit('CHASSIS_ALLOCATED', 'VEHICLE_STOCK', unit.id, oldUnitState, updatedUnit);
        syncToBackend('Chassis allocation', () => backend.allocateChassis(unit.id, bookingId));
      },

      deallocateChassis: (unitId) => {
        const state = get();
        const unit = state.vehicleStock.find((v) => v.id === unitId);
        if (!unit) return;

        const oldUnit = { ...unit };
        const updatedUnit = { ...unit, status: 'IN_STOCK', allocatedBookingId: null };

        set({
          vehicleStock: state.vehicleStock.map((v) => (v.id === unitId ? updatedUnit : v)),
          bookings: state.bookings.map((b) =>
            b.allocatedUnitId === unitId ? { ...b, allocatedUnitId: null, allocatedChassisNumber: null } : b
          ),
        });

        get().logAudit('CHASSIS_DEALLOCATED', 'VEHICLE_STOCK', unitId, oldUnit, updatedUnit);
        syncToBackend('Chassis release', () => backend.deallocateChassis(unitId));
      },

      // Job Cards & Service Bay Actions
      updateJobCardStage: (jobCardId, stage, additional = {}) => {
        const state = get();
        const oldCard = state.jobCards.find((jc) => jc.id === jobCardId);
        if (!oldCard) return;

        const updatedCard = { ...oldCard, stage, ...additional };
        set({
          jobCards: state.jobCards.map((jc) => (jc.id === jobCardId ? updatedCard : jc)),
        });
        get().logAudit('JOBCARD_STAGE_UPDATED', 'JOB_CARD', jobCardId, { stage: oldCard.stage }, { stage });
        syncToBackend('Job card stage', () => backend.setJobCardStage(jobCardId, stage, additional));
      },

      assignBayToJobCard: (bayNumber, jobCardId) => {
        const state = get();
        const card = state.jobCards.find((jc) => jc.id === jobCardId);
        if (!card) throw new Error(`Job card ${jobCardId} not found`);
        const branchId = state.activeBranchId;
        const inBranch = (bay) => !bay.branchId || bay.branchId === branchId;
        const target = state.bays.find((bay) => bay.bayNumber === bayNumber && inBranch(bay));
        if (!target) throw new Error(`Bay #${bayNumber} not found`);
        if (target.status === 'MAINTENANCE') throw new Error(`Bay #${bayNumber} is under maintenance`);
        if (target.activeJobCardId && target.activeJobCardId !== jobCardId) {
          throw new Error(`Bay #${bayNumber} is already occupied by another job card`);
        }
        const freedBay = {
          status: 'FREE',
          activeJobCardId: null,
          vehicleRegistration: null,
          modelName: null,
          technicianId: null,
          technicianName: null,
          startedAt: null,
          slaStatus: 'NORMAL',
        };

        set({
          bays: state.bays.map((bay) =>
            !inBranch(bay)
              ? bay
              : bay.activeJobCardId === jobCardId && bay.bayNumber !== bayNumber
              ? { ...bay, ...freedBay }
              : bay.bayNumber === bayNumber
              ? {
                  ...bay,
                  status: 'OCCUPIED',
                  activeJobCardId: jobCardId,
                  vehicleRegistration: card.registrationNumber,
                  modelName: card.modelName,
                  technicianId: card.technicianId || null,
                  technicianName: card.technicianName || null,
                  startedAt: new Date().toISOString(),
                  slaStatus: 'NORMAL',
                }
              : bay
          ),
          jobCards: state.jobCards.map((jc) => (jc.id === jobCardId ? { ...jc, bayNumber } : jc)),
        });
        get().logAudit('BAY_ALLOCATED', 'SERVICE_BAY', `bay-${bayNumber}`, null, { bayNumber, jobCardId });
        syncToBackend('Bay allocation', () => backend.assignBay(bayNumber, jobCardId, branchId));
      },

      releaseBay: (bayNumber) => {
        const branchId = get().activeBranchId;
        const inBranch = (bay) => !bay.branchId || bay.branchId === branchId;
        const released = get().bays.find((bay) => bay.bayNumber === bayNumber && inBranch(bay));
        set((state) => ({
          jobCards: state.jobCards.map((jc) =>
            released?.activeJobCardId && jc.id === released.activeJobCardId ? { ...jc, bayNumber: null } : jc
          ),
          bays: state.bays.map((bay) =>
            bay.bayNumber === bayNumber && inBranch(bay)
              ? {
                  ...bay,
                  status: 'FREE',
                  activeJobCardId: null,
                  vehicleRegistration: null,
                  modelName: null,
                  technicianId: null,
                  technicianName: null,
                  startedAt: null,
                  slaStatus: 'NORMAL',
                }
              : bay
          ),
        }));
        get().logAudit('BAY_RELEASED', 'SERVICE_BAY', `bay-${bayNumber}`, null, { bayNumber });
        syncToBackend('Bay release', () => backend.releaseBay(bayNumber, branchId));
      },

      // Invoices Actions
      postInvoice: (invoiceData) => {
        const state = get();
        const nextSequence = nextInvoiceSequence(state.invoices);
        const fyCode = '2627';
        const invoiceNumber = `VI/${fyCode}/${String(nextSequence).padStart(5, '0')}`;

        const now = new Date().toISOString();
        const postedInvoice = {
          date: now,
          ...invoiceData,
          id: `inv-${Date.now()}`,
          invoiceNumber,
          status: 'POSTED',
          postedAt: now,
          postedBy: state.currentUser?.name || 'Accountant',
        };

        set({
          invoices: [postedInvoice, ...state.invoices],
        });

        get().logAudit('INVOICE_POSTED', 'INVOICE', postedInvoice.id, null, postedInvoice);
        // The server assigns the authoritative gap-free number; adopt it when it differs.
        syncToBackend('Invoice', () => backend.postInvoice(postedInvoice), (saved) =>
          set((s) => ({ invoices: s.invoices.map((inv) => (inv.id === postedInvoice.id ? saved : inv)) }))
        );
        return postedInvoice;
      },

      // Reset to Fresh Seed State
      resetToDefaultSeed: () => {
        if (backend.enabled() && backend.isLoggedIn()) {
          get().refreshFromBackend();
          return;
        }
        set({ ...getInitialSeedData(), seededOn: todayKey() });
      },
    }),
    {
      name: 'bikeerp-storage-v1',
      // Demo seed dates are relative to the day they were generated. In offline mode a cache from
      // an earlier day would leave every "today" KPI at zero, so re-seed and keep only preferences.
      merge: (persisted, current) => {
        if (!persisted) return current;
        if (!backend.enabled() && persisted.seededOn !== todayKey()) {
          return {
            ...current,
            theme: persisted.theme ?? current.theme,
            currentUser: persisted.currentUser ?? current.currentUser,
          };
        }
        return { ...current, ...persisted };
      },
      partialize: (state) => ({
        seededOn: state.seededOn,
        branches: state.branches,
        notifications: state.notifications,
        theme: state.theme,
        currentUser: state.currentUser,
        activeBranchId: state.activeBranchId,
        customers: state.customers,
        leads: state.leads,
        quotations: state.quotations,
        bookings: state.bookings,
        salesOrders: state.salesOrders,
        vehicleStock: state.vehicleStock,
        partsStock: state.partsStock,
        bays: state.bays,
        jobCards: state.jobCards,
        invoices: state.invoices,
        chartOfAccounts: state.chartOfAccounts,
        journalEntries: state.journalEntries,
        whatsappConversations: state.whatsappConversations,
        approvals: state.approvals,
        auditLogs: state.auditLogs,
      }),
    }
  )
);

export const useStore = useAppStore;
