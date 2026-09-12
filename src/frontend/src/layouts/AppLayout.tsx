import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto bg-navy-950 text-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};