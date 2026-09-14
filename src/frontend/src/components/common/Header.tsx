import React, { useEffect, useState } from 'react';
import { Anchor, Activity, Terminal, Menu } from 'lucide-react';
import { fetchHealth } from '../../api/client';
import { HealthStatus } from '../../types';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setHealth(data);
        setIsLive(true);
      })
      .catch(() => {
        setIsLive(false);
      });
  }, []);

  return (
    <header className="h-14 border-b border-slate-200 bg-white/90 backdrop-blur px-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
          <Anchor className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide text-slate-900">PortFlow AI</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 hidden sm:inline-block">
              Terminal Ops
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block -mt-0.5 hidden sm:block">Shift Supervisor Console</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 hidden sm:inline-block">API:</span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className={isLive ? 'text-emerald-600' : 'text-amber-600'}>
              {isLive && health ? `v${health.version}` : 'Connecting...'}
            </span>
          </span>
        </div>

        <div className="text-xs text-slate-500 hidden md:flex items-center gap-1.5 font-mono">
          <Activity className="w-3.5 h-3.5 text-indigo-500" />
          <span>UTC: {new Date().toISOString().slice(11, 16)}</span>
        </div>
      </div>
    </header>
  );
};