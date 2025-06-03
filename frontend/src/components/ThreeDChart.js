import React, { useEffect, useState, useRef} from 'react';
import Plot from 'react-plotly.js';

const ThreeDChart = ({ data, chartType, xAxis, yAxis }) => {
  const [plotData, setPlotData] = useState([]);
  const [layout, setLayout] = useState({});
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!data || !chartType || !xAxis || !yAxis) return;
    
    setLoading(true);
    
    try {
      // Process data based on chart type
      processDataForChart();
    } catch (error) {
      console.error('Error processing chart data:', error);
    } finally {
      setLoading(false);
    }
  }, [data, chartType, xAxis, yAxis]);
  
  const processDataForChart = () => {
    // Limit data points for performance
    const dataLimit = getDataLimitForChartType();
    const processedData = sampleData(data, dataLimit);
    
const newLayout = {
  title: `3D ${formatChartName(chartType)} of ${yAxis} vs ${xAxis}`,
  titlefont: { color: 'white' },
  autosize: true,
  height: 450,
  scene: {
    xaxis: { 
      title: xAxis,
      titlefont: { color: 'white' },
      tickfont: { color: 'white' },
      gridcolor: 'rgba(255, 255, 255, 0.1)',
      zerolinecolor: 'rgba(255, 255, 255, 0.3)'
    },
    yaxis: { 
      title: yAxis,
      titlefont: { color: 'white' },
      tickfont: { color: 'white' },
      gridcolor: 'rgba(255, 255, 255, 0.1)',
      zerolinecolor: 'rgba(255, 255, 255, 0.3)'
    },
    zaxis: { 
      title: 'Value',
      titlefont: { color: 'white' },
      tickfont: { color: 'white' },
      gridcolor: 'rgba(255, 255, 255, 0.1)',
      zerolinecolor: 'rgba(255, 255, 255, 0.3)'
    },
    camera: getCameraPosition(),
    aspectmode: 'cube',
    bgcolor: 'rgb(17, 17, 17)'
  },
  margin: { l: 0, r: 0, b: 0, t: 40 },
  paper_bgcolor: 'rgb(17, 17, 17)', // Dark background
  plot_bgcolor: 'rgb(17, 17, 17)',
  font: { 
    family: "'Poppins', sans-serif",
    color: 'white'
  },
  showlegend: true,
  legend: { 
    x: 0.8, 
    y: 0.9,
    font: { color: 'white' }
  }
};
    
    // Create chart data based on type
    switch(chartType) {
      case '3d-bar':
        create3DBarChart(processedData, newLayout);
        break;
      case '3d-scatter':
        create3DScatterChart(processedData, newLayout);
        break;
      case '3d-surface':
        create3DSurfaceChart(processedData, newLayout);
        break;
      case '3d-line':
        create3DLineChart(processedData, newLayout);
        break;
      case '3d-area':
        create3DAreaChart(processedData, newLayout);
        break;
      case '3d-pie':
        create3DPieChart(processedData, newLayout);
        break;
      default:
        create3DScatterChart(processedData, newLayout);
    }
  };
  
  // Helper functions for chart creation
  
