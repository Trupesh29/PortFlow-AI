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
    <div className="flex flex-col items-center justify-center p-8 my-4 rounded-xl border border-dashed border-slate-300 bg-white text-center shadow-sm">
      <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
        <Database className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
        >
          <AlertCircle className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};