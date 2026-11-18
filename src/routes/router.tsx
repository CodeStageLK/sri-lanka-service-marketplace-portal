import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/auth-layout';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { DashboardPage } from '@/pages/dashboard-page';
import { LoginPage } from '@/pages/login-page';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { element: <AuthLayout />, children: [{ path: '/login', element: <LoginPage /> }] },
  { element: <DashboardLayout />, children: [{ path: '/dashboard', element: <DashboardPage /> }] },
]);
