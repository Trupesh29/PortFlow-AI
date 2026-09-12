import React from 'react';
import { EmptyState } from '../components/common/EmptyState';

export const VesselsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100">Vessel Queue & Schedules</h1>
        <p className="text-xs text-slate-400 mt-0.5">Incoming vessel call records, dimensions, and container moves</p>
      </div>
      <EmptyState
        title="No Vessel Schedules Ingested"
        description="Vessel schedules imported via CSV or API will be listed here with ETA/ETD, draft requirements, and container moves."
      />
    </div>
  );
};