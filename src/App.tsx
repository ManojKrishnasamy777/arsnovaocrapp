import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import LoginForm from './components/Auth/LoginForm';
import Registration from './components/Views/Registration';
import Activation from './components/Views/Activation';

import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Dashboard from './components/Views/Dashboard';
import FileUpload from './components/Views/FileUpload';
import FileList from './components/Views/FileList';
import UserManagement from './components/Views/UserManagement';
import RoleManagement from './components/Views/RoleManagement';


// ✅ Protected layout (only for logged-in users)
const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLicensed, isRegistered, data_id, loading } = useAuth();
  const [activeView, setActiveView] = React.useState('upload');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!isRegistered) return <Navigate to="/registration" replace />;
  if (!isLicensed) return <Navigate to="/activation" replace state={{ id: data_id }} />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;


  const getViewTitle = (view: string) => {
    ;
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
    ;

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

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getViewTitle(activeView)} />
        <main className="flex-1 overflow-y-auto p-4">{renderView()}</main>
        <Footer />
      </div>
    </div>
  );
};

// ✅ Route-based App
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/registration" element={<Registration />} />
          <Route
            path="/activation"
            element={<Activation id="1" />}
          />
          {/* Protected routes */}
          <Route path="/*" element={<ProtectedLayout />} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
