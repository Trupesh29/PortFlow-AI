import React from 'react';
import { EmptyState } from '../components/common/EmptyState';

export const OperationsPlanPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100">72-Hour Port Operations Plan</h1>
        <p className="text-xs text-slate-400 mt-0.5">Supervisor shift plan, routing decisions, and handover notes</p>
      </div>
      <EmptyState
        title="No Active Operations Plan"
        description="Generated 72-hour operational shift plans with berth assignments, risk mitigation windows, and supervisor approval records will appear here."
      />
    </div>
  );
};