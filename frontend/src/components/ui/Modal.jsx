import React, { useEffect } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, size = 'md', className = '' }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={clsx(
          'w-full bg-surface rounded-card border border-border shadow-dialog overflow-hidden flex flex-col max-h-[90vh]',
          sizeClasses[size],
          className
        )}
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-subtle">
          <h3 className="text-base font-semibold text-text-main">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-main rounded-button hover:bg-surface-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
