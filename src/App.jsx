import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './components/LandingPage'
import UserLogin from './components/auth/UserLogin'
import UserRegister from './components/auth/UserRegister'
import AdminLogin from './components/auth/AdminLogin'
import UserDashboard from './components/dashboard/UserDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/login" element={<UserLogin />} />
            <Route path="/auth/register" element={<UserRegister />} />
            <Route path="/auth/admin" element={<AdminLogin />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <div className="min-h-screen bg-white dark:bg-[#0A0F1A] text-gray-900 dark:text-gray-100 p-8">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p>Welcome to the admin panel!</p>
                  </div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App