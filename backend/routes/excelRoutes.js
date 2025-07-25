// routes/excelRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket, ObjectId } = require('mongodb');
const XLSX = require('xlsx');
const fs = require('fs');
const ExcelFile = require('../models/ExcelFile');
const Activity = require('../models/Activity'); 
const path = require('path');
const jwt = require('jsonwebtoken');
const geminiService = require('../services/geminiService');

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
    
    // Log the activity
    await Activity.create({
      userId: req.user.id,
      fileId: fileId,
      activityType: 'upload',
      fileDetails: {
        filename: req.file.originalname,
        rowCount: rowCount,
        columnCount: headers.length
      }
    });
    
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
    
    // Log the download activity
    await Activity.create({
      userId: req.user.id,
      fileId: new ObjectId(req.params.fileId),
      activityType: 'download',
      fileDetails: {
        filename: file.filename
      }
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get file data for analysis
router.get('/data/:fileId', protect, async (req, res) => {
  try {
    const file = await ExcelFile.findOne({ _id: req.params.fileId });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'excelFiles'
    });
    
    // Create a temporary file path for downloading
    const tempFilePath = path.join('./temp-uploads', `${Date.now()}-${file.filename}`);
    
    // Download the file from GridFS to the temporary location
    const downloadStream = bucket.openDownloadStream(file.fileId);
    const writeStream = fs.createWriteStream(tempFilePath);
    
    await new Promise((resolve, reject) => {
      downloadStream.pipe(writeStream)
        .on('error', reject)
        .on('finish', resolve);
    });
    
    // Read the Excel file with proper encoding options
    const workbook = XLSX.readFile(tempFilePath, {
      type: 'binary',
      codepage: 65001, // UTF-8 encoding
      cellStyles: true
    });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // Convert all values to strings to preserve formatting
      defval: '' // Default empty cells to empty string
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    // Only create view activity, not analysis activity
    await Activity.create({
      userId: req.user.id,
      fileId: new mongoose.Types.ObjectId(req.params.fileId), // FIXED: Added 'new'
      activityType: 'view',
      fileDetails: { 
        filename: file.filename,
        rowCount: file.metadata?.rowCount,
        columnCount: file.metadata?.headers?.length
      }
    });
    
    // Ensure proper content type for handling UTF-8
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // Return data as JSON
    res.json({ 
      filename: file.filename, 
      data: data 
    });
    
  } catch (error) {
    console.error('Error fetching file data:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
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

// Route to get AI insights for a file
router.post('/insights/:fileId', protect, async (req, res) => {
  try {
    const { questionPrompt } = req.body;
    const file = await ExcelFile.findOne({ _id: req.params.fileId });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Check if the file belongs to the requesting user
    if (file.metadata.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this file' });
    }
    
    // Get the file data - reuse your existing file fetching logic
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'excelFiles'
    });
    
    // Create a temporary file path for downloading
    const tempFilePath = path.join('./temp-uploads', `${Date.now()}-${file.filename}`);
    
    // Download the file from GridFS to the temporary location
    const downloadStream = bucket.openDownloadStream(file.fileId);
    const writeStream = fs.createWriteStream(tempFilePath);
    
    await new Promise((resolve, reject) => {
      downloadStream.pipe(writeStream)
        .on('error', reject)
        .on('finish', resolve);
    });
    
    // Read the Excel file
    const workbook = XLSX.readFile(tempFilePath, {
      type: 'binary',
      codepage: 65001, // UTF-8 encoding
      cellStyles: true
    });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // Convert all values to strings to preserve formatting
      defval: '' // Default empty cells to empty string
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'File contains no data to analyze' });
    }
    
    const columns = Object.keys(data[0]);
    
    // Call the Gemini AI service to analyze the data
    const analysisResult = await geminiService.analyzeData(data, columns, questionPrompt);
    
    // Only create the activity AFTER successfully generating insights
    // and as a response to a user-initiated action
    await Activity.create({
      userId: req.user.id,
      fileId: new ObjectId(req.params.fileId),  // Use 'new' here too
      activityType: 'insight',
      fileDetails: { 
        filename: file.filename,
        rowCount: file.metadata?.rowCount, 
        columnCount: file.metadata?.headers?.length
      }
    });
    
    res.json({
      fileName: file.filename,
      insights: analysisResult.insights,
      columnStats: analysisResult.columnStats,
      analysisDate: new Date()
    });
    
  } catch (error) {
    console.error('Error processing AI insights:', error);
    res.status(500).json({ message: 'Error processing AI insights: ' + error.message });
  }
});

// Update your file data route - find where you serve file data for analysis
router.get('/data/:fileId', protect, async (req, res) => {
  try {
    const file = await ExcelFile.findOne({ _id: req.params.fileId });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'excelFiles'
    });
    
    // Create a temporary file path for downloading
    const tempFilePath = path.join('./temp-uploads', `${Date.now()}-${file.filename}`);
    
    // Download the file from GridFS to the temporary location
    const downloadStream = bucket.openDownloadStream(file.fileId);
    const writeStream = fs.createWriteStream(tempFilePath);
    
    await new Promise((resolve, reject) => {
      downloadStream.pipe(writeStream)
        .on('error', reject)
        .on('finish', resolve);
    });
    
    // Read the Excel file with proper encoding options
    const workbook = XLSX.readFile(tempFilePath, {
      type: 'binary',
      codepage: 65001, // UTF-8 encoding
      cellStyles: true
    });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // Convert all values to strings to preserve formatting
      defval: '' // Default empty cells to empty string
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    // Only create view activity, not analysis activity
    await Activity.create({
      userId: req.user.id,
      fileId: new mongoose.Types.ObjectId(req.params.fileId),  // FIX: Added "new" keyword
      activityType: 'view',
      fileDetails: { 
        filename: file.filename,
        rowCount: file.metadata?.rowCount,
        columnCount: file.metadata?.headers?.length
      }
    });
    
    // Ensure proper content type for handling UTF-8
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // Return data as JSON
    res.json({ 
      filename: file.filename, 
      data: data 
    });
    
  } catch (error) {
    console.error('Error fetching file data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new endpoint specifically for when analysis is performed
router.post('/analyze/:fileId', protect, async (req, res) => {
  try {
    const file = await ExcelFile.findOne({ fileId: req.params.fileId });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Create analysis activity ONLY when user actively performs analysis
    await Activity.create({
      userId: req.user.id,
      fileId: new mongoose.Types.ObjectId(req.params.fileId),
      activityType: 'analysis',
      fileDetails: { 
        filename: file.filename,
        rowCount: file.metadata?.rowCount,
        columnCount: file.metadata?.headers?.length
      }
    });
    
    // Return success response
    res.json({ message: 'Analysis activity recorded successfully' });
  } catch (error) {
    console.error('Error recording analysis activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
