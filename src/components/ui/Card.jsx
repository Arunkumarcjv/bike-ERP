import React from 'react';
import clsx from 'clsx';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={clsx(
        'bg-surface rounded-card border border-border shadow-card transition-all duration-150',
        hover && 'hover:shadow-dropdown hover:border-slate-300 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={clsx('px-5 py-4 border-b border-border flex items-center justify-between', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={clsx('text-base font-semibold text-text-main', className)}>{children}</h3>;
}

export function CardContent({ children, className = '' }) {
  return <div className={clsx('p-5', className)}>{children}</div>;
}
