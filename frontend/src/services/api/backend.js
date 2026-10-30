import { toast } from 'sonner';
import { api, apiRequest, getTokens, isBackendEnabled, setTokens } from './client';

/**
 * Typed endpoints of the Django backend (see backend/README.md and /api/docs/ for Swagger).
 */
export const backend = {
  enabled: isBackendEnabled,
  isLoggedIn: () => Boolean(getTokens()?.access),

  async login(email, password, otp) {
    const data = await apiRequest('/auth/login/', {
      method: 'POST',
      auth: false,
      body: { email, password, ...(otp ? { otp } : {}) },
    });
    if (!data.otpRequired) setTokens({ access: data.access, refresh: data.refresh });
    return data;
  },

  async logout() {
    const tokens = getTokens();
    setTokens(null);
    if (tokens?.refresh) {
      await apiRequest('/auth/logout/', { method: 'POST', body: { refresh: tokens.refresh }, auth: false }).catch(
        () => {}
      );
    }
  },

  bootstrap: () => api.get('/dashboard/bootstrap/'),
  dashboardSummary: (branchId) =>
    api.get(`/dashboard/summary/${branchId ? `?branchId=${encodeURIComponent(branchId)}` : ''}`),
  activity: () => api.get('/dashboard/activity/'),

  createLead: (lead) => api.post('/leads/', lead),
  updateLead: (id, patch) => api.patch(`/leads/${encodeURIComponent(id)}/`, patch),
  createQuotation: (quotation) => api.post('/quotations/', quotation),
  updateQuotation: (id, patch) => api.patch(`/quotations/${encodeURIComponent(id)}/`, patch),
  createJobCard: (card) => api.post('/job-cards/', card),
  updateJobCard: (id, patch) => api.patch(`/job-cards/${encodeURIComponent(id)}/`, patch),
  createAppointment: (appointment) => api.post('/appointments/', appointment),
  cancelAppointment: (id) => api.post(`/appointments/${encodeURIComponent(id)}/cancel/`),
  setJobCardStage: (id, stage, extra = {}) =>
    api.post(`/job-cards/${encodeURIComponent(id)}/stage/`, { stage, ...extra }),
  assignBay: (bayNumber, jobCardId, branchId) => api.post('/bays/assign/', { bayNumber, jobCardId, branchId }),
  releaseBay: (bayNumber, branchId) => api.post('/bays/release/', { bayNumber, branchId }),
  allocateChassis: (unitId, bookingId) => api.post(`/vehicles/${encodeURIComponent(unitId)}/allocate/`, { bookingId }),
  deallocateChassis: (unitId) => api.post(`/vehicles/${encodeURIComponent(unitId)}/deallocate/`),
  postInvoice: (invoice) => api.post('/invoices/', invoice),
  createApproval: (approval) => api.post('/approvals/', approval),
  approve: (id, reason) => api.post(`/approvals/${encodeURIComponent(id)}/approve/`, { reason }),
  reject: (id, reason) => api.post(`/approvals/${encodeURIComponent(id)}/reject/`, { reason }),
};

/**
 * Fire-and-forget write-through used by store actions: the UI updates optimistically, and if the
 * server rejects the change we tell the user and re-load server truth.
 */
export function syncToBackend(label, call, onServerData) {
  if (!backend.enabled() || !backend.isLoggedIn()) return;
  call()
    .then((data) => onServerData?.(data))
    .catch(async (err) => {
      toast.error(`${label} not saved on server: ${err.message}`);
      const { useAppStore } = await import('../../store');
      useAppStore.getState().refreshFromBackend?.();
    });
}
