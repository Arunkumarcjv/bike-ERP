import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store';
import { Bell, AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotificationPanel() {
  const notifications = useAppStore((state) => state.notifications || []);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-button text-text-muted hover:text-text-main hover:bg-surface-subtle transition-colors"
        title="Operational Alerts & Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-red ring-2 ring-surface" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-surface rounded-card border border-border shadow-dialog z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-text-main">Notifications</span>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-muted">No active notifications</div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  to={notif.link || '#'}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 hover:bg-surface-subtle transition-colors text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    {notif.severity === 'HIGH' ? (
                      <AlertCircle className="w-4 h-4 text-status-red shrink-0 mt-0.5" />
                    ) : notif.severity === 'MEDIUM' ? (
                      <AlertTriangle className="w-4 h-4 text-status-amber shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold text-text-main">{notif.title}</div>
                      <div className="text-text-muted mt-0.5 leading-relaxed">{notif.message}</div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
