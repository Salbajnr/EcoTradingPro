
const express = require('express')
const News = require('../models/News')

const router = express.Router()

// Get published news for users
router.get('/', async (req, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query
    
    let query = { isPublished: true }
    if (category && category !== 'all') {
      query.category = category
    }
    
    const news = await News.find(query)
      .sort({ priority: -1, publishedAt: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
    
    res.json(news)
  } catch (error) {
    console.error('Error fetching published news:', error)
    res.status(500).json({ error: 'Failed to fetch news' })
  }
})

// Get single news article
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const news = await News.findOne({ _id: id, isPublished: true })
    
    if (!news) {
      return res.status(404).json({ error: 'Article not found' })
    }
    
    // Increment view count
    news.views = (news.views || 0) + 1
    await news.save()
    
    res.json(news)
  } catch (error) {
    console.error('Error fetching news article:', error)
    res.status(500).json({ error: 'Failed to fetch article' })
  }
})

module.exports = router
