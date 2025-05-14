// components/FileUpload.js
import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaFileExcel, FaCheck, FaTimes, FaCloudUploadAlt, FaArrowLeft } from 'react-icons/fa';

const FileUpload = () => {
  const { user } = useSelector(state => state.auth);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (validTypes.includes(file.type) || file.name.endsWith('.xlsx') || 
        file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
      setFile(file);
      setUploadStatus(null);
    } else {
      setUploadStatus({
        success: false,
        message: 'Invalid file type. Please upload Excel or CSV files only.'
      });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('excelFile', file);
    
    const token = user?.token || user?.accessToken || (user?.data?.token);
    
    if (!token) {
      setUploadStatus({
        success: false,
        message: 'Authentication token not found. Please log in again.'
      });
      setUploading(false);
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:5000/api/excel/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setParsedData(response.data.data);
      setUploadStatus({
        success: true,
        message: 'File uploaded and processed successfully!'
      });
      
      // Auto-dismiss success message after 4 seconds
      setTimeout(() => {
        if (setUploadStatus) { // Check component is still mounted
          setUploadStatus(null);
        }
      }, 4000);
      
    } catch (error) {
      console.error("Upload error details:", error.response || error);
      setUploadStatus({
        success: false,
        message: error.response?.data?.message || 'Error uploading file. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const handleBackToProjects = () => {
    // You can implement navigation to projects page here
    console.log("Back to projects clicked");
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload-header">
        <div className="file-upload-title">
          <h2>Upload Data for project</h2>
          <p>Upload multiple Excel or CSV files for analysis</p>
        </div>
        <button className="back-button" onClick={handleBackToProjects}>
          <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Projects
        </button>
      </div>
      
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          id="file-upload" 
          onChange={handleFileChange}
          accept=".xlsx,.xls,.csv"
          className="file-input" 
        />
        
        {!file ? (
          <div className="upload-prompt">
            <FaCloudUploadAlt className="upload-icon" />
            <h3>Drag and drop your Excel or CSV files here</h3>
            <p>or</p>
            <button 
              type="button" 
              className="browse-button" 
              onClick={() => fileInputRef.current.click()}
            >
              Browse Files
            </button>
            {/* Removed the file size limit text as requested */}
          </div>
        ) : (
          <div className="selected-file">
            <div className="file-icon">
              <FaFileExcel />
            </div>
            <div className="file-info">
              <h3>{file.name}</h3>
              <p>{formatFileSize(file.size)}</p>
            </div>
            <div className="file-actions">
              <button 
                type="button" 
                className="remove-file-btn" 
                onClick={() => setFile(null)}
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {file && (
        <div className="upload-actions">
          <button 
            type="button" 
            className="upload-button"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload & Process Data'}
          </button>
        </div>
      )}
      
      {uploadStatus && (
        <div className={`upload-status ${uploadStatus.success ? 'success' : 'error'}`}>
          <div className="status-icon">
            {uploadStatus.success ? <FaCheck /> : <FaTimes />}
          </div>
          <div className="status-message">{uploadStatus.message}</div>
        </div>
      )}
      
      {parsedData && (
        <section className="preview-section">
          <div className="section-header">
            <h2>Data Preview</h2>
          </div>
          
          <div className="data-preview">
            {parsedData.headers && parsedData.preview && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      {parsedData.headers.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.preview.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {parsedData.headers.map((header, colIndex) => (
                          <td key={colIndex}>{row[header] !== undefined ? row[header] : 'N/A'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="preview-info">
              <p><strong>Total Records:</strong> {parsedData.count || 'N/A'}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default FileUpload;