import React from 'react';
import { useAppStore } from '../store';
import { hasPermission } from '../lib/rbac';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { backend } from '../services/api/backend';

export function RouteGuard({ permission, children }) {
  const currentUser = useAppStore((state) => state.currentUser);
  const loginAsRole = useAppStore((state) => state.loginAsRole);

  if (!permission) return children;

  const allowed = hasPermission(currentUser, permission);

  if (!allowed) {
    return (
      <div className="min-h-[420px] flex flex-col items-center justify-center p-8 text-center bg-surface rounded-card border border-border shadow-card">
        <div className="w-14 h-14 rounded-full bg-amber-100 text-status-amber flex items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-text-main mb-1.5">Access Restricted</h3>
        <p className="text-xs text-text-muted max-w-md mb-6 leading-relaxed">
          Your current persona (<strong>{currentUser?.role || 'Guest'}</strong>) lacks the statutory{' '}
          <code className="px-1.5 py-0.5 rounded bg-surface-muted text-text-main font-mono text-[11px]">
            {permission}
          </code>{' '}
          permission to access this operational terminal.
        </p>
        <div className={`flex gap-3 ${backend.enabled() ? 'hidden' : ''}`}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => loginAsRole('super-admin')}
          >
            Switch to Super Admin (Full Access)
          </Button>
        </div>
      </div>
    );
  }

  return children;
}
