import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CustomersPage } from '../pages/CustomersPage';
import { CustomerDetailPage } from '../pages/CustomerDetailPage';
import { ProductsPage } from '../pages/ProductsPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ChallansPage } from '../pages/ChallansPage';
import { CreateChallanPage } from '../pages/CreateChallanPage';
import { ChallanDetailPage } from '../pages/ChallanDetailPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/challans" element={<ChallansPage />} />
        <Route
          path="/challans/create"
          element={
            <ProtectedRoute roles={['ADMIN', 'SALES']}>
              <CreateChallanPage />
            </ProtectedRoute>
          }
        />
        <Route path="/challans/:id" element={<ChallanDetailPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
