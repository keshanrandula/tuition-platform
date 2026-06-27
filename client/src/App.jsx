import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PaymentProvider } from './context/PaymentContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Shared Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import AiAssistant from './components/common/AiAssistant';

// Pages & Auth Views
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Dashboard views
import StudentDashboard from './components/dashboard/StudentDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';

// Classroom and Learning Views
import LiveClass from './pages/LiveClass';
import LiveClassRoom from './components/classes/LiveClassRoom';
import VideoLibrary from './pages/VideoLibrary';
import VideoPlayer from './components/videos/VideoPlayer';

// Billing Views
import PaymentPage from './components/payment/PaymentPage';
import PaymentSuccess from './components/payment/PaymentSuccess';

// ==========================================
// ROUTE PROTECTORS
// ==========================================

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  
  if (!token) return <Navigate to="/login" replace />;
  if (user && user.role !== 'admin') return <Navigate to="/" replace />;
  
  return children;
};

// ==========================================
// CORE APP ROUTER
// ==========================================

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PaymentProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            {/* Header Navbar */}
            <Navbar />
            
            {/* Page content frame */}
            <main className="flex-grow">
              <Routes>
                {/* Public Pathways */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Student Pathways */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/live-classes" element={
                  <ProtectedRoute>
                    <LiveClass />
                  </ProtectedRoute>
                } />
                <Route path="/live-classroom/:id" element={
                  <ProtectedRoute>
                    <LiveClassRoom />
                  </ProtectedRoute>
                } />
                <Route path="/video-library" element={
                  <ProtectedRoute>
                    <VideoLibrary />
                  </ProtectedRoute>
                } />
                <Route path="/video-player/:id" element={
                  <ProtectedRoute>
                    <VideoPlayer />
                  </ProtectedRoute>
                } />
                
                {/* Billing Pathways */}
                <Route path="/checkout/:itemType/:itemId" element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                } />
                <Route path="/payment-success" element={
                  <ProtectedRoute>
                    <PaymentSuccess />
                  </ProtectedRoute>
                } />

                {/* Admin Management Pathway */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />

                {/* Wildcard Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Platform Footer */}
            <Footer />

            {/* Floating AI Assistant for Students */}
            <AiAssistant />
          </div>
        </Router>
        </PaymentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
