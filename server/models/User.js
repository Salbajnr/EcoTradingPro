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