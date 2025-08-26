const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true,
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6 
  },
  balance: { 
    type: Number, 
    default: 0.00 
  },
  portfolio: { 
    type: Map, 
    of: Number, 
    default: {} 
  },
  trades: [{ 
    id: String,
    type: { type: String, enum: ['buy', 'sell'] },
    asset: String,
    amount: Number,
    price: Number,
    quantity: Number,
    orderType: { type: String, enum: ['market', 'limit'] },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: 'completed' }
  }],
  orders: [{
    id: String,
    type: { type: String, enum: ['buy', 'sell'] },
    asset: String,
    amount: Number,
    price: Number,
    quantity: Number,
    orderType: { type: String, enum: ['market', 'limit', 'stop-loss', 'stop-limit'] },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'completed', 'cancelled', 'partial'], default: 'pending' }
  }],
  watchlist: [{
    asset: String,
    addedAt: { type: Date, default: Date.now }
  }],
  priceAlerts: [{
    id: String,
    asset: String,
    price: Number,
    type: { type: String, enum: ['above', 'below'] },
    status: { type: String, enum: ['active', 'triggered'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
  }],
  tradingBots: [{
    id: String,
    name: String,
    strategy: { type: String, enum: ['grid', 'dca', 'rsi', 'macd', 'momentum'] },
    asset: String,
    investment: Number,
    config: Object,
    status: { type: String, enum: ['active', 'paused', 'stopped'], default: 'active' },
    profit: { type: Number, default: 0 },
    trades: { type: Number, default: 0 },
    performance: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  }],
  competitions: [{
    competitionId: String,
    joinedAt: { type: Date, default: Date.now },
    startingBalance: Number,
    currentBalance: Number,
    trades: [Object]
  }],
  socialTrading: {
    following: [String],
    followers: [String],
    copyTrades: [{
      traderId: String,
      amount: Number,
      percentage: Number,
      status: { type: String, enum: ['active', 'paused'], default: 'active' },
      startedAt: { type: Date, default: Date.now }
    }]
  },
  apiKeys: [{
    id: String,
    name: String,
    keyPrefix: String,
    hashedSecret: String,
    permissions: {
      read: { type: Boolean, default: true },
      trade: { type: Boolean, default: false },
      withdraw: { type: Boolean, default: false }
    },
    lastUsed: Date,
    usageCount: { type: Number, default: 0 },
    ipWhitelist: [String],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
})

// Index for email lookup
userSchema.index({ email: 1 })

module.exports = mongoose.model('User', userSchema)