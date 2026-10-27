/**
 * Immutable Audit Middleware for Store Operations
 * Automatically captures mutations to bookings, allocations, invoices, stock adjustments, and approvals.
 */

export function createAuditEntry({
  userId = 'system',
  userName = 'System Process',
  userRole = 'System',
  action,
  entityType,
  entityId,
  oldValue = null,
  newValue = null,
  ipAddress = '192.168.1.101',
}) {
  return {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    userRole,
    action,
    entityType,
    entityId,
    oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
    newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
    ipAddress,
  };
}
