import React from 'react';
import { BerthLayoutMap } from '../components/BerthLayoutMap';

export const MapPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900">Port Geospatial Map</h1>
        <p className="text-sm text-slate-500 mt-1">Terminal layout, berth capacity status, and anchorage constraints</p>
      </div>
      
      <BerthLayoutMap />
    </div>
  );
};