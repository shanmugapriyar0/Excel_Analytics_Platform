const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

// Safe ObjectId conversion
const toObjectId = (id) => {
  if (!id) return null;
  try {
    return new ObjectId(id);
  } catch (error) {
    console.error('Invalid ObjectId format:', id);
    throw new Error(`Invalid ObjectId: ${id}`);
  }
};

module.exports = {
  toObjectId
};