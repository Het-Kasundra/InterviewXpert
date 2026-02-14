
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <TopBar sidebarCollapsed={sidebarCollapsed} />
      
      <main className={`
        transition-all duration-160 ease-in-out pt-16
        ${sidebarCollapsed ? 'ml-16' : 'ml-64'}
      `}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
