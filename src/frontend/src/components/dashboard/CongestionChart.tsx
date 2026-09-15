import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Info,
} from 'lucide-react';
import { CongestionBucket, CongestionForecast, RiskLevel } from '../../types/api';

interface CongestionChartProps {
  forecast?: CongestionForecast;
  selectedScenario?: string;
}

const riskBarColors: Record<RiskLevel, { bar: string; glow: string; text: string; badge: string }> = {
  low: {
    bar: 'bg-emerald-500',
    glow: 'from-emerald-500/20',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  },
  medium: {
    bar: 'bg-amber-500',
    glow: 'from-amber-500/20',
    text: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  },
  high: {
    bar: 'bg-orange-500',
    glow: 'from-orange-500/20',
    text: 'text-orange-400',
    badge: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
  },
  critical: {
    bar: 'bg-rose-500',
    glow: 'from-rose-500/20',
    text: 'text-rose-400',
    badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  },
};

export const CongestionChart: React.FC<CongestionChartProps> = ({ forecast }) => {
  const [selectedBucket, setSelectedBucket] = useState<CongestionBucket | null>(null);

  if (!forecast || !forecast.buckets || forecast.buckets.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-navy-900/60 rounded-2xl border border-slate-800">
        No congestion forecast data available.
      </div>
    );
  }

  const activeBucket = selectedBucket || forecast.buckets[0];

  const formatWindowLabel = (isoString: string, idx: number) => {
    try {
      const dt = new Date(isoString);
      const day = dt.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
      const time = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
      return { day, time, offset: `+${idx * 6}h` };
    } catch {
      return { day: 'Day', time: `${idx * 6}:00`, offset: `+${idx * 6}h` };
    }
  };

  return (
    <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header & Disclaimers */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-slate-100">
              72-Hour Congestion Forecast Timeline
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
              12 × 6-Hour Windows
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Calculated via deterministic heuristic rule: <code className="text-purple-300 font-mono">baseline_rule_v1</code> (trained ML available on Congestion &amp; Wait)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Low (&lt;40%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-400">Med (40-70%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-slate-400">High (70-90%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-400">Critical (&gt;90%)</span>
          </div>
        </div>
      </div>

      {/* Main Bar Timeline Grid */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 sm:gap-3 h-56 items-end pt-6 px-1 border-b border-slate-800 relative">
          {/* Threshold Guide Lines */}
          <div className="absolute inset-x-0 top-[10%] border-b border-rose-500/20 border-dashed pointer-events-none flex justify-end pr-2 text-[10px] text-rose-400">
            Critical 90%
          </div>
          <div className="absolute inset-x-0 top-[30%] border-b border-orange-500/20 border-dashed pointer-events-none flex justify-end pr-2 text-[10px] text-orange-400">
            High 70%
          </div>
          <div className="absolute inset-x-0 top-[60%] border-b border-amber-500/20 border-dashed pointer-events-none flex justify-end pr-2 text-[10px] text-amber-400">
            Medium 40%
          </div>

          {/* 12 Buckets */}
          {forecast.buckets.map((b, idx) => {
            const isSelected = activeBucket?.bucket_index === b.bucket_index;
            const meta = riskBarColors[b.risk_level] || riskBarColors.low;
            const barHeightPct = Math.max(12, Math.round(b.risk_probability * 100));
            const timeInfo = formatWindowLabel(b.window_start_utc, idx);

            return (
              <div
                key={b.bucket_index}
                onClick={() => setSelectedBucket(b)}
                className="flex flex-col items-center h-full justify-end group cursor-pointer relative z-10"
              >
                {/* Value Label on Top of Bar */}
                <div className="mb-1 text-center">
                  <span className={`text-[10px] font-bold ${meta.text}`}>
                    {(b.risk_probability * 100).toFixed(0)}%
                  </span>
                  {b.estimated_queue > 0 && (
                    <div className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                      Q:{b.estimated_queue}
                    </div>
                  )}
                </div>

                {/* Animated Gradient Bar */}
                <div className="w-full flex justify-center">
                  <div
                    style={{ height: `${barHeightPct}%` }}
                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 relative ${meta.bar} ${
                      isSelected
                        ? 'ring-2 ring-cyan-300 shadow-lg shadow-cyan-500/30 scale-105'
                        : 'opacity-85 group-hover:opacity-100 group-hover:scale-102'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-lg" />
                  </div>
                </div>

                {/* Window Marker */}
                <div className="mt-2 text-center">
                  <span className="block text-[10px] font-mono text-slate-400">
                    {timeInfo.offset}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis labels */}
        <div className="grid grid-cols-12 gap-2 text-center text-[10px] text-slate-400 pt-1">
          {forecast.buckets.map((b, idx) => {
            const timeInfo = formatWindowLabel(b.window_start_utc, idx);
            return (
              <div key={idx} className="truncate">
                <span className="text-slate-300 font-medium">{timeInfo.day}</span>
                <span className="block text-slate-400 text-[9px]">{timeInfo.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Bucket Detail Card (Explainable Drivers) */}
      {activeBucket && (
        <div className="p-4 rounded-xl bg-navy-950/90 border border-slate-800 shadow-inner space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">
                Bucket Window #{activeBucket.bucket_index + 1} (T+{activeBucket.bucket_index * 6}h to T+{(activeBucket.bucket_index + 1) * 6}h)
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase border ${riskBarColors[activeBucket.risk_level].badge}`}>
                {activeBucket.risk_level} Risk ({(activeBucket.risk_probability * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Arrivals: <strong className="text-slate-200">{activeBucket.scheduled_arrivals}</strong> | Moves: <strong className="text-slate-200">{activeBucket.expected_container_moves}</strong> | Est. Queue: <strong className="text-rose-400">{activeBucket.estimated_queue}</strong>
            </div>
          </div>

          {/* Rule Drivers List */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-teal-400" />
              <span>Deterministic Rule Drivers (baseline_rule_v1)</span>
            </div>
            <ul className="space-y-1">
              {activeBucket.top_rule_drivers.map((driver, dIdx) => (
                <li key={dIdx} className="text-xs text-slate-300 flex items-start gap-2 bg-navy-900/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-teal-400 font-bold mt-0.5">•</span>
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
