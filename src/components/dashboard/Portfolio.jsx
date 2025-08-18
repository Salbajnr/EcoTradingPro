
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from '../../utils/axios'

function Portfolio() {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState({})
  const [trades, setTrades] = useState([])
  const [marketPrices, setMarketPrices] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolioData()
    fetchTrades()
    fetchMarketPrices()
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

  const calculatePortfolioValue = () => {
    return Object.entries(portfolio).reduce((total, [asset, quantity]) => {
      const price = marketPrices[`${asset}/USDT`]?.price || 0
      return total + (quantity * price)
    }, 0)
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2">Portfolio Value</h3>
          <p className="text-3xl font-bold text-brand-500">${calculatePortfolioValue().toLocaleString()}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2">Available Balance</h3>
          <p className="text-3xl font-bold text-emerald-500">${user?.balance?.toLocaleString() || '0'}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-2">Total Trades</h3>
          <p className="text-3xl font-bold text-blue-500">{trades.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Holdings</h3>
          {Object.keys(portfolio).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No holdings yet. Start trading to build your portfolio!</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(portfolio).map(([asset, quantity]) => {
                const price = marketPrices[`${asset}/USDT`]?.price || 0
                const value = quantity * price
                return (
                  <div key={asset} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                        {asset[0]}
                      </div>
                      <div>
                        <div className="font-semibold">{asset}</div>
                        <div className="text-sm text-gray-500">{quantity.toFixed(6)} {asset}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${value.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">${price.toLocaleString()}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Recent Trades</h3>
          {trades.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No trades yet. Start your trading journey!</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {trades.slice(0, 10).map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      trade.type === 'buy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      <i className={`fas ${trade.type === 'buy' ? 'fa-arrow-up' : 'fa-arrow-down'} text-sm`}></i>
                    </div>
                    <div>
                      <div className="font-medium">{trade.type.toUpperCase()} {trade.asset}</div>
                      <div className="text-sm text-gray-500">{new Date(trade.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{trade.quantity.toFixed(6)} {trade.asset}</div>
                    <div className="text-sm text-gray-500">${trade.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Portfolio
