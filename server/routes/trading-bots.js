
const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

// Get user's trading bots
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    res.json(user.tradingBots || [])
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Create trading bot
router.post('/', auth, async (req, res) => {
  try {
    const { name, strategy, asset, investment, ...config } = req.body
    
    const user = await User.findById(req.user.userId)
    
    if (parseFloat(investment) > user.balance) {
      return res.status(400).json({ error: 'Insufficient balance' })
    }

    const bot = {
      id: Date.now().toString(),
      name,
      strategy,
      asset,
      investment: parseFloat(investment),
      config,
      status: 'active',
      profit: 0,
      trades: 0,
      createdAt: new Date(),
      performance: 0
    }

    user.tradingBots = user.tradingBots || []
    user.tradingBots.push(bot)
    user.balance -= parseFloat(investment)
    
    await user.save()
    res.json({ success: true, bot })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Update bot status
router.patch('/:botId/:action', auth, async (req, res) => {
  try {
    const { botId, action } = req.params
    const user = await User.findById(req.user.userId)
    
    const bot = user.tradingBots?.find(b => b.id === botId)
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' })
    }

    if (action === 'start') {
      bot.status = 'active'
    } else if (action === 'pause') {
      bot.status = 'paused'
    }

    await user.save()
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Delete trading bot
router.delete('/:botId', auth, async (req, res) => {
  try {
    const { botId } = req.params
    const user = await User.findById(req.user.userId)
    
    const botIndex = user.tradingBots?.findIndex(b => b.id === botId)
    if (botIndex === -1) {
      return res.status(404).json({ error: 'Bot not found' })
    }

    const bot = user.tradingBots[botIndex]
    user.balance += bot.investment + bot.profit
    user.tradingBots.splice(botIndex, 1)
    
    await user.save()
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
