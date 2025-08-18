const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const { router: authRouter, authenticateToken } = require('./routes/auth')
const adminRouter = require('./routes/admin')
const usersRouter = require('./routes/users')
const marketRouter = require('./routes/market')
const User = require('./models/User')
const Admin = require('./models/Admin')
const News = require('./models/News')
const Announcement = require('./models/Announcement')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cryptotradingpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)
app.use('/api/users', usersRouter)
app.use('/api/market', marketRouter)

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// User-only middleware
const requireUser = (req, res, next) => {
  if (req.userRole !== 'user') {
    return res.status(403).json({ error: 'User access required' })
  }
  next()
}

// Admin Routes
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.put('/api/admin/users/:id/balance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { balance } = req.body

    if (typeof balance !== 'number' || balance < 0) {
      return res.status(400).json({ error: 'Invalid balance amount' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { balance: parseFloat(balance.toFixed(2)) },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error updating balance:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.put('/api/admin/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error updating user status:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// User Routes
app.get('/api/user/profile', authenticateToken, requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Market data endpoint (mock data for now)
app.get('/api/market/prices', async (req, res) => {
  try {
    // Mock market data - in production, integrate with real crypto API
    const marketData = {
      'BTC/USDT': {
        price: 68355 + (Math.random() - 0.5) * 1000,
        change: (Math.random() - 0.5) * 10
      },
      'ETH/USDT': {
        price: 3210 + (Math.random() - 0.5) * 200,
        change: (Math.random() - 0.5) * 8
      },
      'SOL/USDT': {
        price: 182.4 + (Math.random() - 0.5) * 20,
        change: (Math.random() - 0.5) * 6
      },
      'XRP/USDT': {
        price: 0.62 + (Math.random() - 0.5) * 0.1,
        change: (Math.random() - 0.5) * 4
      },
      'BNB/USDT': {
        price: 598.3 + (Math.random() - 0.5) * 50,
        change: (Math.random() - 0.5) * 5
      },
      'ADA/USDT': {
        price: 0.52 + (Math.random() - 0.5) * 0.05,
        change: (Math.random() - 0.5) * 3
      }
    }
    res.json(marketData)
  } catch (error) {
    console.error('Error fetching market data:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// News Routes
app.get('/api/news', async (req, res) => {
  try {
    const news = await News.find({}).sort({ publishedAt: -1 }).limit(20)
    res.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/admin/news', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const news = new News(req.body)
    await news.save()
    res.status(201).json(news)
  } catch (error) {
    console.error('Error creating news:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Announcements Routes
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 }).limit(10)
    res.json(announcements)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/admin/announcements', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const announcement = new Announcement({
      ...req.body,
      createdBy: req.user._id
    })
    await announcement.save()
    res.status(201).json(announcement)
  } catch (error) {
    console.error('Error creating announcement:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
})