const create3DBarChart = (processedData, newLayout) => {

  
  // Group data appropriately
  const groupedData = groupData(processedData, xAxis, yAxis);
  
  // Create x, y, z coordinates for 3D bar chart
  const x = Object.keys(groupedData);
  const y = Object.values(groupedData).map(item => item.avg);
  
  // Create the proper 3D bar representation
  const plotData = [];
  
  // For each bar, create a separate 3D mesh
  x.forEach((xVal, i) => {
    // Define bar coordinates
    const barWidth = 0.7; // Width of each bar
    const barDepth = 0.7; // Depth of each bar
    const spacing = 1.0; // Spacing between bars
    
    // Calculate bar position
    const xPos = i * spacing;
    const yPos = 0;
    const zPos = 0;
    
    // Bar height from data
    const height = y[i];
    
    // Define the 8 corners of the bar
    const x_bar = [
      xPos - barWidth/2, xPos + barWidth/2, xPos + barWidth/2, xPos - barWidth/2,
      xPos - barWidth/2, xPos + barWidth/2, xPos + barWidth/2, xPos - barWidth/2
    ];
    
    const y_bar = [
      yPos - barDepth/2, yPos - barDepth/2, yPos + barDepth/2, yPos + barDepth/2,
      yPos - barDepth/2, yPos - barDepth/2, yPos + barDepth/2, yPos + barDepth/2
    ];
    
    const z_bar = [
      zPos, zPos, zPos, zPos,
      zPos + height, zPos + height, zPos + height, zPos + height
    ];
    
    // Define the faces of the bar (triangles making up the 6 faces)
    const i_bar = [
      0, 1, 2, 0, 2, 3, // bottom face
      4, 5, 6, 4, 6, 7, // top face
      0, 1, 5, 0, 5, 4, // side face
      1, 2, 6, 1, 6, 5, // side face
      2, 3, 7, 2, 7, 6, // side face
      3, 0, 4, 3, 4, 7  // side face
    ];
    
    // Calculate bar color based on value
    const normalizedValue = (height - Math.min(...y)) / (Math.max(...y) - Math.min(...y) || 1);
    const colorIntensity = Math.floor(normalizedValue * 255);
    
    // Add the bar to the plot
    plotData.push({
      type: 'mesh3d',
      x: x_bar,
      y: y_bar,
      z: z_bar,
      i: i_bar.filter((_, idx) => idx % 3 === 0),
      j: i_bar.filter((_, idx) => idx % 3 === 1),
      k: i_bar.filter((_, idx) => idx % 3 === 2),
      color: `rgb(${46 + colorIntensity}, ${125 + colorIntensity/3}, ${50})`,
      opacity: 0.9,
      flatshading: true,
      name: xVal,
      showlegend: false,
      hovertemplate: 
        `<b>${xAxis}</b>: ${xVal}<br>` +
        `<b>${yAxis}</b>: ${y[i].toFixed(2)}<br>` +
        `<extra></extra>`
    });
  });
  
  // Set the data
  setPlotData(add3DBarLegend(processedData, plotData));
  
  // Update layout for bar chart with better camera position
  newLayout.scene.camera = {
    eye: { x: 2, y: -2, z: 1.5 }
  };
  
  // Add axis labels
  newLayout.scene.xaxis.title = xAxis;
  newLayout.scene.yaxis.title = '';  // Empty y-axis title for cleaner look
  newLayout.scene.zaxis.title = yAxis;
  
  // Add custom axis ticks for the x-axis with the actual category names
  newLayout.scene.xaxis.tickvals = x.map((_, i) => i * 1.0); // Match positions with bar centers
  newLayout.scene.xaxis.ticktext = x;
  newLayout.scene.xaxis.tickangle = 45; // Angle the labels for better readability
  
  setLayout(newLayout);
};
  
  const create3DLineChart = (processedData, newLayout) => {
    // Sort data points by x-axis for proper line connectivity
    const sortedData = [...processedData].sort((a, b) => 
      parseFloat(a[xAxis]) - parseFloat(b[xAxis])
    );
    
    // Extract coordinates
    const x = sortedData.map(item => parseFloat(item[xAxis]) || 0);
    const y = sortedData.map(item => parseFloat(item[yAxis]) || 0);
    
    // Generate z values as function of index to create 3D effect
    const z = Array(x.length).fill(0).map((_, i) => i * 0.1);
    
    setPlotData([{
      type: 'scatter3d',
      mode: 'lines',
      x: x,
      y: y,
      z: z,
      line: {
        color: 'rgba(46, 125, 50, 1)',
        width: 6
      },
      hovertemplate: 
        `<b>${xAxis}</b>: %{x}<br>` +
        `<b>${yAxis}</b>: %{y}<br>` +
        `<extra></extra>`,
    }]);
    
    // Add points to the line
    setPlotData(prev => [...prev, {
      type: 'scatter3d',
      mode: 'markers',
      x: x,
      y: y,
      z: z,
      marker: {
        size: 5,
        color: 'rgba(76, 175, 80, 0.9)',
        line: {
          color: 'rgba(27, 94, 32, 1)',
          width: 1
        }
      },
      hovertemplate: 
        `<b>${xAxis}</b>: %{x}<br>` +
        `<b>${yAxis}</b>: %{y}<br>` +
        `<extra></extra>`,
      showlegend: false
    }]);
    
    // Update layout
    newLayout.scene.camera = {
      eye: { x: 1.25, y: -1.25, z: 0.5 }
    };
    
    setLayout(newLayout);
  };
  
  const create3DAreaChart = (processedData, newLayout) => {
    // Sort data for line connectivity
    const sortedData = [...processedData].sort((a, b) => 
      parseFloat(a[xAxis]) - parseFloat(b[xAxis])
    );
    
    // Extract coordinates
    const x = sortedData.map(item => parseFloat(item[xAxis]) || 0);
    const y = sortedData.map(item => parseFloat(item[yAxis]) || 0);
    const z = Array(x.length).fill(0).map((_, i) => i * 0.1);
    
    // Create base points (at z=0) to form the area
    const x_area = [...x, ...x.reverse()];
    const y_area = [...y, ...Array(y.length).fill(Math.min(...y))];
    const z_area = [...z, ...Array(z.length).fill(0)];
    
    setPlotData([{
      type: 'mesh3d',
      x: x_area,
      y: y_area,
      z: z_area,
      opacity: 0.8,
      color: 'rgba(76, 175, 80, 0.7)',
      flatshading: true,
      hovertemplate: 
        `<b>${xAxis}</b>: %{x}<br>` +
        `<b>${yAxis}</b>: %{y}<br>` +
        `<extra></extra>`,
    }]);
    
    // Add line at the top of the area
    setPlotData(prev => [...prev, {
      type: 'scatter3d',
      mode: 'lines',
      x: x,
      y: y,
      z: z,
      line: {
        color: 'rgba(46, 125, 50, 1)',
        width: 4
      },
      hovertemplate: 
        `<b>${xAxis}</b>: %{x}<br>` +
        `<b>${yAxis}</b>: %{y}<br>` +
        `<extra></extra>`,
      showlegend: false
    }]);
    
    // Update layout
    newLayout.scene.camera = {
      eye: { x: 1.25, y: -1.25, z: 0.75 }
    };
    
    setLayout(newLayout);
  };
  
  const create3DPieChart = (processedData, newLayout) => {
    // For 3D pie, we need to aggregate categorical data
    const isXNumeric = !isNaN(parseFloat(processedData[0][xAxis]));
    const isYNumeric = !isNaN(parseFloat(processedData[0][yAxis]));
    
    // Determine category and value columns
    const categoryCol = !isXNumeric ? xAxis : (!isYNumeric ? yAxis : xAxis);
    const valueCol = isXNumeric ? xAxis : (isYNumeric ? yAxis : xAxis);
    
    // Aggregate data by category
    const pieData = {};
    processedData.forEach(item => {
      const category = item[categoryCol]?.toString() || 'Unknown';
      const value = parseFloat(item[valueCol]) || 0;
      
      if (!pieData[category]) {
        pieData[category] = 0;
      }
      pieData[category] += value;
    });
    
    // Prepare values and labels
    const labels = Object.keys(pieData);
    const values = Object.values(pieData);
    
    // Generate 3D coordinates for pie segments
    const theta = Array(labels.length).fill(0).map((_, i) => 
      (2 * Math.PI * i) / labels.length);
    
    // Place pie segments in a circle
    const x = theta.map(angle => Math.cos(angle) * 10);
    const y = theta.map(angle => Math.sin(angle) * 10);
    const z = values.map(v => Math.max(1, Math.log10(v) * 2));
    
    // Create color array
    const colors = Array(labels.length).fill(0).map((_, i) => 
      `rgba(${46 + i*8}, ${125 + i*4}, ${50 + i*3}, 0.8)`);
    
    setPlotData([{
      type: 'scatter3d',
      mode: 'markers',
      x: x,
      y: y,
      z: z,
      text: labels.map((l, i) => `${l}: ${values[i]}`),
      marker: {
        size: values.map(v => Math.max(10, Math.min(30, Math.sqrt(v) * 2))),
        color: colors,
        symbol: 'circle',
        opacity: 0.9,
        line: {
          color: 'rgba(46, 125, 50, 1)',
          width: 1
        }
      },
      hovertemplate: 
        '<b>%{text}</b><br>' +
        '<extra></extra>',
    }]);
    
    // Create connecting lines to origin for 3D pie effect
    const x_lines = [];
    const y_lines = [];
    const z_lines = [];
    
    x.forEach((xVal, i) => {
      x_lines.push(0, xVal, null);
      y_lines.push(0, y[i], null);
      z_lines.push(0, z[i], null);
    });
    
    setPlotData(prev => [...prev, {
      type: 'scatter3d',
      mode: 'lines',
      x: x_lines,
      y: y_lines,
      z: z_lines,
      line: {
        color: 'rgba(46, 125, 50, 0.5)',
        width: 1
      },
      hoverinfo: 'none',
      showlegend: false
    }]);
    
    // Update layout for 3D pie
    newLayout.title = `3D Distribution of ${categoryCol} by ${valueCol}`;
    newLayout.scene.camera = {
      up: { x: 0, y: 0, z: 1 },
      center: { x: 0, y: 0, z: 0 },
      eye: { x: 1.25, y: 1.25, z: 1.25 }
    };
    
    setLayout(newLayout);
  };
  
  // Helper functions
  
  const getDataLimitForChartType = () => {
    switch(chartType) {
      case '3d-surface': 
        return 300;  // Surface charts need more data points
      case '3d-scatter': 
        return 500;  // Scatter plots can handle more points
      case '3d-pie': 
        return 100;  // Pie charts should aggregate categories
      default: 
        return 300;
    }
  };
  
  const sampleData = (dataArray, limit) => {
    if (!dataArray || dataArray.length <= limit) {
      return dataArray;
    }
    
    const samplingInterval = Math.ceil(dataArray.length / limit);
    return dataArray.filter((_, index) => index % samplingInterval === 0);
  };
  
  const sampleArray = (arr, size) => {
    if (arr.length <= size) return arr;
    
    const result = [];
    const step = arr.length / size;
    
    for (let i = 0; i < size; i++) {
      const index = Math.floor(i * step);
      result.push(arr[index]);
    }
    
    return result;
  };
  
  const formatChartName = (type) => {
    return type
      .replace('3d-', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const groupData = (data, xKey, yKey) => {
    const result = {};
    
    data.forEach(item => {
      const key = item[xKey]?.toString() || 'Unknown';
      const value = parseFloat(item[yKey]) || 0;
      
      if (!result[key]) {
        result[key] = { sum: 0, count: 0, avg: 0 };
      }
      
      result[key].sum += value;
      result[key].count++;
    });
    
    // Calculate averages
    Object.keys(result).forEach(key => {
      result[key].avg = result[key].sum / result[key].count;
    });
    
    return result;
  };
  
  const getCameraPosition = () => {
    switch(chartType) {
      case '3d-bar':
        return { eye: { x: 1.5, y: -1.5, z: 0.75 } };
      case '3d-surface':
        return { eye: { x: 1.87, y: 0.88, z: 0.64 } };
      case '3d-pie':
        return { eye: { x: 1.25, y: 1.25, z: 1.25 } };
      default:
        return { eye: { x: 1.25, y: -1.25, z: 0.5 } };
    }
  };
  
  // Add this after the create3DBarChart function
const add3DBarLegend = (processedData, chartData) => {
  // Create a special hidden scatter trace that only shows in the legend
  const groupedData = groupData(processedData, xAxis, yAxis);
  const categories = Object.keys(groupedData);
  const values = Object.values(groupedData).map(item => item.avg);
  
  // For each category, add a legend item
  const legendItems = categories.map((cat, i) => {
    const normalizedValue = (values[i] - Math.min(...values)) / (Math.max(...values) - Math.min(...values) || 1);
    const colorIntensity = Math.floor(normalizedValue * 255);
    
    return {
      type: 'scatter3d',
      mode: 'markers',
      x: [null], 
      y: [null], 
      z: [null],
      name: `${cat} (${values[i].toFixed(2)})`,
      marker: {
        color: `rgb(${46 + colorIntensity}, ${125 + colorIntensity/3}, ${50})`,
        size: 10
      },
      showlegend: true,
      legendgroup: `group-${i}`
    };
  });
  
  // Add the legend items to the chart data
  return [...chartData, ...legendItems];
};
  
  const create3DScatterChart = (processedData, newLayout) => {
    // Create x, y, z coordinates for 3D scatter chart
    const x = processedData.map(item => parseFloat(item[xAxis]) || 0);
    const y = processedData.map(item => parseFloat(item[yAxis]) || 0);
    
    // Generate z values (could be a third column or derived from x and y)
    // Use a formula to create an interesting z-axis variation
    const z = x.map((xVal, i) => {
      return Math.abs((xVal * y[i]) / 100);
    });
    
    // Find min/max for color normalization
    const zMin = Math.min(...z);
    const zMax = Math.max(...z);
    
    setPlotData([{
      type: 'scatter3d',
      mode: 'markers',
      x: x,
      y: y,
      z: z,
      marker: {
        // Use zMin and zMax for better scaling of point sizes based on z value
        size: z.map(val => Math.max(3, Math.min(15, 3 + 12 * (val - zMin) / (zMax - zMin || 1)))),
        color: z,
        colorscale: [
          [0, 'rgba(76, 175, 80, 0.5)'],      // Light green
          [0.33, 'rgba(76, 175, 80, 0.8)'],    // Medium green
          [0.66, 'rgba(46, 125, 50, 0.9)'],    // Darker green
          [1, 'rgba(27, 94, 32, 1)']           // Darkest green
        ],
        // Set color scale range using zMin and zMax
        cmin: zMin,
        cmax: zMax,
        line: {
          color: 'rgba(27, 94, 32, 0.5)',
          width: 0.5
        },
        opacity: 0.8,
        colorbar: {
          title: 'Value',
          tickfont: { color: 'white' },
          titlefont: { color: 'white' }
        }
      },
      hovertemplate: 
        `<b>${xAxis}</b>: %{x}<br>` +
        `<b>${yAxis}</b>: %{y}<br>` +
        `<b>Value</b>: %{z}<br>` +
        `<extra></extra>`,
    }]);
    
    // Update camera position for better scatter plot view
    newLayout.scene.camera = {
      eye: { x: 1.5, y: -1.5, z: 1.25 }
    };
    
    setLayout(newLayout);
  };
  
// Add this function after create3DScatterChart
const create3DSurfaceChart = (processedData, newLayout) => {
  // For a surface plot, we need a grid of z-values
  // First, identify unique x and y values
  const uniqueX = [...new Set(processedData.map(item => parseFloat(item[xAxis]) || 0))].sort((a, b) => a - b);
  const uniqueY = [...new Set(processedData.map(item => parseFloat(item[yAxis]) || 0))].sort((a, b) => a - b);
  
  // Limit grid size for performance
  const gridSize = Math.min(uniqueX.length, uniqueY.length, 50);
  const sampledX = sampleArray(uniqueX, gridSize);
  const sampledY = sampleArray(uniqueY, gridSize);
  
  // Create a z-value matrix
  const z = Array(sampledY.length).fill().map(() => Array(sampledX.length).fill(0));
  
  // Fill z-matrix with values or approximations
  sampledY.forEach((yVal, yIndex) => {
    sampledX.forEach((xVal, xIndex) => {
      // Find closest data point or use calculated value
      const closestPoint = processedData.find(item => 
        Math.abs(parseFloat(item[xAxis]) - xVal) < 0.01 && 
        Math.abs(parseFloat(item[yAxis]) - yVal) < 0.01
      );
      
      if (closestPoint) {
        // Use actual data point if available
        z[yIndex][xIndex] = parseFloat(closestPoint[yAxis]) || 0;  // Use yAxis as z value
      } else {
        // Generate surface value as function of x and y
        z[yIndex][xIndex] = Math.sin(xVal/5) * Math.cos(yVal/5) * 10;
      }
    });
  });
  
  setPlotData([{
    type: 'surface',
    x: sampledX,
    y: sampledY,
    z: z,
    colorscale: [
      [0, 'rgba(76, 175, 80, 0.5)'],      // Light green
      [0.33, 'rgba(76, 175, 80, 0.8)'],    // Medium green
      [0.66, 'rgba(46, 125, 50, 0.9)'],    // Darker green
      [1, 'rgba(27, 94, 32, 1)']           // Darkest green
    ],
    contours: {
      z: {
        show: true,
        usecolormap: true,
        highlightcolor: "rgba(46, 125, 50, 1)",
        width: 2
      }
    },
    hovertemplate: 
      `<b>${xAxis}</b>: %{x}<br>` +
      `<b>${yAxis}</b>: %{y}<br>` +
      `<b>Value</b>: %{z}<br>` +
      `<extra></extra>`,
  }]);
  
  // Update layout for surface chart
  newLayout.scene.camera = {
    eye: { x: 1.87, y: 0.88, z: 0.64 }
  };
  
  setLayout(newLayout);
};
  
  if (loading) {
    return (
      <div className="three-d-chart-container loading">
        <div className="chart-loading-spinner"></div>
        <p>Rendering 3D chart...</p>
      </div>
    );
  }
  
  return (
    <div className="three-d-chart-container" ref={containerRef}>
      <Plot
        data={plotData}
        layout={layout}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ 
          responsive: true,
          displayModeBar: true,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
          displaylogo: false
        }}
      />
    </div>
  );
};

export default ThreeDChart;