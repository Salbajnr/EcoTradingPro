
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTheme } from './contexts/ThemeContext'
import LandingPage from './components/LandingPage'
import UserLogin from './components/auth/UserLogin'
import UserRegister from './components/auth/UserRegister'
import AdminLogin from './components/auth/AdminLogin'
import UserDashboard from './components/dashboard/UserDashboard'
import AdminDashboard from './components/dashboard/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { theme } = useTheme()

  return (
    <div className={theme}>
      <div className="min-h-screen bg-white text-gray-900 dark:bg-[#0A0F1A] dark:text-gray-100">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<UserLogin />} />
          <Route path="/auth/register" element={<UserRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute userType="user">
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute userType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </div>
  )
}

export default App
