const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // For token generation
const sgMail = require('@sendgrid/mail'); // Replace nodemailer with SendGrid
const User = require('../models/User');

// Configure SendGrid
console.log("SendGrid API Key (first few chars):", 
  process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.substring(0, 5) + "..." : "Not found");

// Make sure there's no whitespace
const apiKey = process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.trim() : null;
sgMail.setApiKey(apiKey);

// Generate JWT
const generateToken = (id, role, username) => {
  return jwt.sign({ id, role, username }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
  // IMPORTANT SECURITY NOTE: Allowing 'role' directly in the signup body is insecure
  // for creating admin users. A separate, protected mechanism should be used for
  // creating admin accounts in a production environment.
  const { username, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user', // Use provided role or default to 'user'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role, user.username),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role, user.username),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Forgot password - validate email and send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists with that email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        message: 'No account with that email address exists' 
      });
    }

    // Generate a unique token ID to invalidate previous reset links
    const resetTokenId = crypto.randomBytes(32).toString('hex');
    
    // Save the resetTokenId to the user document
    user.resetTokenId = resetTokenId;
    await user.save();

    // Create a secret key using JWT_SECRET and the user's hashed password
    // Now also including the resetTokenId
    const secret = process.env.JWT_SECRET + user.password + resetTokenId;
    
    // Create a JWT token with user email and ID that expires in 3 minutes
    const token = jwt.sign(
      { email: user.email, id: user._id, resetTokenId },
      secret,
      { expiresIn: '3m' }
    );
    
    // Create reset URL with user ID and token
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${user._id}/${token}`;
    
    // Log the reset URL for development/testing
    console.log('---------------------------------------');
    console.log('PASSWORD RESET LINK FOR TESTING:');
    console.log(resetUrl);
    console.log('---------------------------------------');
    
    // Configure SendGrid email
    const msg = {
      to: user.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Password Reset - Excel Analytics Platform',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset for your Excel Analytics Platform account.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#4CAF50;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a>
        <p>This link will expire in 3 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    // Send the email using SendGrid
    sgMail.send(msg)
      .then(() => {
        // In production, you would NOT return the URL in the response
        return res.status(200).json({
          message: 'Password reset email sent successfully',
          success: true,
          // Only include resetUrl in development
          ...(process.env.NODE_ENV !== 'production' && { resetUrl })
        });
      })
      .catch((error) => {
        console.error('SendGrid email error:', error);
        // Still return success but mention email couldn't be sent
        return res.status(200).json({
          message: 'Reset link generated but email could not be sent. Use this link for testing:',
          success: true,
          resetUrl: resetUrl
        });
      });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:id/:token
// @access  Public
router.post('/reset-password/:id/:token', async (req, res) => {
  const { password } = req.body;
  const { id, token } = req.params;
  
  try {
    // Find user by ID
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid reset request'
      });
    }
    
    // Get payload without verification to extract resetTokenId
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.resetTokenId) {
      return res.status(400).json({
        message: 'Invalid reset link. Please request a new one.'
      });
    }
    
    // Check if resetTokenId in token matches the one in user document
    if (decoded.resetTokenId !== user.resetTokenId) {
      return res.status(400).json({
        message: 'This reset link has been superseded by a newer request. Please use the most recent link or request a new one.'
      });
    }
    
    // Now verify with the same secret used to sign
    const secret = process.env.JWT_SECRET + user.password + user.resetTokenId;
    
    // Verify the token
    const verified = jwt.verify(token, secret);
    
    if (!verified) {
      return res.status(400).json({
        message: 'Invalid or expired token'
      });
    }
    
    // Check if the new password is the same as the current password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: 'New password cannot be the same as your current password'
      });
    }
    
    // Set the new password
    user.password = password;
    
    // Invalidate all reset tokens by clearing resetTokenId
    user.resetTokenId = undefined;
    
    // Save the user with new password
    await user.save();
    
    res.status(200).json({
      message: 'Password has been successfully reset'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    
    // Check if error is due to token expiration or invalid signature
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid reset link. Please request a new one.' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Validate reset token without changing password
// @route   GET /api/auth/validate-token/:id/:token
// @access  Public
router.get('/validate-token/:id/:token', async (req, res) => {
  const { id, token } = req.params;
  
  try {
    // Find user by ID
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid reset request'
      });
    }
    
    // Get payload without verification to extract resetTokenId
    // (This doesn't validate the token yet)
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.resetTokenId) {
      return res.status(400).json({
        message: 'Invalid reset link. Please request a new one.'
      });
    }
    
    // Check if resetTokenId in token matches the one in user document
    if (decoded.resetTokenId !== user.resetTokenId) {
      return res.status(400).json({
        message: 'This reset link has been superseded by a newer request. Please use the most recent link or request a new one.'
      });
    }
    
    // Now verify with the same secret used to sign
    const secret = process.env.JWT_SECRET + user.password + user.resetTokenId;
    
    // Verify the token
    const verified = jwt.verify(token, secret);
    
    // If we get here, token is valid
    res.status(200).json({
      message: 'Token is valid',
      userId: id
    });
  } catch (error) {
    console.error('Token validation error:', error);
    
    // Check if error is due to token expiration or invalid signature
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid reset link. Please request a new one.' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;