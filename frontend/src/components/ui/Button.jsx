import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconRight: IconRight = null,
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-button transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground focus:ring-primary shadow-soft',
    secondary:
      'bg-surface-subtle hover:bg-surface-muted text-text-main border border-border focus:ring-slate-300',
    outline:
      'bg-transparent hover:bg-surface-subtle text-primary border border-primary focus:ring-primary',
    ghost:
      'bg-transparent hover:bg-surface-subtle text-text-main focus:ring-slate-300',
    danger:
      'bg-status-red hover:bg-red-700 text-white focus:ring-red-500 shadow-soft',
  };

  return (
    <button
      className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 text-current" />
      ) : null}
      {children}
      {!loading && IconRight ? <IconRight className="w-4 h-4 text-current" /> : null}
    </button>
  );
}
