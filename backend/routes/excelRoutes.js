// routes/excelRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket, ObjectId } = require('mongodb');
const XLSX = require('xlsx');
const fs = require('fs');
const ExcelFile = require('../models/ExcelFile');
const path = require('path');
const jwt = require('jsonwebtoken'); // <--- ADD THIS LINE

// JWT Authentication middleware
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log("Token being verified on server:", token.substring(0, 20) + "..."); // Server log
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = {
                id: decoded.id
                // You might want to include other decoded parts like role if needed later
                // e.g., role: decoded.role
            };
            next();
        } catch (error) {
            // This log will appear on your backend server console
            console.error("SERVER JWT Error in excelRoutes:", error.name, error.message);
            // This message is sent to the client
            return res.status(401).json({ message: `Token verification failed: ${error.message}` });
        }
    } else {
        console.log("SERVER: No token found in headers or incorrect format:", req.headers.authorization); // Server log
        return res.status(401).json({ message: 'Not authorized, no token or incorrect format' });
    }
};

// Set up temporary storage for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = './temp-uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('excel') || 
        file.mimetype.includes('spreadsheetml') ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only Excel files are allowed'));
    }
  }
});

// Upload Excel file using GridFS
router.post('/upload', protect, upload.single('excelFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file' });
  }

  try {
    // Parse file data
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = jsonData[0];
    const rowCount = jsonData.length - 1;
    
    // Check if file already exists
    const existingFile = await ExcelFile.findOne({
      filename: req.file.originalname,
      'metadata.uploadedBy': req.user.id
    });
    
    // Connect to GridFS
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'excelFiles'
    });
    
    // Delete old file from GridFS if exists
    if (existingFile) {
      try {
        await bucket.delete(ObjectId.createFromHexString(existingFile.fileId.toString()));
      } catch (err) {
        console.log("Error deleting old file:", err);
      }
    }
    
    // Upload new file to GridFS
    const uploadStream = bucket.openUploadStream(req.file.originalname);
    const fileId = uploadStream.id;
    
    // Create or update file record
    if (existingFile) {
      existingFile.fileId = fileId;
      existingFile.uploadDate = new Date();
      existingFile.metadata = {
        uploadedBy: req.user.id,
        headers: headers,
        rowCount: rowCount,
        originalName: req.file.originalname
      };
      await existingFile.save();
    } else {
      const excelFile = new ExcelFile({
        filename: req.file.originalname,
        fileId: fileId,
        metadata: {
          uploadedBy: req.user.id,
          headers: headers,
          rowCount: rowCount,
          originalName: req.file.originalname
        }
      });
      await excelFile.save();
    }
    
    // Pipe file to GridFS
    const pipePromise = new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(uploadStream)
        .on('error', reject)
        .on('finish', resolve);
    });
    
    await pipePromise;
    
    // Delete temp file
    fs.unlinkSync(req.file.path);
    
    // Return success response
    return res.status(200).json({
      message: existingFile ? 'File updated successfully' : 'File uploaded successfully',
      fileId: fileId,
      metadata: {
        headers: headers,
        rowCount: rowCount,
        fileName: req.file.originalname
      }
    });
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
    // Clean up temp file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: 'Error processing file' });
  }
});

// Get file info
router.get('/files', protect, async (req, res) => {
  try {
    const files = await ExcelFile.find({ 'metadata.uploadedBy': req.user.id })
      .sort({ uploadDate: -1 });
    
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download file
router.get('/download/:fileId', protect, async (req, res) => {
  try {
    const file = await ExcelFile.findOne({ fileId: req.params.fileId });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'excelFiles'
    });
    
    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.set('Content-Disposition', `attachment; filename="${file.filename}"`);
    
    bucket.openDownloadStream(ObjectId.createFromHexString(req.params.fileId))
      .pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// New route for token verification
router.get('/verify-token', protect, (req, res) => {
  res.status(200).json({ message: 'Token is valid', user: req.user });
});

// New route for test authentication
router.get('/test-auth', (req, res) => {
  const authHeader = req.headers.authorization;
  console.log('Auth header received:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided or invalid format' });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('Token extracted:', token);
  
  try {
    // Log the JWT_SECRET to make sure it's being loaded correctly
    console.log('JWT_SECRET length:', process.env.JWT_SECRET.length);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    
    return res.status(200).json({ message: 'Authentication successful', user: decoded });
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({ message: error.message });
  }
});

module.exports = router;
