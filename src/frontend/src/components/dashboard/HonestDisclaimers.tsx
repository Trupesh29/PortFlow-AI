import React from 'react';
import { Database, Info, ShieldCheck, Terminal } from 'lucide-react';

export const HonestDisclaimers: React.FC = () => {
  return (
    <div className="bg-navy-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-3">
      <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
        <ShieldCheck className="w-4 h-4 text-teal-400" />
        <span>PortFlow AI Operational Integrity & Data Disclosure</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Synthetic Data Notice */}
        <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 flex items-start gap-2.5">
          <Database className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300 block mb-0.5">Synthetic Demo Data</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              All vessel schedules, port dimensions, and crane productivities are reproducible fictional datasets generated for demonstration purposes.
            </p>
          </div>
        </div>

        {/* Baseline Rule Notice */}
        <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 flex items-start gap-2.5">
          <Terminal className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-purple-300 block mb-0.5">Baseline Rule Engine (<code className="text-purple-200">baseline_rule_v1</code>)</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Congestion risk and queues are computed using transparent deterministic 6-hour capacity formulas. Full machine learning models are pending Phase 7.
            </p>
          </div>
        </div>

        {/* Optimization Pending Notice */}
        <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-cyan-300 block mb-0.5">Optimization Engine Pending</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              OR-Tools joint berth-crane CP-SAT solver and alternate routing recommendations will be connected in subsequent phases with mandatory supervisor approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
