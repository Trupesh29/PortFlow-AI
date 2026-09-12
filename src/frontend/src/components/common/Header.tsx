import React, { useEffect, useState } from 'react';
import { Anchor, Activity, Terminal } from 'lucide-react';
import { fetchHealth } from '../../api/client';
import { HealthStatus } from '../../types';

export const Header: React.FC = () => {
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
    <header className="h-14 border-b border-slate-800 bg-navy-900/90 backdrop-blur px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
          <Anchor className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide text-white">PortFlow AI</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
              Terminal Ops
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block -mt-0.5">Shift Supervisor Console</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-md bg-navy-950 border border-slate-800">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">API:</span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className={isLive ? 'text-emerald-400' : 'text-amber-400'}>
              {isLive && health ? `v${health.version}` : 'Connecting...'}
            </span>
          </span>
        </div>

        <div className="text-xs text-slate-400 hidden sm:flex items-center gap-1.5 font-mono">
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          <span>UTC: {new Date().toISOString().slice(11, 16)}</span>
        </div>
      </div>
    </header>
  );
};