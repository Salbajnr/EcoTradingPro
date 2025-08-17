
const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
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
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'super_admin']
  },
  permissions: {
    type: [String],
    default: ['manage_users', 'manage_news', 'manage_announcements', 'view_analytics']
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
adminSchema.index({ email: 1 })

module.exports = mongoose.model('Admin', adminSchema)
