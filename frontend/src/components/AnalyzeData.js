import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaChartBar, FaFileExcel, FaFileCsv, FaChevronDown, FaFilter, FaTable, FaSearch } from 'react-icons/fa';

const AnalyzeData = () => {
  const { user } = useSelector(state => state.auth);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Memoize fetchFiles with useCallback
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get authentication token
      const token = user?.token || user?.accessToken || (user?.data?.token);
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/excel/files', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setFiles(response.data);
      
      // Get the saved file ID
      const savedFileId = localStorage.getItem('selectedFileId');
      console.log("Looking for saved file ID:", savedFileId);

      if (savedFileId && response.data.length > 0) {
        // Find the file with matching ID
        const savedFile = response.data.find(file => 
          file._id === savedFileId || file.fileId === savedFileId
        );
        
        console.log("Found matching file:", savedFile ? savedFile.filename : "None");
        
        // Select it if found
        if (savedFile) {
          setSelectedFile(savedFile);
        } else {
          // If not found, select the most recent file (first in the list)
          setSelectedFile(response.data[0]);
          console.log("Using most recent file instead:", response.data[0].filename);
          // Update localStorage with this ID
          localStorage.setItem('selectedFileId', response.data[0]._id);
        }
      } else if (response.data.length > 0) {
        // If no saved ID but files exist, select the most recent one
        setSelectedFile(response.data[0]);
        localStorage.setItem('selectedFileId', response.data[0]._id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files. Please try again later.');
      setLoading(false);
    }
  }, [user]);
  
  // useEffect to fetch files when component mounts
  useEffect(() => {
    // Store the fetch promise so we can cancel it if needed
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = user?.token || user?.accessToken || (user?.data?.token);
        
        if (!token) {
          if (isMounted) {
            setError('Authentication token not found. Please log in again.');
            setLoading(false);
          }
          return;
        }
        
        const response = await axios.get('http://localhost:5000/api/excel/files', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal
        });
        
        if (isMounted) {
          setFiles(response.data);
          
          // Get the saved file ID
          const savedFileId = localStorage.getItem('selectedFileId');
          console.log("Looking for saved file ID:", savedFileId);

          if (savedFileId && response.data.length > 0) {
            // Find the file with matching ID
            const savedFile = response.data.find(file => 
              file._id === savedFileId || file.fileId === savedFileId
            );
            
            console.log("Found matching file:", savedFile ? savedFile.filename : "None");
            
            // Select it if found
            if (savedFile) {
              setSelectedFile(savedFile);
            } else {
              // If not found, select the most recent file (first in the list)
              setSelectedFile(response.data[0]);
              console.log("Using most recent file instead:", response.data[0].filename);
              // Update localStorage with this ID
              localStorage.setItem('selectedFileId', response.data[0]._id);
            }
          } else if (response.data.length > 0) {
            // If no saved ID but files exist, select the most recent one
            setSelectedFile(response.data[0]);
            localStorage.setItem('selectedFileId', response.data[0]._id);
          }
          
          setLoading(false);
        }
      } catch (error) {
        // Only update state if component is still mounted
        if (isMounted && !axios.isCancel(error)) {
          console.error('Error fetching files:', error);
          setError('Failed to load files. Please try again later.');
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [user]);
  
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setDropdownOpen(false);
    
    // Save the selection to localStorage
    localStorage.setItem('selectedFileId', file._id);
  };
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  // Format date to more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="analyze-data-container">
      <div className="analyze-header">
        <div className="analyze-title">
          <h2>Data Analysis</h2>
          <p>Select a file to analyze and visualize your data</p>
        </div>
      </div>
      
      <div className="analyze-content">
        <div className="file-selection-section">
          <div className="section-header">
            <h3>1. Select File for Analysis</h3>
            <p>Choose from your uploaded Excel or CSV files</p>
          </div>
          
          <div className="file-selector">
            <div className="file-dropdown">
              <button 
                className="dropdown-button" 
                onClick={toggleDropdown}
                disabled={loading || files.length === 0}
              >
                {loading ? (
                  <span className="loading-text">Loading files...</span>
                ) : selectedFile ? (
                  <div className="selected-file-info">
                    {selectedFile.filename.toLowerCase().endsWith('.csv') ? 
                      <FaFileCsv className="file-icon csv-icon" /> : 
                      <FaFileExcel className="file-icon excel-icon" />
                    }
                    <span className="file-name">{selectedFile.filename}</span>
                  </div>
                ) : files.length > 0 ? (
                  <span className="placeholder-text">Select a file for analysis</span>
                ) : (
                  <span className="placeholder-text">No files available</span>
                )}
                <FaChevronDown className={`dropdown-icon ${dropdownOpen ? 'open' : ''}`} />
              </button>
              
              {dropdownOpen && files.length > 0 && (
                <div className="dropdown-menu">
                  {files.map((file) => (
                    <div 
                      key={file._id} 
                      className={`dropdown-item ${selectedFile && selectedFile._id === file._id ? 'active' : ''}`}
                      onClick={() => handleFileSelect(file)}
                    >
                      <div className="dropdown-item-content">
                        {file.filename.toLowerCase().endsWith('.csv') ? 
                          <FaFileCsv className="file-icon csv-icon" /> : 
                          <FaFileExcel className="file-icon excel-icon" />
                        }
                        <div className="file-details">
                          <span className="file-name">{file.filename}</span>
                          <span className="file-meta">
                            {file.metadata?.rowCount || '?'} rows • Uploaded {formatDate(file.uploadDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchFiles} className="retry-button">Try Again</button>
            </div>
          )}
          
          {files.length === 0 && !loading && !error && (
            <div className="no-files-message">
              <p>You haven't uploaded any files yet. Go to the File Upload section to upload files for analysis.</p>
            </div>
          )}
        </div>
        
        {selectedFile && (
          <div className="analysis-options-section">
            <div className="section-header">
              <h3>2. Choose Analysis Options</h3>
              <p>Select how you want to analyze your data</p>
            </div>
            
            <div className="analysis-options">
              <div className="option-card">
                <div className="option-icon">
                  <FaTable />
                </div>
                <div className="option-details">
                  <h4>Data Preview</h4>
                  <p>View and explore the raw data</p>
                </div>
              </div>
              
              <div className="option-card">
                <div className="option-icon">
                  <FaChartBar />
                </div>
                <div className="option-details">
                  <h4>Data Visualization</h4>
                  <p>Create charts and graphs</p>
                </div>
              </div>
              
              <div className="option-card">
                <div className="option-icon">
                  <FaFilter />
                </div>
                <div className="option-details">
                  <h4>Data Filtering</h4>
                  <p>Filter and sort your data</p>
                </div>
              </div>
              
              <div className="option-card">
                <div className="option-icon">
                  <FaSearch />
                </div>
                <div className="option-details">
                  <h4>Advanced Analysis</h4>
                  <p>Statistical analysis and insights</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedFile && files.length > 0 && (
          <div className="no-selection-message">
            <p>Please select a file from the dropdown to begin analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzeData;