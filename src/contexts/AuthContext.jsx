
import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userType = localStorage.getItem('userType')
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser({ token, userType })
    }
    setLoading(false)
  }, [])

  const login = async (credentials, type = 'user') => {
    try {
      const endpoint = type === 'admin' ? '/api/admin/login' : '/api/auth/login'
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const response = await axios.post(`${baseURL}${endpoint}`, credentials)
      
      const { token, user: userData } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('userType', type)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser({ token, userType: type, ...userData })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const response = await axios.post(`${baseURL}/api/auth/register`, userData)
      return { success: true, message: response.data.message }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userType')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
