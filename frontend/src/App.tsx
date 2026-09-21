import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { TasksPage } from './pages/TasksPage';
import { ActivityFeedPage } from './pages/ActivityFeedPage';
import { ClientsPage } from './pages/ClientsPage';
import { Role } from './types';
import { Layers } from 'lucide-react';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: Role[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center animate-pulse">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <span className="text-xs font-mono">Initializing Velozity Session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProjectsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProjectDetailPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TasksPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/activity"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ActivityFeedPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/clients"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
                  <AppLayout>
                    <ClientsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
