import React from 'react';
import clsx from 'clsx';

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={clsx('animate-pulse rounded-input bg-surface-muted', className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="w-full space-y-3 p-4">
      <div className="flex gap-4 border-b border-border pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2 border-b border-border/40">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
