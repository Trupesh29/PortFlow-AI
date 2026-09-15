import React from 'react';
import { Anchor, Clock, Database, RefreshCw, Terminal } from 'lucide-react';
import { PortIdentity } from '../../types/api';

interface OperationalHeaderProps {
  port?: PortIdentity;
  horizonHours: number;
  scenario?: string;
  isSynthetic: boolean;
  calculationMethod: string;
  asOfUtc?: string;
  loading: boolean;
  onRefresh: () => void;
}

export const OperationalHeader: React.FC<OperationalHeaderProps> = ({
  port,
  horizonHours,
  isSynthetic,
  calculationMethod,
  asOfUtc,
  loading,
  onRefresh,
}) => {
  const formattedAsOf = asOfUtc
    ? new Date(asOfUtc).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      }) + ' UTC'
    : 'Live';

  return (
    <div className="bg-navy-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Port Identity & Title */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 text-teal-400 shadow-inner">
            <Anchor className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                {port?.name || 'Bluehaven Container Terminal'}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 tracking-wide">
                {port?.code || 'PFA'}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {port?.country || 'Fictionland'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>Operations Planning & Congestion Forecasting</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">As of: <strong className="text-slate-300">{formattedAsOf}</strong></span>
            </p>
          </div>
        </div>

        {/* Right: Badges & Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Horizon Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-800 text-slate-300 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Horizon: <strong className="text-slate-100">{horizonHours} Hours</strong></span>
          </div>

          {/* Synthetic Data Label */}
          {isSynthetic && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Synthetic Demo Data</span>
            </div>
          )}

          {/* Baseline Rule Method Label */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium" title="Dashboard baseline calculation; trained ML predictions are on Congestion & Wait">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>Method: <code className="font-mono text-[11px] text-purple-200">{calculationMethod}</code></span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 active:scale-95 border border-teal-500/40 text-teal-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Refresh operational data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>
    </div>
  );
};
