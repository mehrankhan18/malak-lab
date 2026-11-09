import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Shared Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// 18 Public Pages
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import OurLaboratories from './pages/OurLaboratories';
import LaboratoryServices from './pages/LaboratoryServices';
import AllMedicalTests from './pages/AllMedicalTests';
import TestDetails from './pages/TestDetails';
import HealthPackages from './pages/HealthPackages';
import PackageDetails from './pages/PackageDetails';
import BookTest from './pages/PriceRequest';
import HomeCollection from './pages/HomeCollection';
import FindBranch from './pages/FindBranch';
import DoctorsSpecialists from './pages/DoctorsSpecialists';
import TestPreparation from './pages/TestPreparation';
import FAQ from './pages/FAQ';
import ContactUs from './pages/ContactUs';
import Blog from './pages/Blog';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import LiveTrackingPage from './pages/LiveTrackingPage';
import RequestTracking from './pages/RequestTracking';

// Customer Portal Pages
import Login from './pages/customer/Login';
import Register from './pages/customer/Register';
import ForgotPassword from './pages/customer/ForgotPassword';
import ResetPassword from './pages/customer/ResetPassword';
import CustomerLayout from './pages/customer/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerRequests from './pages/customer/CustomerRequests';
import CustomerTracking from './pages/customer/CustomerTracking';
import CustomerReports from './pages/customer/CustomerReports';
import CustomerInvoices from './pages/customer/CustomerInvoices';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerSupport from './pages/customer/CustomerSupport';

// Protected Route Guard for Customer Portal
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function MainApp() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col theme-bg-${theme} text-theme-text-${theme}`}>
      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      
      <main className="flex-1">
        <Routes>
          {/* Public Website (18 Pages) */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/laboratories" element={<OurLaboratories />} />
          <Route path="/services" element={<LaboratoryServices />} />
          <Route path="/tests" element={<AllMedicalTests />} />
          <Route path="/tests/:slug" element={<TestDetails />} />
          <Route path="/packages" element={<HealthPackages />} />
          <Route path="/packages/:slug" element={<PackageDetails />} />
          <Route path="/book-test" element={<BookTest />} />
          <Route path="/home-collection" element={<HomeCollection />} />
          <Route path="/branches" element={<FindBranch />} />
          <Route path="/doctors" element={<DoctorsSpecialists />} />
          <Route path="/test-preparation" element={<TestPreparation />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          
          {/* Public Tracking */}
          <Route path="/track" element={<LiveTrackingPage />} />
          <Route path="/track/:id" element={<LiveTrackingPage />} />
          <Route path="/request-tracking" element={<RequestTracking />} />

          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Customer Portal */}
          <Route 
            path="/customer" 
            element={
              <ProtectedRoute>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerDashboard />} />
            <Route path="bookings" element={<CustomerBookings />} />
            <Route path="requests" element={<CustomerRequests />} />
            <Route path="tracking" element={<CustomerTracking />} />
            <Route path="track/:bookingId" element={<CustomerTracking />} />
            <Route path="reports" element={<CustomerReports />} />
            <Route path="invoices" element={<CustomerInvoices />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="support" element={<CustomerSupport />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
