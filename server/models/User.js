
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { 
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
    default: 10000 
  },
  portfolio: { 
    type: Object, 
    default: {} 
  },
  trades: [{ 
    type: Object 
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
