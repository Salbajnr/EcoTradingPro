
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from '../../utils/axios'

function SocialTrading() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('discover')
  const [traders, setTraders] = useState([])
  const [following, setFollowing] = useState([])
  const [mySignals, setMySignals] = useState([])
  const [copySettings, setCopySettings] = useState({})
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [selectedTrader, setSelectedTrader] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchTraders()
    fetchFollowing()
    fetchMySignals()
  }, [])

  const fetchTraders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/social/traders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTraders(response.data)
    } catch (error) {
      // Mock data for demo
      setTraders([
        {
          id: '1',
          name: 'CryptoMaster',
          avatar: 'https://ui-avatars.com/api/?name=CryptoMaster&background=0284c7&color=fff',
          followers: 2847,
          winRate: 78.5,
          monthlyReturn: 24.8,
          totalReturn: 145.2,
          riskScore: 6.2,
          copiers: 156,
          activeSignals: 12,
          verified: true,
          bio: 'Professional trader with 5+ years experience in crypto markets',
          tags: ['Swing Trading', 'Technical Analysis', 'Risk Management']
        },
        {
          id: '2',
          name: 'AITrader_Pro',
          avatar: 'https://ui-avatars.com/api/?name=AITrader&background=059669&color=fff',
          followers: 1923,
          winRate: 82.1,
          monthlyReturn: 18.3,
          totalReturn: 98.7,
          riskScore: 4.8,
          copiers: 89,
          activeSignals: 8,
          verified: true,
          bio: 'Algorithm-based trading strategies with consistent returns',
          tags: ['Algorithmic', 'Low Risk', 'DCA']
        }
      ])
    }
  }

  const fetchFollowing = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/social/following', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFollowing(response.data)
    } catch (error) {
      // Mock data for demo
      setFollowing([
        {
          id: '1',
          name: 'CryptoMaster',
          copyAmount: 500,
          copyPercentage: 10,
          profit: 89.45,
          activeTrades: 3,
          status: 'active'
        }
      ])
    }
  }

  const fetchMySignals = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/social/signals', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMySignals(response.data)
    } catch (error) {
      // Mock data for demo
      setMySignals([
        {
          id: '1',
          asset: 'BTC',
          type: 'buy',
          entry: 68500,
          stopLoss: 65000,
          takeProfit: 75000,
          status: 'active',
          timestamp: new Date(),
          followers: 12,
          profit: 245.67
        }
      ])
    }
  }

  const followTrader = async (traderId) => {
    setSelectedTrader(traders.find(t => t.id === traderId))
    setShowCopyModal(true)
  }

  const startCopying = async () => {
    if (!copySettings.amount || copySettings.amount < 100) {
      setMessage('Minimum copy amount is $100')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/users/social/copy', {
        traderId: selectedTrader.id,
        amount: copySettings.amount,
        percentage: copySettings.percentage || 10,
        stopLoss: copySettings.stopLoss,
        riskLevel: copySettings.riskLevel || 'medium'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setMessage('Successfully started copying trader!')
      setShowCopyModal(false)
      fetchFollowing()
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to start copying')
    } finally {
      setLoading(false)
    }
  }

  const stopCopying = async (traderId) => {
    if (!confirm('Are you sure you want to stop copying this trader?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/users/social/copy/${traderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('Stopped copying trader')
      fetchFollowing()
    } catch (error) {
      setMessage('Failed to stop copying')
    }
  }

  const publishSignal = async (signal) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/users/social/signals', signal, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('Signal published successfully!')
      fetchMySignals()
    } catch (error) {
      setMessage('Failed to publish signal')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Social Trading</h2>
            <p className="text-gray-600 dark:text-gray-300">Follow and copy successful traders</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass rounded-2xl p-4">
        <div className="flex gap-4">
          {[
            { id: 'discover', name: 'Discover Traders' },
            { id: 'following', name: 'Following' },
            { id: 'signals', name: 'My Signals' },
            { id: 'leaderboard', name: 'Leaderboard' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('success') || message.includes('Successfully')
            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      {/* Discover Traders Tab */}
      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {traders.map((trader) => (
            <div key={trader.id} className="glass rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={trader.avatar}
                  alt={trader.name}
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{trader.name}</h3>
                    {trader.verified && (
                      <span className="text-brand-500">✓</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{trader.bio}</p>
                  <div className="flex flex-wrap gap-1">
                    {trader.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{trader.winRate}%</p>
                  <p className="text-sm text-gray-500">Win Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-500">+{trader.monthlyReturn}%</p>
                  <p className="text-sm text-gray-500">Monthly Return</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{trader.followers}</p>
                  <p className="text-sm text-gray-500">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{trader.copiers}</p>
                  <p className="text-sm text-gray-500">Copiers</p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-sm text-gray-500">Risk Score: </span>
                  <span className={`font-semibold ${
                    trader.riskScore <= 3 ? 'text-green-500' :
                    trader.riskScore <= 6 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {trader.riskScore}/10
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Total Return: </span>
                  <span className="font-semibold text-emerald-500">+{trader.totalReturn}%</span>
                </div>
              </div>

              <button
                onClick={() => followTrader(trader.id)}
                className="w-full py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition font-semibold"
              >
                Copy Trader
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Following Tab */}
      {activeTab === 'following' && (
        <div className="space-y-4">
          {following.length === 0 ? (
            <div className="text-center glass rounded-2xl p-12">
              <p className="text-gray-500">You're not following any traders yet</p>
              <button
                onClick={() => setActiveTab('discover')}
                className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
              >
                Discover Traders
              </button>
            </div>
          ) : (
            following.map((trader) => (
              <div key={trader.id} className="glass rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{trader.name}</h3>
                    <p className="text-sm text-gray-500">Copy Amount: ${trader.copyAmount}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    trader.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400'
                  }`}>
                    {trader.status}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className={`text-lg font-bold ${trader.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trader.profit >= 0 ? '+' : ''}${trader.profit.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Profit/Loss</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{trader.activeTrades}</p>
                    <p className="text-sm text-gray-500">Active Trades</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{trader.copyPercentage}%</p>
                    <p className="text-sm text-gray-500">Copy Percentage</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    Edit Settings
                  </button>
                  <button
                    onClick={() => stopCopying(trader.id)}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Stop Copying
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Copy Modal */}
      {showCopyModal && selectedTrader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Copy {selectedTrader.name}</h3>
              <button
                onClick={() => setShowCopyModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Copy Amount ($)</label>
                <input
                  type="number"
                  value={copySettings.amount || ''}
                  onChange={(e) => setCopySettings({...copySettings, amount: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="500"
                  min="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Copy Percentage (%)</label>
                <select
                  value={copySettings.percentage || 10}
                  onChange={(e) => setCopySettings({...copySettings, percentage: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value={5}>5% - Conservative</option>
                  <option value={10}>10% - Moderate</option>
                  <option value={20}>20% - Aggressive</option>
                  <option value={50}>50% - Very Aggressive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Stop Loss (%)</label>
                <input
                  type="number"
                  value={copySettings.stopLoss || ''}
                  onChange={(e) => setCopySettings({...copySettings, stopLoss: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="10"
                  min="1"
                  max="50"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowCopyModal(false)}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={startCopying}
                  disabled={loading}
                  className="flex-1 py-3 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition disabled:opacity-50"
                >
                  {loading ? 'Starting...' : 'Start Copying'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SocialTrading
