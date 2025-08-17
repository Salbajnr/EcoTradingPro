
const mongoose = require('mongoose')

const newsSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  author: { 
    type: String, 
    default: 'CryptoTrade Pro' 
  },
  category: { 
    type: String, 
    default: 'General',
    enum: ['General', 'Market Analysis', 'Technology', 'Regulation', 'Trading Tips'] 
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  publishedAt: { 
    type: Date, 
    default: Date.now 
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index for published date and category
newsSchema.index({ publishedAt: -1 })
newsSchema.index({ category: 1 })

module.exports = mongoose.model('News', newsSchema)
