
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
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [marketPrices, setMarketPrices] = useState({})
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] })
  const [recentTrades, setRecentTrades] = useState([])
  const [openOrders, setOpenOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [tradingViewMode, setTradingViewMode] = useState('simple')

  const assets = ['BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'BNB', 'MATIC', 'DOT', 'LINK', 'UNI']

  useEffect(() => {
    fetchMarketPrices()
    generateOrderBook()
    generateRecentTrades()
    fetchOpenOrders()
    const interval = setInterval(() => {
      fetchMarketPrices()
      generateOrderBook()
      generateRecentTrades()
    }, 3000)
    return () => clearInterval(interval)
  }, [selectedAsset])

  const fetchMarketPrices = async () => {
    try {
      const response = await axios.get('/api/market/prices')
      setMarketPrices(response.data)
      if (!price && selectedAsset && orderType === 'market') {
        setPrice(response.data[`${selectedAsset}/USDT`]?.price || '')
      }
    } catch (error) {
      console.error('Error fetching market prices:', error)
    }
  }

  const fetchOpenOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/users/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOpenOrders(response.data || [])
    } catch (error) {
      console.error('Error fetching open orders:', error)
    }
  }

  const generateOrderBook = () => {
    const currentPrice = marketPrices[`${selectedAsset}/USDT`]?.price || 50000
    const bids = []
    const asks = []
    
    // Generate bids (buy orders) below current price
    for (let i = 0; i < 10; i++) {
      const priceLevel = currentPrice * (1 - (i + 1) * 0.0005)
      const size = Math.random() * 5 + 0.1
      bids.push({
        price: priceLevel,
        size: size,
        total: priceLevel * size
      })
    }
    
    // Generate asks (sell orders) above current price
    for (let i = 0; i < 10; i++) {
      const priceLevel = currentPrice * (1 + (i + 1) * 0.0005)
      const size = Math.random() * 5 + 0.1
      asks.push({
        price: priceLevel,
        size: size,
        total: priceLevel * size
      })
    }
    
    setOrderBook({ bids, asks })
  }

  const generateRecentTrades = () => {
    const currentPrice = marketPrices[`${selectedAsset}/USDT`]?.price || 50000
    const trades = []
    
    for (let i = 0; i < 20; i++) {
      const variation = (Math.random() - 0.5) * 0.002
      const price = currentPrice * (1 + variation)
      const size = Math.random() * 2 + 0.01
      const side = Math.random() > 0.5 ? 'buy' : 'sell'
      
      trades.push({
        id: Date.now() + i,
        price: price,
        size: size,
        side: side,
        time: new Date(Date.now() - i * 30000).toLocaleTimeString()
      })
    }
    
    setRecentTrades(trades)
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

  const validateOrder = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid amount')
      return false
    }

    if (orderType !== 'market' && (!price || parseFloat(price) <= 0)) {
      setMessage('Please enter a valid price')
      return false
    }

    if (tradeType === 'buy' && parseFloat(amount) > user.balance) {
      setMessage('Insufficient balance')
      return false
    }

    if (orderType === 'stop-loss' && !stopLoss) {
      setMessage('Please enter stop loss price')
      return false
    }

    return true
  }

  const executeTrade = async () => {
    if (!validateOrder()) return

    const currentPrice = marketPrices[`${selectedAsset}/USDT`]?.price || 0
    const tradePrice = orderType === 'market' ? currentPrice : parseFloat(price)
    const quantity = parseFloat(amount) / tradePrice

    setLoading(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const orderData = {
        type: tradeType,
        asset: selectedAsset,
        amount: parseFloat(amount),
        price: tradePrice,
        quantity: quantity,
        orderType: orderType,
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        takeProfit: takeProfit ? parseFloat(takeProfit) : null
      }

      const response = await axios.post('/api/users/trades', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setMessage(`Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${quantity.toFixed(6)} ${selectedAsset}`)
        updateUser({ 
          ...user, 
          balance: response.data.balance,
          portfolio: response.data.portfolio 
        })
        
        // Reset form
        setAmount('')
        if (orderType === 'market') setPrice('')
        setStopLoss('')
        setTakeProfit('')
        
        // Refresh open orders
        fetchOpenOrders()
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Trade execution failed')
    } finally {
      setLoading(false)
    }
  }

  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/users/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchOpenOrders()
      setMessage('Order cancelled successfully')
    } catch (error) {
      setMessage('Failed to cancel order')
    }
  }

  const setOrderFromOrderBook = (price, side) => {
    setPrice(price.toFixed(2))
    setTradeType(side === 'ask' ? 'buy' : 'sell')
    setOrderType('limit')
  }

  return (
    <div className="space-y-6">
      {/* Trading Mode Toggle */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            {['spot', 'futures', 'margin'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  activeTab === tab
                    ? 'bg-brand-500 text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setTradingViewMode('simple')}
              className={`px-3 py-1 rounded text-sm ${
                tradingViewMode === 'simple' ? 'bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400' : 'text-gray-500'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setTradingViewMode('advanced')}
              className={`px-3 py-1 rounded text-sm ${
                tradingViewMode === 'advanced' ? 'bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400' : 'text-gray-500'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Order Form */}
        <div className="xl:col-span-1 glass rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Place Order</h3>
          
          {/* Buy/Sell Toggle */}
          <div className="grid grid-cols-2 gap-2 mb-4">
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
            {/* Asset Selection */}
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

            {/* Order Type */}
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
                <option value="stop-loss">Stop Loss</option>
                <option value="stop-limit">Stop Limit</option>
              </select>
            </div>

            {/* Amount */}
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

            {/* Price (for non-market orders) */}
            {orderType !== 'market' && (
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

            {/* Advanced Options */}
            {tradingViewMode === 'advanced' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Stop Loss (Optional)</label>
                  <input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Stop loss price"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Take Profit (Optional)</label>
                  <input
                    type="number"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Take profit price"
                  />
                </div>
              </>
            )}

            {/* Order Summary */}
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

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('Successfully') 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                {message}
              </div>
            )}

            {/* Execute Button */}
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

        {/* Order Book & Market Data */}
        <div className="xl:col-span-2 space-y-6">
          {/* Market Overview */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">{selectedAsset}/USDT</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Last Price</p>
                <p className="text-2xl font-bold">
                  ${marketPrices[`${selectedAsset}/USDT`]?.price?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">24h Change</p>
                <p className={`text-2xl font-bold ${
                  (marketPrices[`${selectedAsset}/USDT`]?.change || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {(marketPrices[`${selectedAsset}/USDT`]?.change || 0) >= 0 ? '+' : ''}
                  {marketPrices[`${selectedAsset}/USDT`]?.change?.toFixed(2) || '0'}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">24h Volume</p>
                <p className="text-2xl font-bold">
                  ${((Math.random() * 1000000000) + 100000000).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Order Book */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Order Book</h3>
            <div className="grid grid-cols-3 gap-4">
              {/* Asks (Sell Orders) */}
              <div>
                <h4 className="text-sm font-semibold text-red-500 mb-2">Asks</h4>
                <div className="space-y-1">
                  {orderBook.asks.slice(0, 8).reverse().map((ask, index) => (
                    <div 
                      key={index}
                      onClick={() => setOrderFromOrderBook(ask.price, 'ask')}
                      className="flex justify-between text-xs cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 p-1 rounded"
                    >
                      <span className="text-red-500">${ask.price.toFixed(2)}</span>
                      <span>{ask.size.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spread */}
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Spread</p>
                  <p className="font-semibold">
                    ${((orderBook.asks[0]?.price || 0) - (orderBook.bids[0]?.price || 0)).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Bids (Buy Orders) */}
              <div>
                <h4 className="text-sm font-semibold text-emerald-500 mb-2">Bids</h4>
                <div className="space-y-1">
                  {orderBook.bids.slice(0, 8).map((bid, index) => (
                    <div 
                      key={index}
                      onClick={() => setOrderFromOrderBook(bid.price, 'bid')}
                      className="flex justify-between text-xs cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/10 p-1 rounded"
                    >
                      <span className="text-emerald-500">${bid.price.toFixed(2)}</span>
                      <span>{bid.size.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trades & Open Orders */}
        <div className="xl:col-span-1 space-y-6">
          {/* Recent Trades */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Recent Trades</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex justify-between items-center text-sm">
                  <span className={trade.side === 'buy' ? 'text-emerald-500' : 'text-red-500'}>
                    ${trade.price.toFixed(2)}
                  </span>
                  <span>{trade.size.toFixed(4)}</span>
                  <span className="text-gray-500">{trade.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Open Orders */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Open Orders</h3>
            {openOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No open orders</p>
            ) : (
              <div className="space-y-3">
                {openOrders.map((order) => (
                  <div key={order.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.type === 'buy'
                            ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        }`}>
                          {order.type.toUpperCase()}
                        </span>
                        <span className="ml-2 font-semibold">{order.asset}</span>
                      </div>
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>{order.quantity} @ ${order.price}</div>
                      <div>{order.orderType} order</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Trading
