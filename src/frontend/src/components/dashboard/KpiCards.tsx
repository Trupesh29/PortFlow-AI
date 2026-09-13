import React from 'react';
import {
  AlertOctagon,
  Anchor,
  Clock,
  Ship,
  Wrench,
} from 'lucide-react';
import { DashboardSummary, RiskLevel } from '../../types/api';

interface KpiCardsProps {
  summary?: DashboardSummary;
}

const riskStyles: Record<
  RiskLevel,
  { bg: string; border: string; text: string; label: string }
> = {
  low: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    label: 'Low Risk',
  },
  medium: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    label: 'Medium Risk',
  },
  high: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    label: 'High Risk',
  },
  critical: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    label: 'Critical Risk',
  },
};

export const KpiCards: React.FC<KpiCardsProps> = ({ summary }) => {
  if (!summary) return null;

  const currentRisk = summary.peak_congestion_level || 'low';
  const riskMeta = riskStyles[currentRisk] || riskStyles.low;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Upcoming Vessels */}
      <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Upcoming Vessels
          </span>
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Ship className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-100 tracking-tight">
            {summary.active_upcoming_vessels}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
            <span className="text-teal-400 font-semibold">{summary.arrivals_next_24h}</span>
            <span>arriving next 24h</span>
          </div>
        </div>
      </div>

      {/* 2. Berth Occupancy */}
      <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Berth Occupancy
          </span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Anchor className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-100 tracking-tight">
            {summary.berth_occupancy_pct.toFixed(1)}%
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
            <span className="text-cyan-400 font-semibold">{summary.available_berths} / {summary.total_berths}</span>
            <span>berths available</span>
          </div>
        </div>
      </div>

      {/* 3. Available Cranes */}
      <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Available Cranes
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Wrench className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-100 tracking-tight">
            {summary.available_cranes} <span className="text-sm font-normal text-slate-400">/ {summary.total_cranes}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
            <span className="text-indigo-400 font-semibold">
              {summary.total_cranes - summary.available_cranes}
            </span>
            <span>in maintenance / outage</span>
          </div>
        </div>
      </div>

      {/* 4. Peak Congestion Risk */}
      <div className={`bg-navy-900/70 border ${riskMeta.border} rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700/80 transition-all`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Peak Risk (72h)
          </span>
          <div className={`p-2 rounded-xl ${riskMeta.bg} ${riskMeta.text} border ${riskMeta.border}`}>
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100 tracking-tight">
              {(summary.peak_congestion_risk * 100).toFixed(0)}%
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase ${riskMeta.bg} ${riskMeta.text} border ${riskMeta.border}`}>
              {summary.peak_congestion_level}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
            <span>Critical vessels: <strong className="text-slate-200">{summary.critical_vessel_count}</strong></span>
          </div>
        </div>
      </div>

      {/* 5. Avg Estimated Waiting Time */}
      <div className="bg-navy-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700/80 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Baseline Wait Time
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-100 tracking-tight">
            {summary.average_waiting_time_hours.toFixed(1)} <span className="text-sm font-normal text-slate-400">hrs</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
            <span className="text-amber-400 font-semibold">baseline rule</span>
            <span>average per queue</span>
          </div>
        </div>
      </div>
    </div>
  );
};
