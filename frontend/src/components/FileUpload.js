// components/FileUpload.js
import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaFileExcel, FaCheck, FaTimes, FaCloudUploadAlt, FaArrowLeft, FaSpinner } from 'react-icons/fa';

const FileUpload = () => {
  const { user } = useSelector(state => state.auth);
  const [files, setFiles] = useState([]); // Changed from single file to array of files
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [parsedData, setParsedData] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      validateAndAddFiles(selectedFiles);
    }
  };

  const validateAndAddFiles = (newFiles) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    const validFiles = [];
    const invalidFiles = [];
    
    newFiles.forEach(file => {
      if (validTypes.includes(file.type) || 
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls') || 
          file.name.endsWith('.csv')) {
        // Check if file already exists in the files array
        const isDuplicate = files.some(existingFile => 
          existingFile.name === file.name && 
          existingFile.size === file.size
        );
        
        if (!isDuplicate) {
          validFiles.push(file);
        }
      } else {
        invalidFiles.push(file.name);
      }
    });
    
    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
    
    if (invalidFiles.length > 0) {
      setUploadStatus({
        success: false,
        message: `Invalid file type(s): ${invalidFiles.join(', ')}. Please upload Excel or CSV files only.`
      });
      
      // Auto-dismiss error message after 4 seconds
      setTimeout(() => {
        setUploadStatus(null);
      }, 4000);
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadProgress({});
    setParsedData([]);
    
    // Get authentication token
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
      // Upload files sequentially
      const uploadResults = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('excelFile', file);
        
        setUploadProgress(prev => ({
          ...prev,
          [i]: { progress: 0, status: 'uploading' }
        }));
        
        try {
          const response = await axios.post(
            'http://localhost:5000/api/excel/upload', 
            formData, 
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                
                setUploadProgress(prev => ({
                  ...prev,
                  [i]: { progress: percentCompleted, status: 'uploading' }
                }));
              }
            }
          );
          
          // Update progress to completed
          setUploadProgress(prev => ({
            ...prev,
            [i]: { progress: 100, status: 'completed' }
          }));
          
          uploadResults.push({
            fileName: file.name,
            fileSize: file.size,
            success: true,
            data: response.data
          });
          
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error.response || error);
          
          setUploadProgress(prev => ({
            ...prev,
            [i]: { progress: 0, status: 'failed' }
          }));
          
          uploadResults.push({
            fileName: file.name,
            fileSize: file.size,
            success: false,
            error: error.response?.data?.message || 'Upload failed'
          });
        }
      }
      
      // Calculate overall success/failure
      const successfulUploads = uploadResults.filter(result => result.success);
      
      if (successfulUploads.length === files.length) {
        setUploadStatus({
          success: true,
          message: `All ${files.length} files uploaded successfully!`
        });
        
        // Auto-dismiss success message after 4 seconds with fade animation
        setTimeout(() => {
          // First add the fade-out class
          document.querySelector('.upload-status').classList.add('fade-out');
          
          // Then remove the element after the animation completes
          setTimeout(() => {
            setUploadStatus(null);
          }, 500);
        }, 3500); // Start fading at 3.5s, total duration will be 4s
        
        // Only save parsed data from the first file for preview
        if (uploadResults.length > 0 && uploadResults[0].data) {
          setParsedData(uploadResults.map(result => result.data));
        }
        
        // Clear files after successful upload
        setFiles([]);
      } else if (successfulUploads.length === 0) {
        setUploadStatus({
          success: false,
          message: 'All file uploads failed. Please try again.'
        });
      } else {
        setUploadStatus({
          success: 'partial',
          message: `${successfulUploads.length} of ${files.length} files uploaded successfully.`
        });
        
        // Auto-dismiss partial success message after 4 seconds too
        setTimeout(() => {
          setUploadStatus(null);
        }, 4000);
        
        // Save partial data
        if (successfulUploads.length > 0) {
          setParsedData(successfulUploads.map(result => result.data));
        }
        
        // Remove successful uploads from the files list
        const remainingFiles = files.filter((_, index) => 
          uploadProgress[index]?.status !== 'completed'
        );
        setFiles(remainingFiles);
      }
      
    } catch (error) {
      console.error("General upload error:", error);
      setUploadStatus({
        success: false,
        message: error.message || 'Error uploading files. Please try again.'
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
          <FaArrowLeft /> Back to Projects
        </button>
      </div>
      
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${files.length > 0 ? 'has-files' : ''}`}
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
          multiple // Enable multiple file selection
        />
        
        {files.length === 0 ? (
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
          </div>
        ) : (
          <div className="selected-files">
            <h3 className="files-header">Selected Files ({files.length})</h3>
            <div className="files-list">
              {files.map((file, index) => (
                <div key={index} className="selected-file">
                  <div className="file-icon">
                    <FaFileExcel />
                  </div>
                  <div className="file-info">
                    <h4>{file.name}</h4>
                    <p>{formatFileSize(file.size)}</p>
                  </div>
                  
                  {uploading ? (
                    <div className="file-progress">
                      {uploadProgress[index] && (
                        <>
                          {uploadProgress[index].status === 'uploading' && (
                            <>
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill" 
                                  style={{ width: `${uploadProgress[index].progress}%` }}
                                ></div>
                              </div>
                              <span className="progress-text">
                                {uploadProgress[index].progress}%
                              </span>
                            </>
                          )}
                          {uploadProgress[index].status === 'completed' && (
                            <span className="progress-complete">
                              <FaCheck className="complete-icon" />
                            </span>
                          )}
                          {uploadProgress[index].status === 'failed' && (
                            <span className="progress-failed">
                              <FaTimes className="failed-icon" />
                            </span>
                          )}
                        </>
                      )}
                      {!uploadProgress[index] && (
                        <FaSpinner className="spinner" />
                      )}
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      className="remove-file-btn" 
                      onClick={() => removeFile(index)}
                      aria-label="Remove file"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="add-more-files">
              <button 
                type="button" 
                className="add-files-button" 
                onClick={() => fileInputRef.current.click()}
              >
                + Add More Files
              </button>
            </div>
          </div>
        )}
      </div>
      
      {files.length > 0 && (
        <div className="upload-actions">
          <button 
            type="button" 
            className="upload-button"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
          >
            {uploading ? `Uploading... (${Object.values(uploadProgress).filter(p => p.status === 'completed').length}/${files.length})` : 'Upload & Process Files'}
          </button>
        </div>
      )}
      
      {uploadStatus && (
        <div className={`upload-status ${uploadStatus.success === true ? 'success' : uploadStatus.success === 'partial' ? 'partial' : 'error'}`}>
          <div className="status-icon">
            {uploadStatus.success === true ? <FaCheck /> : uploadStatus.success === 'partial' ? <FaCheck /> : <FaTimes />}
          </div>
          <div className="status-message">{uploadStatus.message}</div>
        </div>
      )}
      
      {parsedData.length > 0 && (
        <section className="preview-section">
          <div className="section-header">
            <h2>Files Uploaded</h2>
          </div>
          
          <div className="data-preview">
            <div className="uploaded-files-summary">
              {parsedData.map((data, index) => (
                <div key={index} className="uploaded-file-card">
                  <div className="file-card-icon">
                    <FaFileExcel />
                  </div>
                  <div className="file-card-details">
                    <h4>{data.metadata?.fileName || `File ${index + 1}`}</h4>
                    <p><strong>Rows:</strong> {data.metadata?.rowCount || 'N/A'}</p>
                    <p><strong>Headers:</strong> {data.metadata?.headers?.length || 'N/A'} columns</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default FileUpload;