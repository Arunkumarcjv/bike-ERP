import React from 'react';
import clsx from 'clsx';

export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={clsx('flex border-b border-border space-x-1', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition-all duration-150 flex items-center gap-2',
              isActive
                ? 'border-primary text-primary bg-primary/5 rounded-t-button'
                : 'border-transparent text-text-muted hover:text-text-main hover:border-slate-300'
            )}
          >
            {tab.label}
            {tab.count != null && (
              <span
                className={clsx(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                  isActive ? 'bg-primary text-white' : 'bg-surface-muted text-text-muted'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
