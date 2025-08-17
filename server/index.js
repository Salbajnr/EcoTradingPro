
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const http = require('http')
const socketIo = require('socket.io')
const cron = require('node-cron')
const axios = require('axios')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cryptotrade', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 10000 }, // Virtual balance
  portfolio: { type: Object, default: {} },
  trades: [{ type: Object }],
  createdAt: { type: Date, default: Date.now }
})

// Admin Schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

// News Schema
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, default: 'CryptoTrade Pro' },
  publishedAt: { type: Date, default: Date.now },
  category: { type: String, default: 'General' }
})

// Announcement Schema
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success'], default: 'info' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)
const Admin = mongoose.model('Admin', adminSchema)
const News = mongoose.model('News', newsSchema)
const Announcement = mongoose.model('Announcement', announcementSchema)

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' })
    }
    req.user = decoded
    next()
  })
}

// Create default admin if doesn't exist
async function createDefaultAdmin() {
  try {
    const adminExists = await Admin.findOne({})
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      const admin = new Admin({
        email: 'admin@cryptotrade.pro',
        password: hashedPassword,
        name: 'System Administrator'
      })
      await admin.save()
      console.log('Default admin created: admin@cryptotrade.pro / admin123')
    }
  } catch (error) {
    console.error('Error creating default admin:', error)
  }
}

// Routes

// User Authentication
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
      name,
      email,
      password: hashedPassword
    })

    await user.save()
    res.status(201).json({ message: 'User created successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, type: 'user' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Admin Authentication
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.status(400).json({ message: 'Invalid admin credentials' })
    }

    const validPassword = await bcrypt.compare(password, admin.password)
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid admin credentials' })
    }

    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, type: 'admin' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        type: 'admin'
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// User Routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'user') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const user = await User.findById(req.user.userId).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Admin Routes
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const users = await User.find({}).select('-password')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

app.put('/api/admin/users/:id/balance', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const { balance } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { balance },
      { new: true }
    ).select('-password')

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// News Routes
app.get('/api/news', async (req, res) => {
  try {
    const news = await News.find({}).sort({ publishedAt: -1 }).limit(20)
    res.json(news)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

app.post('/api/admin/news', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const news = new News(req.body)
    await news.save()
    res.status(201).json(news)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Market Data Routes (Mock for simulation)
app.get('/api/market/prices', async (req, res) => {
  try {
    // Mock crypto prices - in real app, integrate with CoinGecko/Binance API
    const mockPrices = {
      'BTC/USDT': { price: 68355 + (Math.random() - 0.5) * 1000, change: 1.2 },
      'ETH/USDT': { price: 3210 + (Math.random() - 0.5) * 200, change: -0.4 },
      'SOL/USDT': { price: 182.4 + (Math.random() - 0.5) * 20, change: 2.1 },
      'XRP/USDT': { price: 0.62 + (Math.random() - 0.5) * 0.1, change: 0.7 },
      'BNB/USDT': { price: 598.3 + (Math.random() - 0.5) * 50, change: 0.9 },
      'ADA/USDT': { price: 0.52 + (Math.random() - 0.5) * 0.05, change: -0.3 }
    }
    
    res.json(mockPrices)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Announcements Routes
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find({ active: true }).sort({ createdAt: -1 })
    res.json(announcements)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Broadcast market data every 5 seconds
cron.schedule('*/5 * * * * *', () => {
  const mockPrices = {
    'BTC/USDT': { price: 68355 + (Math.random() - 0.5) * 1000, change: (Math.random() - 0.5) * 5 },
    'ETH/USDT': { price: 3210 + (Math.random() - 0.5) * 200, change: (Math.random() - 0.5) * 3 },
    'SOL/USDT': { price: 182.4 + (Math.random() - 0.5) * 20, change: (Math.random() - 0.5) * 4 },
    'XRP/USDT': { price: 0.62 + (Math.random() - 0.5) * 0.1, change: (Math.random() - 0.5) * 2 },
    'BNB/USDT': { price: 598.3 + (Math.random() - 0.5) * 50, change: (Math.random() - 0.5) * 3 },
    'ADA/USDT': { price: 0.52 + (Math.random() - 0.5) * 0.05, change: (Math.random() - 0.5) * 2 }
  }
  
  io.emit('marketUpdate', mockPrices)
})

const PORT = process.env.PORT || 5000

// Initialize default admin and start server
createDefaultAdmin().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`)
    console.log('Default admin: admin@cryptotrade.pro / admin123')
  })
})
