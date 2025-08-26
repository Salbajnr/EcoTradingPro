
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Admin = require('../models/Admin')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
    
    // Try to find user first, then admin
    let user = await User.findById(decoded.userId).select('-password')
    if (user) {
      req.user = user
      req.userRole = 'user'
      req.user.userId = user._id
    } else {
      let admin = await Admin.findById(decoded.adminId).select('-password')
      if (admin) {
        req.user = admin
        req.userRole = 'admin'
        req.user.adminId = admin._id
      } else {
        return res.status(401).json({ error: 'Token is not valid' })
      }
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ error: 'Token is not valid' })
  }
}

module.exports = auth
