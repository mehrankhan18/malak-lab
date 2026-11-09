import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

// Layout
import AdminLayout from './layouts/AdminLayout';

// Pages
import AdminLogin from './pages/AdminLogin';
import DashboardOverview from './pages/DashboardOverview';
import TestManagement from './pages/TestManagement';
import SampleOperations from './pages/SampleOperations';
import ReportManagement from './pages/ReportManagement';
import BookingManagement from './pages/BookingManagement';
import PatientManagement from './pages/PatientManagement';
import StaffManagement from './pages/StaffManagement';
import BranchManagement from './pages/BranchManagement';
import FinancialManagement from './pages/FinancialManagement';
import ContentManagement from './pages/ContentManagement';
import SystemSettings from './pages/SystemSettings';
import TestInquiryManagement from './pages/TestInquiryManagement';

function AdminProtectedGuard({ children }) {
  const { adminUser, loading } = useAdminAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono text-xs">
        Initializing LIS Workspace...
      </div>
    );
  }
  if (!adminUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <Routes>
          {/* Public Sign In */}
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected Workspace Layout */}
          <Route
            path="/"
            element={
              <AdminProtectedGuard>
                <AdminLayout />
              </AdminProtectedGuard>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="tests" element={<TestManagement />} />
            <Route path="inquiries" element={<TestInquiryManagement />} />
            <Route path="samples" element={<SampleOperations />} />
            <Route path="reports" element={<ReportManagement />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="patients" element={<PatientManagement />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="branches" element={<BranchManagement />} />
            <Route path="financials" element={<FinancialManagement />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
    </Router>
  );
}
