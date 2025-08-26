const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path')
const { router: authRouter, authenticateToken } = require('./routes/auth')
const adminRouter = require('./routes/admin')
const usersRouter = require('./routes/users')
const marketRouter = require('./routes/market')
const newsRouter = require('./routes/news')
const User = require('./models/User')
const Admin = require('./models/Admin')
const News = require('./models/News')
const Announcement = require('./models/Announcement')

// Import services
const marketService = require('./services/marketService')
const websocketService = require('./services/websocketService')

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  }
})
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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:cryptotrade123@cluster0.mongodb.net/cryptotrade?retryWrites=true&w=majority'

mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)
app.use('/api/users', usersRouter)
app.use('/api/market', marketRouter)
app.use('/api/news', newsRouter)
app.use('/api/portfolio', require('./routes/portfolio'))
app.use('/api/trading-bots', require('./routes/trading-bots'))
app.use('/api/competitions', require('./routes/competitions'))


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

    // Send notification to user about balance update
    io.to(`user-${user._id}`).emit('balance-update', {
      message: `Your balance has been updated to ${user.balance.toFixed(2)}.`,
      newBalance: user.balance
    })

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

    // Send notification to user about status change
    io.to(`user-${user._id}`).emit('status-update', {
      message: `Your account status has been updated to ${user.isActive ? 'Active' : 'Inactive'}.`,
      isActive: user.isActive
    })

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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join user to their personal room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`)
    console.log(`User ${userId} joined their room`)
  })

  // Join market data room
  socket.on('join-market', () => {
    socket.join('market-data')
    console.log('User joined market data room')
  })

  // Leave market data room
  socket.on('leave-market', () => {
    socket.leave('market-data')
    console.log('User left market data room')
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Simulate real-time market data updates
const marketDataInterval = setInterval(() => {
  const coins = ['bitcoin', 'ethereum', 'cardano', 'polkadot', 'chainlink', 'litecoin', 'stellar', 'dogecoin']

  coins.forEach(coin => {
    // Simulate price changes (-5% to +5%)
    const changePercent = (Math.random() - 0.5) * 10
    const basePrice = getBasePriceForCoin(coin)
    const newPrice = basePrice * (1 + changePercent / 100)

    const marketUpdate = {
      symbol: coin,
      price: newPrice,
      change24h: changePercent,
      timestamp: new Date()
    }

    // Emit to all users in market-data room
    io.to('market-data').emit('price-update', marketUpdate)
  })
}, 3000) // Update every 3 seconds

// Helper function to get base prices
function getBasePriceForCoin(coin) {
  const basePrices = {
    bitcoin: 45000,
    ethereum: 3000,
    cardano: 0.5,
    polkadot: 25,
    chainlink: 15,
    litecoin: 150,
    stellar: 0.3,
    dogecoin: 0.08
  }
  return basePrices[coin] || 100
}

// Export for use in other modules
app.locals.io = io
// app.locals.sendNotification = sendNotification // This function is not defined in the provided snippet. If needed, it should be implemented.

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  clearInterval(marketDataInterval)
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})