
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

// Import models
const User = require('../models/User')
const Admin = require('../models/Admin')
const News = require('../models/News')
const Announcement = require('../models/Announcement')

async function initializeSampleData() {
  try {
    // Create sample news if none exist
    const newsCount = await News.countDocuments()
    if (newsCount === 0) {
      const sampleNews = [
        {
          title: "Bitcoin Reaches New All-Time High",
          content: "Bitcoin has surged to unprecedented levels, breaking through previous resistance...",
          author: "CryptoNews Team",
          publishedAt: new Date(),
          source: "CryptoNews"
        },
        {
          title: "Ethereum 2.0 Staking Rewards Increase",
          content: "The latest update to Ethereum's staking mechanism has increased rewards for validators...",
          author: "DeFi Analyst",
          publishedAt: new Date(Date.now() - 86400000), // 1 day ago
          source: "DeFi Today"
        },
        {
          title: "Regulatory Clarity Boosts Crypto Markets",
          content: "New regulatory guidelines have provided much-needed clarity for the cryptocurrency industry...",
          author: "Regulatory Expert",
          publishedAt: new Date(Date.now() - 172800000), // 2 days ago
          source: "Crypto Regulation"
        }
      ]
      
      await News.insertMany(sampleNews)
      console.log('Sample news created')
    }

    // Create sample announcements if none exist
    const announcementCount = await Announcement.countDocuments()
    if (announcementCount === 0) {
      const sampleAnnouncements = [
        {
          title: "Welcome to EcoTradingPro!",
          content: "Welcome to our cryptocurrency trading simulation platform. Start with $10,000 virtual balance and practice trading!",
          type: "info",
          active: true
        },
        {
          title: "New Features Available",
          content: "We've added real-time market data and improved the trading interface for a better experience.",
          type: "update",
          active: true
        }
      ]
      
      await Announcement.insertMany(sampleAnnouncements)
      console.log('Sample announcements created')
    }

  } catch (error) {
    console.error('Error initializing sample data:', error)
  }
}

module.exports = { initializeSampleData }

const initDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cryptotrade', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log('Connected to MongoDB')

    // Create default admin if doesn't exist
    const adminExists = await Admin.findOne({ email: 'admin@cryptotrade.pro' })
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      const admin = new Admin({
        email: 'admin@cryptotrade.pro',
        password: hashedPassword,
        name: 'System Administrator'
      })
      await admin.save()
      console.log('✅ Default admin created: admin@cryptotrade.pro / admin123')
    }

    // Create sample news
    const newsExists = await News.findOne({})
    if (!newsExists) {
      const sampleNews = [
        {
          title: 'Bitcoin Reaches New Heights',
          content: 'Bitcoin continues its bullish trend as institutional adoption increases worldwide.',
          category: 'Market Analysis'
        },
        {
          title: 'Ethereum 2.0 Staking Rewards',
          content: 'Learn about the latest updates on Ethereum staking and potential rewards for validators.',
          category: 'Technology'
        },
        {
          title: 'Regulatory Updates',
          content: 'Latest regulatory developments in the cryptocurrency space across major markets.',
          category: 'Regulation'
        }
      ]

      await News.insertMany(sampleNews)
      console.log('✅ Sample news articles created')
    }

    // Create welcome announcement
    const announcementExists = await Announcement.findOne({})
    if (!announcementExists) {
      const welcomeAnnouncement = new Announcement({
        title: 'Welcome to CryptoTrade Pro!',
        content: 'Start your trading journey with $10,000 virtual balance. Explore our platform features and learn crypto trading in a safe environment.',
        type: 'success'
      })
      await welcomeAnnouncement.save()
      console.log('✅ Welcome announcement created')
    }

    console.log('🎉 Database initialization completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  }
}

initDatabase()
