import React from 'react';
import { Settings2, Play, CheckCircle2, AlertTriangle, Clock, Ship, Activity } from 'lucide-react';

export const OptimizerPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Joint Berth & Crane Optimizer</h1>
        <p className="text-sm text-slate-500 mt-1">Mathematical constraint programming via Google OR-Tools CP-SAT</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Planning Settings */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-slate-500" />
              <h3 className="font-semibold text-slate-800 text-sm">Planning Settings</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Planning Horizon</label>
                <select className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white border p-2">
                  <option>24 hours</option>
                  <option>48 hours</option>
                  <option selected>72 hours</option>
                  <option>96 hours</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Solver Time Limit</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="3" max="30" defaultValue="15" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  <span className="text-xs text-slate-600 font-mono w-10 text-right">15s</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-medium text-slate-700 mb-2">Applied Constraints</label>
                <ul className="space-y-2">
                  {[
                    'No berth overlaps',
                    'Vessel dimensions compatible with berth',
                    'Concurrent crane demand within inventory',
                    'Service duration scales with crane allocation'
                  ].map((constraint, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{constraint}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Play className="w-4 h-4" />
                Run Optimization
              </button>
            </div>
          </div>
        </div>

        {/* Right: Optimization Outcome */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">Optimization Outcome</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Solver Status</div>
                <div className="font-semibold text-emerald-600 flex items-center gap-1.5">
                  OPTIMAL
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Wait Reduction</div>
                <div className="font-semibold text-indigo-600">-48%</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Ship className="w-3.5 h-3.5" /> Scheduled</div>
                <div className="font-semibold text-slate-800">12 Vessels</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Berth Util</div>
                <div className="font-semibold text-slate-800">82%</div>
              </div>
            </div>

            {/* Baseline vs Optimized comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Baseline FIFO</div>
                <div className="text-2xl font-bold text-slate-700">620 <span className="text-sm font-medium text-slate-500">minutes</span></div>
                <div className="text-xs text-slate-500 mt-1">Total waiting time</div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <div className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded">300 min saved</div>
                </div>
                <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">Optimized CP-SAT</div>
                <div className="text-2xl font-bold text-amber-600">320 <span className="text-sm font-medium text-amber-600/80">minutes</span></div>
                <div className="text-xs text-amber-700 mt-1">Total waiting time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Below: Assignment timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 text-sm">Constraint Verification & Assignments</h3>
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            All constraints satisfied
          </div>
        </div>
        
        <div className="p-4 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Timeline header */}
            <div className="flex items-center text-xs text-slate-400 mb-2 pl-24 border-b border-slate-100 pb-2">
              <div className="flex-1">09:00</div>
              <div className="flex-1">10:00</div>
              <div className="flex-1">11:00</div>
              <div className="flex-1">12:00</div>
              <div className="flex-1">13:00</div>
              <div className="flex-1">14:00</div>
              <div className="flex-1">15:00</div>
            </div>

            {/* Berth lanes */}
            <div className="space-y-3">
              {/* Berth B01 */}
              <div className="flex items-center gap-4 relative h-16 bg-slate-50/50 rounded-lg border border-slate-100">
                <div className="w-20 shrink-0 font-semibold text-sm text-slate-700 text-right pr-4 border-r border-slate-200 h-full flex flex-col justify-center">
                  Berth B01
                </div>
                <div className="flex-1 relative h-full">
                  {/* Vessel A: 09:00 - 12:00 */}
                  <div className="absolute left-0 w-[42%] h-12 top-2 bg-indigo-50 border-l-4 border-indigo-500 rounded shadow-sm p-2 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs text-indigo-900">Vessel A</span>
                      <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded font-medium">P1</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-indigo-700">
                      <span>09:00-12:00</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> 0m</span>
                      <span>2 Cranes</span>
                    </div>
                  </div>
                  {/* Vessel D: 12:15 - 15:00 */}
                  <div className="absolute left-[46%] w-[38%] h-12 top-2 bg-blue-50 border-l-4 border-blue-500 rounded shadow-sm p-2 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs text-blue-900">Vessel D</span>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1 rounded font-medium">P3</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-blue-700">
                      <span>12:15-15:00</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> 15m</span>
                      <span>3 Cranes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Berth B02 */}
              <div className="flex items-center gap-4 relative h-16 bg-slate-50/50 rounded-lg border border-slate-100">
                <div className="w-20 shrink-0 font-semibold text-sm text-slate-700 text-right pr-4 border-r border-slate-200 h-full flex flex-col justify-center">
                  Berth B02
                </div>
                <div className="flex-1 relative h-full">
                  {/* Vessel B: 09:15 - 11:30 */}
                  <div className="absolute left-[4%] w-[31%] h-12 top-2 bg-teal-50 border-l-4 border-teal-500 rounded shadow-sm p-2 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs text-teal-900">Vessel B</span>
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1 rounded font-medium">P2</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-teal-700">
                      <span>09:15-11:30</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> 10m</span>
                      <span>2 Cranes</span>
                    </div>
                  </div>
                  {/* Vessel E: 11:45 - 14:30 */}
                  <div className="absolute left-[39%] w-[39%] h-12 top-2 bg-purple-50 border-l-4 border-purple-500 rounded shadow-sm p-2 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs text-purple-900">Vessel E</span>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1 rounded font-medium">P3</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-purple-700">
                      <span>11:45-14:30</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> 20m</span>
                      <span>2 Cranes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Berth B03 */}
              <div className="flex items-center gap-4 relative h-16 bg-slate-50/50 rounded-lg border border-slate-100">
                <div className="w-20 shrink-0 font-semibold text-sm text-slate-700 text-right pr-4 border-r border-slate-200 h-full flex flex-col justify-center">
                  Berth B03
                </div>
                <div className="flex-1 relative h-full">
                  {/* Vessel C: 09:30 - 13:15 */}
                  <div className="absolute left-[7%] w-[53%] h-12 top-2 bg-rose-50 border-l-4 border-rose-500 rounded shadow-sm p-2 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs text-rose-900">Vessel C</span>
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1 rounded font-medium">P2</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-rose-700">
                      <span>09:30-13:15</span>
                      <span className="flex items-center gap-0.5 text-amber-600"><AlertTriangle className="w-3 h-3" /> 45m</span>
                      <span>1 Crane</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};