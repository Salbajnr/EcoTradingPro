
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children, userType }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  if (!user || user.userType !== userType) {
    const redirectPath = userType === 'admin' ? '/admin/login' : '/auth/login'
    return <Navigate to={redirectPath} replace />
  }

  return children
}

export default ProtectedRoute
