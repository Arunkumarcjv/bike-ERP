import { describe, it, expect } from 'vitest';
import { hasPermission, canViewCost, canViewFullPhone } from '../lib/rbac';
import { PERMISSIONS } from '../config/permissions';
import { ROLES, ROLE_PRESETS } from '../config/roles';

describe('RBAC Access Control & Security Policies', () => {
  const superAdmin = ROLE_PRESETS.find((r) => r.role === ROLES.SUPER_ADMIN);
  const salesExec = ROLE_PRESETS.find((r) => r.role === ROLES.SALES_EXECUTIVE);
  const accountant = ROLE_PRESETS.find((r) => r.role === ROLES.ACCOUNTANT);
  const technician = ROLE_PRESETS.find((r) => r.role === ROLES.TECHNICIAN);

  it('allows Super Admin full access to all areas', () => {
    expect(hasPermission(superAdmin, PERMISSIONS.USERS_MANAGE)).toBe(true);
    expect(hasPermission(superAdmin, PERMISSIONS.COST_VIEW)).toBe(true);
    expect(hasPermission(superAdmin, PERMISSIONS.PERIOD_LOCK)).toBe(true);
  });

  it('restricts cost.view from Sales Executive but grants to Accountant', () => {
    expect(canViewCost(salesExec)).toBe(false);
    expect(canViewCost(accountant)).toBe(true);
  });

  it('restricts full customer phone view from unprivileged roles', () => {
    expect(canViewFullPhone(technician)).toBe(false);
    expect(canViewFullPhone(salesExec)).toBe(false);
    expect(canViewFullPhone(accountant)).toBe(true);
  });

  it('enforces fine-grained ownership for lead view_own', () => {
    expect(
      hasPermission(salesExec, PERMISSIONS.LEAD_VIEW_OWN, { ownerId: salesExec.id })
    ).toBe(true);

    expect(
      hasPermission(salesExec, PERMISSIONS.LEAD_VIEW_OWN, { ownerId: 'other-exec-id' })
    ).toBe(false);
  });
});
