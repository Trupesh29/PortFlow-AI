import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Ship,
  MapPin,
  TrendingUp,
  Cpu,
  CalendarCheck2,
  Bot
} from 'lucide-react';

interface NavItemConfig {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItemConfig[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Vessel Queue', path: '/vessels', icon: Ship },
  { name: 'Port Map', path: '/map', icon: MapPin },
  { name: 'Congestion & Wait', path: '/predictions', icon: TrendingUp },
  { name: 'Joint Optimizer', path: '/optimizer', icon: Cpu },
  { name: '72h Operations Plan', path: '/operations-plan', icon: CalendarCheck2 },
  { name: 'AI Copilot (Bob)', path: '/copilot', icon: Bot },
];

interface SidebarProps {
  onNavClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavClick }) => {
  return (
    <aside className="w-full h-full flex flex-col shrink-0">
      <div className="p-4 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
        Operational Modules
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-port-lavender text-port-lavenderDark font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200 text-xs text-slate-500 bg-slate-50">
        <span className="font-semibold text-slate-700 block mb-0.5">PortFlow AI</span>
        <span>Version 0.1.0 (Demo)</span>
      </div>
    </aside>
  );
};