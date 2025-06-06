const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { toObjectId } = require('../utils/helpers');

// Helper function for safe ObjectId conversion
const convertToObjectId = (id) => {
  try {
    return new ObjectId(id);
  } catch (error) {
    console.error('Invalid ObjectId format:', id);
    throw new Error(`Invalid ObjectId: ${id}`);
  }
};

router.post('/insights/:fileId', protect, async (req, res) => {
  try {
    const fileId = toObjectId(req.params.fileId);
    
    // Now use fileId safely
  } catch (error) {
    // Error handling
  }
});

module.exports = { convertToObjectId };