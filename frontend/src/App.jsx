import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Callback from './pages/Callback';
import EmployerDashboard from './pages/EmployerDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import PostJob from './pages/PostJob';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';

// Route guard: requires authentication with a specific role
function RoleRoute({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function MainApp() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-dark-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-dark-700 border-t-primary-500" />
        <p className="text-sm text-dark-400 font-sans">Loading SkillHub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 font-sans text-dark-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* OIDC callback — completes the code exchange */}
          <Route path="/callback" element={<Callback />} />

          {/* Pre-OIDC registration — saves user to DB before first login */}
          <Route path="/register" element={<Register />} />

          <Route path="/candidate" element={
            <RoleRoute role="CANDIDATE"><CandidateDashboard /></RoleRoute>
          } />

          <Route path="/employer" element={
            <RoleRoute role="EMPLOYER"><EmployerDashboard /></RoleRoute>
          } />

          <Route path="/employer/post" element={
            <RoleRoute role="EMPLOYER"><PostJob /></RoleRoute>
          } />

          <Route path="/admin" element={
            <RoleRoute role="ADMIN"><AdminDashboard /></RoleRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </Router>
  );
}
