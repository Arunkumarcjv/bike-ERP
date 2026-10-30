import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store';
import { ROLE_PRESETS } from '../../config/roles';
import { UserCheck, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backend } from '../../services/api/backend';

export function RoleSwitcher() {
  const currentUser = useAppStore((state) => state.currentUser);
  const loginAsRole = useAppStore((state) => state.loginAsRole);
  const logout = useAppStore((state) => state.logout);
  const navigate = useNavigate();
  // With the Django backend the role comes from the signed-in JWT user, so local switching is disabled.
  const serverAuth = backend.enabled();
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
            {serverAuth ? 'Signed in' : 'Demo Persona Switcher'}
          </div>
          {serverAuth && (
            <div className="py-1">
              <div className="px-3 py-2 text-xs">
                <div className="font-medium text-text-main">{currentUser?.name}</div>
                <div className="text-[10px] text-text-muted">{currentUser?.email}</div>
              </div>
              <button
                onClick={async () => {
                  setOpen(false);
                  await logout();
                  navigate('/login');
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-status-red hover:bg-surface-subtle"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          )}
          <div className={`max-h-72 overflow-y-auto py-1 ${serverAuth ? 'hidden' : ''}`}>
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
