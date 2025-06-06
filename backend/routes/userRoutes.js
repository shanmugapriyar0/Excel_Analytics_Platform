const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const ExcelFile = require('../models/ExcelFile');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Reuse your protect middleware
const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id };
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Get user activities
router.get('/activity', protect, async (req, res) => {
  try {
    // Get recent user activities
    const activities = await Activity.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(10);
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats
router.get('/stats/dashboard', protect, async (req, res) => {
  try {
    // Get file stats
    const files = await ExcelFile.find({ 'metadata.uploadedBy': req.user.id });
    const totalFiles = files.length;
    
    // Calculate total rows
    const totalRows = files.reduce((acc, file) => acc + (file.metadata?.rowCount || 0), 0);
    
    // Get recent activity counts
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentUploads = await Activity.countDocuments({
      userId: req.user.id,
      activityType: 'upload',
      timestamp: { $gte: oneWeekAgo }
    });
    
    const recentViews = await Activity.countDocuments({
      userId: req.user.id,
      activityType: 'view',
      timestamp: { $gte: oneWeekAgo }
    });
    
    res.json({
      totalFiles,
      totalRows,
      recentUploads,
      recentViews
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this endpoint to clean up any duplicate activities
router.delete('/activity/cleanup', protect, async (req, res) => {
  try {
    // Find duplicate activities from the same day
    const activities = await Activity.find({ userId: req.user.id })
      .sort({ timestamp: -1 });
    
    const seen = new Set();
    const duplicates = [];
    
    activities.forEach(activity => {
      // Create a unique key based on file and activity type for same-day activities
      const activityDate = new Date(activity.timestamp).toDateString();
      const key = `${activity.fileId}-${activity.activityType}-${activityDate}`;
      
      if (seen.has(key)) {
        duplicates.push(activity._id);
      } else {
        seen.add(key);
      }
    });
    
    // Delete the duplicates
    if (duplicates.length > 0) {
      await Activity.deleteMany({ _id: { $in: duplicates } });
    }
    
    res.json({ 
      message: 'Activity cleanup completed',
      duplicatesRemoved: duplicates.length
    });
  } catch (error) {
    console.error('Error cleaning up activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Replace your popular-file endpoint with this improved version

// Get most popular/accessed file
router.get('/popular-file', protect, async (req, res) => {
  try {
    console.log('Fetching popular file for user ID:', req.user.id);
    
    // Count activities by file ID to find most accessed, with debugging
    const fileCounts = await Activity.aggregate([
      // Use a string comparison instead of ObjectId for more reliable matching
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      
      // Only include activities with a valid fileId
      { $match: { fileId: { $ne: null } } },
      
      // Only count these activity types
      { $match: { activityType: { $in: ['view', 'analysis', 'insight'] } } },
      
      // Group by filename instead of fileId which might be more reliable
      { $group: {
          _id: '$fileDetails.filename',  // Group by filename instead of fileId
          count: { $sum: 1 },            // Count occurrences
          fileId: { $first: '$fileId' }  // Keep the fileId
        }
      },
      
      // Sort by count descending
      { $sort: { count: -1 } },
      
      // Get top 5 for debugging
      { $limit: 5 }
    ]);
    
    console.log('File counts results:', JSON.stringify(fileCounts, null, 2));
    
    if (fileCounts.length > 0) {
      // Return the most accessed file
      res.json({ 
        fileId: fileCounts[0].fileId,
        filename: fileCounts[0]._id, // Filename is now the _id from grouping
        accessCount: fileCounts[0].count
      });
    } else {
      // If no results from aggregation, try a simpler approach
      console.log('No file counts from aggregation, trying simpler query');
      
      // Just get most recently accessed file
      const recentActivity = await Activity.findOne({
        userId: new mongoose.Types.ObjectId(req.user.id),
        'fileDetails.filename': { $exists: true }
      }).sort({ timestamp: -1 });
      
      if (recentActivity && recentActivity.fileDetails && recentActivity.fileDetails.filename) {
        return res.json({
          fileId: recentActivity.fileId,
          filename: recentActivity.fileDetails.filename,
          accessCount: 1
        });
      }
      
      res.json({ 
        fileId: null, 
        filename: null, 
        accessCount: 0,
        message: 'No popular content yet'
      });
    }
    
  } catch (error) {
    console.error('Error fetching popular file:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;