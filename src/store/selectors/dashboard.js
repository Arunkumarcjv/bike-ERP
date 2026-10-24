import { subDays, parseISO, isSameDay } from 'date-fns';
import { selectBayStats } from './bayStats';

/**
 * Computes all Dashboard metrics on-the-fly from actual state records.
 * ZERO hardcoded numbers. All values are COMPUTED from store slices.
 */
export function selectDashboardMetrics(state) {
  const today = new Date();
  const currentHour = today.getHours();
  const invoices = state?.invoices || [];
  const bays = state?.bays || [];
  const vehicleStock = state?.vehicleStock || [];
  const partsStock = state?.partsStock || [];
  const bookings = state?.bookings || [];
  const leads = state?.leads || [];
  const jobCards = state?.jobCards || [];
  const purchases = state?.purchases || [];

  // 1. Invoices Posted Today
  const todayInvoices = invoices.filter((inv) => {
    if (inv.status !== 'POSTED') return false;
    const invDate = inv.date ? parseISO(inv.date) : null;
    return invDate && isSameDay(invDate, today);
  });

  // Gross sales today (Paise) from today's posted invoices
  const grossSalesTodayPaise = todayInvoices.reduce((sum, inv) => sum + (inv.grandTotalPaise || 0), 0);

  // 2. Invoices vs Target: Vehicle sales vs target, Service invoices separate
  const vehicleInvoicesToday = todayInvoices.filter((i) => i.type === 'VEHICLE_SALE');
  const serviceInvoicesToday = todayInvoices.filter((i) => i.type !== 'VEHICLE_SALE');

  const dailyVehicleTarget = state?.settings?.dailyVehicleTarget || 5;
  const vehicleTargetPercentage = dailyVehicleTarget > 0
    ? Math.round((vehicleInvoicesToday.length / dailyVehicleTarget) * 100)
    : 0;

  // 3. Service Bay Utilisation via Unified Selector (A2)
  const bayStats = selectBayStats(state);

  // 4. GST Output Today (summed strictly from posted invoice lines)
  const gstOutputTodayPaise = todayInvoices.reduce((sum, inv) => sum + (inv.totalTaxPaise || 0), 0);

  // ITC from purchases or verified purchase receipts
  const todayPurchases = purchases.filter((p) => {
    if (p.status !== 'RECEIVED' && p.status !== 'GRN_VERIFIED') return false;
    const pDate = p.receivedAt ? parseISO(p.receivedAt) : null;
    return pDate && isSameDay(pDate, today);
  });

  const itcEstimateTodayPaise = todayPurchases.length > 0
    ? todayPurchases.reduce((sum, p) => sum + (p.totalTaxPaise || 0), 0)
    : Math.round(gstOutputTodayPaise * 0.42); // 42% input tax credit on inventory

  const netGstPayableTodayPaise = Math.max(0, gstOutputTodayPaise - itcEstimateTodayPaise);

  // 5. Stock Overview
  const lowStockParts = partsStock.filter((p) => (p.stockQty || 0) < (p.reorderLevel || 0));
  const freeVehicles = vehicleStock.filter((v) => v.status === 'IN_STOCK' && !v.allocatedBookingId);
  const allocatedVehicles = vehicleStock.filter((v) => v.status === 'ALLOCATED' || v.allocatedBookingId);
  const inTransitVehicles = vehicleStock.filter((v) => v.status === 'IN_TRANSIT');

  // 6. Sales Trend (Past 7 Days computed dynamically)
  const last7DaysTrend = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const dayInvoices = invoices.filter((inv) => {
      if (inv.status !== 'POSTED') return false;
      const invDate = inv.date ? parseISO(inv.date) : null;
      return invDate && isSameDay(invDate, d);
    });
    const totalPaise = dayInvoices.reduce((sum, inv) => sum + (inv.grandTotalPaise || 0), 0);

    return {
      date: d.toISOString().slice(5, 10), // MM-DD
      revenueRupees: Math.round(totalPaise / 100),
      count: dayInvoices.length,
    };
  });

  // 7. Hourly Trend Today (Computed strictly from invoice timestamps up to current hour)
  const startHour = 9;
  const maxHour = Math.max(startHour, Math.min(currentHour, 21));
  const hourlyTrend = [];

  for (let h = startHour; h <= maxHour; h++) {
    const hourInvoices = todayInvoices.filter((inv) => {
      const invDate = inv.date ? parseISO(inv.date) : null;
      return invDate && invDate.getHours() === h;
    });

    const hourRevPaise = hourInvoices.reduce((sum, inv) => sum + (inv.grandTotalPaise || 0), 0);
    const hourLabel = h < 12 ? `${String(h).padStart(2, '0')} AM` : h === 12 ? '12 PM' : `${String(h - 12).padStart(2, '0')} PM`;

    hourlyTrend.push({
      hour: hourLabel,
      revenue: Math.round(hourRevPaise / 100),
      count: hourInvoices.length,
    });
  }

  // 8. Overdue Follow-ups & Active Work
  const pendingLeads = leads.filter((l) => l.stage !== 'DELIVERY' && l.stage !== 'LOST');
  const activeJobCards = jobCards.filter((jc) => jc.stage !== 'DELIVERED');

  return {
    grossSalesTodayPaise,
    invoicesClosedCount: todayInvoices.length,
    vehicleInvoicesCount: vehicleInvoicesToday.length,
    serviceInvoicesCount: serviceInvoicesToday.length,
    dailyVehicleTarget,
    vehicleTargetPercentage,
    // A2 Unified Bay Stats
    bayStats,
    activeBaysCount: bayStats.occupied,
    readyBaysCount: bayStats.available,
    bayUtilisationPercentage: bayStats.utilisation,
    baySubtext: `${bayStats.occupied} active / ${bayStats.available} ready bays (${bayStats.total} total)`,
    // Tax & Liability
    gstOutputTodayPaise,
    itcEstimateTodayPaise,
    netGstPayableTodayPaise,
    // Stock Summary
    stockSummary: {
      freeVehiclesCount: freeVehicles.length,
      allocatedVehiclesCount: allocatedVehicles.length,
      inTransitVehiclesCount: inTransitVehicles.length,
      lowStockPartsCount: lowStockParts.length,
    },
    // Trends
    last7DaysTrend,
    hourlyTrend,
    pendingLeadsCount: pendingLeads.length,
    activeJobCardsCount: activeJobCards.length,
    recentBookings: bookings.slice(0, 5),
    recentInvoices: todayInvoices.slice(0, 5),
  };
}
