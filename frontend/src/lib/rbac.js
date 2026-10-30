import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from '../config/permissions';
import { ROLES } from '../config/roles';

export function hasPermission(user, permissionCode, context = {}) {
  if (!user) return false;
  if (user.role === ROLES.SUPER_ADMIN) return true;

  const userPerms = user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || [];
  if (userPerms.includes(permissionCode)) {
    // Check specific fine-grained ownership rules if applicable
    if (permissionCode === PERMISSIONS.LEAD_VIEW_OWN && context.ownerId) {
      return context.ownerId === user.id;
    }
    if (permissionCode === PERMISSIONS.JOBCARD_VIEW_OWN && context.technicianId) {
      return context.technicianId === user.id;
    }
    return true;
  }

  // If user has view_all, they satisfy view_own
  if (permissionCode === PERMISSIONS.LEAD_VIEW_OWN && userPerms.includes(PERMISSIONS.LEAD_VIEW_ALL)) {
    return true;
  }
  if (permissionCode === PERMISSIONS.JOBCARD_VIEW_OWN && userPerms.includes(PERMISSIONS.JOBCARD_VIEW_ALL)) {
    return true;
  }

  return false;
}

export function canViewCost(user) {
  return hasPermission(user, PERMISSIONS.COST_VIEW);
}

export function canViewFullPhone(user) {
  return hasPermission(user, PERMISSIONS.CUSTOMER_PHONE_VIEW_FULL);
}
