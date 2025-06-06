/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback} from 'react';
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
  FaRobot, 
  FaExclamationTriangle,
  FaDownload,
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Scatter, Doughnut, PolarArea, Radar, Bubble } from 'react-chartjs-2';
import ThreeDChart from './ThreeDChart';
import AIInsights from './AIInsights';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyzeData = () => {
  const { user } = useSelector(state => state.auth);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50); 
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartType, setChartType] = useState('none');
  const [chart3DType, setChart3DType] = useState('none'); 
  const [availableColumns, setAvailableColumns] = useState([]);


  const handle2DChartTypeChange = (e) => {
    const newChartType = e.target.value;
    setChartType(newChartType);
    if (newChartType !== 'none') {
      setChart3DType('none');
    }
  };

  const handle3DChartTypeChange = (e) => {
    const new3DChartType = e.target.value;
    setChart3DType(new3DChartType);
    if (new3DChartType !== 'none') {
      setChartType('none');
    }
  };

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
const token = (user?.token || user?.accessToken) || user?.data?.token;
      
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
      
      // If preview or visualization is already selected, fetch the new file data
      if (selectedOption === 'preview' || selectedOption === 'visualization') {
        fetchFileData();
      }
    }
  }, [selectedFile, selectedOption, fetchFileData]); // Remove selectedFile?._id and add selectedFile
  
  const handleOptionSelect = (option) => {
    if (selectedFile) {
      setSelectedOption(option);
      
      // For preview or visualization options, fetch file data
      if ((option === 'preview' || option === 'visualization') && !fileData) {
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
  
  // New function to render data visualization
  const renderDataVisualization = () => {
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
    
    // Get headers/columns from the data and filter out empty ones
    const headers = Object.keys(fileData.data[0]).filter(column => 
      column && column.trim() !== "" && column !== "__empty"
    );
    
    // Check data types for selected axes
    const validateChartData = () => {
      if (!fileData || !fileData.data || fileData.data.length === 0 || !xAxis || !yAxis) {
        return null;
      }
      
      const isXNumeric = isNumericData(fileData.data, xAxis);
      const isYNumeric = isNumericData(fileData.data, yAxis);
      
      // Critical warning: Both axes are non-numeric (except for pie/doughnut)
      if (!isXNumeric && !isYNumeric && chartType !== 'none' && 
          chartType !== 'pie' && chartType !== 'doughnut') {
        return (
          <div className="data-warning-critical">
            <FaExclamationTriangle />
            <div className="warning-content">
              <p className="warning-text">Both selected columns contain text/non-numeric data.</p>
              <p className="warning-suggestion">Charts require at least one numeric axis to display data properly. Please select a column with numeric values for at least one axis.</p>
            </div>
          </div>
        );
      }
      
      // For pie and doughnut charts - SHOULD have one text column and one numeric column
      if ((chartType === 'pie' || chartType === 'doughnut')) {
        // If both columns are numeric or both are text, show warning but STILL render the chart
        if ((isXNumeric && isYNumeric) || (!isXNumeric && !isYNumeric)) {
          return (
            <div className="data-warning">
              <FaExclamationTriangle />
              <div className="warning-content">
                <p className="warning-text">Pie/Doughnut charts work best with one categorical column and one numeric column.</p>
                <p className="warning-suggestion">For best results, select one column with categories (text) and one with values (numbers).</p>
              </div>
            </div>
          );
        }
      }
      
      // For most chart types, Y should be numeric
      if (chartType !== 'none' && chartType !== 'pie' && chartType !== 'doughnut') {
        if (!isYNumeric) {
          return (
            <div className="data-warning">
              <FaExclamationTriangle />
              <div className="warning-content">
                <p className="warning-text">The Y-axis column "{yAxis}" contains non-numeric values.</p>
                <p className="warning-suggestion">For {chartType} charts, Y-axis should contain numbers. Consider switching the columns or selecting a different column.</p>
              </div>
            </div>
          );
        }
      }
      
      // Scatter and bubble charts need numeric X and Y
      if ((chartType === 'scatter' || chartType === 'bubble')) {
        if (!isXNumeric || !isYNumeric) {
          return (
            <div className="data-warning">
              <FaExclamationTriangle />
              <div className="warning-content">
                <p className="warning-text">The "{!isXNumeric ? xAxis : yAxis}" column contains non-numeric values.</p>
                <p className="warning-suggestion">Scatter/Bubble charts require numeric data for both axes. Try using a Bar or Column chart instead.</p>
              </div>
            </div>
          );
        }
      }
      
      return null;
    };
    
    const dataValidationMessage = validateChartData();
    
    return (
      <div className="data-visualization-container">
        <div className="data-preview-header">
          <h3>
            Data Visualization: <span className="filename-text">{selectedFile.filename}</span>
          </h3>
          <div className="data-stats">
            <span>{fileData.data.length} rows</span>
            <span>{headers.length} columns</span>
          </div>
        </div>
        
        <div className="chart-controls">
          <div className="axis-selectors">
            <div className="axis-selector">
              <label htmlFor="x-axis">X-Axis</label>
              <div className="axis-dropdown">
                <select 
                  id="x-axis" 
                  value={xAxis} 
                  onChange={(e) => setXAxis(e.target.value)}
                  className="axis-select"
                >
                  <option value="" disabled>Select X-Axis</option>
                  {headers.filter(column => 
                    column && column.trim() !== "" && column !== "__empty"
                  ).map((column) => (
                    <option key={`x-${column}`} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="axis-selector">
              <label htmlFor="y-axis">Y-Axis</label>
              <div className="axis-dropdown">
                <select 
                  id="y-axis" 
                  value={yAxis} 
                  onChange={(e) => setYAxis(e.target.value)}
                  className="axis-select"
                >
                  <option value="" disabled>Select Y-Axis</option>
                  {headers.filter(column => 
                    column && column.trim() !== "" && column !== "__empty"
                  ).map((column) => (
                    <option key={`y-${column}`} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="axis-selector">
              <label htmlFor="chart-type">Chart Type</label>
              <div className="axis-dropdown">
                <select
                  id="chart-type"
                  value={chartType}
                  onChange={handle2DChartTypeChange}  // Use the new handler
                  className="axis-select"
                >
                  <option value="none">None</option>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="scatter">Scatter Plot</option>
                  <option value="area">Area Chart</option>
                  <option value="doughnut">Doughnut Chart</option>
                  <option value="radar">Radar Chart</option>
                  <option value="bubble">Bubble Chart</option>
                  <option value="polar">Polar Area Chart</option>
                  <option value="column">Column Chart</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Add the new 3D chart type dropdown below the other dropdowns */}
          <div className="threed-chart-selector">
            <label htmlFor="3d-chart-type">3D Chart Type</label>
            <div className="axis-dropdown">
              <select
                id="3d-chart-type"
                value={chart3DType}
                onChange={handle3DChartTypeChange}  // Use the new handler
                className="axis-select"
              >
                <option value="none">None</option>
                <option value="3d-bar">3D Bar Chart</option>
                <option value="3d-pie">3D Pie Chart</option>
                <option value="3d-scatter">3D Scatter Plot</option>
                <option value="3d-surface">3D Surface Plot</option>
                <option value="3d-line">3D Line Chart</option>
                <option value="3d-area">3D Area Chart</option>
              </select>
            </div>
          </div>
        </div>
        
<div className="chart-container">
  {xAxis && yAxis ? (
    <div className="chart-area">
      {chartType !== 'none' && chart3DType === 'none' ? (
        <>
          {/* Check for both text-only data */}
          {!isNumericData(fileData.data, xAxis) && !isNumericData(fileData.data, yAxis) ? (
            <div className="chart-error-state">
              <div className="error-state-icon">
                <FaExclamationTriangle />
              </div>
              <h3>Cannot generate chart with text-only data</h3>
              <p>Both selected columns contain text/non-numeric data. Charts require at least one numeric axis to display data properly.</p>
            </div>
          /* Add this new condition to block numeric-only pie/doughnut charts */
          ) : ((chartType === 'pie' || chartType === 'doughnut') && 
                isNumericData(fileData.data, xAxis) && 
                isNumericData(fileData.data, yAxis)) ? (
            <div className="chart-error-state">
              <div className="error-state-icon">
                <FaExclamationTriangle />
              </div>
              <h3>Cannot generate pie chart with numeric-only data</h3>
              <p>Pie charts require at least one categorical column. Please select a text column for either the X or Y axis.</p>
            </div>
          ) : (
            <div className="chart-wrapper" data-charttype={chartType}>
              <div className="chart-controls-overlay">
                <button className="chart-download-btn" onClick={downloadChart} title="Download as PNG">
                  <FaDownload /> PNG
                </button>
              </div>
              {renderChart()}
            </div>
          )}
        </>
              ) : chart3DType !== 'none' && chartType === 'none' ? (
                <>
                  {!isNumericData(fileData.data, xAxis) && !isNumericData(fileData.data, yAxis) ? (
                    <div className="chart-error-state">
                      <div className="error-state-icon">
                        <FaExclamationTriangle />
                      </div>
                      <h3>Cannot generate 3D chart with text-only data</h3>
                      <p>Both selected columns contain text/non-numeric values. 3D charts require numeric data to display properly.</p>
                    </div>
                  ) : (chart3DType === '3d-pie' && isNumericData(fileData.data, xAxis) && isNumericData(fileData.data, yAxis)) ? (
                    <div className="chart-error-state">
                      <div className="error-state-icon">
                        <FaExclamationTriangle />
                      </div>
                      <h3>Cannot generate 3D pie chart with numeric-only data</h3>
                      <p>Pie charts require at least one categorical column. Please select a text column for either the X or Y axis.</p>
                    </div>
                  ) : (
                    <div className="chart-container">
                      <div className="chart-wrapper" data-charttype={chart3DType}>
                        <ThreeDChart 
                          data={prepare3DChartData(fileData.data, xAxis, yAxis, chart3DType)} 
                          chartType={chart3DType}
                          xAxis={xAxis}
                          yAxis={yAxis}
                        />
                        
                        {fileData?.data?.length > 500 && (
                          <div className="three-d-performance-warning">
                            <FaExclamationTriangle />
                            <span>
                              Your dataset contains {fileData.data.length.toLocaleString()} records. 
                              For better performance, the chart uses a sample of the data.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : chartType !== 'none' && chart3DType !== 'none' ? (
                <div className="chart-warning">
                  <FaExclamationTriangle />
                  <p>Please select either a 2D chart type OR a 3D chart type, not both.</p>
                </div>
              ) : (
                <div className="chart-empty-state">
                  <div className="empty-state-icon">
                    <FaChartBar />
                  </div>
                  <h3>Select a chart type to generate visualization</h3>
                  <p>Choose either a 2D or 3D chart type to visualize your data</p>
                </div>
              )}
            </div>
          ) : (
            <div className="chart-empty-state">
              <div className="empty-state-icon">
                <FaChartBar />
              </div>
              <h3>Select axis values and chart type to generate visualization</h3>
              <p>Choose columns from your data for the X and Y axes and select a chart type to visualize your data</p>
            </div>
          )}
        </div>
        
        {dataValidationMessage}
      </div>
    );
  };
  
  // Simplified processChartData function
  const processChartData = useCallback((data, xAxisKey, yAxisKey) => {
    // Check if this is a pie/doughnut chart
    const isPieType = chartType === 'pie' || chartType === 'doughnut';
    
    // Determine which is the category axis and which is the value axis
    const isXNumeric = isNumericData(data, xAxisKey);
    const isYNumeric = isNumericData(data, yAxisKey);
    
    // For pie/doughnut, set categoryKey to the text column, valueKey to the numeric column
    let categoryKey, valueKey;
    
    if (isPieType) {
      if (!isXNumeric && isYNumeric) {
        categoryKey = xAxisKey;
        valueKey = yAxisKey;
      } else if (isXNumeric && !isYNumeric) {
        categoryKey = yAxisKey;
        valueKey = xAxisKey;
      } else {
        categoryKey = xAxisKey;
        valueKey = yAxisKey;
      }
    }
    
    // Group data by X axis value
    const groupedData = {};
    
    data.forEach(item => {
      const xValue = isPieType 
        ? item[categoryKey]?.toString() || 'Undefined'
        : item[xAxisKey]?.toString() || 'Undefined';
        
      const yValue = isPieType
        ? parseFloat(item[valueKey]) || 0
        : parseFloat(item[yAxisKey]) || 0;
    
      if (!groupedData[xValue]) {
        groupedData[xValue] = [];
      }
      
      groupedData[xValue].push(yValue);
    });
    
    // Calculate values for each category
    let labels = Object.keys(groupedData);
    let values = labels.map(label => {
      const values = groupedData[label];
      const sum = values.reduce((acc, val) => acc + val, 0);
      return isPieType ? sum : sum / values.length; // For pie charts, use sum; otherwise average
    });
    
    // Limit the number of labels for readability
    if (labels.length > 30) {
      if (chartType === 'bar' || chartType === 'column') {
        labels = labels.slice(0, 15);
        values.splice(15);
      } else if (chartType === 'line' || chartType === 'area') {
        labels = labels.slice(0, 30);
        values.splice(30);
      } else if (chartType === 'radar') {
        labels = labels.slice(0, 12);
        values.splice(12);
      } else if (chartType === 'pie' || chartType === 'doughnut' || chartType === 'polar') {
        // Sort by value and keep top entries
        const combined = labels.map((label, i) => ({ label, value: values[i] }));
        combined.sort((a, b) => b.value - a.value);
        labels = combined.map(item => item.label).slice(0, 15);
        values = combined.map(item => item.value).slice(0, 15);
      }
    }
    
    // Create color palette based on the green theme
    const greenPalette = [
      'rgba(46, 125, 50, 0.9)',
      'rgba(76, 175, 80, 0.9)',
      'rgba(129, 199, 132, 0.9)',
      'rgba(27, 94, 32, 0.9)',
      'rgba(56, 142, 60, 0.9)',
      'rgba(102, 187, 106, 0.9)',
      'rgba(46, 125, 50, 0.7)',
      'rgba(76, 175, 80, 0.7)',
      'rgba(129, 199, 132, 0.7)',
      'rgba(27, 94, 32, 0.7)',
    ];
    
    // Extend palette if needed
    while (greenPalette.length < labels.length) {
      const baseColor = greenPalette[greenPalette.length % 10];
      const opacity = 0.5 + (Math.random() * 0.4);
      greenPalette.push(baseColor.replace(/[\d.]+\)$/, `${opacity})`));
    }
    
    // Get background and border colors based on chart type
    const backgroundColor = labels.map((_, index) => greenPalette[index % greenPalette.length]);
    
    const borderColor = labels.map((_, index) => {
      const bgColor = greenPalette[index % greenPalette.length];
      return bgColor.replace(/[\d.]+\)$/, '1)');
    });
    
    return {
      labels,
      datasets: [
        {
          label: isPieType ? categoryKey : yAxisKey,
          data: values,
          backgroundColor,
          borderColor,
          borderWidth: 1,
          hoverOffset: 10,
          hoverBorderWidth: 2,
        }
      ]
    };
  }, [chartType]);



  const renderChart = () => {
    
    // Ensure we have data and selected axes
    if (!fileData || !fileData.data || fileData.data.length === 0 || !xAxis || !yAxis) {
      return null;
    }
    const processedData = processChartData(fileData.data, xAxis, yAxis);
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              family: "'Poppins', sans-serif",
              size: 14, // Increased from 12
              weight: '500'
            },
            padding: 20,
            usePointStyle: true, // Use point style instead of rectangles for legend
            pointStyle: 'circle'
          }
        },
        title: {
          display: true,
          text: `${yAxis} by ${xAxis}`,
          font: {
            family: "'Poppins', sans-serif",
            size: 18, // Increased from 16
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 25
          },
          color: '#333'
        },
        tooltip: {
          backgroundColor: 'rgba(46, 125, 50, 0.85)',
          titleFont: {
            family: "'Poppins', sans-serif",
            size: 16 // Increased from 14
          },
          bodyFont: {
            family: "'Poppins', sans-serif",
            size: 14 // Increased from 13
          },
          padding: 12,
          cornerRadius: 6,
          displayColors: true,
          usePointStyle: true,
          callbacks: {
            // Format numbers with comma separators and 2 decimal places
            label: function(context) {
              let value = context.raw;
              if (typeof value === 'number') {
                return `${context.dataset.label}: ${value.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
                })}`;
              }
              return `${context.dataset.label}: ${value}`;
            }
          }
        }
      },
      elements: {
        point: {
          radius: 5, // Larger points
          hoverRadius: 8,
          borderWidth: 2,
          hoverBorderWidth: 3
        },
        line: {
          borderWidth: 3, // Thicker lines
          tension: 0.2 // Slight curve for line charts
        },
        bar: {
          borderWidth: 1,
          borderRadius: 4 // Rounded bars
        },
        arc: {
          borderWidth: 2
        }
      }
    };

    // Chart-specific options
    const specificOptions = {
      // For radar charts
      radar: {
        ...options,
        plugins: {
          ...options.plugins,
          legend: {
            ...options.plugins.legend,
            position: 'top',
            labels: {
              font: {
                family: "'Poppins', sans-serif",
                size: 14,
                weight: '500'
              }
            }
          },
          title: {
            ...options.plugins.title,
            padding: {
              top: 10,
              bottom: 30  // Increased padding at bottom
            }
          }
        },
        scales: {
          r: {
            min: 0,  // Always start from zero
            beginAtZero: true,
            angleLines: {
              color: 'rgba(0, 0, 0, 0.1)',
              lineWidth: 1
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              circular: true
            },
            pointLabels: {
              font: {
                family: "'Poppins', sans-serif",
                size: 11  // Smaller font size for labels
              },
              padding: 15,  // Increased padding
              centerPointLabels: false,
              display: true,
              callback: function(value) {
                // If the value is longer than 5 characters, truncate it
                if (value && value.length > 5) {
                  return value.substr(0, 5) + '...';
                }
                return value;
              }
            },
            ticks: {
              backdropColor: 'transparent',
              backdropPadding: 5,
              showLabelBackdrop: false,
              z: 1,  // Place ticks above grid
              font: {
                size: 10
              },
              count: 5  // Limit the number of ticks
            }
          }
        },
        elements: {
          line: {
            borderWidth: 2,
            tension: 0.1  // Less curve
          },
          point: {
            radius: 3,  // Smaller points
            hoverRadius: 5,
            hitRadius: 8,  // Larger hit area for interaction
            borderWidth: 2
          }
        }
      },
      // For polar area charts
      polarArea: {
        ...options,
        scales: {
          r: {
            beginAtZero: true,
            ticks: {
              backdropColor: 'transparent',
              font: {
                size: 12
              }
            }
          }
        }
      },
      // For pie and doughnut charts
      pie: {
        ...options,
        cutout: '0%',
        maintainAspectRatio: false,
        responsive: true,
        layout: {
          padding: {
            right: 30,
            left: 5,
            top: 15,
            bottom: 15
          }
        },
        plugins: {
          ...options.plugins,
          legend: {
            position: 'right',
            align: 'center',
            labels: {
              boxWidth: 18, // Increased from 12
              boxHeight: 18, // Increased from 12
              padding: 14, // Increased padding between items
              color: '#333',
              font: {
                size: 14, // Increased from 10
                family: "'Poppins', sans-serif",
                weight: '500' // Added weight for better readability
              },
              generateLabels: function(chart) {
                // Get default labels
                const original = ChartJS.overrides.pie.plugins.legend.labels.generateLabels(chart);
                
                // Truncate long labels
                return original.map(label => {
                  if (label.text && label.text.length > 12) { // Increased from 10
                    label.text = label.text.substring(0, 12) + '...';
                  }
                  return label;
                });
              }
            },
            maxHeight: 400, // Increased max height
            maxWidth: 300, // Increased max width for more text
            overflow: 'auto'
          },
          tooltip: {
            ...options.plugins.tooltip,
            titleFont: {
              size: 16,
              family: "'Poppins', sans-serif"
            },
            bodyFont: {
              size: 14,
              family: "'Poppins', sans-serif"
            },
            padding: 12,
            callbacks: {
              ...options.plugins.tooltip.callbacks,
              title: function(tooltipItems) {
                // Get the original full label
                const dataIndex = tooltipItems[0].dataIndex;
                return processedData.labels[dataIndex];
              }
            }
          }
        }
      },
      doughnut: {
        ...options,
        cutout: '60%',
        maintainAspectRatio: false,
        responsive: true,
        layout: {
          padding: {
            right: 30,
            left: 5,
            top: 15,
            bottom: 15
          }
        },
        plugins: {
          ...options.plugins,
          legend: {
            position: 'right',
            align: 'center',
            labels: {
              boxWidth: 18, // Increased from 12
              boxHeight: 18, // Increased from 12
              padding: 14, // Increased from 8
              color: '#333',
              font: {
                size: 14, // Increased from 10
                family: "'Poppins', sans-serif",
                weight: '500'
              },
              generateLabels: function(chart) {
                // Get default labels
                const original = ChartJS.overrides.pie.plugins.legend.labels.generateLabels(chart);
                
                // Truncate long labels
                return original.map(label => {
                  if (label.text && label.text.length > 12) { // Increased from 10
                    label.text = label.text.substring(0, 12) + '...';
                  }
                  return label;
                });
              }
            },
            maxHeight: 400, // Increased max height
            maxWidth: 300, // Increased max width for more text
            overflow: 'auto'
          },
          tooltip: {
            ...options.plugins.tooltip,
            titleFont: {
              size: 16,
              family: "'Poppins', sans-serif"
            },
            bodyFont: {
              size: 14,
              family: "'Poppins', sans-serif"
            },
            padding: 12,
            callbacks: {
              ...options.plugins.tooltip.callbacks,
              title: function(tooltipItems) {
                // Get the original full label
                const dataIndex = tooltipItems[0].dataIndex;
                return processedData.labels[dataIndex];
              }
            }
          }
        }
      }
    };

    // Add a visual indicator for data sampling
    const originalDataLength = Object.keys(processChartData(fileData.data, xAxis, yAxis)).length;
    const currentDataLength = processedData.labels.length;
    const samplingInfo = originalDataLength > currentDataLength ? 
      `(Showing ${currentDataLength} out of ${originalDataLength} data points)` : '';

    // Update chart title to show data sampling information
    if (samplingInfo) {
      options.plugins.title.text = [`${yAxis} by ${xAxis}`, samplingInfo];
      options.plugins.title.font = {
        family: "'Poppins', sans-serif",
        size: samplingInfo ? 16 : 18,
        weight: 'bold'
      };
    }

    // Render the selected chart type with enhanced styling
    switch (chartType) {
      case 'bar':
        return <Bar 
          data={processedData} 
          options={{
            ...options,
            indexAxis: 'y', // This makes the bars horizontal
            scales: {
              y: {
                grid: { display: false },
                ticks: { font: { size: 13 } }
              },
              x: {
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { font: { size: 13 } }
              }
            }
          }} 
        />;
      case 'line':
        return <Line 
          data={{
            ...processedData,
            datasets: processedData.datasets.map(dataset => ({
              ...dataset,
              pointBackgroundColor: dataset.borderColor,
              tension: 0.3
            }))
          }} 
          options={{
            ...options, 
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { size: 13 } }
              },
              y: {
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { font: { size: 13 } }
              }
            }
          }} 
        />;
      case 'pie':
        // Make sure to use the right column as category/value based on data type
        const isXNumeric = isNumericData(fileData.data, xAxis);
        const isYNumeric = isNumericData(fileData.data, yAxis);
        
        let pieData;
        
        // Special handling based on column types
        if ((!isXNumeric && isYNumeric) || (isXNumeric && !isYNumeric)) {
          // Ideal case: one text, one numeric column
          pieData = {...processedData};
        } else {
          // Both columns same type - convert data to make it work anyway
          pieData = {...processedData};
          
          // Add a visual indicator that this isn't ideal
          pieData.datasets[0].backgroundColor = pieData.datasets[0].backgroundColor.map(color => {
            // Make colors slightly more muted to indicate non-ideal data
            return color.replace('0.9', '0.7').replace('0.7', '0.5');
          });
        }
        
        // Sort for better visualization
        if (pieData.labels && pieData.labels.length > 0) {
          const items = pieData.labels.map((label, i) => ({
            label,
            value: pieData.datasets[0].data[i],
            backgroundColor: pieData.datasets[0].backgroundColor[i],
            borderColor: pieData.datasets[0].borderColor[i]
          }));
          
          // Sort by value descending
          items.sort((a, b) => b.value - a.value);
          
          // Update data
          pieData.labels = items.map(item => item.label);
          pieData.datasets[0].data = items.map(item => item.value);
          pieData.datasets[0].backgroundColor = items.map(item => item.backgroundColor);
          pieData.datasets[0].borderColor = items.map(item => item.borderColor);
        }
        
        return <Pie 
          data={pieData} 
          options={specificOptions.pie} 
        />;
      case 'doughnut':
        // Apply the same logic as pie chart for data type handling
        const dXNumeric = isNumericData(fileData.data, xAxis);
        const dYNumeric = isNumericData(fileData.data, yAxis);
        
        let doughnutData;
        
        // Special handling based on column types
        if ((!dXNumeric && dYNumeric) || (dXNumeric && !dYNumeric)) {
          // Ideal case: one text, one numeric column
          doughnutData = {...processedData};
        } else {
          // Both columns same type - convert data to make it work anyway
          doughnutData = {...processedData};
          
          // Add a visual indicator that this isn't ideal
          doughnutData.datasets[0].backgroundColor = doughnutData.datasets[0].backgroundColor.map(color => {
            // Make colors slightly more muted to indicate non-ideal data
            return color.replace('0.9', '0.7').replace('0.7', '0.5');
          });
        }
        
        // Sort for better visualization
        if (doughnutData.labels && doughnutData.labels.length > 0) {
          const items = doughnutData.labels.map((label, i) => ({
            label,
            value: doughnutData.datasets[0].data[i],
            backgroundColor: doughnutData.datasets[0].backgroundColor[i],
            borderColor: doughnutData.datasets[0].borderColor[i]
          }));
          
          // Sort by value descending
          items.sort((a, b) => b.value - a.value);
          
          // Update data
          doughnutData.labels = items.map(item => item.label);
          doughnutData.datasets[0].data = items.map(item => item.value);
          doughnutData.datasets[0].backgroundColor = items.map(item => item.backgroundColor);
          doughnutData.datasets[0].borderColor = items.map(item => item.borderColor);
        }
        
        return <Doughnut 
          data={doughnutData} 
          options={specificOptions.doughnut} 
        />;
      case 'scatter':
  return <Scatter 
    data={processScatterData(fileData.data, xAxis, yAxis)} 
    options={{
      ...options,
      scales: {
        x: {
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { font: { size: 13 } }
        },
        y: {
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { font: { size: 13 } }
        }
      },
      elements: {
        point: {
          radius: fileData.data.length > 200 ? 3 : 4,
          hoverRadius: 6,
          hoverBorderWidth: 2
        }
      },
      plugins: {
        ...options.plugins,
        tooltip: {
          ...options.plugins.tooltip,
          callbacks: {
            ...options.plugins.tooltip.callbacks,
            label: function(context) {
              return [
                `${xAxis}: ${context.raw.x}`,
                `${yAxis}: ${context.raw.y}`
              ];
            }
          }
        }
      }
    }} 
  />;
      case 'polar':
        return <PolarArea 
          data={processedData} 
          options={specificOptions.polarArea} 
        />;
      case 'radar':
        return <Radar 
          data={{
            ...processedData,
            datasets: [{
              ...processedData.datasets[0],
              pointBackgroundColor: processedData.datasets[0].borderColor,
              pointBorderColor: '#fff',
              borderJoinStyle: 'round',
              fill: true,
              backgroundColor: 'rgba(76, 175, 80, 0.2)'
            }]
          }} 
          options={specificOptions.radar} 
        />;
      case 'area':
        return <Line 
          data={{
            ...processedData,
            datasets: [{
              ...processedData.datasets[0],
              fill: true,
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              pointBackgroundColor: 'rgba(46, 125, 50, 1)',
              tension: 0.3
            }]
          }} 
          options={{
            ...options,
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { size: 13 } }
              },
              y: {
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { font: { size: 13 } }
              }
            }
          }} 
        />;
      case 'bubble':
  return <Bubble 
    data={processBubbleData(fileData.data, xAxis, yAxis)} 
    options={{
      ...options,
      scales: {
        x: {
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { font: { size: 13 } }
        },
        y: {
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { font: { size: 13 } }
        }
      },
      elements: {
        point: {
          // Configure hover effects for bubbles
          hoverRadius: 15, // Increase radius on hover
          hoverBorderWidth: 2,
          // Add transition effect on hover
          hitRadius: 10
        }
      },
      hover: {
        mode: 'nearest',
        intersect: true,
        animationDuration: 400
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      },
      plugins: {
        ...options.plugins,
        tooltip: {
          ...options.plugins.tooltip,
          callbacks: {
            ...options.plugins.tooltip.callbacks,
            label: function(context) {
              return [
                `${xAxis}: ${context.raw.x}`,
                `${yAxis}: ${context.raw.y}`
              ];
            }
          }
        }
      }
    }} 
  />;
      case 'column':
        return <Bar 
          data={processedData} 
          options={{
            ...options,
            indexAxis: 'x', // This is already correct (makes vertical columns)
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { size: 13 } }
              },
              y: {
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { font: { size: 13 } }
              }
            }
          }} 
        />;
      default:
        return null;
    }
  };
  

  // Process data for scatter plots
  const processScatterData = (data, xAxisKey, yAxisKey) => {
  // Check if we need to limit data points for performance
  const pointLimit = 500;
  let pointsData = data;
  
  if (data.length > pointLimit) {
    // Sample data for better performance
    const samplingInterval = Math.ceil(data.length / pointLimit);
    pointsData = data.filter((_, index) => index % samplingInterval === 0);
  }
  
  // Filter out invalid data points
  const validPoints = pointsData.filter(item => {
    const xValue = parseFloat(item[xAxisKey]);
    const yValue = parseFloat(item[yAxisKey]);
    return !isNaN(xValue) && !isNaN(yValue);
  });
  
  // Map to proper format for scatter plot - must have x and y properties
  const points = validPoints.map(item => ({
    x: parseFloat(item[xAxisKey]),
    y: parseFloat(item[yAxisKey])
  }));
  
  return {
    datasets: [
      {
        label: `${yAxisKey} vs ${xAxisKey}`,
        data: points,
        backgroundColor: points.map(() => {
          // Generate slightly different colors for points
          const baseColor = 'rgba(76, 175, 80,';
          const opacity = (Math.random() * 0.3 + 0.4).toFixed(2); // Between 0.4 and 0.7
          return `${baseColor} ${opacity})`;
        }),
        borderColor: 'rgba(46, 125, 50, 1)',
        borderWidth: 1,
        pointRadius: data.length > 200 ? 3 : 4, // Smaller points for large datasets
        pointHoverRadius: 6
      }
    ]
  };
};

  // Updated processBubbleData function to properly format bubble chart data
  const processBubbleData = (data, xAxisKey, yAxisKey) => {
    // Ensure both columns are numeric for bubble charts
    const isXNumeric = isNumericData(data, xAxisKey);
    const isYNumeric = isNumericData(data, yAxisKey);
  // Log warning if columns aren't numeric (but continue processing)
  if (!isXNumeric || !isYNumeric) {
    console.warn('Bubble chart works best with numeric columns. Some data points may be filtered out.');
  }
    // Limit points for performance
    const bubbleLimit = 200;
    
    // Filter data to include only rows with valid numeric values for both axes
    const validData = data.filter(item => {
      const xValue = parseFloat(item[xAxisKey]);
      const yValue = parseFloat(item[yAxisKey]);
      return !isNaN(xValue) && !isNaN(yValue);
    });
    
    // Sample data if needed
    let bubbleData = validData;
    if (validData.length > bubbleLimit) {
      const samplingInterval = Math.ceil(validData.length / bubbleLimit);
      bubbleData = validData.filter((_, index) => index % samplingInterval === 0).slice(0, bubbleLimit);
    }
    
    // Create proper bubble point objects with x, y, and r properties
    const bubblePoints = bubbleData.map((item, index) => {
      // Base bubble size
      const baseRadius = Math.max(4, Math.min(15, 
        (Math.abs(parseFloat(item[xAxisKey]) % 10) + 5) || (index % 10) + 5));
        
      return {
        x: parseFloat(item[xAxisKey]),
        y: parseFloat(item[yAxisKey]),
        r: baseRadius,
        // Add hover transition properties
        hoverBackgroundColor: 'rgba(76, 175, 80, 0.9)',
        hoverBorderColor: 'rgba(46, 125, 50, 1)',
        hoverBorderWidth: 2,
        // Hover radius will be handled by chart.js options
        originalRadius: baseRadius // Store original for custom hover handlers
      };
    });
    
    return {
      datasets: [{
        label: `${yAxisKey} vs ${xAxisKey}`,
        data: bubblePoints,
        backgroundColor: bubblePoints.map(() => {
          // Generate different colors for bubbles
          const hue = Math.floor(Math.random() * 60) + 100; // Green hues
          return `hsla(${hue}, 70%, 60%, 0.7)`;
        }),
        borderColor: 'rgba(46, 125, 50, 0.7)',
        borderWidth: 1,
        // Add transition properties
        transitionDuration: 750,
        hoverBackgroundColor: bubblePoints.map(() => 'rgba(76, 175, 80, 0.9)'),
        hoverBorderColor: 'rgba(46, 125, 50, 1)',
        hoverBorderWidth: 2
      }]
    };
  };

  // Helper to check if data is numeric
  const isNumericData = (data, key) => {
    if (!data || data.length === 0) return false;
    const sample = data.slice(0, 5);
    return sample.every(item => !isNaN(parseFloat(item[key])));
  };

  
  // Add this useEffect to handle cell expansion properly
