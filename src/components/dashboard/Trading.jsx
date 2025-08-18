
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from '../../utils/axios'

function Trading() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('spot')
  const [orderType, setOrderType] = useState('market')
  const [tradeType, setTradeType] = useState('buy')
  const [selectedAsset, setSelectedAsset] = useState('BTC')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [marketPrices, setMarketPrices] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const assets = ['BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'BNB']

  useEffect(() => {
    fetchMarketPrices()
    const interval = setInterval(fetchMarketPrices, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchMarketPrices = async () => {
    try {
      const response = await axios.get('/api/market/prices')
      setMarketPrices(response.data)
      if (!price && selectedAsset) {
        setPrice(response.data[`${selectedAsset}/USDT`]?.price || '')
      }
    } catch (error) {
      console.error('Error fetching market prices:', error)
    }
  }

  const calculateQuantity = () => {
    if (!amount || !price) return 0
    return parseFloat(amount) / parseFloat(price)
  }

  const calculateTotal = () => {
    if (!amount && !price) return 0
    if (orderType === 'market') {
      return parseFloat(amount) || 0
    }
    return calculateQuantity() * parseFloat(price) || 0
  }

  const executeTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid amount')
      return
    }

    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      setMessage('Please enter a valid price')
      return
    }

    const currentPrice = marketPrices[`${selectedAsset}/USDT`]?.price || 0
    const tradePrice = orderType === 'market' ? currentPrice : parseFloat(price)
    const quantity = parseFloat(amount) / tradePrice

    if (tradeType === 'buy' && parseFloat(amount) > user.balance) {
      setMessage('Insufficient balance')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('/api/users/trades', {
        type: tradeType,
        asset: selectedAsset,
        amount: parseFloat(amount),
        price: tradePrice,
        quantity: quantity,
        orderType: orderType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setMessage(`Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${quantity.toFixed(6)} ${selectedAsset}`)
        updateUser({ 
          ...user, 
          balance: response.data.balance,
          portfolio: response.data.portfolio 
        })
        setAmount('')
        setPrice(orderType === 'market' ? '' : price)
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Trade execution failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          {['spot', 'futures', 'margin'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-medium text-sm transition ${
                activeTab === tab
                  ? 'border-b-2 border-brand-500 text-brand-500'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Trading
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-4">Place Order</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => setTradeType('buy')}
                className={`p-3 rounded-lg font-semibold transition ${
                  tradeType === 'buy'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setTradeType('sell')}
                className={`p-3 rounded-lg font-semibold transition ${
                  tradeType === 'sell'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Sell
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Asset</label>
                <select
                  value={selectedAsset}
                  onChange={(e) => {
                    setSelectedAsset(e.target.value)
                    if (orderType === 'market') {
                      setPrice(marketPrices[`${e.target.value}/USDT`]?.price || '')
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {assets.map(asset => (
                    <option key={asset} value={asset}>{asset}/USDT</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Order Type</label>
                <select
                  value={orderType}
                  onChange={(e) => {
                    setOrderType(e.target.value)
                    if (e.target.value === 'market') {
                      setPrice(marketPrices[`${selectedAsset}/USDT`]?.price || '')
                    } else {
                      setPrice('')
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="market">Market Order</option>
                  <option value="limit">Limit Order</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {tradeType === 'buy' ? 'Amount (USD)' : `Amount (${selectedAsset})`}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="0.00"
                />
              </div>

              {orderType === 'limit' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Price (USD)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="0.00"
                  />
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Quantity:</span>
                  <span>{calculateQuantity().toFixed(6)} {selectedAsset}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Total:</span>
                  <span>${calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span>${user?.balance?.toLocaleString() || '0'}</span>
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('Successfully') 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  {message}
                </div>
              )}

              <button
                onClick={executeTrade}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  tradeType === 'buy'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                } disabled:opacity-50`}
              >
                {loading ? 'Executing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selectedAsset}`}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Market Prices</h3>
            <div className="space-y-3">
              {Object.entries(marketPrices).map(([pair, data]) => {
                const [base] = pair.split('/')
                return (
                  <div key={pair} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer"
                       onClick={() => setSelectedAsset(base)}>
                    <div>
                      <div className="font-semibold">{base}</div>
                      <div className="text-sm text-gray-500">{pair}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${data.price?.toLocaleString()}</div>
                      <div className={`text-sm ${data.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {data.change >= 0 ? '+' : ''}{data.change?.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Trading
