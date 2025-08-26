
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from '../../utils/axios'

function Portfolio() {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState({})
  const [trades, setTrades] = useState([])
  const [marketPrices, setMarketPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [portfolioHistory, setPortfolioHistory] = useState([])

  useEffect(() => {
    fetchPortfolioData()
    fetchTrades()
    fetchMarketPrices()
    generatePortfolioHistory()
  }, [])

  const fetchPortfolioData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPortfolio(response.data.portfolio || {})
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    }
  }

  const fetchTrades = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/trades', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTrades(response.data)
    } catch (error) {
      console.error('Error fetching trades:', error)
    }
  }

  const fetchMarketPrices = async () => {
    try {
      const response = await axios.get('/api/market/prices')
      setMarketPrices(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching market prices:', error)
      setLoading(false)
    }
  }

  const generatePortfolioHistory = () => {
    // Generate sample portfolio history for the last 30 days
    const history = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const baseValue = 10000
      const randomChange = (Math.random() - 0.5) * 2000
      const value = baseValue + randomChange + (i * 50) // Slight upward trend
      history.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, value)
      })
    }
    setPortfolioHistory(history)
  }

  const calculatePortfolioValue = () => {
    return Object.entries(portfolio).reduce((total, [asset, quantity]) => {
      const price = marketPrices[`${asset}/USDT`]?.price || 0
      return total + (quantity * price)
    }, 0)
  }

  const calculateTotalInvested = () => {
    return trades.filter(trade => trade.type === 'buy').reduce((total, trade) => {
      return total + trade.amount
    }, 0)
  }

  const calculateProfitLoss = () => {
    const currentValue = calculatePortfolioValue()
    const totalInvested = calculateTotalInvested()
    return currentValue - totalInvested
  }

  const calculateProfitLossPercentage = () => {
    const totalInvested = calculateTotalInvested()
    if (totalInvested === 0) return 0
    const profitLoss = calculateProfitLoss()
    return (profitLoss / totalInvested) * 100
  }

  const getAssetAllocation = () => {
    const totalValue = calculatePortfolioValue()
    if (totalValue === 0) return []
    
    return Object.entries(portfolio).map(([asset, quantity]) => {
      const price = marketPrices[`${asset}/USDT`]?.price || 0
      const value = quantity * price
      const percentage = (value / totalValue) * 100
      return {
        asset,
        quantity,
        value,
        percentage,
        price
      }
    }).sort((a, b) => b.value - a.value)
  }

  const getTradeStatistics = () => {
    const buyTrades = trades.filter(trade => trade.type === 'buy')
    const sellTrades = trades.filter(trade => trade.type === 'sell')
    
    return {
      totalTrades: trades.length,
      buyTrades: buyTrades.length,
      sellTrades: sellTrades.length,
      avgTradeSize: trades.length > 0 ? trades.reduce((sum, trade) => sum + trade.amount, 0) / trades.length : 0,
      mostTradedAsset: getMostTradedAsset()
    }
  }

  const getMostTradedAsset = () => {
    const assetCounts = {}
    trades.forEach(trade => {
      assetCounts[trade.asset] = (assetCounts[trade.asset] || 0) + 1
    })
    return Object.keys(assetCounts).reduce((a, b) => assetCounts[a] > assetCounts[b] ? a : b, '')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  const portfolioValue = calculatePortfolioValue()
  const profitLoss = calculateProfitLoss()
  const profitLossPercentage = calculateProfitLossPercentage()
  const assetAllocation = getAssetAllocation()
  const tradeStats = getTradeStatistics()

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2">Portfolio Value</h3>
          <p className="text-3xl font-bold text-brand-500">${portfolioValue.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">+${user?.balance?.toLocaleString() || '0'} available</p>
        </div>
        
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2">Total P&L</h3>
          <p className={`text-3xl font-bold ${profitLoss >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            ${Math.abs(profitLoss).toLocaleString()}
          </p>
          <p className={`text-sm mt-1 ${profitLossPercentage >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {profitLoss >= 0 ? '+' : '-'}{Math.abs(profitLossPercentage).toFixed(2)}%
          </p>
        </div>
        
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2">Total Invested</h3>
          <p className="text-3xl font-bold text-blue-500">${calculateTotalInvested().toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{tradeStats.totalTrades} trades</p>
        </div>
        
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2">Best Performer</h3>
          <p className="text-3xl font-bold text-emerald-500">
            {assetAllocation.length > 0 ? assetAllocation[0].asset : 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {assetAllocation.length > 0 ? `${assetAllocation[0].percentage.toFixed(1)}% of portfolio` : ''}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-2xl p-6">
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          {['overview', 'holdings', 'trades', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-medium text-sm transition ${
                activeTab === tab
                  ? 'border-b-2 border-brand-500 text-brand-500'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Asset Allocation</h3>
              {assetAllocation.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No holdings yet. Start trading to build your portfolio!</p>
              ) : (
                <div className="space-y-4">
                  {assetAllocation.map((allocation) => (
                    <div key={allocation.asset} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                          {allocation.asset[0]}
                        </div>
                        <div>
                          <div className="font-semibold">{allocation.asset}</div>
                          <div className="text-sm text-gray-500">{allocation.quantity.toFixed(6)} {allocation.asset}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${allocation.value.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{allocation.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Trading Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                  <span>Total Trades</span>
                  <span className="font-semibold">{tradeStats.totalTrades}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                  <span>Buy Orders</span>
                  <span className="font-semibold text-emerald-500">{tradeStats.buyTrades}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                  <span>Sell Orders</span>
                  <span className="font-semibold text-red-500">{tradeStats.sellTrades}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                  <span>Avg Trade Size</span>
                  <span className="font-semibold">${tradeStats.avgTradeSize.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                  <span>Most Traded</span>
                  <span className="font-semibold">{tradeStats.mostTradedAsset || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'holdings' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Current Holdings</h3>
            {assetAllocation.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No holdings yet. Start trading to build your portfolio!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4">Asset</th>
                      <th className="text-right py-3 px-4">Quantity</th>
                      <th className="text-right py-3 px-4">Price</th>
                      <th className="text-right py-3 px-4">Value</th>
                      <th className="text-right py-3 px-4">Allocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetAllocation.map((allocation) => (
                      <tr key={allocation.asset} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                              {allocation.asset[0]}
                            </div>
                            <span className="font-semibold">{allocation.asset}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">{allocation.quantity.toFixed(6)}</td>
                        <td className="text-right py-3 px-4">${allocation.price.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 font-semibold">${allocation.value.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <span>{allocation.percentage.toFixed(1)}%</span>
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full"
                                style={{ width: `${Math.min(allocation.percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trades' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Trade History</h3>
            {trades.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No trades yet. Start your trading journey!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Asset</th>
                      <th className="text-right py-3 px-4">Quantity</th>
                      <th className="text-right py-3 px-4">Price</th>
                      <th className="text-right py-3 px-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.slice().reverse().map((trade) => (
                      <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5">
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(trade.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            trade.type === 'buy' 
                              ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                          }`}>
                            {trade.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">{trade.asset}</td>
                        <td className="text-right py-3 px-4">{trade.quantity.toFixed(6)}</td>
                        <td className="text-right py-3 px-4">${trade.price.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 font-semibold">${trade.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Portfolio Performance</h3>
              <div className="h-64 bg-gray-50 dark:bg-white/5 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-gray-500">Portfolio chart coming soon</p>
                  <p className="text-sm text-gray-400 mt-1">30-day performance tracking</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Risk Metrics</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5">
                  <div className="flex justify-between mb-2">
                    <span>Portfolio Diversification</span>
                    <span className="font-semibold">
                      {assetAllocation.length > 0 ? `${assetAllocation.length} assets` : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-brand-500 rounded-full"
                      style={{ width: `${Math.min(assetAllocation.length * 20, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5">
                  <div className="flex justify-between mb-2">
                    <span>Cash Allocation</span>
                    <span className="font-semibold">
                      {((user?.balance || 0) / ((user?.balance || 0) + portfolioValue) * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${((user?.balance || 0) / ((user?.balance || 0) + portfolioValue) * 100 || 0)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 dark:bg-white/5">
                  <h4 className="font-semibold mb-3">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Return</span>
                      <span className={profitLoss >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                        {profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Win Rate</span>
                      <span>
                        {trades.length > 0 ? 
                          (trades.filter(t => t.type === 'sell').length / trades.length * 100).toFixed(1) 
                          : '0'
                        }%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Largest Position</span>
                      <span>
                        {assetAllocation.length > 0 ? 
                          `${assetAllocation[0].percentage.toFixed(1)}%` 
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Portfolio
