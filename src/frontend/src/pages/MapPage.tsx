import React from 'react';
import { EmptyState } from '../components/common/EmptyState';

export const MapPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100">Port Geospatial Map</h1>
        <p className="text-xs text-slate-400 mt-0.5">Terminal layout, berth locations, and anchorage positions</p>
      </div>
      <EmptyState
        title="Geospatial Map Standby"
        description="OpenStreetMap and Leaflet integration will display port coordinates, berth faces, and anchored vessel positions once terminal data is configured."
      />
    </div>
  );
};