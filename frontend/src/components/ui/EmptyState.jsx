import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There are no items to display for the current filter criteria.',
  actionLabel = null,
  onAction = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-surface-subtle/50 rounded-card border border-dashed border-border ${className}`}>
      <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center text-text-muted mb-3">
        <Icon className="w-6 h-6 stroke-1.5" />
      </div>
      <h4 className="text-sm font-semibold text-text-main mb-1">{title}</h4>
      <p className="text-xs text-text-muted max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
