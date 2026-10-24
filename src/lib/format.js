import { format, parseISO, isValid } from 'date-fns';
import { amountInWords } from './amountInWords';

/**
 * Formats integer paise into Indian Rupee representation (e.g. ₹ 1,25,000)
 */
export function formatMoney(paise, { symbol = '₹', showPaise = false } = {}) {
  if (paise == null || isNaN(paise)) return `${symbol} 0`;
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = absPaise / 100;

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showPaise ? 2 : 0,
    maximumFractionDigits: showPaise ? 2 : 0,
  }).format(rupees);

  return `${isNegative ? '-' : ''}${symbol} ${formatted}`;
}

/**
 * Formats compact money for KPI badges (e.g. ₹ 1.25 L, ₹ 2.40 Cr, ₹ 45 K)
 */
export function formatCompactMoney(paise, { symbol = '₹' } = {}) {
  if (paise == null || isNaN(paise)) return `${symbol} 0`;
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = absPaise / 100;

  let formatted = '';
  if (rupees >= 10000000) {
    formatted = `${(rupees / 10000000).toFixed(2)} Cr`;
  } else if (rupees >= 100000) {
    formatted = `${(rupees / 100000).toFixed(2)} L`;
  } else if (rupees >= 1000) {
    formatted = `${(rupees / 1000).toFixed(1)} K`;
  } else {
    formatted = `${rupees.toFixed(0)}`;
  }

  return `${isNegative ? '-' : ''}${symbol} ${formatted}`;
}

export function paiseToRupees(paise) {
  if (paise == null) return 0;
  return Math.round(paise) / 100;
}

export function rupeesToPaise(rupees) {
  if (rupees == null || isNaN(rupees)) return 0;
  return Math.round(Number(rupees) * 100);
}

/**
 * Robust date formatter
 */
export function formatDate(dateInput, pattern = 'dd MMM yyyy') {
  if (!dateInput) return '—';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    if (!isValid(d)) return '—';
    return format(d, pattern);
  } catch {
    return '—';
  }
}

export function formatDateTime(dateInput) {
  return formatDate(dateInput, 'dd MMM yyyy, hh:mm a');
}

export function formatTimeOnly(dateInput) {
  return formatDate(dateInput, 'hh:mm a');
}

/**
 * Formats Indian phone numbers with optional masking for privacy
 */
export function formatPhone(phone, { mask = false } = {}) {
  if (!phone) return '—';
  const cleaned = String(phone).replace(/\D/g, '');
  const digits = cleaned.length >= 10 ? cleaned.slice(-10) : cleaned;

  if (mask && digits.length === 10) {
    return `+91 ${digits.slice(0, 2)}*** **${digits.slice(-2)}`;
  }

  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  return phone;
}

export { amountInWords };
