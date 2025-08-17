
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

// Import models
const User = require('../models/User')
const Admin = require('../models/Admin')
const News = require('../models/News')
const Announcement = require('../models/Announcement')

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
