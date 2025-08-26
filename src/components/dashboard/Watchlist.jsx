
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useWebSocket } from '../../contexts/WebSocketContext'
import axios from '../../utils/axios'

function Watchlist() {
  const { user } = useAuth()
  const { socket } = useWebSocket()
  const [watchlist, setWatchlist] = useState([])
  const [priceAlerts, setPriceAlerts] = useState([])
  const [marketPrices, setMarketPrices] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [showAlertForm, setShowAlertForm] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState('BTC')
  const [alertPrice, setAlertPrice] = useState('')
  const [alertType, setAlertType] = useState('above')
  const [sortBy, setSortBy] = useState('symbol')
  const [sortOrder, setSortOrder] = useState('asc')

  const availableAssets = ['BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'BNB', 'MATIC', 'DOT', 'LINK', 'UNI']

  useEffect(() => {
    fetchWatchlist()
    fetchPriceAlerts()
    fetchMarketPrices()
    
    const interval = setInterval(fetchMarketPrices, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('priceUpdate', handlePriceUpdate)
      socket.on('alertTriggered', handleAlertTriggered)
      
      return () => {
        socket.off('priceUpdate', handlePriceUpdate)
        socket.off('alertTriggered', handleAlertTriggered)
      }
    }
  }, [socket])

  const fetchWatchlist = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/watchlist', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setWatchlist(response.data || [])
    } catch (error) {
      console.error('Error fetching watchlist:', error)
    }
  }

  const fetchPriceAlerts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPriceAlerts(response.data || [])
    } catch (error) {
      console.error('Error fetching price alerts:', error)
    }
  }

  const fetchMarketPrices = async () => {
    try {
      const response = await axios.get('/api/market/prices')
      setMarketPrices(response.data)
    } catch (error) {
      console.error('Error fetching market prices:', error)
    }
  }

  const handlePriceUpdate = (data) => {
    setMarketPrices(prev => ({ ...prev, ...data }))
  }

  const handleAlertTriggered = (alert) => {
    // Handle triggered alert notification
    console.log('Alert triggered:', alert)
  }

  const addToWatchlist = async (asset) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/users/watchlist', { asset }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchWatchlist()
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding to watchlist:', error)
    }
  }

  const removeFromWatchlist = async (asset) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/users/watchlist/${asset}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchWatchlist()
    } catch (error) {
      console.error('Error removing from watchlist:', error)
    }
  }

  const createPriceAlert = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/users/alerts', {
        asset: selectedAsset,
        price: parseFloat(alertPrice),
        type: alertType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchPriceAlerts()
      setShowAlertForm(false)
      setAlertPrice('')
    } catch (error) {
      console.error('Error creating price alert:', error)
    }
  }

  const deleteAlert = async (alertId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/users/alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchPriceAlerts()
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  const sortedWatchlist = [...watchlist].sort((a, b) => {
    let aVal, bVal
    
    switch (sortBy) {
      case 'symbol':
        aVal = a.asset
        bVal = b.asset
        break
      case 'price':
        aVal = marketPrices[`${a.asset}/USDT`]?.price || 0
        bVal = marketPrices[`${b.asset}/USDT`]?.price || 0
        break
      case 'change':
        aVal = marketPrices[`${a.asset}/USDT`]?.change || 0
        bVal = marketPrices[`${b.asset}/USDT`]?.change || 0
        break
      default:
        aVal = a.asset
        bVal = b.asset
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  const availableToAdd = availableAssets.filter(asset => 
    !watchlist.find(w => w.asset === asset)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Watchlist & Alerts</h2>
            <p className="text-gray-600 dark:text-gray-300">Track your favorite assets and set price alerts</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
            >
              Add Asset
            </button>
            <button
              onClick={() => setShowAlertForm(true)}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
            >
              Set Alert
            </button>
          </div>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Asset to Watchlist</h3>
            <div className="space-y-4">
              {availableToAdd.length === 0 ? (
                <p className="text-gray-500">All available assets are already in your watchlist</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableToAdd.map(asset => (
                    <button
                      key={asset}
                      onClick={() => addToWatchlist(asset)}
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      {asset}/USDT
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Alert Modal */}
      {showAlertForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Set Price Alert</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Asset</label>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  {availableAssets.map(asset => (
                    <option key={asset} value={asset}>{asset}/USDT</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Alert Type</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="above">Price Above</option>
                  <option value="below">Price Below</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Target Price (USD)</label>
                <input
                  type="number"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current: ${marketPrices[`${selectedAsset}/USDT`]?.price?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAlertForm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={createPriceAlert}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
              >
                Create Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Watchlist */}
      <div className="glass rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">My Watchlist</h3>
          <div className="flex gap-2 text-sm">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            >
              <option value="symbol">Symbol</option>
              <option value="price">Price</option>
              <option value="change">Change</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Your watchlist is empty. Add some assets to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2">Asset</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">24h Change</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedWatchlist.map(item => {
                  const priceData = marketPrices[`${item.asset}/USDT`]
                  return (
                    <tr key={item.asset} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3">
                        <div className="font-semibold">{item.asset}/USDT</div>
                      </td>
                      <td className="text-right py-3">
                        <div className="font-semibold">
                          ${priceData?.price?.toLocaleString() || '0'}
                        </div>
                      </td>
                      <td className="text-right py-3">
                        <div className={`font-semibold ${
                          (priceData?.change || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          {(priceData?.change || 0) >= 0 ? '+' : ''}
                          {priceData?.change?.toFixed(2) || '0'}%
                        </div>
                      </td>
                      <td className="text-right py-3">
                        <button
                          onClick={() => removeFromWatchlist(item.asset)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Price Alerts */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-4">Price Alerts</h3>
        
        {priceAlerts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No price alerts set. Create one to get notified when prices hit your targets!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {priceAlerts.map(alert => (
              <div key={alert.id} className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <div className="font-semibold">{alert.asset}/USDT</div>
                  <div className="text-sm text-gray-500">
                    Alert when price goes {alert.type} ${alert.price?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    Current: ${marketPrices[`${alert.asset}/USDT`]?.price?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    alert.status === 'active' 
                      ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {alert.status}
                  </span>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Watchlist
