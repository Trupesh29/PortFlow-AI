import React from 'react';
import { EmptyState } from '../components/common/EmptyState';

export const PredictionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100">Congestion & Waiting Time Predictions</h1>
        <p className="text-xs text-slate-400 mt-0.5">ML-driven congestion probabilities and vessel wait time forecasts</p>
      </div>
      <EmptyState
        title="ML Predictions Not Initialized"
        description="Scikit-learn and XGBoost inference models will compute 72-hour congestion windows and vessel waiting times when active schedules are submitted."
      />
    </div>
  );
};