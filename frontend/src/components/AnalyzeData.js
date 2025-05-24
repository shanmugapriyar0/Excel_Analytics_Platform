import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  FaChartBar, 
  FaFileExcel, 
  FaFileCsv, 
  FaChevronDown, 
  FaFilter, 
  FaTable, 
  FaSearch, 
  FaRobot // Replace FaLightbulb with FaRobot
} from 'react-icons/fa';

const AnalyzeData = () => {
  const { user } = useSelector(state => state.auth);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Add these new state variables
  const [selectedOption, setSelectedOption] = useState(null); // 'preview', 'visualization', 'filtering', 'advanced', 'ai'
  const [fileData, setFileData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  
  // Add these state variables after your other state declarations
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50); // Fixed at 75 rows
  
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

          if (savedFileId && response.data.length > 0) {
            // Find the file with matching ID
            const savedFile = response.data.find(file => 
              file._id === savedFileId || file.fileId === savedFileId
            );
            if (savedFile) {
              setSelectedFile(savedFile);
            } else {
              // If not found, select the most recent file (first in the list)
              setSelectedFile(response.data[0]);
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

  // Memoize fetchFileData with useCallback to prevent unnecessary rerenders
  // Update the fetch function to properly handle Unicode data
  const fetchFileData = useCallback(async () => {
    if (!selectedFile) return;
    
    try {
      setDataLoading(true);
      setDataError(null);
      
      const token = user?.token || user?.accessToken || (user?.data?.token);
      
      if (!token) {
        setDataError('Authentication token not found. Please log in again.');
        setDataLoading(false);
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/api/excel/data/${selectedFile._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json; charset=utf-8'
        }
      });
      
      // Process data if needed
      const processedData = response.data;
      
      // Set state with the data
      setFileData(processedData);
      setDataLoading(false);
      
      // Reset to first page when loading new data
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching file data:', error);
      setDataError('Failed to load file data. Please try again later.');
      setDataLoading(false);
    }
  }, [selectedFile, user]);
  
  // Fix the useEffect dependency array
  useEffect(() => {
    // Reset file data when selected file changes
    if (selectedFile) {
      setFileData(null);
      setDataError(null);
      
      // If preview is already selected, fetch the new file data
      if (selectedOption === 'preview') {
        fetchFileData();
      }
    }
  }, [selectedFile, selectedOption, fetchFileData]); // Remove selectedFile?._id and add selectedFile
  
  const handleOptionSelect = (option) => {
    if (selectedFile) {
      setSelectedOption(option);
      
      // For preview option, fetch file data
      if (option === 'preview' && !fileData) {
        fetchFileData();
      }
    }
  };
  
  // Add this function to render the data preview
  const renderDataPreview = () => {
    if (dataLoading) {
      return (
        <div className="data-loading">
          <div className="loading-spinner"></div>
          <p>Loading data...</p>
        </div>
      );
    }
    
    if (dataError) {
      return (
        <div className="data-error">
          <p>{dataError}</p>
          <button onClick={fetchFileData} className="retry-button">Try Again</button>
        </div>
      );
    }
    
    if (!fileData || !fileData.data || fileData.data.length === 0) {
      return <div className="no-data-message">No data available for this file.</div>;
    }
    
    // Get headers from first row
    const headers = Object.keys(fileData.data[0]);
    const totalRows = fileData.data.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    
    // Calculate start and end index for current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    
    // Get current page data
    const currentPageData = fileData.data.slice(startIndex, endIndex);
    
    // Functions to handle pagination
    const goToNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };
    
    const goToPrevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };
    
    return (
      <div className="data-preview-container">
        <div className="data-preview-header">
          <h3>
            Data Preview: <span className="filename-text">{selectedFile.filename}</span>
          </h3>
          <div className="data-stats">
            <span>{totalRows} rows</span>
            <span>{headers.length} columns</span>
          </div>
        </div>
        
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((row, rowIndex) => (
                <tr key={rowIndex + startIndex}>
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} title="Click to view full content">
                      {row[header] !== undefined && row[header] !== null ? row[header].toString() : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="pagination-controls">
            <div className="pagination-info">
              Showing rows {startIndex + 1} to {endIndex} of {totalRows} total rows
            </div>
            <div className="pagination-buttons">
              <button 
                className="pagination-button"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="page-indicator">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className="pagination-button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  useEffect(() => {
    const setupCellExpansion = () => {
      const cells = document.querySelectorAll('.data-table td');
      
      cells.forEach(cell => {
        // Check if content is truncated
        if (cell.scrollWidth > cell.clientWidth) {
          cell.classList.add('has-more');
          
          cell.addEventListener('click', function() {
            const columnName = cell.closest('table').querySelector('th:nth-child(' + (Array.from(cell.parentNode.children).indexOf(cell) + 1) + ')').textContent;
            const cellContent = cell.textContent;
            
            // Set modal content
            document.getElementById('cellColumnName').textContent = columnName + ':';
            document.getElementById('cellContent').textContent = cellContent;
            
            // Show modal
            document.getElementById('cellContentModal').style.display = 'flex';
          });
        }
      });
      
      // Close modal when clicking outside
      document.getElementById('cellContentModal').addEventListener('click', function(e) {
        if (e.target === this) {
          this.style.display = 'none';
        }
      });
    };
    
    // Wait for table to render completely
    if (fileData && fileData.data && fileData.data.length > 0) {
      setTimeout(setupCellExpansion, 100);
    }
    
    // Cleanup
    return () => {
      const cells = document.querySelectorAll('.data-table td');
      cells.forEach(cell => {
        cell.removeEventListener('click', () => {});
      });
    };
  }, [fileData, currentPage, rowsPerPage]);
  
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
              <div 
                className={`option-card ${selectedOption === 'preview' ? 'active' : ''}`} 
                onClick={() => handleOptionSelect('preview')}
              >
                <div className="option-icon">
                  <FaTable />
                </div>
                <div className="option-details">
                  <h4>Data Preview</h4>
                  <p>View and explore the raw data</p>
                </div>
              </div>
              
              <div className="option-card" onClick={() => handleOptionSelect('visualization')}>
                <div className="option-icon">
                  <FaChartBar />
                </div>
                <div className="option-details">
                  <h4>Data Visualization</h4>
                  <p>Create charts and graphs</p>
                </div>
              </div>
              
              <div className="option-card" onClick={() => handleOptionSelect('filtering')}>
                <div className="option-icon">
                  <FaFilter />
                </div>
                <div className="option-details">
                  <h4>Data Filtering</h4>
                  <p>Filter and sort your data</p>
                </div>
              </div>
              
              <div className="option-card" onClick={() => handleOptionSelect('advanced')}>
                <div className="option-icon">
                  <FaSearch />
                </div>
                <div className="option-details">
                  <h4>Advanced Analysis</h4>
                  <p>Statistical analysis and insights</p>
                </div>
              </div>

              <div className="option-card" onClick={() => handleOptionSelect('ai')}>
                <div className="option-icon">
                  <FaRobot />
                </div>
                <div className="option-details">
                  <h4>AI Insights</h4>
                  <p>Get smart data summarization and recommendations</p>
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

        {selectedFile && selectedOption === 'preview' && (
          <div className="data-content-section">
            {renderDataPreview()}
          </div>
        )}
      </div>

      <div id="cellContentModal" className="cell-content-modal">
        <div className="cell-content-container">
          <div className="cell-content-header">
            <div className="cell-content-title">Cell Content</div>
            <button className="cell-content-close" onClick={() => document.getElementById('cellContentModal').style.display = 'none'}>×</button>
          </div>
          <div className="cell-content-body">
            <span className="cell-column-name" id="cellColumnName"></span>
            <div id="cellContent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeData;