const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExcelFile'
  },
  activityType: {
    type: String,
    enum: ['upload', 'download', 'view', 'analysis', 'insight'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  fileDetails: {
    filename: String,
    rowCount: Number,
    columnCount: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', ActivitySchema);