import React, { useState, useEffect } from 'react';
import {
  Home,
  Upload,
  Users,
  UserCheck,
  FileText,
  LogOut,
  Settings,
  ChevronDown,
  ChevronRight,
  Minus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [dashboardOpen, setDashboardOpen] = useState(false);

  const menuItems = [
    { id: 'upload', label: 'Upload PDF', icon: Upload },
    { id: 'files', label: 'Files', icon: FileText },
    ...(user?.role_name === 'Admin' ? [
      { id: 'users', label: 'Users', icon: Users },
      { id: 'roles', label: 'Roles', icon: UserCheck },
    ] : []),
  ];

  useEffect(() => {
    if (window.innerWidth < 1024 && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, []);
  return (
    <div className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-64 shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] z-50 transition-all duration-300 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}>
      <div className="bg-white dark:bg-gray-900 h-full">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="main-logo flex items-center shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Arsnova</span>
          </div>
          
          <button
            type="button"
            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="h-[calc(100vh-140px)] overflow-y-auto">
          <nav className="p-4">
            <ul className="space-y-1">
              {/* Dashboard Section */}
              <li className="menu nav-item">
                <button
                  type="button"
                  className="nav-link group w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setDashboardOpen(!dashboardOpen)}
                >
                  <div className="flex items-center">
                    <Home className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600" />
                    <span className="ml-3 text-gray-900 dark:text-white group-hover:text-blue-600">Dashboard</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dashboardOpen ? 'rotate-180' : ''}`} />
                </button>
                {dashboardOpen && (
                  <ul className="mt-2 ml-8 space-y-1">
                    <li>
                      <button
                        onClick={() => onViewChange('dashboard')}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeView === 'dashboard'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        Dashboard
                      </button>
                    </li>
                  </ul>
                )}
              </li>

              {/* Section Header */}
              <li className="py-3 px-3 flex items-center uppercase font-extrabold text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 -mx-4 mb-1 mt-4">
                <Minus className="w-4 h-4 mr-2 hidden" />
                <span>FILE MANAGEMENT</span>
              </li>

              {/* Menu Items */}
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onViewChange(item.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors group ${
                        activeView === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${
                        activeView === item.id 
                          ? 'text-white' 
                          : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600'
                      }`} />
                      <span className="ml-3">{item.label}</span>
                    </button>
                  </li>
                );
              })}

              {user?.role_name === 'Admin' && (
                <>
                  {/* Admin Section Header */}
                  <li className="py-3 px-3 flex items-center uppercase font-extrabold text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 -mx-4 mb-1 mt-4">
                    <Minus className="w-4 h-4 mr-2 hidden" />
                    <span>ADMINISTRATION</span>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>

        {/* Logout Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors group"
          >
            <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;