useEffect(() => {
  // Define a named handler function that we can both add and remove
  const handleCellClick = (event) => {
    const cell = event.target;
    const columnName = document.querySelector('.data-table thead th:nth-child(' + (Array.from(cell.parentNode.children).indexOf(cell) + 1) + ')').textContent;
    
    document.getElementById('cellColumnName').textContent = columnName;
    document.getElementById('cellContent').textContent = cell.textContent || "Empty cell";
    document.getElementById('cellContentModal').style.display = 'flex';
  };
  
  // Define modal close handler at this scope level
  const handleModalOutsideClick = (e) => {
    if (e.target.id === 'cellContentModal') {
      document.getElementById('cellContentModal').style.display = 'none';
    }
  };
  
  const setupCellExpansion = () => {
    // Get all table cells
    const cells = document.querySelectorAll('.data-table td');
    
    // Add click event to each cell
    cells.forEach(cell => {
      cell.addEventListener('click', handleCellClick);
    });
    
    // Setup modal close handler
    const modal = document.getElementById('cellContentModal');
    if (modal) {
      modal.removeEventListener('click', handleModalOutsideClick); // Remove first to avoid duplicates
      modal.addEventListener('click', handleModalOutsideClick);
    }
  };
  
  // Wait for table to render completely
  if (fileData && fileData.data && fileData.data.length > 0) {
    setTimeout(setupCellExpansion, 100);
  }
  
  // Cleanup function - properly remove the exact same handler
  return () => {
    const cells = document.querySelectorAll('.data-table td');
    cells.forEach(cell => {
      cell.removeEventListener('click', handleCellClick);
    });
    
    const modal = document.getElementById('cellContentModal');
    if (modal) {
      modal.removeEventListener('click', handleModalOutsideClick);
    }
  };
}, [fileData, currentPage, rowsPerPage]);
  
  // Add a new useEffect to process column data when fileData changes
  useEffect(() => {
    if (fileData && fileData.data && fileData.data.length > 0) {
      // Extract column information
      const headers = Object.keys(fileData.data[0]);
      
      // Generate metadata about columns (type detection, etc)
      const columnsWithMetadata = headers.filter(header => 
        header && header.trim() !== "" && header !== "__empty"
      ).map(header => {
        // Try to detect if column is numeric
        const isNumeric = isNumericData(fileData.data, header);
        
        return {
          name: header,
          isNumeric,
          // Add any other metadata you might need
        };
      });
      
      setAvailableColumns(columnsWithMetadata);
    }
  }, [fileData]);
  
  // Add this function to your component
