import React from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { Anchor, ShieldAlert, Clock } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Operations Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">Terminal real-time status and 72-hour congestion overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-navy-900 border border-slate-700 text-slate-300">
            Window: Next 72 Hours
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-navy-900/60 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
            <Anchor className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Berth Occupancy</div>
            <div className="text-sm font-semibold text-slate-300 mt-1">No active schedule</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-navy-900/60 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Vessels in Queue</div>
            <div className="text-sm font-semibold text-slate-300 mt-1">0 expected</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-navy-900/60 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400">High Risk Windows</div>
            <div className="text-sm font-semibold text-slate-300 mt-1">None detected</div>
          </div>
        </div>
      </div>

      <EmptyState
        title="Operational Dashboard Awaiting Data"
        description="No vessel schedule or berth data is loaded yet. When schedules are ingested, this view will show the 72-hour congestion heatmap, vessel queue, and berth occupancy status."
      />
    </div>
  );
};