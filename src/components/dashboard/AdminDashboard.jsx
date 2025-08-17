
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import axios from 'axios'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [newBalance, setNewBalance] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users')
      setUsers(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  const updateUserBalance = async (userId, balance) => {
    try {
      const response = await axios.put(`/api/admin/users/${userId}/balance`, { balance: parseFloat(balance) })
      setUsers(users.map(user => user._id === userId ? response.data : user))
      setSelectedUser(null)
      setNewBalance('')
    } catch (error) {
      console.error('Error updating balance:', error)
      alert('Error updating balance')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0F1A]">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" fill="#10B981" opacity=".14"/>
                <path d="M16 34c8-6 14-14 16-24 2 10 8 18 16 24-8 6-14 14-16 24-2-10-8-18-16-24z" fill="#0A84FF"/>
              </svg>
              <span className="text-xl font-extrabold">
                <span className="text-emerald-500">ADMIN</span> <span className="text-brand-500">PANEL</span>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Admin: {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">User Management</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Manage user accounts and balances
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ${user.balance?.toLocaleString() || '0'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
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
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Platform Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Users</h3>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{users.length}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-700 dark:text-green-400">Active Users</h3>
                <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-700 dark:text-purple-400">Total Balance</h3>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                  ${users.reduce((sum, user) => sum + (user.balance || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Balance Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Edit Balance for {selectedUser.name}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">New Balance</label>
              <input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder={selectedUser.balance?.toString() || '0'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => updateUserBalance(selectedUser._id, newBalance)}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setNewBalance('')
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
