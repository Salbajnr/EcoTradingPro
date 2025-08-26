
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from '../../utils/axios'

function TradingBots() {
  const { user } = useAuth()
  const [bots, setBots] = useState([])
  const [showCreateBot, setShowCreateBot] = useState(false)
  const [selectedBot, setSelectedBot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const [botConfig, setBotConfig] = useState({
    name: '',
    strategy: 'grid',
    asset: 'BTC',
    investment: '',
    gridLevels: 10,
    gridRange: 5,
    stopLoss: '',
    takeProfit: '',
    rsiOverbought: 70,
    rsiOversold: 30,
    macdSettings: { fast: 12, slow: 26, signal: 9 },
    isActive: false
  })

  const strategies = [
    { id: 'grid', name: 'Grid Trading', description: 'Places buy and sell orders at regular intervals' },
    { id: 'dca', name: 'Dollar Cost Average', description: 'Invests a fixed amount at regular intervals' },
    { id: 'rsi', name: 'RSI Strategy', description: 'Uses RSI indicator to determine entry/exit points' },
    { id: 'macd', name: 'MACD Strategy', description: 'Uses MACD crossover signals for trading' },
    { id: 'momentum', name: 'Momentum Trading', description: 'Follows price momentum trends' }
  ]

  useEffect(() => {
    fetchBots()
  }, [])

  const fetchBots = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/trading-bots', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBots(response.data)
    } catch (error) {
      console.error('Error fetching trading bots:', error)
      // Mock data for demo
      setBots([
        {
          id: '1',
          name: 'Grid Bot #1',
          strategy: 'grid',
          asset: 'BTC',
          status: 'active',
          profit: 245.67,
          trades: 28,
          createdAt: new Date('2024-01-15'),
          performance: 12.5
        },
        {
          id: '2',
          name: 'DCA ETH Bot',
          strategy: 'dca',
          asset: 'ETH',
          status: 'paused',
          profit: -23.45,
          trades: 15,
          createdAt: new Date('2024-01-20'),
          performance: -2.1
        }
      ])
    }
  }

  const createBot = async () => {
    if (!botConfig.name || !botConfig.investment) {
      setMessage('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/users/trading-bots', botConfig, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        fetchBots()
        setShowCreateBot(false)
        setBotConfig({
          name: '',
          strategy: 'grid',
          asset: 'BTC',
          investment: '',
          gridLevels: 10,
          gridRange: 5,
          stopLoss: '',
          takeProfit: '',
          rsiOverbought: 70,
          rsiOversold: 30,
          macdSettings: { fast: 12, slow: 26, signal: 9 },
          isActive: false
        })
        setMessage('Trading bot created successfully')
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to create trading bot')
    } finally {
      setLoading(false)
    }
  }

  const toggleBot = async (botId, action) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`/api/users/trading-bots/${botId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchBots()
      setMessage(`Bot ${action}d successfully`)
    } catch (error) {
      setMessage(`Failed to ${action} bot`)
    }
  }

  const deleteBot = async (botId) => {
    if (!confirm('Are you sure you want to delete this trading bot?')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/users/trading-bots/${botId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchBots()
      setMessage('Bot deleted successfully')
    } catch (error) {
      setMessage('Failed to delete bot')
    }
  }

  const getStrategyConfig = () => {
    switch (botConfig.strategy) {
      case 'grid':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Grid Levels</label>
              <input
                type="number"
                value={botConfig.gridLevels}
                onChange={(e) => setBotConfig({...botConfig, gridLevels: parseInt(e.target.value)})}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                min="5"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Grid Range (%)</label>
              <input
                type="number"
                value={botConfig.gridRange}
                onChange={(e) => setBotConfig({...botConfig, gridRange: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                min="1"
                max="20"
                step="0.1"
              />
            </div>
          </>
        )
      case 'rsi':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">RSI Overbought Level</label>
              <input
                type="number"
                value={botConfig.rsiOverbought}
                onChange={(e) => setBotConfig({...botConfig, rsiOverbought: parseInt(e.target.value)})}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                min="60"
                max="90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">RSI Oversold Level</label>
              <input
                type="number"
                value={botConfig.rsiOversold}
                onChange={(e) => setBotConfig({...botConfig, rsiOversold: parseInt(e.target.value)})}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                min="10"
                max="40"
              />
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Trading Bots</h2>
            <p className="text-gray-600 dark:text-gray-300">Automate your trading strategies</p>
          </div>
          <button
            onClick={() => setShowCreateBot(true)}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
          >
            Create Bot
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('success') 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      {/* Active Bots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <div key={bot.id} className="glass rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{bot.name}</h3>
                <span className="text-sm text-gray-500">{bot.strategy.toUpperCase()} • {bot.asset}</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                bot.status === 'active' 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : bot.status === 'paused'
                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400'
              }`}>
                {bot.status}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">P&L</span>
                <span className={`font-semibold ${bot.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {bot.profit >= 0 ? '+' : ''}${bot.profit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Performance</span>
                <span className={`font-semibold ${bot.performance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {bot.performance >= 0 ? '+' : ''}{bot.performance}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trades</span>
                <span className="font-semibold">{bot.trades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-semibold text-sm">{bot.createdAt.toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => toggleBot(bot.id, bot.status === 'active' ? 'pause' : 'start')}
                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                  bot.status === 'active'
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {bot.status === 'active' ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={() => setSelectedBot(bot)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition"
              >
                Edit
              </button>
              <button
                onClick={() => deleteBot(bot.id)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Bot Modal */}
      {showCreateBot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Create Trading Bot</h3>
              <button
                onClick={() => setShowCreateBot(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bot Name</label>
                <input
                  type="text"
                  value={botConfig.name}
                  onChange={(e) => setBotConfig({...botConfig, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="My Trading Bot"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Strategy</label>
                <select
                  value={botConfig.strategy}
                  onChange={(e) => setBotConfig({...botConfig, strategy: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {strategies.map(strategy => (
                    <option key={strategy.id} value={strategy.id}>
                      {strategy.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {strategies.find(s => s.id === botConfig.strategy)?.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Asset</label>
                  <select
                    value={botConfig.asset}
                    onChange={(e) => setBotConfig({...botConfig, asset: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {['BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'BNB'].map(asset => (
                      <option key={asset} value={asset}>{asset}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Investment Amount ($)</label>
                  <input
                    type="number"
                    value={botConfig.investment}
                    onChange={(e) => setBotConfig({...botConfig, investment: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="1000"
                    min="100"
                  />
                </div>
              </div>

              {/* Strategy-specific configuration */}
              {getStrategyConfig()}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stop Loss (%)</label>
                  <input
                    type="number"
                    value={botConfig.stopLoss}
                    onChange={(e) => setBotConfig({...botConfig, stopLoss: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="5"
                    min="1"
                    max="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Take Profit (%)</label>
                  <input
                    type="number"
                    value={botConfig.takeProfit}
                    onChange={(e) => setBotConfig({...botConfig, takeProfit: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="10"
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowCreateBot(false)}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createBot}
                  disabled={loading}
                  className="flex-1 py-3 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Bot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TradingBots
