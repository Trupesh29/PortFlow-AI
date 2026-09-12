import React from 'react';
import { Database, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Demo data not loaded",
  description = "Connect database or import synthetic vessel schedules to populate operational predictions and optimizer tables.",
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 my-4 rounded-xl border border-dashed border-slate-700 bg-navy-900/40 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-maritime-accent mb-4">
        <Database className="w-6 h-6 text-maritime-cyan" />
      </div>
      <h3 className="text-base font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-maritime-teal hover:bg-teal-600 text-white transition-colors"
        >
          <AlertCircle className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};