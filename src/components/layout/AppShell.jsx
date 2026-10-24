import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { MobileBottomNav } from './MobileBottomNav';
import { useAppStore } from '../../store';
import { Toaster } from 'sonner';

export function AppShell() {
  const theme = useAppStore((state) => state.theme);

  // Sync data-theme attribute on root element for Tailwind dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Deep Navy Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Operational Bar */}
        <Topbar />

        {/* Dynamic Page Canvas */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-8">
          <Outlet />
        </main>

        {/* Mobile First Bottom Navigation Bar */}
        <MobileBottomNav />
      </div>

      {/* Global Interactive Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors theme={theme} />
    </div>
  );
}
