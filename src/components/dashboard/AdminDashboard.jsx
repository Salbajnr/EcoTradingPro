import React, { useState, useEffect } from 'react'
import { Link, useNavigate, Routes, Route } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import axios from '../../utils/axios'
import NewsManagement from './NewsManagement'

// Placeholder for AdminDashboardHome and UserManagement components if they were defined elsewhere
const AdminDashboardHome = () => <div>Dashboard Content</div>;
const UserManagement = () => <div>User Management Content</div>;


function AdminDashboard() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [newBalance, setNewBalance] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    fetchUsers()
    // Update stats periodically
    const interval = setInterval(() => {
      updateStats()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  const updateUserBalance = async (userId, balance) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`/api/admin/users/${userId}/balance`,
        { balance: parseFloat(balance) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUsers(users.map(user => user._id === userId ? response.data : user))
      setSelectedUser(null)
      setNewBalance('')
    } catch (error) {
      console.error('Error updating balance:', error)
      alert('Error updating balance')
    }
  }

  const updateStats = () => {
    // Simulate real-time updates for demo purposes
    // In production, this would fetch real data
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out of your admin session?')) {
      logout()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 text-white overflow-x-hidden min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(93, 92, 222, 0.1) 1px, transparent 0)',
        backgroundSize: '20px 20px'
      }}></div>
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-600/5 pointer-events-none"></div>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen ${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700/50 transform transition-all duration-300 z-40`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
              <span className="text-white font-bold text-lg">₿</span>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Eco Trading Pro</h2>
                <p className="text-xs text-gray-400">Admin Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
              }`}
            >
              <span className="text-xl mr-4">🏠</span>
              {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'users'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
              }`}
            >
              <span className="text-xl mr-4">👥</span>
              {!sidebarCollapsed && <span className="font-medium">User Management</span>}
            </button>
            <button
              onClick={() => setActiveTab('balance')}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'balance'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
              }`}
            >
              <span className="text-xl mr-4">💰</span>
              {!sidebarCollapsed && <span className="font-medium">Balance Control</span>}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'analytics'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
              }`}
            >
              <span className="text-xl mr-4">📊</span>
              {!sidebarCollapsed && <span className="font-medium">Analytics</span>}
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'news'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
              }`}
            >
              <span className="text-xl mr-4">📰</span>
              {!sidebarCollapsed && <span className="font-medium">News Manager</span>}
            </button>
            <button className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-gray-800/50 text-gray-300 hover:text-white transition-all duration-300">
              <span className="text-xl mr-4">🔔</span>
              {!sidebarCollapsed && <span className="font-medium">Notifications</span>}
            </button>
            <button className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-gray-800/50 text-gray-300 hover:text-white transition-all duration-300">
              <span className="text-xl mr-4">⚙️</span>
              {!sidebarCollapsed && <span className="font-medium">Settings</span>}
            </button>
          </div>
        </nav>

        {/* Admin Status */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-6 left-3 right-3">
            <div className="backdrop-filter backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white text-sm">👤</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-green-400 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`${sidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="backdrop-filter backdrop-blur-lg bg-white/5 border-b border-gray-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={toggleSidebar} className="p-2 rounded-xl hover:bg-gray-700/50 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Welcome back, Admin
                </h1>
                <p className="text-gray-400 text-sm">Monitor and manage your crypto simulation platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-gray-700/50 transition-colors"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* Real-time indicator */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Live</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-gray-700/50 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z"></path>
                </svg>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-bounce">3</div>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gradient-to-r from-primary to-purple-600 rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          <Routes>
            <Route path="/" element={<AdminDashboardHome />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/news" element={<NewsManagement />} />
            <Route path="/analytics" element={<div>Analytics coming soon...</div>} />
          </Routes>

          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Users */}
                <div className="backdrop-filter backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 hover:transform hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div className="text-green-400 text-sm font-medium flex items-center">
                      <span className="mr-1">↗</span> +12%
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{users.length}</h3>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-pulse" style={{width: '78%'}}></div>
                  </div>
                </div>

                {/* Active Traders */}
                <div className="backdrop-filter backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 hover:transform hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📈</span>
                    </div>
                    <div className="text-green-400 text-sm font-medium flex items-center">
                      <span className="mr-1">↗</span> +8%
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{users.filter(u => u.isActive).length}</h3>
                  <p className="text-gray-400 text-sm">Active Traders</p>
                  <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full animate-pulse" style={{width: '65%'}}></div>
                  </div>
                </div>

                {/* Total Volume */}
                <div className="backdrop-filter backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 hover:transform hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="text-green-400 text-sm font-medium flex items-center">
                      <span className="mr-1">↗</span> +23%
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">${users.reduce((sum, user) => sum + (user.balance || 0), 0).toLocaleString()}</h3>
                  <p className="text-gray-400 text-sm">Simulated Volume</p>
                  <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full animate-pulse" style={{width: '89%'}}></div>
                  </div>
                </div>

                {/* Platform Health */}
                <div className="backdrop-filter backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 hover:transform hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div className="text-green-400 text-sm font-medium flex items-center">
                      <span className="mr-1">✓</span> Healthy
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">99.9%</h3>
                  <p className="text-gray-400 text-sm">System Uptime</p>
                  <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full animate-pulse" style={{width: '99%'}}></div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <button
                  onClick={() => setActiveTab('balance')}
                  className="w-full p-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center"
                >
                  <span className="text-2xl mr-3">💰</span>
                  <span className="font-medium">Simulate Balance</span>
                </button>
                <button className="w-full p-6 bg-gradient-to-r from-green-600 to-green-500 rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center justify-center">
                  <span className="text-2xl mr-3">📢</span>
                  <span className="font-medium">Send Announcement</span>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className="w-full p-6 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center"
                >
                  <span className="text-2xl mr-3">👥</span>
                  <span className="font-medium">Manage Users</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="w-full p-6 bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 flex items-center justify-center"
                >
                  <span className="text-2xl mr-3">📊</span>
                  <span className="font-medium">View Reports</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="backdrop-filter backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">User Management</h2>
                <p className="text-gray-400">Manage user accounts and balances</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-700/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-100">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-100">${user.balance?.toLocaleString() || '0'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-primary hover:text-purple-400 transition-colors"
                          >
                            Edit Balance
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="backdrop-filter backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-6">Platform Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-400 mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-blue-300">{users.length}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-green-400 mb-2">Active Users</h3>
                  <p className="text-3xl font-bold text-green-300">{users.filter(u => u.isActive).length}</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-400 mb-2">Total Balance</h3>
                  <p className="text-3xl font-bold text-purple-300">${users.reduce((sum, user) => sum + (user.balance || 0), 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Balance Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Edit Balance for {selectedUser.name}</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">New Balance</label>
              <input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder={selectedUser.balance?.toString() || '0'}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-800/50 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => updateUserBalance(selectedUser._id, newBalance)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setNewBalance('')
                }}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .primary { color: #5D5CDE; }
        .bg-primary { background-color: #5D5CDE; }
        .border-primary { border-color: #5D5CDE; }
        .text-primary { color: #5D5CDE; }
        .from-primary { --tw-gradient-from: #5D5CDE; }
        .to-primary { --tw-gradient-to: #5D5CDE; }
      `}</style>
    </div>
  )
}

export default AdminDashboard