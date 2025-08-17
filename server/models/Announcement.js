
const mongoose = require('mongoose')

const announcementSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['info', 'warning', 'success', 'error'], 
    default: 'info' 
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  expiresAt: {
    type: Date
  },
  targetUsers: {
    type: String,
    enum: ['all', 'new_users', 'active_traders'],
    default: 'all'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
})

// Index for active announcements
announcementSchema.index({ active: 1, createdAt: -1 })

module.exports = mongoose.model('Announcement', announcementSchema)
