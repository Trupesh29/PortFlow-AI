import React from 'react';
import { Clock, Ship } from 'lucide-react';
import { RiskLevel, ScheduleItem } from '../../types/api';

interface AffectedVesselsTableProps {
  schedules: ScheduleItem[];
  loading: boolean;
}

const riskBadges: Record<RiskLevel, { text: string; bg: string; border: string }> = {
  low: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  medium: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  high: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  critical: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
};

const priorityBadges: Record<number, { text: string; bg: string; border: string }> = {
  1: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  2: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  3: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  4: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  5: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
};

export const AffectedVesselsTable: React.FC<AffectedVesselsTableProps> = ({ schedules, loading }) => {
  const formatUtcTime = (iso: string) => {
    try {
      const dt = new Date(iso);
      return dt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC',
      }) + ' UTC';
    } catch {
      return iso;
    }
  };

  return (
    <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Ship className="w-5 h-5 text-teal-400" />
          <h2 className="text-base font-bold text-slate-100">
            Vessel Queue & Arrival Schedule
          </h2>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {schedules.length} In Horizon
          </span>
        </div>
        <div className="text-xs text-slate-400">
          Showing real seeded vessel schedules and baseline physical compatibility
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-navy-950/60">
              <th className="py-3 px-3.5 font-semibold">Vessel</th>
              <th className="py-3 px-3 font-semibold">ETA (UTC)</th>
              <th className="py-3 px-3 font-semibold">Priority</th>
              <th className="py-3 px-3 font-semibold">Dimensions</th>
              <th className="py-3 px-3 font-semibold">Moves</th>
              <th className="py-3 px-3 font-semibold">Berth Compatibility</th>
              <th className="py-3 px-3 font-semibold">Baseline Impact</th>
              <th className="py-3 px-3 font-semibold text-right">Risk Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-400">
                  {loading ? 'Loading scheduled vessels...' : 'No upcoming vessels found in this operational window.'}
                </td>
              </tr>
            ) : (
              schedules.map((s) => {
                const riskMeta = riskBadges[s.congestion_risk_level] || riskBadges.low;
                const pMeta = priorityBadges[s.priority] || priorityBadges[2];

                return (
                  <tr
                    key={s.schedule_id}
                    className="hover:bg-navy-850/50 transition-colors group"
                  >
                    {/* Vessel */}
                    <td className="py-3 px-3.5 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          <Ship className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-100 group-hover:text-teal-300 transition-colors">
                            {s.vessel_name}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            IMO {s.vessel_imo}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ETA */}
                    <td className="py-3 px-3 font-mono text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatUtcTime(s.eta_utc)}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase border ${pMeta.bg} ${pMeta.text} ${pMeta.border}`}>
                        {s.priority_label} (P{s.priority})
                      </span>
                    </td>

                    {/* Dimensions */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      <span>{s.length_m.toFixed(0)}m × {s.draft_m.toFixed(1)}m draft</span>
                    </td>

                    {/* Moves */}
                    <td className="py-3 px-3 font-semibold text-slate-200">
                      {s.expected_containers.toLocaleString()} TEU
                    </td>

                    {/* Berth Compatibility */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {s.compatible_berth_codes.length === 0 ? (
                          <span className="text-rose-400 text-[11px] font-semibold">No open berth</span>
                        ) : (
                          s.compatible_berth_codes.map((code) => (
                            <span
                              key={code}
                              className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono"
                            >
                              {code}
                            </span>
                          ))
                        )}
                        <span className="text-[10px] text-slate-400">
                          ({s.compatible_berth_count} valid)
                        </span>
                      </div>
                    </td>

                    {/* Baseline Impact */}
                    <td className="py-3 px-3">
                      <div>
                        <span className="text-[11px] text-slate-200 block">
                          {s.baseline_estimated_impact}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Est. wait: <strong className="text-amber-300 font-mono">{s.baseline_estimated_waiting_hours.toFixed(1)}h</strong>
                        </span>
                      </div>
                    </td>

                    {/* Risk Level */}
                    <td className="py-3 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase border inline-block ${riskMeta.bg} ${riskMeta.text} ${riskMeta.border}`}>
                        {s.congestion_risk_level}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
