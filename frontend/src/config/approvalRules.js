import { ROLES } from './roles';

export const APPROVAL_TYPES = {
  DISCOUNT: 'discount',
  BOOKING_CANCELLATION: 'booking_cancellation',
  STOCK_ADJUSTMENT: 'stock_adjustment',
  JOURNAL_VOUCHER: 'journal_voucher',
  MARKETING_CAMPAIGN: 'marketing_campaign',
  PERIOD_REOPEN: 'period_reopen',
  PURCHASE_ORDER: 'purchase_order',
};

export const APPROVAL_LIMITS = {
  // In paise
  DISCOUNT: {
    SALES_EXECUTIVE_MAX: 200000, // ₹2,000 max without approval
    SALES_MANAGER_MAX: 1000000,   // ₹10,000 max without Super Admin approval
  },
  PURCHASE_ORDER: {
    INVENTORY_MANAGER_MAX: 50000000, // ₹5,00,000 max auto-approve
  },
  JOURNAL_VOUCHER: {
    ACCOUNTANT_MAX: 5000000, // ₹50,000 auto-post, above requires Admin sign-off
  },
};

export const APPROVAL_WORKFLOWS = {
  [APPROVAL_TYPES.DISCOUNT]: {
    name: 'Quotation Discount Approval',
    requiresRole: [ROLES.SALES_MANAGER, ROLES.SUPER_ADMIN],
    reasonRequired: true,
  },
  [APPROVAL_TYPES.BOOKING_CANCELLATION]: {
    name: 'Booking Cancellation & Refund',
    requiresRole: [ROLES.SALES_MANAGER, ROLES.SUPER_ADMIN],
    reasonRequired: true,
  },
  [APPROVAL_TYPES.STOCK_ADJUSTMENT]: {
    name: 'Spare Parts / Vehicle Stock Write-off',
    requiresRole: [ROLES.SUPER_ADMIN, ROLES.INVENTORY_MANAGER],
    reasonRequired: true,
  },
  [APPROVAL_TYPES.JOURNAL_VOUCHER]: {
    name: 'High-Value Journal Entry',
    requiresRole: [ROLES.SUPER_ADMIN],
    reasonRequired: true,
  },
  [APPROVAL_TYPES.MARKETING_CAMPAIGN]: {
    name: 'WhatsApp Campaign Dispatch Authorization',
    requiresRole: [ROLES.SUPER_ADMIN, ROLES.SALES_MANAGER],
    dualControl: true, // Cannot approve own campaign
    reasonRequired: false,
  },
  [APPROVAL_TYPES.PERIOD_REOPEN]: {
    name: 'Accounting Period Reopen',
    requiresRole: [ROLES.SUPER_ADMIN],
    reasonRequired: true,
  },
};
