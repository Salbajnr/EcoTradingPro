
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function UserLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData, 'user')
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient px-4">
      <div className="max-w-md w-full">
        <div className="glass rounded-2xl p-8 shadow-glow">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" fill="#0A84FF" opacity=".14"/>
                <path d="M16 34c8-6 14-14 16-24 2 10 8 18 16 24-8 6-14 14-16 24-2-10-8-18-16-24z" fill="#10B981"/>
              </svg>
              <span className="text-xl font-extrabold">
                <span className="text-brand-500">CRYPTO</span> TRADE <span className="text-emerald-500">PRO</span>
              </span>
            </Link>
            <h1 className="mt-4 text-2xl font-extrabold">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-300">Sign in to your trading account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-brand-500 hover:text-brand-600 font-semibold">
                Create Account
              </Link>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Admin? <Link to="/admin/login" className="text-emerald-500 hover:text-emerald-600">Access Admin Panel</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserLogin
