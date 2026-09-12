import React from 'react';
import { EmptyState } from '../components/common/EmptyState';

export const OptimizerPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100">Joint Berth & Crane Optimizer</h1>
        <p className="text-xs text-slate-400 mt-0.5">Mathematical constraint programming via Google OR-Tools CP-SAT</p>
      </div>
      <EmptyState
        title="Optimization Engine Standby"
        description="OR-Tools solver will compute optimal vessel-to-berth and crane assignments across 30-minute time slots to minimize port dwell time."
      />
    </div>
  );
};