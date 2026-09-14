import React, { useState } from 'react';
import { Ship, Anchor, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export type BerthStatus = 'available' | 'occupied' | 'near-capacity' | 'at-risk' | 'closed';

export interface BerthData {
  id: string;
  name: string;
  status: BerthStatus;
  compatibleSize: string;
  maxCranes: number;
  currentCranes: number;
  availableAt: string;
  currentVessel?: string;
}

const mockBerths: BerthData[] = [
  { id: 'b1', name: 'Berth Alpha', status: 'occupied', compatibleSize: 'Large (Post-Panamax)', maxCranes: 4, currentCranes: 3, availableAt: '13:40 UTC', currentVessel: 'Vessel A' },
  { id: 'b2', name: 'Berth Beta', status: 'available', compatibleSize: 'Medium (Panamax)', maxCranes: 3, currentCranes: 0, availableAt: 'Now' },
  { id: 'b3', name: 'Berth Gamma', status: 'near-capacity', compatibleSize: 'Large (Post-Panamax)', maxCranes: 4, currentCranes: 4, availableAt: '18:15 UTC', currentVessel: 'Vessel C' },
  { id: 'b4', name: 'Berth Delta', status: 'at-risk', compatibleSize: 'Small (Feeder)', maxCranes: 2, currentCranes: 2, availableAt: 'Unknown', currentVessel: 'Vessel Omega' },
  { id: 'b5', name: 'Berth Epsilon', status: 'closed', compatibleSize: 'Medium (Panamax)', maxCranes: 3, currentCranes: 0, availableAt: 'Under Maintenance' },
];

const getStatusColor = (status: BerthStatus) => {
  switch (status) {
    case 'available': return 'bg-emerald-100 border-emerald-300 text-emerald-800';
    case 'occupied': return 'bg-slate-200 border-slate-400 text-slate-800';
    case 'near-capacity': return 'bg-amber-100 border-amber-300 text-amber-800';
    case 'at-risk': return 'bg-orange-100 border-orange-300 text-orange-800';
    case 'closed': return 'bg-red-100 border-red-300 text-red-800 opacity-75 cursor-not-allowed';
    default: return 'bg-slate-100 border-slate-300 text-slate-800';
  }
};

const getStatusIcon = (status: BerthStatus) => {
  switch (status) {
    case 'available': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case 'occupied': return <Ship className="w-4 h-4 text-slate-600" />;
    case 'near-capacity': return <Anchor className="w-4 h-4 text-amber-600" />;
    case 'at-risk': return <AlertCircle className="w-4 h-4 text-orange-600" />;
    case 'closed': return <Clock className="w-4 h-4 text-red-600" />;
    default: return null;
  }
};

export const BerthLayoutMap: React.FC = () => {
  const [selectedBerth, setSelectedBerth] = useState<BerthData>(mockBerths[0]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[500px]">
      {/* Map Area */}
      <div className="flex-1 bg-port-warmWhite rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col p-6 min-h-[300px]">
        
        {/* Minimal navy water lines */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-slate-50 border-t-2 border-indigo-900/10 z-0">
          <div className="absolute top-6 left-6 text-xs text-indigo-900/40 uppercase tracking-widest font-bold">Harbor Basin</div>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
            <defs>
              <pattern id="water" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 0 10 Q 10 5 20 10 T 40 10" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#water)" />
          </svg>
        </div>

        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-8 z-10">Terminal Layout</h3>

        <div className="relative z-10 flex-1 flex flex-col justify-end pb-4">
          {/* Wharf Line */}
          <div className="w-full h-3 bg-slate-300 rounded-sm mb-2 shadow-sm border border-slate-400"></div>
          
          {/* Berths Row */}
          <div className="flex gap-3 sm:gap-4 items-end flex-wrap sm:flex-nowrap">
            {mockBerths.map((berth) => (
              <button
                key={berth.id}
                onClick={() => setSelectedBerth(berth)}
                className={`flex-1 min-w-[100px] min-h-[100px] sm:min-h-[120px] rounded-lg border-2 p-2 sm:p-3 transition-all text-left flex flex-col justify-between ${getStatusColor(berth.status)} ${selectedBerth.id === berth.id ? 'ring-2 ring-indigo-500 ring-offset-2 shadow-md sm:scale-105 z-20' : 'hover:brightness-95 z-10'}`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm">{berth.name}</div>
                  <div className="text-[10px] sm:text-xs mt-1 capitalize opacity-80 font-medium">{berth.status.replace('-', ' ')}</div>
                </div>
                <div className="flex justify-end mt-2 sm:mt-0">
                  {getStatusIcon(berth.status)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inspector Sidebar */}
      <div className="w-full lg:w-80 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Berth Inspector</h3>
        
        {selectedBerth ? (
          <div className="space-y-5 flex-1">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selectedBerth.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                  selectedBerth.status === 'available' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  selectedBerth.status === 'occupied' ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                  selectedBerth.status === 'near-capacity' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  selectedBerth.status === 'at-risk' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                  'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {selectedBerth.status.replace('-', ' ')}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              {selectedBerth.currentVessel && (
                <div>
                  <label className="text-xs text-slate-500 font-medium uppercase tracking-wide block mb-1">Current Vessel</label>
                  <div className="text-sm font-semibold text-slate-900 flex items-center gap-2 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                    <Ship className="w-4 h-4 text-indigo-500" />
                    {selectedBerth.currentVessel}
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-xs text-slate-500 font-medium uppercase tracking-wide block mb-1">Compatible Vessel Size</label>
                <div className="text-sm font-semibold text-slate-800">{selectedBerth.compatibleSize}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <label className="text-xs text-slate-500 font-medium uppercase tracking-wide block mb-0.5">Max Cranes</label>
                  <div className="text-lg font-bold text-slate-800">{selectedBerth.maxCranes}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <label className="text-xs text-slate-500 font-medium uppercase tracking-wide block mb-0.5">Cranes Used</label>
                  <div className={`text-lg font-bold ${selectedBerth.currentCranes === selectedBerth.maxCranes ? 'text-amber-600' : 'text-slate-800'}`}>
                    {selectedBerth.currentCranes} <span className="text-sm text-slate-400 font-normal">/ {selectedBerth.maxCranes}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium uppercase tracking-wide block mb-1">Available At</label>
                <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {selectedBerth.availableAt}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500 flex items-center justify-center h-full">Select a berth to view details</div>
        )}
      </div>
    </div>
  );
};
