import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wrench, Smartphone, Users, UserPlus } from 'lucide-react';

export function MobileBottomNav() {
  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/leads', label: 'Leads', icon: UserPlus },
    { to: '/service/bays', label: 'Bays', icon: Wrench },
    { to: '/service/my-jobs', label: 'My Jobs', icon: Smartphone },
    { to: '/customers', label: 'Customers', icon: Users },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-border z-40 flex items-center justify-around py-1.5 px-2 safe-area-bottom shadow-dialog">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-button text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-text-muted hover:text-text-main'
              }`
            }
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
