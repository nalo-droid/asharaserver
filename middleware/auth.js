const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { ROLES } = require('../config/constants');

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Protect routes middleware
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password -refreshToken');

      // Check if user still exists
      if (!req.user) {
        res.status(401);
        throw new Error('User no longer exists');
      }

      // Check if token is blacklisted
      if (req.user.tokenBlacklist?.includes(token)) {
        res.status(401);
        throw new Error('Token has been invalidated');
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401);
        throw new Error('Token expired');
      }
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Verify admin role
const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === ROLES.ADMIN) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as admin');
  }
});

// Verify client role
const isClient = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === ROLES.CLIENT) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as client');
  }
});

// Refresh token middleware
const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401);
    throw new Error('Refresh token required');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Get user
    const user = await User.findById(decoded.id);
    
    if (!user || user.refreshToken !== refreshToken) {
      res.status(401);
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);
    
    // Update refresh token in database
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Send new tokens
    res.json(tokens);
  } catch (error) {
    res.status(401);
    throw new Error('Invalid refresh token');
  }
});

// Logout middleware
const logout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    res.status(400);
    throw new Error('Token required');
  }

  try {
    // Add token to blacklist
    const user = await User.findById(req.user._id);
    user.tokenBlacklist = user.tokenBlacklist || [];
    user.tokenBlacklist.push(token);
    user.refreshToken = null;
    await user.save();

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500);
    throw new Error('Error during logout');
  }
});

module.exports = { 
  protect, 
  isAdmin, 
  isClient, 
  refreshToken, 
  logout,
  generateTokens 
}; 