
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const User = require('../models/User')
const Admin = require('../models/Admin')

const router = express.Router()

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
})

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// User Registration
router.post('/user/register', authLimiter, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' })
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user with default balance
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      balance: 10000.00, // Default balance, admin can simulate any amount
      isActive: true
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id, 'user')

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance,
        role: 'user'
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// User Login
router.post('/user/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account has been suspended' })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user._id, 'user')

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance,
        role: 'user'
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin Login
router.post('/admin/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find admin
    const admin = await Admin.findOne({ email: email.toLowerCase() })
    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' })
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({ error: 'Admin account has been suspended' })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' })
    }

    // Update last login
    admin.lastLogin = new Date()
    await admin.save()

    // Generate token
    const token = generateToken(admin._id, 'admin')

    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: 'admin',
        permissions: admin.permissions
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Token verification middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    if (decoded.role === 'user') {
      const user = await User.findById(decoded.id)
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid or inactive user' })
      }
      req.user = user
    } else if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id)
      if (!admin || !admin.isActive) {
        return res.status(401).json({ error: 'Invalid or inactive admin' })
      }
      req.user = admin
    } else {
      return res.status(401).json({ error: 'Invalid token role' })
    }

    req.userRole = decoded.role
    next()
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(403).json({ error: 'Invalid or expired token' })
  }
}

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userInfo = {
      id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.userRole
    }

    if (req.userRole === 'user') {
      userInfo.balance = req.user.balance
    } else if (req.userRole === 'admin') {
      userInfo.permissions = req.user.permissions
    }

    res.json({ success: true, user: userInfo })
  } catch (error) {
    console.error('Get user info error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Logout (client-side token removal, but we can track it server-side if needed)
router.post('/logout', authenticateToken, async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' })
})

module.exports = { router, authenticateToken }
