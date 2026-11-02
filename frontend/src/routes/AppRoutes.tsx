import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ContigoLandingPage } from '../features/landing/ContigoLandingPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { MainLayout } from '../components/layout/MainLayout';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { AppointmentsPage } from '../features/appointments/AppointmentsPage';
import { MedicationsPage } from '../features/medications/MedicationsPage';
import { VitalsPage } from '../features/vitals/VitalsPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { PatientSimulatorPage } from '../features/simulator/PatientSimulatorPage';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const RootRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 00. Ruta Raíz Dinámica */}
      <Route path="/" element={<RootRoute />} />

      {/* 01. Landing Informativa del Producto EsSalud Contigo */}
      <Route path="/landing" element={<ContigoLandingPage />} />

      {/* 02. Acceso Directo Modo Asistivo Adulto Mayor (Zero-Login / Código Familiar) */}
      <Route path="/modo-senior" element={<PatientSimulatorPage />} />

      {/* 03. Autenticación Cuidador */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 04. Portal Web del Cuidador EsSalud Contigo (Rutas Protegidas con MainLayout) */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/medications" element={<MedicationsPage />} />
        <Route path="/vitals" element={<VitalsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/patient-simulator" element={<PatientSimulatorPage />} />
      </Route>

      {/* Fallback general */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
