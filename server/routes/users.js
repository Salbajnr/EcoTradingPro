const express = require('express')
const User = require('../models/User')
const { authenticateToken } = require('./auth')

const router = express.Router()

// Get user profile and balance
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }

    const user = await User.findById(req.user._id, '-password')
    res.json(user)
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user trading history
router.get('/trades', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }

    const user = await User.findById(req.user._id)
    res.json(user.trades || [])
  } catch (error) {
    console.error('Error fetching trades:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Execute a trade (simulation)
router.post('/trades', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }

    const { type, asset, amount, price, quantity } = req.body

    // Validate trade data
    if (!type || !asset || !amount || !price || !quantity) {
      return res.status(400).json({ error: 'Missing required trade data' })
    }

    const user = await User.findById(req.user._id)

    // Check if user has sufficient balance for buy orders
    if (type === 'buy' && user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' })
    }

    // Create trade record
    const trade = {
      id: Date.now().toString(),
      type,
      asset,
      amount,
      price,
      quantity,
      timestamp: new Date(),
      status: 'completed'
    }

    // Update user balance and portfolio
    if (type === 'buy') {
      user.balance -= amount
      user.portfolio[asset] = (user.portfolio[asset] || 0) + quantity
    } else if (type === 'sell') {
      user.balance += amount
      user.portfolio[asset] = Math.max(0, (user.portfolio[asset] || 0) - quantity)
    }

    user.trades = user.trades || []
    user.trades.push(trade)

    await user.save()

    res.json({ success: true, trade, balance: user.balance, portfolio: user.portfolio })
  } catch (error) {
    console.error('Error executing trade:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user portfolio
router.get('/portfolio', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }
    const user = await User.findById(req.user._id).select('portfolio balance')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      portfolio: user.portfolio || {},
      balance: user.balance
    })
  } catch (error) {
    console.error('Portfolio fetch error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get user watchlist
router.get('/watchlist', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }
    const user = await User.findById(req.user._id).select('watchlist')
    res.json(user?.watchlist || [])
  } catch (error) {
    console.error('Watchlist fetch error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Add to watchlist
router.post('/watchlist', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }
    const { asset } = req.body
    const user = await User.findById(req.user._id)

    if (!user.watchlist) user.watchlist = []

    const exists = user.watchlist.find(item => item.asset === asset)
    if (exists) {
      return res.status(400).json({ error: 'Asset already in watchlist' })
    }

    user.watchlist.push({ asset, addedAt: new Date() })
    await user.save()

    res.json({ success: true })
  } catch (error) {
    console.error('Add to watchlist error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Remove from watchlist
router.delete('/watchlist/:asset', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }
    const { asset } = req.params
    const user = await User.findById(req.user._id)

    if (!user.watchlist) user.watchlist = []

    user.watchlist = user.watchlist.filter(item => item.asset !== asset)
    await user.save()

    res.json({ success: true })
  } catch (error) {
    console.error('Remove from watchlist error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get price alerts
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }
    const user = await User.findById(req.user._id).select('priceAlerts')
    res.json(user?.priceAlerts || [])
  } catch (error) {
    console.error('Price alerts fetch error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Create price alert
router.post('/alerts', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }
    const { asset, price, type } = req.body
    const user = await User.findById(req.user._id)

    if (!user.priceAlerts) user.priceAlerts = []

    const alert = {
      id: Date.now().toString(),
      asset,
      price,
      type,
      status: 'active',
      createdAt: new Date()
    }

    user.priceAlerts.push(alert)
    await user.save()

    res.json({ success: true, alert })
  } catch (error) {
    console.error('Create alert error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Delete price alert
router.delete('/alerts/:alertId', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }
    const { alertId } = req.params
    const user = await User.findById(req.user._id)

    if (!user.priceAlerts) user.priceAlerts = []

    user.priceAlerts = user.priceAlerts.filter(alert => alert.id !== alertId)
    await user.save()

    res.json({ success: true })
  } catch (error) {
    console.error('Delete alert error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get order history
router.get('/orders/history', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }
    const { status, days } = req.query
    const user = await User.findById(req.user._id).select('orders')

    let orders = user?.orders || []

    if (status && status !== 'all') {
      orders = orders.filter(order => order.status === status)
    }

    if (days) {
      const daysAgo = new Date(Date.now() - (parseInt(days) * 24 * 60 * 60 * 1000))
      orders = orders.filter(order => new Date(order.timestamp) >= daysAgo)
    }

    res.json(orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
  } catch (error) {
    console.error('Order history fetch error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get trade history
router.get('/trades/history', authenticateToken, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }
    const { type, days } = req.query
    const user = await User.findById(req.user._id).select('trades')

    let trades = user?.trades || []

    if (type && type !== 'all') {
      trades = trades.filter(trade => trade.type === type)
    }

    if (days) {
      const daysAgo = new Date(Date.now() - (parseInt(days) * 24 * 60 * 60 * 1000))
      trades = trades.filter(trade => new Date(trade.timestamp) >= daysAgo)
    }

    res.json(trades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
  } catch (error) {
    console.error('Trade history fetch error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router