import React from 'react';
import clsx from 'clsx';

/**
 * Standard StatusBadge implementing system-wide semantics:
 * Green = Paid / Confirmed / Ready / Approved / Delivered / Available / HOT / LOW (churn risk)
 * Amber = Pending / Waiting / Scheduled / PENDING_APPROVAL / MEDIUM / WARM
 * Blue  = In Progress / Completed(info) / Filed / Allocated
 * Red   = Cancelled / Low Stock / Overdue / Rejected / Breached / COLD / HIGH (churn risk)
 * Grey  = Draft / Closed / Archived
 */
export function StatusBadge({ status, label, className = '' }) {
  const norm = (status || '').toUpperCase().replace(/[\s-]/g, '_');

  let variant = 'grey';

  if (
    [
      'PAID',
      'CONFIRMED',
      'READY',
      'APPROVED',
      'DELIVERED',
      'AVAILABLE',
      'IN_STOCK',
      'HOT',
      'NORMAL',
    ].includes(norm)
  ) {
    variant = 'green';
  } else if (
    [
      'PENDING',
      'PENDING_APPROVAL',
      'WAITING',
      'SCHEDULED',
      'ESTIMATE_SENT',
      'WARM',
      'MEDIUM',
      'WARNING',
    ].includes(norm)
  ) {
    variant = 'amber';
  } else if (
    [
      'IN_PROGRESS',
      'COMPLETED',
      'FILED',
      'ALLOCATED',
      'CHECKED_IN',
      'QUALITY_CHECK',
      'IN_TRANSIT',
    ].includes(norm)
  ) {
    variant = 'blue';
  } else if (
    [
      'CANCELLED',
      'LOW_STOCK',
      'OVERDUE',
      'REJECTED',
      'BREACHED',
      'LOST',
      'COLD',
      'HIGH',
    ].includes(norm)
  ) {
    variant = 'red';
  } else {
    variant = 'grey';
  }

  const colorStyles = {
    green: 'bg-status-green-bg text-status-green border-status-green-border',
    amber: 'bg-status-amber-bg text-status-amber border-status-amber-border',
    blue: 'bg-status-blue-bg text-status-blue border-status-blue-border',
    red: 'bg-status-red-bg text-status-red border-status-red-border',
    grey: 'bg-status-grey-bg text-status-grey border-status-grey-border',
  };

  const displayText = label || (status ? status.replace(/_/g, ' ') : '—');

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-semibold tracking-wide border uppercase',
        colorStyles[variant],
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {displayText}
    </span>
  );
}
