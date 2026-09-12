import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-3xl font-bold text-slate-200">404</h2>
      <p className="text-slate-400 mt-2 mb-4 text-sm">Operational page not found.</p>
      <Link
        to="/"
        className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};