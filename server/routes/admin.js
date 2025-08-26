const express = require('express')
const User = require('../models/User')
const News = require('../models/News')
const { authenticateToken } = require('./auth')

const router = express.Router()

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update user balance
router.put('/users/:userId/balance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    const { balance } = req.body

    if (typeof balance !== 'number' || balance < 0) {
      return res.status(400).json({ error: 'Invalid balance amount' })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { balance },
      { new: true, select: '-password' }
    )

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error updating balance:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Toggle user active status
router.put('/users/:userId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    const { isActive } = req.body

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, select: '-password' }
    )

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error updating user status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get platform statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const totalBalance = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ])

    res.json({
      totalUsers,
      activeUsers,
      totalBalance: totalBalance[0]?.total || 0,
      systemUptime: process.uptime()
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// --- News Management Endpoints ---

// Create a new news article
router.post('/news', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, author } = req.body
    const newNews = new News({
      title,
      content,
      author: author || 'Admin' // Default author if not provided
    })
    await newNews.save()
    res.status(201).json(newNews)
  } catch (error) {
    console.error('Error creating news:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all news articles (published and unpublished)
router.get('/news', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 })
    res.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get a single news article by ID
router.get('/news/:newsId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { newsId } = req.params
    const news = await News.findById(newsId)
    if (!news) {
      return res.status(404).json({ error: 'News not found' })
    }
    res.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update a news article
router.put('/news/:newsId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { newsId } = req.params
    const { title, content, isPublished } = req.body

    const updatedNews = await News.findByIdAndUpdate(
      newsId,
      { title, content, isPublished },
      { new: true }
    )

    if (!updatedNews) {
      return res.status(404).json({ error: 'News not found' })
    }
    res.json(updatedNews)
  } catch (error) {
    console.error('Error updating news:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete a news article
router.delete('/news/:newsId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { newsId } = req.params
    const deletedNews = await News.findByIdAndDelete(newsId)

    if (!deletedNews) {
      return res.status(404).json({ error: 'News not found' })
    }
    res.json({ message: 'News article deleted successfully' })
  } catch (error) {
    console.error('Error deleting news:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get published news articles for public view
router.get('/news/published', async (req, res) => {
  try {
    const publishedNews = await News.find({ isPublished: true }).sort({ createdAt: -1 })
    res.json(publishedNews)
  } catch (error) {
    console.error('Error fetching published news:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router