// backend/index.js (or server.js)

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); // Import your auth routes
const cors = require('cors'); // Import cors
const jwt = require('jsonwebtoken'); // Import jwt here

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cors()); // Enable CORS for all origins (adjust as needed for production)

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routes
app.use('/api/auth', authRoutes);

// Simple protected route example (requires authentication)
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user from token to the request
      req.user = decoded; // The decoded token payload contains user info (like id and role)
      next();
    } catch (error) {
      console.error(error);
      // If token is invalid, send 401
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token is provided, send 401
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Example dashboard route - requires authentication
app.get('/api/dashboard', protect, (req, res) => {
  // You can send user-specific data here based on req.user
  res.json({ message: `Welcome to the dashboard, ${req.user.username || 'User'}!` });
});

// Example admin route - requires admin role
const adminProtect = (req, res, next) => {
    // Check if user is authenticated first using the protect middleware
    protect(req, res, () => {
        // If protect middleware passed, check if user has admin role
        if (req.user && req.user.role === 'admin') {
            next(); // User is authenticated and is admin, proceed
        } else {
            // User is authenticated but not admin, send 403 Forbidden
            res.status(403).json({ message: 'Not authorized as an admin' });
        }
    });
};

app.get('/api/admin', adminProtect, (req, res) => {
    res.json({ message: 'Welcome to the admin panel!' });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));