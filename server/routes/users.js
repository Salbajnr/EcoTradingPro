
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

module.exports = router
