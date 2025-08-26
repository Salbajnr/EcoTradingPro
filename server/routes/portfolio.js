
const express = require('express')
const auth = require('../middleware/auth')
const portfolioService = require('../services/portfolioService')
const websocketService = require('../services/websocketService')

const router = express.Router()

// Get portfolio value and holdings
router.get('/value', auth, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }

    const portfolio = await portfolioService.calculatePortfolioValue(req.user._id)
    res.json(portfolio)
  } catch (error) {
    console.error('Error fetching portfolio value:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get performance metrics
router.get('/performance', auth, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }

    const { timeRange = 30 } = req.query
    const performance = await portfolioService.calculatePerformanceMetrics(req.user._id, parseInt(timeRange))
    res.json(performance)
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get risk metrics
router.get('/risk', auth, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }

    const riskMetrics = await portfolioService.getRiskMetrics(req.user._id)
    res.json(riskMetrics)
  } catch (error) {
    console.error('Error fetching risk metrics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get portfolio composition
router.get('/composition', auth, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }

    const composition = await portfolioService.getPortfolioComposition(req.user._id)
    res.json(composition)
  } catch (error) {
    console.error('Error fetching portfolio composition:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Generate portfolio report
router.get('/report', auth, async (req, res) => {
  try {
    if (req.userRole !== 'user') {
      return res.status(403).json({ error: 'User access required' })
    }

    const { timeRange = 30 } = req.query
    
    const [portfolio, performance, risk, composition] = await Promise.all([
      portfolioService.calculatePortfolioValue(req.user._id),
      portfolioService.calculatePerformanceMetrics(req.user._id, parseInt(timeRange)),
      portfolioService.getRiskMetrics(req.user._id),
      portfolioService.getPortfolioComposition(req.user._id)
    ])

    const report = {
      summary: {
        totalValue: portfolio.totalValue,
        totalReturn: performance.totalReturn,
        sharpeRatio: performance.sharpeRatio,
        maxDrawdown: performance.maxDrawdown,
        winRate: performance.winRate
      },
      portfolio,
      performance,
      risk,
      composition,
      generatedAt: new Date()
    }

    res.json(report)
  } catch (error) {
    console.error('Error generating portfolio report:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
