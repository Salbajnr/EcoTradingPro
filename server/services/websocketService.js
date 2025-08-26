
const { Server } = require('socket.io')
const marketService = require('./marketService')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Admin = require('../models/Admin')

class WebSocketService {
  constructor() {
    this.io = null
    this.connectedClients = new Map()
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    this.setupAuthentication()
    this.setupEventHandlers()
    this.subscribeToMarketUpdates()
  }

  setupAuthentication() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
        
        if (!token) {
          return next(new Error('Authentication required'))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
        
        // Try to find user or admin
        let user = await User.findById(decoded.userId).select('-password')
        let userRole = 'user'
        
        if (!user) {
          user = await Admin.findById(decoded.adminId).select('-password')
          userRole = 'admin'
        }

        if (!user) {
          return next(new Error('Invalid token'))
        }

        socket.user = user
        socket.userRole = userRole
        next()
      } catch (error) {
        next(new Error('Authentication failed'))
      }
    })
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user._id} connected via WebSocket`)
      
      this.connectedClients.set(socket.id, {
        userId: socket.user._id,
        userRole: socket.userRole,
        socket
      })

      // Join user to personal room
      socket.join(`user:${socket.user._id}`)
      
      // Join role-based room
      socket.join(`role:${socket.userRole}`)

      // Handle market data subscription
      socket.on('subscribe:market', (assets) => {
        socket.join('market:updates')
        // Send current market data immediately
        socket.emit('market:data', marketService.getCurrentData())
      })

      // Handle price alerts
      socket.on('subscribe:alerts', () => {
        socket.join(`alerts:${socket.user._id}`)
      })

      // Handle trading updates
      socket.on('subscribe:trading', () => {
        socket.join(`trading:${socket.user._id}`)
      })

      // Handle portfolio updates
      socket.on('subscribe:portfolio', () => {
        socket.join(`portfolio:${socket.user._id}`)
      })

      // Handle trading bot updates
      socket.on('subscribe:bots', () => {
        socket.join(`bots:${socket.user._id}`)
      })

      // Handle news updates
      socket.on('subscribe:news', () => {
        socket.join('news:updates')
      })

      // Handle ping/pong for connection monitoring
      socket.on('ping', () => {
        socket.emit('pong')
      })

      socket.on('disconnect', () => {
        console.log(`User ${socket.user._id} disconnected`)
        this.connectedClients.delete(socket.id)
      })
    })
  }

  subscribeToMarketUpdates() {
    marketService.subscribe((marketData) => {
      this.io.to('market:updates').emit('market:update', marketData)
    })
  }

  // Emit price alert
  emitPriceAlert(userId, alert) {
    this.io.to(`alerts:${userId}`).emit('price:alert', alert)
  }

  // Emit trade execution
  emitTradeExecution(userId, trade) {
    this.io.to(`trading:${userId}`).emit('trade:executed', trade)
  }

  // Emit portfolio update
  emitPortfolioUpdate(userId, portfolio) {
    this.io.to(`portfolio:${userId}`).emit('portfolio:update', portfolio)
  }

  // Emit trading bot update
  emitBotUpdate(userId, botData) {
    this.io.to(`bots:${userId}`).emit('bot:update', botData)
  }

  // Emit news update
  emitNewsUpdate(news) {
    this.io.to('news:updates').emit('news:update', news)
  }

  // Emit system notification
  emitSystemNotification(message, userRole = 'all') {
    if (userRole === 'all') {
      this.io.emit('system:notification', message)
    } else {
      this.io.to(`role:${userRole}`).emit('system:notification', message)
    }
  }

  // Get connected clients count
  getConnectedClientsCount() {
    return this.connectedClients.size
  }

  // Get connected users
  getConnectedUsers() {
    return Array.from(this.connectedClients.values()).map(client => ({
      userId: client.userId,
      userRole: client.userRole
    }))
  }
}

module.exports = new WebSocketService()
