import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { useTranslation } from 'react-i18next';
import { BranchSwitcher } from './BranchSwitcher';
import { RoleSwitcher } from './RoleSwitcher';
import { NotificationPanel } from './NotificationPanel';
import { Search, Sun, Moon, Globe, Clock, Menu } from 'lucide-react';
import { format } from 'date-fns';

export function Topbar() {
  const { i18n } = useTranslation();
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const setCommandPaletteOpen = useAppStore((state) => state.setCommandPaletteOpen);
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const branches = useAppStore((state) => state.branches || []);

  const currentBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  // Live IST Clock with flashing colon
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isEvenSecond = time.getSeconds() % 2 === 0;

  return (
    <header className="h-14 bg-surface border-b border-border px-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Mobile hamburger & Branch & GSTIN */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-button text-text-muted hover:text-text-main hover:bg-surface-subtle lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <BranchSwitcher />

        {/* GSTIN Badge Chip */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-surface-subtle border border-border text-[11px] font-mono text-text-muted">
          <span className="font-sans font-medium text-text-subtle">GSTIN:</span>
          <span className="text-text-main font-semibold">{currentBranch?.gstin || '29AABCB1829M1ZK'}</span>
        </div>
      </div>

      {/* Middle: Command Palette Search Input (Ctrl+K) */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-input bg-surface-subtle border border-border text-xs text-text-muted hover:border-primary/40 hover:bg-surface-muted transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-text-muted" />
            <span>Search anything (leads, VIN, jobs, invoices)...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface text-[10px] font-mono text-text-muted shadow-xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Tools: Clock, Language, Theme, Notifications, Role Switcher */}
      <div className="flex items-center gap-2">
        {/* Live IST Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-subtle border border-border text-xs text-text-main font-medium tabular-nums">
          <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>
            {format(time, 'hh')}
            <span className={isEvenSecond ? 'opacity-100' : 'opacity-20'}>:</span>
            {format(time, 'mm')}
          </span>
          <span className="text-[10px] text-text-muted uppercase ml-0.5">{format(time, 'a')} IST</span>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center border border-border rounded-button overflow-hidden text-xs bg-surface-subtle">
          <button
            onClick={() => i18n.changeLanguage('en')}
            className={`px-2 py-1 font-semibold transition-colors ${
              i18n.language === 'en' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => i18n.changeLanguage('ta')}
            className={`px-2 py-1 font-semibold transition-colors ${
              i18n.language === 'ta' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
            }`}
          >
            தமிழ்
          </button>
          <button
            onClick={() => i18n.changeLanguage('hi')}
            className={`px-2 py-1 font-semibold transition-colors ${
              i18n.language === 'hi' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-main'
            }`}
          >
            हिन्दी
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-button text-text-muted hover:text-text-main hover:bg-surface-subtle transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notification Bell */}
        <NotificationPanel />

        {/* Role Presets Switcher */}
        <RoleSwitcher />
      </div>
    </header>
  );
}