const prepare3DChartData = (data, xAxisKey, yAxisKey, chartType) => {
  const isXNumeric = isNumericData(data, xAxisKey);
  const isYNumeric = isNumericData(data, yAxisKey);
  
  // For 3D charts, both axes should ideally be numeric
  if (!isXNumeric || !isYNumeric) {
    // Try to convert text data to numeric indices for visualization
    const uniqueXValues = {};
    const uniqueYValues = {};
    
    data.forEach(item => {
      if (!isXNumeric) uniqueXValues[item[xAxisKey]] = true;
      if (!isYNumeric) uniqueYValues[item[yAxisKey]] = true;
    });
    
    const xMapping = Object.keys(uniqueXValues).reduce((acc, key, index) => {
      acc[key] = index;
      return acc;
    }, {});
    
    const yMapping = Object.keys(uniqueYValues).reduce((acc, key, index) => {
      acc[key] = index;
      return acc;
    }, {});
    
    // Create a modified dataset with numeric values
    return data.map(item => ({
      ...item,
      [xAxisKey]: isXNumeric ? parseFloat(item[xAxisKey]) : xMapping[item[xAxisKey]],
      [yAxisKey]: isYNumeric ? parseFloat(item[yAxisKey]) : yMapping[item[yAxisKey]]
    }));
  }
  
  // Sample data for better performance based on chart type
  let sampleSize = 500; // Default
  
  switch(chartType) {
    case '3d-surface':
      sampleSize = 300; // Surface plots can be performance-intensive
      break;
    case '3d-scatter':
      sampleSize = 500; // Scatter plots can handle more points
      break;
    case '3d-pie':
      sampleSize = 200; // Pie charts should be limited to fewer categories
      break;
    default:
      sampleSize = 400;
  }
  
  // If data is larger than sample size, take representative sample
  if (data.length > sampleSize) {
    const samplingInterval = Math.floor(data.length / sampleSize);
    return data.filter((_, index) => index % samplingInterval === 0).slice(0, sampleSize);
  }
  
  return data;
};
  
  const downloadChart = () => {
    const chartElement = document.querySelector(`.chart-wrapper[data-charttype="${chartType}"] canvas`);
    
    if (chartElement) {
      try {
        // Create loading indicator
        const chartContainer = document.querySelector('.chart-wrapper');
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'download-loading';
        loadingIndicator.innerHTML = 'Generating image...';
        loadingIndicator.style.position = 'absolute';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.backgroundColor = 'rgba(0,0,0,0.7)';
        loadingIndicator.style.color = 'white';
        loadingIndicator.style.padding = '10px 20px';
        loadingIndicator.style.borderRadius = '5px';
        loadingIndicator.style.zIndex = '1000';
        
        chartContainer.style.position = 'relative';
        chartContainer.appendChild(loadingIndicator);
        
        // Create a white background canvas for 2D charts
        setTimeout(() => { // Small delay to ensure loading indicator is shown
          // Create a temporary canvas with white background
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = chartElement.width;
          tempCanvas.height = chartElement.height;
          const tempCtx = tempCanvas.getContext('2d');
          
          // Fill with white background
          tempCtx.fillStyle = '#ffffff';
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          // Draw the original chart on top
          tempCtx.drawImage(chartElement, 0, 0);
          
          // Get the image with white background
          const dataUrl = tempCanvas.toDataURL('image/png', 1.0);
          const fileName = `${chartType}_chart_${xAxis}_vs_${yAxis}.png`;
          
          // Create download link
          const downloadLink = document.createElement('a');
          downloadLink.href = dataUrl;
          downloadLink.download = fileName;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          // Clean up
          chartContainer.removeChild(loadingIndicator);
        }, 100);
      } catch (error) {
        console.error('Error generating chart image:', error);
        alert('Failed to download chart. Please try again.');
        
        // Make sure to clean up loading indicator if there's an error
        const loadingIndicator = document.querySelector('.download-loading');
        if (loadingIndicator) {
          loadingIndicator.parentNode.removeChild(loadingIndicator);
        }
      }
    } else {
      alert('Chart not found. Please try again.');
    }
  };

  // Add to your component
