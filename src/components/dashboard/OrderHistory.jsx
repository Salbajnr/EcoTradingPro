
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from '../../utils/axios'

function OrderHistory() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [trades, setTrades] = useState([])
  const [activeTab, setActiveTab] = useState('orders')
  const [filter, setFilter] = useState('all')
  const [dateRange, setDateRange] = useState('7days')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrderHistory()
    fetchTradeHistory()
  }, [dateRange, filter])

  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/orders/history', {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          status: filter !== 'all' ? filter : undefined,
          days: dateRange.replace('days', '')
        }
      })
      setOrders(response.data || [])
    } catch (error) {
      console.error('Error fetching order history:', error)
    }
  }

  const fetchTradeHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/trades/history', {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          type: filter !== 'all' ? filter : undefined,
          days: dateRange.replace('days', '')
        }
      })
      setTrades(response.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching trade history:', error)
      setLoading(false)
    }
  }

  const filteredData = () => {
    const data = activeTab === 'orders' ? orders : trades
    if (!searchTerm) return data
    
    return data.filter(item => 
      item.asset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/20'
      case 'pending': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20'
      case 'cancelled': return 'text-red-500 bg-red-100 dark:bg-red-900/20'
      case 'partial': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20'
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const exportToCSV = () => {
    const data = filteredData()
    const headers = activeTab === 'orders' 
      ? ['Date', 'Asset', 'Type', 'Order Type', 'Amount', 'Price', 'Status']
      : ['Date', 'Asset', 'Type', 'Quantity', 'Price', 'Total', 'Status']
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => {
        if (activeTab === 'orders') {
          return [
            new Date(item.timestamp).toLocaleDateString(),
            item.asset,
            item.type,
            item.orderType,
            item.amount,
            item.price,
            item.status
          ].join(',')
        } else {
          return [
            new Date(item.timestamp).toLocaleDateString(),
            item.asset,
            item.type,
            item.quantity,
            item.price,
            (item.quantity * item.price).toFixed(2),
            item.status
          ].join(',')
        }
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab}_history_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Trading History</h2>
            <p className="text-gray-600 dark:text-gray-300">View your complete trading activity</p>
          </div>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="glass rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tab Selection */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                activeTab === 'orders'
                  ? 'bg-white dark:bg-gray-700 text-brand-500 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                activeTab === 'trades'
                  ? 'bg-white dark:bg-gray-700 text-brand-500 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Trades
            </button>
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            {activeTab === 'orders' && <option value="partial">Partial</option>}
            {activeTab === 'trades' && (
              <>
                <option value="buy">Buy Only</option>
                <option value="sell">Sell Only</option>
              </>
            )}
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="1days">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 3 Months</option>
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Search asset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                {activeTab === 'orders' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Type</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'orders' ? 'Amount' : 'Quantity'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData().map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium">{item.asset}</span>
                      <span className="text-gray-500 ml-1">/USDT</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.type === 'buy'
                        ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {item.type?.toUpperCase()}
                    </span>
                  </td>
                  {activeTab === 'orders' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {item.orderType}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {activeTab === 'orders' 
                      ? `$${item.amount?.toLocaleString()}` 
                      : `${item.quantity?.toFixed(6)} ${item.asset}`
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    ${item.price?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${((item.quantity || item.amount) * item.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(item.status)}`}>
                      {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData().length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No {activeTab} found for the selected criteria</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total {activeTab}</h3>
          <p className="text-2xl font-bold">{filteredData().length}</p>
        </div>
        
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Volume</h3>
          <p className="text-2xl font-bold">
            ${filteredData().reduce((sum, item) => sum + ((item.quantity || item.amount) * item.price), 0).toLocaleString()}
          </p>
        </div>
        
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Success Rate</h3>
          <p className="text-2xl font-bold text-emerald-500">
            {filteredData().length > 0 
              ? ((filteredData().filter(item => item.status === 'completed').length / filteredData().length) * 100).toFixed(1)
              : '0'
            }%
          </p>
        </div>
      </div>
    </div>
  )
}

export default OrderHistory
