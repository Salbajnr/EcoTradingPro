
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useWebSocket } from '../../contexts/WebSocketContext'
import axios from '../../utils/axios'

function Analytics() {
  const { user } = useAuth()
  const { marketData } = useWebSocket()
  const [analytics, setAnalytics] = useState({
    portfolio: {
      totalValue: 0,
      totalInvested: 0,
      totalProfit: 0,
      profitPercentage: 0,
      holdings: []
    },
    trading: {
      totalTrades: 0,
      successfulTrades: 0,
      successRate: 0,
      totalVolume: 0,
      averageTradeSize: 0,
      bestTrade: 0,
      worstTrade: 0
    },
    performance: {
      daily: [],
      weekly: [],
      monthly: []
    }
  })
  const [timeframe, setTimeframe] = useState('7d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/users/analytics?timeframe=${timeframe}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAnalytics(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Generate mock data for demo
      generateMockAnalytics()
      setLoading(false)
    }
  }

  const generateMockAnalytics = () => {
    const mockPortfolio = {
      totalValue: 12500.50,
      totalInvested: 10000,
      totalProfit: 2500.50,
      profitPercentage: 25.005,
      holdings: [
        { symbol: 'bitcoin', name: 'Bitcoin', amount: 0.25, value: 11250, profit: 2250, profitPercent: 25 },
        { symbol: 'ethereum', name: 'Ethereum', amount: 2.5, value: 7500, profit: 1500, profitPercent: 25 },
        { symbol: 'cardano', name: 'Cardano', amount: 1000, value: 500, profit: -250, profitPercent: -33.3 }
      ]
    }

    const mockTrading = {
      totalTrades: 45,
      successfulTrades: 32,
      successRate: 71.1,
      totalVolume: 125000,
      averageTradeSize: 2777.78,
      bestTrade: 1250.50,
      worstTrade: -345.20
    }

    const mockPerformance = {
      daily: generateTimeSeriesData(30),
      weekly: generateTimeSeriesData(12),
      monthly: generateTimeSeriesData(6)
    }

    setAnalytics({
      portfolio: mockPortfolio,
      trading: mockTrading,
      performance: mockPerformance
    })
  }

  const generateTimeSeriesData = (points) => {
    const data = []
    let value = 10000
    for (let i = 0; i < points; i++) {
      value += (Math.random() - 0.4) * 500
      data.push({
        date: new Date(Date.now() - (points - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.max(value, 5000)
      })
    }
    return data
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Performance</h2>
          <p className="text-gray-500 mt-1">Comprehensive insights into your trading performance</p>
        </div>
        <div className="flex gap-2">
          {['1d', '7d', '30d', '90d'].map(period => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                timeframe === period
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Portfolio Value</h3>
          <p className="text-2xl font-bold">{formatCurrency(analytics.portfolio.totalValue)}</p>
          <div className={`text-sm mt-1 ${
            analytics.portfolio.profitPercentage >= 0 ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {formatPercentage(analytics.portfolio.profitPercentage)}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Profit/Loss</h3>
          <p className={`text-2xl font-bold ${
            analytics.portfolio.totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {formatCurrency(analytics.portfolio.totalProfit)}
          </p>
          <div className="text-sm text-gray-500 mt-1">
            From {formatCurrency(analytics.portfolio.totalInvested)} invested
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Success Rate</h3>
          <p className="text-2xl font-bold text-brand-500">{analytics.trading.successRate.toFixed(1)}%</p>
          <div className="text-sm text-gray-500 mt-1">
            {analytics.trading.successfulTrades}/{analytics.trading.totalTrades} trades
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Volume</h3>
          <p className="text-2xl font-bold">{formatCurrency(analytics.trading.totalVolume)}</p>
          <div className="text-sm text-gray-500 mt-1">
            Avg: {formatCurrency(analytics.trading.averageTradeSize)}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">Portfolio Performance</h3>
        <div className="h-64 flex items-end justify-between gap-1">
          {analytics.performance.daily.slice(-30).map((point, index) => {
            const height = ((point.value - 5000) / 10000) * 100
            return (
              <div
                key={index}
                className="bg-brand-500 rounded-t flex-1 min-h-[2px] opacity-80 hover:opacity-100 transition"
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${point.date}: ${formatCurrency(point.value)}`}
              />
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Holdings Breakdown */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">Holdings Analysis</h3>
        <div className="space-y-4">
          {analytics.portfolio.holdings.map((holding, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold">
                  {holding.symbol.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold">{holding.name}</h4>
                  <p className="text-sm text-gray-500">{holding.amount} {holding.symbol.toUpperCase()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(holding.value)}</p>
                <p className={`text-sm ${
                  holding.profitPercent >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {formatPercentage(holding.profitPercent)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Trading Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Best Trade</span>
              <span className="font-semibold text-emerald-500">
                {formatCurrency(analytics.trading.bestTrade)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Worst Trade</span>
              <span className="font-semibold text-red-500">
                {formatCurrency(analytics.trading.worstTrade)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Average Trade Size</span>
              <span className="font-semibold">
                {formatCurrency(analytics.trading.averageTradeSize)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Trades</span>
              <span className="font-semibold">{analytics.trading.totalTrades}</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Market Insights</h3>
          <div className="space-y-4">
            {Object.entries(marketData).slice(0, 5).map(([symbol, data]) => (
              <div key={symbol} className="flex justify-between items-center">
                <span className="capitalize font-medium">{symbol}</span>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(data.price)}</p>
                  <p className={`text-sm ${
                    data.change24h >= 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {formatPercentage(data.change24h)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">Risk Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
              <span className="text-2xl text-emerald-500">📈</span>
            </div>
            <h4 className="font-semibold mb-2">Portfolio Diversification</h4>
            <p className="text-sm text-gray-500">
              {analytics.portfolio.holdings.length > 3 ? 'Well diversified' : 'Consider diversifying'}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <span className="text-2xl text-blue-500">⚖️</span>
            </div>
            <h4 className="font-semibold mb-2">Risk Level</h4>
            <p className="text-sm text-gray-500">
              {analytics.trading.successRate > 70 ? 'Conservative' : 'Moderate'}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <span className="text-2xl text-orange-500">🎯</span>
            </div>
            <h4 className="font-semibold mb-2">Trading Frequency</h4>
            <p className="text-sm text-gray-500">
              {analytics.trading.totalTrades > 50 ? 'Active trader' : 'Casual trader'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
