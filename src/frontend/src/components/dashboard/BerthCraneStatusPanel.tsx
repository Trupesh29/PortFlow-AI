import React from 'react';
import { Anchor, Wrench } from 'lucide-react';
import { BerthResource, CraneResource } from '../../types/api';

interface BerthCraneStatusPanelProps {
  berths: BerthResource[];
  cranes: CraneResource[];
  loading?: boolean;
}

export const BerthCraneStatusPanel: React.FC<BerthCraneStatusPanelProps> = ({
  berths,
  cranes,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* 1. Berths Panel */}
      <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Anchor className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Terminal Berths Status
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {berths.filter((b) => b.status === 'available').length} / {berths.length} Open
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {berths.map((b) => {
            const isClosed = b.status === 'closed';
            const isOccupied = b.current_occupancy === 'occupied';

            return (
              <div
                key={b.code}
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                  isClosed
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : isOccupied
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-navy-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black font-mono text-slate-100">
                      {b.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        isClosed
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : isOccupied
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {isClosed ? 'Closed' : isOccupied ? 'Occupied' : 'Open'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-1">
                    {b.name}
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2">
                  <div className="flex justify-between">
                    <span>Max Draft:</span>
                    <span className="text-slate-200 font-semibold">{b.max_draft_m} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Length:</span>
                    <span className="text-slate-200 font-semibold">{b.max_length_m} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Allocated Cranes:</span>
                    <span className="text-teal-400 font-semibold">{b.allocated_cranes_count} QC</span>
                  </div>
                </div>

                {b.assigned_vessel_name && (
                  <div className="text-[10px] px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 truncate">
                    Berthed: {b.assigned_vessel_name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Cranes Panel */}
      <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Quay Cranes Throughput
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {cranes.filter((c) => c.status === 'available').length} / {cranes.length} Online
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {cranes.map((c) => {
            const isOutage = c.status === 'outage';

            return (
              <div
                key={c.code}
                className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 transition-all ${
                  isOutage
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    : 'bg-navy-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-100">
                    {c.code}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOutage ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                    }`}
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    {c.moves_per_hour} <span className="text-[10px] text-slate-400 font-normal">mph</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Berth: {c.berth_code || 'Unassigned'}
                  </div>
                </div>
                <div className="text-[9px] uppercase font-bold text-right">
                  {isOutage ? <span className="text-rose-400">Outage</span> : <span className="text-teal-400">Active</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
