
const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

// Get available competitions
router.get('/', auth, async (req, res) => {
  try {
    // In a real app, this would come from a Competitions collection
    const competitions = [
      {
        id: '1',
        title: 'Weekly Crypto Challenge',
        description: 'Trade cryptocurrencies for the highest return in 7 days',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-08'),
        participants: 245,
        maxParticipants: 500,
        entryFee: 0,
        prizePool: 5000,
        startingBalance: 10000,
        status: 'active',
        category: 'general',
        rules: [
          'Starting balance: $10,000 virtual money',
          'All major cryptocurrencies allowed',
          'No leverage trading',
          'Competition ends at midnight UTC'
        ],
        prizes: {
          1: 2000,
          2: 1500,
          3: 1000,
          '4-10': 500
        }
      }
    ]
    
    res.json(competitions)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Join competition
router.post('/:competitionId/join', auth, async (req, res) => {
  try {
    const { competitionId } = req.params
    const user = await User.findById(req.user.userId)
    
    // Check if already joined
    const existing = user.competitions?.find(c => c.competitionId === competitionId)
    if (existing) {
      return res.status(400).json({ error: 'Already joined this competition' })
    }

    const competition = {
      competitionId,
      joinedAt: new Date(),
      startingBalance: 10000,
      currentBalance: 10000,
      trades: []
    }

    user.competitions = user.competitions || []
    user.competitions.push(competition)
    
    await user.save()
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Get competition leaderboard
router.get('/:competitionId/leaderboard', auth, async (req, res) => {
  try {
    // Mock leaderboard data
    const leaderboard = [
      { rank: 1, name: 'CryptoPro', balance: 15234.56, profit: 5234.56, profitPercent: 52.3 },
      { rank: 2, name: 'TradeKing', balance: 14892.33, profit: 4892.33, profitPercent: 48.9 },
      { rank: 3, name: 'MoonTrader', balance: 13567.89, profit: 3567.89, profitPercent: 35.7 }
    ]
    
    res.json(leaderboard)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
