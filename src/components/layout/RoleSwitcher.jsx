import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store';
import { ROLE_PRESETS } from '../../config/roles';
import { UserCheck, ChevronDown } from 'lucide-react';

export function RoleSwitcher() {
  const currentUser = useAppStore((state) => state.currentUser);
  const loginAsRole = useAppStore((state) => state.loginAsRole);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-button bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-medium transition-colors"
        title="Quick Role Switcher for ERP demo testing"
      >
        <UserCheck className="w-3.5 h-3.5 text-primary" />
        <span className="font-semibold hidden sm:inline">{currentUser?.role || 'Switch Role'}</span>
        <ChevronDown className="w-3 h-3 opacity-70" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-surface rounded-card border border-border shadow-dialog z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Demo Persona Switcher
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {ROLE_PRESETS.map((preset) => {
              const isSelected = currentUser?.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    loginAsRole(preset.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-subtle transition-colors ${
                    isSelected ? 'bg-primary/10 text-primary font-semibold' : 'text-text-main'
                  }`}
                >
                  <div>
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-[10px] text-text-muted">{preset.role} • {preset.department}</div>
                  </div>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
