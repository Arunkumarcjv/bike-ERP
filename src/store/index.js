import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getInitialSeedData } from '../data/seed';
import { createAuditEntry } from './auditMiddleware';
import { ROLE_PRESETS } from '../config/roles';

export const useAppStore = create(
  persist(
    (set, get) => ({
      ...getInitialSeedData(),

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
      },

      // Quotations Actions
      addQuotation: (quotation) => {
        set((state) => ({ quotations: [quotation, ...state.quotations] }));
        get().logAudit('QUOTATION_CREATED', 'QUOTATION', quotation.id, null, quotation);
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

        set({
          vehicleStock: state.vehicleStock.map((v) => (v.chassisNumber === chassisNumber ? updatedUnit : v)),
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, allocatedUnitId: unit.id, allocatedChassisNumber: chassisNumber } : b
          ),
        });

        get().logAudit('CHASSIS_ALLOCATED', 'VEHICLE_STOCK', unit.id, oldUnitState, updatedUnit);
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
      },

      assignBayToJobCard: (bayNumber, jobCardId) => {
        const state = get();
        const card = state.jobCards.find((jc) => jc.id === jobCardId);
        if (!card) return;

        set({
          bays: state.bays.map((bay) =>
            bay.bayNumber === bayNumber
              ? {
                  ...bay,
                  status: 'OCCUPIED',
                  activeJobCardId: jobCardId,
                  vehicleRegistration: card.registrationNumber,
                  modelName: card.modelName,
                  startedAt: new Date().toISOString(),
                }
              : bay
          ),
          jobCards: state.jobCards.map((jc) => (jc.id === jobCardId ? { ...jc, bayNumber } : jc)),
        });
        get().logAudit('BAY_ALLOCATED', 'SERVICE_BAY', `bay-${bayNumber}`, null, { bayNumber, jobCardId });
      },

      releaseBay: (bayNumber) => {
        set((state) => ({
          bays: state.bays.map((bay) =>
            bay.bayNumber === bayNumber
              ? {
                  ...bay,
                  status: 'FREE',
                  activeJobCardId: null,
                  vehicleRegistration: null,
                  modelName: null,
                  startedAt: null,
                  slaStatus: 'NORMAL',
                }
              : bay
          ),
        }));
      },

      // Invoices Actions
      postInvoice: (invoiceData) => {
        const state = get();
        const nextSequence = state.invoices.length + 1;
        const fyCode = '2627';
        const invoiceNumber = `VI/${fyCode}/${String(nextSequence).padStart(5, '0')}`;

        const postedInvoice = {
          ...invoiceData,
          id: `inv-${Date.now()}`,
          invoiceNumber,
          status: 'POSTED',
          postedAt: new Date().toISOString(),
          postedBy: state.currentUser?.name || 'Accountant',
        };

        set({
          invoices: [postedInvoice, ...state.invoices],
        });

        get().logAudit('INVOICE_POSTED', 'INVOICE', postedInvoice.id, null, postedInvoice);
        return postedInvoice;
      },

      // Reset to Fresh Seed State
      resetToDefaultSeed: () => {
        set(getInitialSeedData());
      },
    }),
    {
      name: 'bikeerp-storage-v1',
      partialize: (state) => ({
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
