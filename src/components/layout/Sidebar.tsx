
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: 'ri-dashboard-line', label: 'Dashboard', path: '/dashboard' },
  { icon: 'ri-mic-line', label: 'Interviews', path: '/interviews' },
  // { icon: 'ri-video-line', label: 'Mock Interview', path: '/mock-interview', badge: 'AI' },
  { icon: 'ri-calendar-line', label: 'Schedule', path: '/schedule' },
  // { icon: 'ri-file-list-line', label: 'Tests', path: '/tests' },
  { icon: 'ri-bar-chart-line', label: 'Analytics', path: '/analytics' },
  { icon: 'ri-gamepad-line', label: 'Gamified Learning', path: '/gamified-learning' },
  { icon: 'ri-folder-line', label: 'Portfolio & Projects', path: '/portfolio', badge: null },
  { icon: 'ri-sword-line', label: 'Challenge Arena', path: '/challenge-arena', badge: 'New' },
  { icon: 'ri-file-search-line', label: 'Resume Analyzer', path: '/resume-analyzer' },
  { icon: 'ri-lightbulb-line', label: 'Additional Skills', path: '/additional-skills' },
  { icon: 'ri-book-open-line', label: 'Interview Tips', path: '/interview-tips' },
  { icon: 'ri-settings-line', label: 'Settings', path: '/settings' },
  { icon: 'ri-customer-service-line', label: 'Support', path: '/support' },
];

export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50
        transition-all duration-160 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'}
      `}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold">
                <span className="text-yellow-500">Interview</span>
                <span className="text-blue-600">Xpert</span>
              </span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <i className={`ri-${isCollapsed ? 'menu-unfold' : 'menu-fold'}-line text-gray-600 dark:text-gray-400`} />
          </button>
        </div>

        {/* Menu Title */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Main Menu</h2>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center px-3 py-2 rounded-lg transition-all duration-160
                      ${isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold border-r-2 border-blue-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                      ${isCollapsed ? 'justify-center' : 'justify-start'}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <i className={`${item.icon} text-lg ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && (
                      <>
                        <span className="whitespace-nowrap flex-1">{item.label}</span>
                        {item.badge && (
                          <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${item.badge === 'AI'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : item.badge === 'New'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};
