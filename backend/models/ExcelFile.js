const mongoose = require('mongoose');

const ExcelFileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  metadata: {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    headers: [String],
    rowCount: Number,
    originalName: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExcelFile', ExcelFileSchema);
