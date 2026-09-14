import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';

export const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-port-warmWhite flex flex-col text-slate-800">
      <Header onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <div className="flex flex-1 relative overflow-hidden">
        {/* Mobile Drawer Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          absolute inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out bg-white border-r border-slate-200
          md:relative md:translate-x-0 w-64 shadow-lg md:shadow-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar onNavClick={() => setIsMobileMenuOpen(false)} />
        </div>
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-port-warmWhite text-slate-800 w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};