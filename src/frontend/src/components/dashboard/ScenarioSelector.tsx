import React from 'react';
import { Activity, AlertTriangle, ArrowUpRight, Cpu, Layers, SlidersHorizontal, Wrench } from 'lucide-react';
import { ScenarioItem } from '../../types/api';

interface ScenarioSelectorProps {
  scenarios: ScenarioItem[];
  activeScenario: string;
  onSelectScenario: (key: string) => void;
  loading: boolean;
}

const scenarioIcons: Record<string, React.ReactNode> = {
  baseline: <Activity className="w-4 h-4 text-emerald-400" />,
  arrival_surge: <ArrowUpRight className="w-4 h-4 text-rose-400" />,
  crane_outage: <Wrench className="w-4 h-4 text-amber-400" />,
  berth_closure: <AlertTriangle className="w-4 h-4 text-orange-400" />,
  handling_slowdown: <Cpu className="w-4 h-4 text-purple-400" />,
};

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  activeScenario,
  onSelectScenario,
  loading,
}) => {
  const currentScenarioObj = scenarios.find((s) => s.key === activeScenario);

  return (
    <div className="bg-navy-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Synthetic Operational Scenario Simulator
          </h2>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Derived view — does not mutate persistent database</span>
        </div>
      </div>

      {/* Scenario Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {scenarios.map((sc) => {
          const isActive = sc.key === activeScenario;
          return (
            <button
              key={sc.key}
              onClick={() => onSelectScenario(sc.key)}
              disabled={loading}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden group ${
                isActive
                  ? 'bg-gradient-to-b from-teal-500/20 to-navy-900 border-teal-500/60 text-slate-100 shadow-md ring-1 ring-teal-500/40'
                  : 'bg-navy-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-navy-850/60'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-teal-500/20' : 'bg-slate-800/80'}`}>
                    {scenarioIcons[sc.key] || <Activity className="w-4 h-4 text-teal-400" />}
                  </div>
                  <span className={`text-xs font-bold ${isActive ? 'text-teal-200' : 'text-slate-300'}`}>
                    {sc.name}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {sc.description}
              </p>
              {isActive && (
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-teal-400 rounded-bl-lg shadow-sm" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Scenario Info Alert */}
      {currentScenarioObj && (
        <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800/80 flex items-start gap-3 text-xs">
          <div className="p-1 rounded-md bg-teal-500/10 text-teal-400 shrink-0 mt-0.5">
            {scenarioIcons[currentScenarioObj.key] || <Activity className="w-3.5 h-3.5" />}
          </div>
          <div>
            <span className="font-semibold text-teal-300 mr-1.5">{currentScenarioObj.name} Active:</span>
            <span className="text-slate-300">{currentScenarioObj.description}</span>
          </div>
        </div>
      )}
    </div>
  );
};
