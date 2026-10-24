import React, { useEffect } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

export function Drawer({ isOpen, onClose, title, children, size = 'md', className = '' }) {
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
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-navy-950/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={clsx(
            'w-screen bg-surface border-l border-border shadow-dialog flex flex-col',
            sizeClasses[size],
            className
          )}
        >
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-subtle">
            <h3 className="text-base font-semibold text-text-main">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-main rounded-button hover:bg-surface-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
