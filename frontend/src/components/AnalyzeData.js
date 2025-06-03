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
  FaRobot, // Replace FaLightbulb with FaRobot
  FaExclamationTriangle
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

// Register Chart.js components
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
  
  // Add these new state variables
  const [selectedOption, setSelectedOption] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50); 
  
  // Add these near your other state declarations
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartType, setChartType] = useState('none');
  const [chart3DType, setChart3DType] = useState('none'); 
  const [availableColumns, setAvailableColumns] = useState([]);

  // Add these functions to handle chart type changes
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
      
      // For most chart types, Y should be numeric
      if (chartType !== 'none' && chartType !== 'pie' && chartType !== 'doughnut') {
        if (!isNumericData(fileData.data, yAxis)) {
          return (
            <div className="data-warning">
              <FaExclamationTriangle />
              <span>The selected Y-axis data contains non-numeric values. This may affect chart display.</span>
            </div>
          );
        }
      }
      
      // Scatter and bubble charts need numeric X and Y
      if ((chartType === 'scatter' || chartType === 'bubble') && !isNumericData(fileData.data, xAxis)) {
        return (
          <div className="data-warning">
            <FaExclamationTriangle />
            <span>Scatter/Bubble charts require numeric data for both axes. The X-axis contains non-numeric values.</span>
          </div>
        );
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
                // Only show 2D chart if 2D is selected and 3D is not
                <div className="chart-wrapper">
                  {renderChart()}
                </div>
              ) : chart3DType !== 'none' && chartType === 'none' ? (
                // Only show 3D placeholder if 3D is selected and 2D is not
                <div className="chart-placeholder">
                  <p>3D Chart will be displayed here</p>
                  <p>X-Axis: {xAxis}, Y-Axis: {yAxis}, Type: {chart3DType}</p>
                </div>
              ) : chartType !== 'none' && chart3DType !== 'none' ? (
                // If both are selected, show a message that only one can be used
                <div className="chart-warning">
                  <FaExclamationTriangle />
                  <p>Please select either a 2D chart type OR a 3D chart type, not both.</p>
                </div>
              ) : (
                // If neither chart type is selected
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
  
  // Add this function inside your AnalyzeData component

  const renderChart = () => {
    // Ensure we have data and selected axes
    if (!fileData || !fileData.data || fileData.data.length === 0 || !xAxis || !yAxis) {
      return null;
    }

    // Extract unique values for X-axis and corresponding Y values
    const processedData = processChartData(fileData.data, xAxis, yAxis);
    
    // Apply chart options
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              family: "'Poppins', sans-serif",
              size: 12
            }
          }
        },
        title: {
          display: true,
          text: `${yAxis} by ${xAxis}`,
          font: {
            family: "'Poppins', sans-serif",
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(46, 125, 50, 0.8)',
          titleFont: {
            family: "'Poppins', sans-serif",
            size: 14
          },
          bodyFont: {
            family: "'Poppins', sans-serif",
            size: 13
          },
          padding: 10,
          cornerRadius: 4
        }
      },
    };

    // Render the selected chart type
    switch (chartType) {
      case 'bar':
        return <Bar data={processedData} options={options} />;
      case 'line':
        return <Line data={processedData} options={{...options, tension: 0.2}} />;
      case 'pie':
        return <Pie data={processedData} options={options} />;
      case 'doughnut':
        return <Doughnut data={processedData} options={options} />;
      case 'scatter':
        return <Scatter data={processScatterData(fileData.data, xAxis, yAxis)} options={options} />;
      case 'polar':
        return <PolarArea data={processedData} options={options} />;
      case 'radar':
        return <Radar data={processedData} options={options} />;
      case 'area':
        return <Line 
          data={{
            ...processedData,
            datasets: [{
              ...processedData.datasets[0],
              fill: true,
              backgroundColor: 'rgba(76, 175, 80, 0.2)'
            }]
          }} 
          options={{...options, tension: 0.2}}
        />;
      case 'bubble':
        return <Bubble data={processBubbleData(fileData.data, xAxis, yAxis)} options={options} />;
      case 'column':
        return <Bar 
          data={processedData} 
          options={{
            ...options,
            indexAxis: 'x'
          }} 
        />;
      default:
        return null;
    }
  };
  
  // Add these functions inside your AnalyzeData component

  // Process data for most chart types (bar, line, pie, etc.)
  const processChartData = (data, xAxisKey, yAxisKey) => {
    // Group data by X axis value
    const groupedData = {};
    
    data.forEach(item => {
      const xValue = item[xAxisKey]?.toString() || 'Undefined';
      const yValue = parseFloat(item[yAxisKey]) || 0;
      
      if (!groupedData[xValue]) {
        groupedData[xValue] = [];
      }
      
      groupedData[xValue].push(yValue);
    });
    
    // Calculate averages for each X value
    const labels = Object.keys(groupedData);
    const values = labels.map(label => {
      const values = groupedData[label];
      const sum = values.reduce((acc, val) => acc + val, 0);
      return sum / values.length; // Average
    });
    
    // Get a nice shade of green
    const backgroundColor = labels.map((_, index) => {
      // Create different shades of green
      const opacity = 0.7 + (index % 3) * 0.1;
      // Use a simpler calculation instead of creating an unused variable
      return `rgba(56, ${120 + (index % 5) * 15}, 56, ${opacity})`;
    });
    
    const borderColor = labels.map((_, index) => {
      return `rgba(46, ${100 + (index % 5) * 15}, 46, 1)`;
    });
    
    return {
      labels,
      datasets: [
        {
          label: yAxisKey,
          data: values,
          backgroundColor,
          borderColor,
          borderWidth: 1,
        }
      ]
    };
  };

  // Process data for scatter plots
  const processScatterData = (data, xAxisKey, yAxisKey) => {
    const points = data.map(item => ({
      x: parseFloat(item[xAxisKey]) || 0,
      y: parseFloat(item[yAxisKey]) || 0
    }));
    
    return {
      datasets: [
        {
          label: `${yAxisKey} vs ${xAxisKey}`,
          data: points,
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: 'rgba(46, 125, 50, 1)',
          borderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  };

  // Process data for bubble charts
  const processBubbleData = (data, xAxisKey, yAxisKey) => {
    // Get a third dimension for bubble size - use index if no other field
    const bubblePoints = data.slice(0, 100).map((item, index) => ({
      x: parseFloat(item[xAxisKey]) || 0,
      y: parseFloat(item[yAxisKey]) || 0,
      r: (index % 10) + 5 // Random size between 5-15
    }));
    
    return {
      datasets: [
        {
          label: `${yAxisKey} vs ${xAxisKey}`,
          data: bubblePoints,
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: 'rgba(46, 125, 50, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // Helper to check if data is numeric
  const isNumericData = (data, key) => {
    if (!data || data.length === 0) return false;
    const sample = data.slice(0, 5);
    return sample.every(item => !isNaN(parseFloat(item[key])));
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

        {selectedFile && selectedOption === 'visualization' && (
          <div className="data-content-section">
            {renderDataVisualization()}
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