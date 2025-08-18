
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import axios from '../utils/axios'

const ProfileContext = createContext()

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

export const ProfileProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch user profile data
  const fetchProfile = async () => {
    if (!isAuthenticated || !user) {
      setProfile(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const endpoint = user.role === 'admin' ? '/api/admin/profile' : '/api/user/profile'
      const response = await axios.get(endpoint)
      
      if (response.data) {
        setProfile(response.data)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err.response?.data?.error || 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  // Update profile data
  const updateProfile = async (updates) => {
    if (!isAuthenticated || !user) return { success: false, error: 'Not authenticated' }

    try {
      setLoading(true)
      setError(null)
      
      const endpoint = user.role === 'admin' ? '/api/admin/profile' : '/api/user/profile'
      const response = await axios.put(endpoint, updates)
      
      if (response.data) {
        setProfile(response.data)
        return { success: true }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update profile'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Update balance (admin only)
  const updateUserBalance = async (userId, newBalance) => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return { success: false, error: 'Admin access required' }
    }

    try {
      setLoading(true)
      const response = await axios.put(`/api/admin/users/${userId}/balance`, {
        balance: newBalance
      })
      
      return { success: true, user: response.data }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update balance'
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Update user status (admin only)
  const updateUserStatus = async (userId, isActive) => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return { success: false, error: 'Admin access required' }
    }

    try {
      setLoading(true)
      const response = await axios.put(`/api/admin/users/${userId}/status`, {
        isActive
      })
      
      return { success: true, user: response.data }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update user status'
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch profile when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile()
    } else {
      setProfile(null)
    }
  }, [isAuthenticated, user])

  const value = {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateUserBalance,
    updateUserStatus,
    isAdmin: user?.role === 'admin'
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}
