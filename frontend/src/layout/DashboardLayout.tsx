import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { usePageTitle } from '../hooks/usePageTitle';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = usePageTitle();

  return (
    <div className="landed-brutal brutal-grid min-h-dvh bg-[#fbf7ef]">
      <div className="min-h-dvh lg:flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="min-w-0 flex-1 lg:pl-0">
          <Navbar title={title} onMenuClick={() => setSidebarOpen(true)} />
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
