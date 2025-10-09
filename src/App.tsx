import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Views/Dashboard';
import FileUpload from './components/Views/FileUpload';
import FileList from './components/Views/FileList';
import UserManagement from './components/Views/UserManagement';
import RoleManagement from './components/Views/RoleManagement';
import Footer from './components/Layout/Footer';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeView, setActiveView] = useState('upload');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const getViewTitle = (view: string) => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      upload: 'Upload PDF',
      files: 'Files',
      users: 'User Management',
      roles: 'Role Management',
    };
    return titles[view] || 'Dashboard';
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'upload':
        return <FileUpload />;
      case 'files':
        return <FileList />;
      case 'users':
        return <UserManagement />;
      case 'roles':
        return <RoleManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header title={getViewTitle(activeView)} />

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto p-4">
          {renderView()}
        </main>

        {/* Sticky footer */}
        <Footer />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
