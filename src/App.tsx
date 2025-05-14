
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/UserManagement";
import Dashboard from "./pages/Dashboard";
import DataImport from "./pages/DataImport";
import DatabaseMigration from "./pages/DatabaseMigration";

// Create a client
const queryClient = new QueryClient();

// Componente que verifica autenticação para rotas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Componente que verifica se o usuário é administrador
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// AppRoutes requires AuthProvider to be available
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      <Route path="/usuarios" element={
        <AdminRoute>
          <UserManagement />
        </AdminRoute>
      } />
      <Route path="/dashboard" element={
        <AdminRoute>
          <Dashboard />
        </AdminRoute>
      } />
      <Route path="/importacao" element={
        <AdminRoute>
          <DataImport />
        </AdminRoute>
      } />
      <Route path="/migracao" element={
        <AdminRoute>
          <DatabaseMigration />
        </AdminRoute>
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component with proper provider nesting
const App = () => {
  return (
    <React.StrictMode>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </React.StrictMode>
  );
};

export default App;