const recordAnalysisActivity = async (fileId) => {
  try {
    await axios.post(`http://localhost:5000/api/excel/analyze/${fileId}`, {}, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });
  } catch (error) {
    console.error('Error recording analysis activity:', error);
    // Non-critical, so continue even if it fails
  }
};

// Call this when user performs analysis (e.g., when they generate a chart)
const handleGenerateChart = () => {
  // Existing chart generation code...
  
  // Record the analysis activity
  if (selectedFile && selectedFile._id) {
    recordAnalysisActivity(selectedFile._id);
  }
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
          </div
          >
          
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
              
              <div 
                className={`option-card ${selectedOption === 'visualization' ? 'active' : ''}`}
                onClick={() => handleOptionSelect('visualization')}
              >
                <div className="option-icon">
                  <FaChartBar />
                </div>
                <div className="option-details">
                  <h4>Data Visualization</h4>
                  <p>Create charts and graphs</p>
                </div>
              </div>
              
              <div 
                className={`option-card ${selectedOption === 'filtering' ? 'active' : ''}`}
                onClick={() => handleOptionSelect('filtering')}
              >
                <div className="option-icon">
                  <FaFilter />
                </div>
                <div className="option-details">
                  <h4>Data Filtering</h4>
                  <p>Filter and sort your data</p>
                </div>
              </div>
              
              <div 
                className={`option-card ${selectedOption === 'advanced' ? 'active' : ''}`}
                onClick={() => handleOptionSelect('advanced')}
              >
                <div className="option-icon">
                  <FaSearch />
                </div>
                <div className="option-details">
                  <h4>Advanced Analysis</h4>
                  <p>Statistical analysis and insights</p>
                </div>
              </div>

              <div 
                className={`option-card ${selectedOption === 'ai' ? 'active' : ''}`}
                onClick={() => handleOptionSelect('ai')}
              >
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

        {selectedFile && selectedOption === 'visualization' && (
          <div className="data-content-section">
            {renderDataVisualization()}
          </div>
        )}

        {selectedFile && selectedOption === 'ai' && (
          <div className="data-content-section ai-insights-section">
            <AIInsights 
              selectedFile={selectedFile} 
              user={user} 
            />
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