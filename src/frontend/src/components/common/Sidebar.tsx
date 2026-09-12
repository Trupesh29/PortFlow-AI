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

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-60 border-r border-slate-800 bg-navy-950 flex flex-col shrink-0 min-h-[calc(100vh-3.5rem)]">
      <div className="p-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
        Operational Modules
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400">
        <span className="font-semibold text-slate-300 block">PortFlow AI — Monolith</span>
        <span>Version 0.1.0 (Skeleton)</span>
      </div>
    </aside>
  );
};