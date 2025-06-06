// Make sure this is at the very top of the file, before any other code
const dotenv = require('dotenv');
const path = require('path');

// Explicitly set the path to your .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Now rest of your imports
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes'); // Import your auth routes
const cors = require('cors'); // Import cors
const jwt = require('jsonwebtoken'); // Import jwt here
const excelRoutes = require('./routes/excelRoutes'); // New: require excelRoutes
const userRoutes = require('./routes/userRoutes'); // Add user routes

const app = express();

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cors()); // Enable CORS for all origins (adjust as needed for production)

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Create temp-uploads directory if it doesn't exist
if (!fs.existsSync('./temp-uploads')) {
  fs.mkdirSync('./temp-uploads');
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/excel', excelRoutes); // New: mount excel routes
app.use('/api/users', userRoutes); // Mount user routes

// Simple protected route example (requires authentication)
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
    console.log("Token being verified:", token.substring(0, 20) + "...");
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user from token to the request
      req.user = decoded;
      next();
    } catch (error) {
      console.error("JWT Error:", error.name, error.message);
      return res.status(401).json({ message: `Token verification failed: ${error.message}` });
    }
  }
  
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