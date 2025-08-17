
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
require('dotenv').config()

// Import database initialization
require('../database/init')

const Admin = require('../models/Admin')

async function createDefaultAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@ecotradingpro.com' })
    
    if (existingAdmin) {
      console.log('Default admin already exists')
      return
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash('admin123', salt)

    // Create admin
    const admin = new Admin({
      email: 'admin@ecotradingpro.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      permissions: [
        'users.view',
        'users.edit',
        'users.delete',
        'balances.edit',
        'news.create',
        'news.edit',
        'news.delete',
        'announcements.create',
        'announcements.edit',
        'announcements.delete',
        'analytics.view'
      ],
      isActive: true
    })

    await admin.save()
    console.log('Default admin created successfully!')
    console.log('Email: admin@ecotradingpro.com')
    console.log('Password: admin123')
    console.log('Please change the password after first login.')
    
  } catch (error) {
    console.error('Error creating admin:', error)
  } finally {
    mongoose.connection.close()
  }
}

createDefaultAdmin()
