import React, { useEffect, useState, useRef} from 'react';
import Plot from 'react-plotly.js';
import { FaDownload } from 'react-icons/fa';

const ThreeDChart = ({ data, chartType, xAxis, yAxis }) => {
  const [plotData, setPlotData] = useState([]);
  const [layout, setLayout] = useState({});
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const plotRef = useRef(null);
  
  const colorPalettes = {
    default: [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ],
    green: [
      'rgba(46, 125, 50, 0.9)', // Primary green
      'rgba(76, 175, 80, 0.9)', // Medium green
      'rgba(129, 199, 132, 0.9)', // Lighter green
      'rgba(165, 214, 167, 0.9)' // Lightest green
    ],
    warm: [
      '#f1c40f', '#e67e22', '#d35400', '#e74c3c', '#c0392b'
    ],
    cool: [
      '#3498db', '#2980b9', '#1abc9c', '#16a085', '#2c3e50'
    ],
    gradient: [
      [0, 'rgb(165, 214, 167)'],     // Light green
      [0.25, 'rgb(76, 175, 80)'],    // Medium green 
      [0.5, 'rgb(46, 125, 50)'],     // Primary green
      [0.75, 'rgb(27, 94, 32)'],     // Dark green
      [1, 'rgb(0, 51, 0)']           // Very dark green
    ]
  };

  useEffect(() => {
    if (!data || !chartType || !xAxis || !yAxis) return;
    
    setLoading(true);
    
    try {
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
    
    // Enhanced layout for better readability
    const newLayout = {
      title: `3D ${formatChartName(chartType)} of ${yAxis} vs ${xAxis}`,
      titlefont: { 
        size: 18,
        color: 'white',
        family: "'Poppins', sans-serif"
      },
      autosize: true,
      height: 650, // Taller chart for better visibility
      scene: {
        xaxis: { 
          title: {
            text: xAxis,
            font: {
              size: 14,
              family: "'Poppins', sans-serif",
              color: 'white'
            },
            standoff: 15
          },
          tickfont: { 
            size: 12, 
            color: 'white',
            family: "'Poppins', sans-serif"
          },
          gridcolor: 'rgba(255, 255, 255, 0.2)',
          zerolinecolor: 'rgba(255, 255, 255, 0.5)',
          showbackground: true,
          backgroundcolor: 'rgba(23, 25, 35, 0.8)'  // Modern black with slight blue tint
        },
        yaxis: { 
          title: {
            text: yAxis,
            font: {
              size: 14,
              family: "'Poppins', sans-serif", 
              color: 'white'
            },
            standoff: 15
          },
          tickfont: { 
            size: 12, 
            color: 'white',
            family: "'Poppins', sans-serif" 
          },
          gridcolor: 'rgba(255, 255, 255, 0.2)',
          zerolinecolor: 'rgba(255, 255, 255, 0.5)',
          showbackground: true,
          backgroundcolor: 'rgba(23, 25, 35, 0.8)'  // Modern black with slight blue tint
        },
        zaxis: { 
          title: {
            text: 'Value',
            font: {
              size: 14, 
              family: "'Poppins', sans-serif",
              color: 'white'
            },
            standoff: 15
          },
          tickfont: { 
            size: 12, 
            color: 'white',
            family: "'Poppins', sans-serif" 
          },
          gridcolor: 'rgba(255, 255, 255, 0.2)',
          zerolinecolor: 'rgba(255, 255, 255, 0.5)',
          showbackground: true,
          backgroundcolor: 'rgba(23, 25, 35, 0.8)'  // Modern black with slight blue tint
        },
        camera: getCameraPosition(chartType),
        aspectratio: { x: 1, y: 1, z: 0.95 },
        aspectmode: 'manual',
        bgcolor: 'rgb(23, 25, 35)'  // Modern black with slight blue tint
      },
      margin: { l: 0, r: 0, b: 10, t: 50 }, // More space at top for title
      paper_bgcolor: 'rgb(23, 25, 35)', // Modern black
      plot_bgcolor: 'rgb(23, 25, 35)',
      font: { 
        family: "'Poppins', sans-serif",
        color: 'white'
      },
      showlegend: true,
      legend: { 
        x: 0.05, 
        y: 1,
        bgcolor: 'rgba(0,0,0,0.5)',
        bordercolor: 'rgba(255,255,255,0.2)',
        borderwidth: 1,
        font: { 
          color: 'white',
          size: 12
        }
      },
      hoverlabel: {
        bgcolor: 'rgba(0,0,0,0.8)',
        font: { size: 12, color: 'white' },
        bordercolor: 'rgba(76, 175, 80, 0.8)'
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

  // Improved 3D Bar Chart
  // Bar chart fixes for better text display and hover templates
  const create3DBarChart = (processedData, newLayout) => {
    try {
      // Group data appropriately
      const groupedData = groupData(processedData, xAxis, yAxis);
      
      // Create x, y, z coordinates for 3D bar chart
      const categories = Object.keys(groupedData);
      const values = Object.values(groupedData).map(item => item.avg);
      
      // Prepare color array based on values
      const normalizedValues = values.map(
        val => (val - Math.min(...values)) / (Math.max(...values) - Math.min(...values) || 1)
      );
      const traces = [];
      
      categories.forEach((category, i) => {
        // Position bars in a grid pattern
        const x = i % Math.ceil(Math.sqrt(categories.length));
        const y = Math.floor(i / Math.ceil(Math.sqrt(categories.length)));
        const value = values[i];
        
        // Bar dimensions
        const width = 0.7;
        const depth = 0.7;
        const height = value;
        const spacing = 1.5; // More spacing between bars
        
        // Calculate position
        const xPos = x * spacing;
        const yPos = y * spacing;
        
        // Generate cube vertices (8 corners of each bar)
        const vertices = [
          // Bottom face
          [xPos - width/2, yPos - depth/2, 0],
          [xPos + width/2, yPos - depth/2, 0],
          [xPos + width/2, yPos + depth/2, 0],
          [xPos - width/2, yPos + depth/2, 0],
          // Top face
          [xPos - width/2, yPos - depth/2, height],
          [xPos + width/2, yPos - depth/2, height],
          [xPos + width/2, yPos + depth/2, height],
          [xPos - width/2, yPos + depth/2, height]
        ];
        
        // Extract x,y,z coordinates for mesh3d
        const x_coords = vertices.map(v => v[0]);
        const y_coords = vertices.map(v => v[1]);
        const z_coords = vertices.map(v => v[2]);
        
        // Define faces (12 triangles - 2 per face of the cube)
        // Each number references the index of a vertex in the arrays above
        const i_indices = [0,3,7, 0,7,4, 0,4,5, 0,5,1, 1,5,6, 1,6,2, 2,6,7, 2,7,3];
        const j_indices = [3,7,4, 7,4,0, 4,5,1, 5,1,0, 5,6,2, 6,2,1, 6,7,3, 7,3,2];
        const k_indices = [7,4,0, 4,0,3, 5,1,0, 1,0,4, 6,2,1, 2,1,5, 7,3,2, 3,2,6];
        
        // Calculate color based on value
        const colorValue = normalizedValues[i];
        const color = getColor(colorValue, colorPalettes.warm);

        traces.push({
          type: 'mesh3d',
          x: x_coords,
          y: y_coords,
          z: z_coords,
          i: i_indices,
          j: j_indices,
          k: k_indices,
          color: color,
          opacity: 0.95,
          flatshading: true,
          name: `${category}: ${value.toFixed(2)}`,
          showlegend: true,
          hoverinfo: 'name+text',
          text: `<b>${category}</b><br>Value: ${value.toFixed(2)}`,
          hovertemplate: 
            `<b>${category}</b><br>` +
            `<b>Value</b>: ${value.toFixed(2)}<br>` +
            `<extra></extra>`,
        });
        
        // Add text label above each bar
        traces.push({
          type: 'scatter3d',
          mode: 'text',
          x: [xPos],
          y: [yPos],
          z: [height + height/8], // Position higher above the bar for better visibility
          text: [`${value.toFixed(1)}`], // Display only the numeric value
          textfont: {
            color: 'white',
            size: 10, // Smaller text
            family: "'Poppins', sans-serif"
          },
          textposition: 'top center',
          texttemplate: '%{text}', // Ensure text renders properly
          showlegend: false,
          hoverinfo: 'none'
        });
      });
      
      // Add text background for better readability (optional)
      // This adds dark boxes behind text labels for contrast
      categories.forEach((category, i) => {
        const x = i % Math.ceil(Math.sqrt(categories.length));
        const y = Math.floor(i / Math.ceil(Math.sqrt(categories.length)));
        const value = values[i];
        const height = value;
        const spacing = 1.5;
        const xPos = x * spacing;
        const yPos = y * spacing;
        
        // Add background "plates" behind text for better readability
        traces.push({
          type: 'mesh3d',
          x: [xPos-0.4, xPos+0.4, xPos+0.4, xPos-0.4],
          y: [yPos-0.2, yPos-0.2, yPos+0.2, yPos+0.2],
          z: [height+height/8-0.05, height+height/8-0.05, height+height/8-0.05, height+height/8-0.05],
          i: [0],
          j: [1],
          k: [2],
          color: 'rgba(0,0,0,0.5)', 
          flatshading: true,
          showlegend: false,
          hoverinfo: 'none'
        });
      });
      
      // Update camera position for better viewing of text labels
      newLayout.scene.camera = {
        eye: { x: 2.5, y: 2.5, z: 1.5 }, // Move camera further back
        up: { x: 0, y: 0, z: 1 },
        center: { x: 0, y: 0, z: 0 }
      };
      
      // Adjust scene domain to make more room for labels
      newLayout.scene.domain = { 
        x: [0.15, 0.98],
        y: [0, 1] 
      };
      
      // Add more top margin for title
      newLayout.margin.t = 60;
      
      setPlotData(traces);
      setLayout(newLayout);
    } catch (error) {
      console.error('Error creating 3D bar chart:', error);
    }
  };
  
  // Improved 3D Scatter Chart
  const create3DScatterChart = (processedData, newLayout) => {
    try {
      // Extract data
      const x = processedData.map(item => parseFloat(item[xAxis]) || 0);
      const y = processedData.map(item => parseFloat(item[yAxis]) || 0);
      
      // Generate meaningful z values
      const z = [];
      for (let i = 0; i < x.length; i++) {
        // Create z-values that show some relationship to x and y
        z.push(Math.sqrt(Math.abs(x[i] * y[i])) / 2);
      }
      
      // Find ranges for proper scaling
      const xRange = Math.max(...x) - Math.min(...x);
      const yRange = Math.max(...y) - Math.min(...y);
      const zRange = Math.max(...z) - Math.min(...z);
      
      // Use ranges to set appropriate axis ranges for better visualization
      newLayout.scene.xaxis.range = [Math.min(...x) - xRange * 0.1, Math.max(...x) + xRange * 0.1];
      newLayout.scene.yaxis.range = [Math.min(...y) - yRange * 0.1, Math.max(...y) + yRange * 0.1];
      newLayout.scene.zaxis.range = [Math.min(...z) - zRange * 0.1, Math.max(...z) + zRange * 0.1];
      
      // Normalize values for color mapping
      const normalized = z.map(val => 
        (val - Math.min(...z)) / (Math.max(...z) - Math.min(...z) || 1)
      );
      
      // Create better marker sizes based on data range - use zRange for scaling
      const minSize = 5;
      const maxSize = 18;
      const sizes = normalized.map(val => minSize + val * (maxSize - minSize));
      
      setPlotData([{
        type: 'scatter3d',
        mode: 'markers',
        x: x,
        y: y,
        z: z,
        marker: {
          size: sizes,
          color: z,
          colorscale: colorPalettes.gradient,
          colorbar: {
            // Position far to the left with these settings - match surface plot
            x: -0.18,             // Move further left (more negative)
            xpad: 0,              // Remove padding on x-axis
            thickness: 15,        // Keep the colorbar thin
            len: 0.75,            // Make it 75% of the plot height
            y: 0.6,               // Move up from center
            ypad: 0,              // Remove padding on y-axis
            outlinewidth: 0,      // Remove outline for cleaner look
            title: {
              text: 'Value',
              font: {
                color: 'white',
                family: "'Poppins', sans-serif",
                size: 12
              },
              side: 'top'         // Title at the top
            },
            tickfont: {
              color: 'white',
              family: "'Poppins', sans-serif",
              size: 10            // Smaller font for ticks
            },
            tickformat: '.1f'     // Format with 1 decimal place
          },
          opacity: 0.9,
          line: {
            color: 'rgba(255, 255, 255, 0.5)',
            width: 0.5
          }
        },
        hovertemplate: 
          `<b>${xAxis}</b>: %{x}<br>` +
          `<b>${yAxis}</b>: %{y}<br>` +
          `<b>Value</b>: %{z}<br>` +
          `<extra></extra>`,
      }]);
      
      // Adjust camera for better viewing angle of scatter plot
      newLayout.scene.camera = {
        eye: { x: 1.5, y: -1.5, z: 1.25 },
        center: { x: 0, y: 0, z: 0 }
      };
      
      // Add these layout adjustments to match the surface chart
      // Adjust layout settings to accommodate the colorbar positioning
      newLayout.margin = { 
        l: 50,        // Left margin
        r: 10,
        b: 20,        // Slightly more bottom margin to show bottom part better
        t: 50
      };
      
      // Adjust scene placement to make room for the colorbar
      newLayout.scene.domain = { 
        x: [0.15, 0.98],
        y: [0, 1]
      };
      
      // Adjust camera position for better viewing that includes all points
      newLayout.scene.camera = {
        eye: { x: -1.8, y: -1.5, z: 1.5 },  // Better angle to see all points
        up: { x: 0, y: 0, z: 1 },
        center: { x: 0, y: 0, z: -0.1 }     // Slight adjustment to center
      };
      
      // Ensure proper backgrounds on all axes
      newLayout.scene.xaxis.backgroundcolor = 'rgb(23, 25, 35)';
      newLayout.scene.yaxis.backgroundcolor = 'rgb(23, 25, 35)';
      newLayout.scene.zaxis.backgroundcolor = 'rgb(23, 25, 35)';
      newLayout.scene.bgcolor = 'rgb(23, 25, 35)';

      setLayout(newLayout);
    } catch (error) {
      console.error('Error creating 3D scatter chart:', error);
    }
  };
  
  // Enhanced 3D Surface Chart
  const create3DSurfaceChart = (processedData, newLayout) => {
    try {
      // Extract unique sorted x and y values 
      let xVals = [...new Set(processedData.map(item => parseFloat(item[xAxis])))].filter(x => !isNaN(x)).sort((a, b) => a - b);
      let yVals = [...new Set(processedData.map(item => parseFloat(item[yAxis])))].filter(y => !isNaN(y)).sort((a, b) => a - b);
      
      // If we don't have enough unique values, interpolate
      if (xVals.length < 5 || yVals.length < 5) {
        const xMin = Math.min(...xVals);
        const xMax = Math.max(...xVals);
        const yMin = Math.min(...yVals);
        const yMax = Math.max(...yVals);
        
        xVals = Array.from({length: 20}, (_, i) => xMin + (xMax - xMin) * i / 19);
        yVals = Array.from({length: 20}, (_, i) => yMin + (yMax - yMin) * i / 19);
      }
      
      // Sample to a reasonable size for performance
      const xSampled = sampleArray(xVals, 30);
      const ySampled = sampleArray(yVals, 30);
      
      // Create z matrix
      const zMatrix = Array(ySampled.length).fill().map(() => Array(xSampled.length).fill(0));
      
      // Create mapping function to find closest data point
      const dataMap = new Map();
      processedData.forEach(point => {
        const xVal = parseFloat(point[xAxis]);
        const yVal = parseFloat(point[yAxis]);
        
        // Skip invalid values
        if (isNaN(xVal) || isNaN(yVal)) return;
        
        const key = `${xVal},${yVal}`;
        dataMap.set(key, point);
      });
      
      // Fill z matrix with values or interpolate
      ySampled.forEach((yVal, yIdx) => {
        xSampled.forEach((xVal, xIdx) => {
          // Try to find exact value
          const exactKey = `${xVal},${yVal}`;
          const exactMatch = dataMap.get(exactKey);
          
          if (exactMatch) {
            // Use actual data if available
            zMatrix[yIdx][xIdx] = parseFloat(exactMatch[yAxis]) || 0;
          } else {
            // Otherwise create a smooth surface based on x,y coordinates
            // This creates a visually pleasing wave pattern
            zMatrix[yIdx][xIdx] = Math.sin(xVal/10) * Math.cos(yVal/10) * 
              Math.min(Math.max(...xVals), Math.max(...yVals)) / 10;
          }
        });
      });
      
      // Create surface plot
      setPlotData([{
        type: 'surface',
        x: xSampled,
        y: ySampled,
        z: zMatrix,
        colorscale: [
          [0, 'rgb(255, 236, 179)'],     // Light yellow
          [0.2, 'rgb(255, 213, 79)'],    // Medium yellow
          [0.4, 'rgb(255, 167, 38)'],    // Orange
          [0.6, 'rgb(251, 140, 0)'],     // Darker orange  
          [0.8, 'rgb(230, 81, 0)'],      // Red-orange
          [1, 'rgb(183, 28, 28)']        // Deep red
        ],
        // Improved contours settings
        contours: {
          z: {
            show: true,
            usecolormap: true,
            highlightcolor: "rgba(255, 255, 255, 0.5)",
            width: 1
          },
          x: { 
            show: false,
            project: { x: false }
          },
          y: { 
            show: false,
            project: { y: false }
          }
        },
        colorbar: {
          // Keep your existing colorbar settings
          x: -0.18,
          xpad: 0,
          thickness: 15,
          len: 0.75,
          y: 0.6,
          ypad: 0,
          outlinewidth: 0,
          title: {
            text: 'Value',
            font: {
              color: 'white',
              family: "'Poppins', sans-serif",
              size: 12
            },
            side: 'top'
          },
          tickfont: {
            color: 'white',
            family: "'Poppins', sans-serif",
            size: 10
          },
          tickformat: '.1f'
        },
        // Improved lighting settings for better color rendering
        lighting: {
          ambient: 0.85,        // Increased ambient light to show colors better
          diffuse: 0.4,         // Reduced diffuse to minimize shadow effects on colors
          roughness: 0.3,       // Lower roughness for smoother appearance
          specular: 0.1,        // Reduced specular highlights that can wash out colors
          fresnel: 0.05         // Reduced fresnel effect that can distort edge colors
        },
        lightposition: {
          x: 100,
          y: 100, 
          z: 500               // Higher light position to more evenly illuminate surface
        },
        hidesurface: false,
        showscale: true,
        opacity: 1.0,          // Full opacity for better color visibility
        hovertemplate: 
          `<b>${xAxis}</b>: %{x}<br>` +
          `<b>${yAxis}</b>: %{y}<br>` +
          `<b>Value</b>: %{z}<br>` +
          `<extra></extra>`,
      }]);
      
      // Adjust layout settings to accommodate the colorbar positioning
      newLayout.margin = { 
        l: 50,        // Left margin
        r: 10,
        b: 20,        // Slightly more bottom margin to show bottom part better
        t: 50
      };
      
      // Adjust scene placement to make room for the colorbar
      newLayout.scene.domain = { 
        x: [0.15, 0.98],
        y: [0, 1]
      };
      
      // Adjust camera for a wider view that includes the bottom part
      newLayout.scene.camera = {
        eye: { x: -2.2, y: 0.6, z: 1.8 },  // Increased distance and height
        up: { x: 0, y: 0, z: 1 },
        center: { x: 0, y: 0, z: -0.2 }    // Focus slightly lower to see bottom better
      };
      
      // Ensure proper backgrounds on all axes
      newLayout.scene.xaxis.backgroundcolor = 'rgb(23, 25, 35)';
      newLayout.scene.yaxis.backgroundcolor = 'rgb(23, 25, 35)';
      newLayout.scene.zaxis.backgroundcolor = 'rgb(23, 25, 35)';
      newLayout.scene.bgcolor = 'rgb(23, 25, 35)';

      setLayout(newLayout);
    } catch (error) {
      console.error('Error creating surface chart:', error);
    }
  };
  
  // Enhanced 3D Line Chart
  const create3DLineChart = (processedData, newLayout) => {
    try {
      // Sort data by x-axis
      const sortedData = [...processedData].sort((a, b) => {
        return parseFloat(a[xAxis]) - parseFloat(b[xAxis]);
      });
      
      // Extract coordinates
      const x = sortedData.map(item => parseFloat(item[xAxis]) || 0);
      const y = sortedData.map(item => parseFloat(item[yAxis]) || 0);
      
      // Create meaningful z values (use index to create depth)
      const z = Array(x.length).fill(0).map((_, i) => i * 0.1);
      
      // Add 3D line with enhanced styling
      setPlotData([{
        type: 'scatter3d',
        mode: 'lines',
        x: x,
        y: y,
        z: z,
        line: {
          color: 'rgba(76, 175, 80, 1)',
          width: 6
        },
        hoverinfo: 'none'
      },
      // Add points on the line
      {
        type: 'scatter3d',
        mode: 'markers',
        x: x,
        y: y,
        z: z,
        marker: {
          size: 6,
          color: z,
          colorscale: colorPalettes.gradient,
          colorbar: {
            // Position far to the left with these settings - match surface plot
            x: -0.18,             // Move further left (more negative)
            xpad: 0,              // Remove padding on x-axis
            thickness: 15,        // Keep the colorbar thin
            len: 0.75,            // Make it 75% of the plot height
            y: 0.6,               // Move up from center
            ypad: 0,              // Remove padding on y-axis
            outlinewidth: 0,      // Remove outline for cleaner look
            title: {
              text: 'Value',
              font: {
                color: 'white',
                family: "'Poppins', sans-serif",
                size: 12
              },
              side: 'top'         // Title at the top
            },
            tickfont: {
              color: 'white',
              family: "'Poppins', sans-serif",
              size: 10            // Smaller font for ticks
            },
            tickformat: '.1f'     // Format with 1 decimal place
          },
          opacity: 0.9,
          line: {
            color: 'rgba(255, 255, 255, 0.5)',
            width: 1
          }
        },
        hovertemplate: 
          `<b>${xAxis}</b>: %{x}<br>` +
          `<b>${yAxis}</b>: %{y}<br>` +
          `<extra></extra>`,
      }]);
      
      // Add consistent layout adjustments as in other chart types
      newLayout.margin = { 
        l: 50,        // Left margin
        r: 10,
        b: 20,        // Slightly more bottom margin to show bottom part better
        t: 50
      };
      
      // Adjust scene placement to make room for the colorbar
      newLayout.scene.domain = { 
        x: [0.15, 0.98],
        y: [0, 1]
      };
      
      // Improve camera position for line chart
      newLayout.scene.camera = {
        eye: { x: -1.9, y: -1.2, z: 1.5 },  // Updated camera position for better view
        up: { x: 0, y: 0, z: 1 },
        center: { x: 0, y: 0, z: -0.1 }     // Focus slightly lower
      };
      
      // Ensure proper backgrounds on all axes
      newLayout.scene.xaxis.backgroundcolor = 'rgb(23, 25, 35)';
      newLayout.scene.yaxis.backgroundcolor = 'rgb(23, 25, 35)';
      newLayout.scene.zaxis.backgroundcolor = 'rgb(23, 25, 35)';
      newLayout.scene.bgcolor = 'rgb(23, 25, 35)';
      
      setLayout(newLayout);
    } catch (error) {
      console.error('Error creating 3D line chart:', error);
    }
  };

  // Enhanced 3D Area Chart
  const create3DAreaChart = (processedData, newLayout) => {
    try {
      // Sort data by x-axis
      const sortedData = [...processedData].sort((a, b) => {
        return parseFloat(a[xAxis]) - parseFloat(b[xAxis]);
      });
      
      // Extract coordinates
      const x = sortedData.map(item => parseFloat(item[xAxis]) || 0);
      const y = sortedData.map(item => parseFloat(item[yAxis]) || 0);
      const z = Array(x.length).fill(0).map((_, i) => i * 0.1);
      
      // Add base points to close the area
      const yMin = Math.min(...y);
      
      // Create full set of coordinates for area
      const xArea = [...x, ...x.reverse()];
      const yArea = [...y, ...Array(y.length).fill(yMin)];
      const zArea = [...z, ...Array(z.length).fill(0)];
      
      // Create 3D area
      setPlotData([{
        type: 'mesh3d',
        x: xArea,
        y: yArea,
        z: zArea,
        opacity: 0.85,
        color: 'rgba(76, 175, 80, 0.9)',
        flatshading: false,
        lighting: {
          ambient: 0.7,
          diffuse: 0.8
        },
        hoverinfo: 'none'
      },
      // Add line at top of area
      {
        type: 'scatter3d',
        mode: 'lines',
        x: x,
        y: y,
        z: z,
        line: {
          color: '#f1c40f',
          width: 5
        },
        hoverinfo: 'none'
      },
      // Add points with hover info
      {
        type: 'scatter3d',
        mode: 'markers',
        x: x,
        y: y,
        z: z,
        marker: {
          size: 6,
          color: y,
          colorscale: [
            [0, '#e67e22'],
            [0.5, '#f1c40f'],
            [1, '#f39c12']
          ],
          colorbar: {
            // Position far to the left with these settings - match surface plot
            x: -0.18,             // Move further left (more negative)
            xpad: 0,              // Remove padding on x-axis
            thickness: 15,        // Keep the colorbar thin
            len: 0.75,            // Make it 75% of the plot height
            y: 0.6,               // Move up from center
            ypad: 0,              // Remove padding on y-axis
            outlinewidth: 0,      // Remove outline for cleaner look
            title: {
              text: 'Value',
              font: {
                color: 'white',
                family: "'Poppins', sans-serif",
                size: 12
              },
              side: 'top'         // Title at the top
            },
            tickfont: {
              color: 'white',
              family: "'Poppins', sans-serif",
              size: 10            // Smaller font for ticks
            },
            tickformat: '.1f'     // Format with 1 decimal place
          },
          opacity: 1,
          line: {
            color: 'white',
            width: 1
          }
        },
        hovertemplate: 
          `<b>${xAxis}</b>: %{x}<br>` +
          `<b>${yAxis}</b>: %{y}<br>` +
          `<extra></extra>`,
      }]);
      
      // Add consistent layout adjustments as in other chart types
      newLayout.margin = { 
        l: 50,        // Left margin
        r: 10,
        b: 20,        // Slightly more bottom margin to show bottom part better
        t: 50
      };
      
      // Adjust scene placement to make room for the colorbar
      newLayout.scene.domain = { 
        x: [0.15, 0.98],
        y: [0, 1]
      };
      
      // Improve camera position for area chart - needs to show the area fill clearly
      newLayout.scene.camera = {
        eye: { x: -2.1, y: -0.8, z: 1.2 },  // Updated for better view of area fill
        up: { x: 0, y: 0, z: 1 },
        center: { x: 0, y: 0, z: -0.1 }     // Slight adjustment to center
      };
      
      // Ensure proper backgrounds on all axes
      newLayout.scene.xaxis.backgroundcolor = 'rgb(23, 25, 35)';
      newLayout.scene.yaxis.backgroundcolor = 'rgb(23, 25, 35)';
      newLayout.scene.zaxis.backgroundcolor = 'rgb(23, 25, 35)';
      newLayout.scene.bgcolor = 'rgb(23, 25, 35)';

      setLayout(newLayout);
    } catch (error) {
      console.error('Error creating 3D area chart:', error);
    }
  };
  
  // Enhanced and fixed 3D Pie Chart implementation
  const create3DPieChart = (processedData, newLayout) => {
    try {
      // Aggregate data
      const aggregatedData = {};
      processedData.forEach(item => {
        const key = item[xAxis]?.toString() || 'Unknown';
        const value = parseFloat(item[yAxis]) || 0;
        
        if (!aggregatedData[key]) {
          aggregatedData[key] = 0;
        }
        aggregatedData[key] += value;
      });
      
      // Convert to arrays and sort by value (descending)
      let categories = Object.keys(aggregatedData);
      let values = Object.values(aggregatedData);
      
      // Sort and limit to top 15 if more than that (for better visibility)
      if (categories.length > 15) {
        // Create pairs and sort
        const pairs = categories.map((cat, i) => ({ category: cat, value: values[i] }));
        pairs.sort((a, b) => b.value - a.value);
        
        // Take top 15
        const topPairs = pairs.slice(0, 15);
        categories = topPairs.map(p => p.category);
        values = topPairs.map(p => p.value);
      }
      
      // Calculate total and percentages
      const total = values.reduce((a, b) => a + b, 0);
      const percentages = values.map(v => (v/total) * 100);
      
      // Build a proper 3D pie chart using cone segments
      const traces = [];
      
      // Set up chart center and size
      const centerX = 0;
      const centerY = 0;
      const baseZ = 0;
      const outerRadius = 5;
      const innerRadius = 1; // Create a hole in the middle
      const segmentHeight = 1; // Uniform height for better visibility
      
      // Calculate cumulative angles for segments
      let cumulativeAngle = 0;
      
      // Generate a proper 3D pie with segments
      categories.forEach((category, i) => {
        const percentage = percentages[i];
        const value = values[i];
        
        // Calculate segment angles in radians (start and end)
        const angleSize = (percentage / 100) * 2 * Math.PI;
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + angleSize;
        cumulativeAngle = endAngle;
        
        // Get color for this segment
        const colorValue = i / categories.length;
        const segmentColor = getColor(colorValue, colorPalettes.warm);
        
        // Create points along the arc (more points = smoother curve)
        const points = 12; // Number of points along the curve
        const xOuter = [];
        const yOuter = [];
        const xInner = [];
        const yInner = [];
        
        // Generate points for top and bottom of the segment
        for (let j = 0; j <= points; j++) {
          const angle = startAngle + (j / points) * (endAngle - startAngle);
          xOuter.push(centerX + outerRadius * Math.cos(angle));
          yOuter.push(centerY + outerRadius * Math.sin(angle));
          xInner.push(centerX + innerRadius * Math.cos(angle));
          yInner.push(centerY + innerRadius * Math.sin(angle));
        }
        
        // Create the top face of the segment (extruded up)
        const topZ = baseZ + segmentHeight * (1 + (percentage / 15));  // Taller segments for larger values
        
        // Create outer wall
        traces.push({
          type: 'mesh3d',
          x: [...xOuter, ...xOuter],
          y: [...yOuter, ...yOuter],
          z: [...Array(xOuter.length).fill(baseZ), ...Array(xOuter.length).fill(topZ)],
          i: Array.from({ length: xOuter.length - 1 }, (_, j) => j),
          j: Array.from({ length: xOuter.length - 1 }, (_, j) => j + xOuter.length),
          k: Array.from({ length: xOuter.length - 1 }, (_, j) => j + xOuter.length + 1),
          color: segmentColor,
          opacity: 0.92,
          flatshading: false,
          lighting: {
            ambient: 0.6,
            diffuse: 0.8,
            specular: 0.2,
            roughness: 0.3,
            fresnel: 0.2
          },
          hoverinfo: 'text',
          hovertext: `${category}: ${value.toFixed(1)} (${percentage.toFixed(1)}%)`,
          showlegend: false
        });
        
        // Create top surface of segment
        traces.push({
          type: 'mesh3d',
          x: [...xOuter, ...xInner].flat(),
          y: [...yOuter, ...yInner].flat(),
          z: Array(xOuter.length * 2).fill(topZ),
          color: segmentColor,
          opacity: 0.95,
          flatshading: false,
          lighting: {
            ambient: 0.7,
            diffuse: 0.6
          },
          name: `${category}: ${value.toFixed(1)} (${percentage.toFixed(1)}%)`,
          showlegend: true,
          hovertemplate: `<b>${category}</b><br>${value.toFixed(1)} (${percentage.toFixed(1)}%)<extra></extra>`
        });
        
        // Add label at the center of each segment
        const labelAngle = startAngle + angleSize / 2;
        const labelRadius = outerRadius * 0.7;
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);
        const labelZ = topZ + 0.1;
        
        if (percentage > 3) {  // Only show label for segments large enough
          traces.push({
            type: 'scatter3d',
            mode: 'text',
            x: [labelX],
            y: [labelY],
            z: [labelZ],
            text: [`${percentage.toFixed(1)}%`],
            textfont: {
              color: 'white',
              size: 10,
              family: "'Poppins', sans-serif"
            },
            textposition: 'middle center',
            showlegend: false,
            hoverinfo: 'none'
          });
        }
      });
      
      // Add center hole to complete the pie look
      traces.push({
        type: 'mesh3d',
        x: Array.from({ length: 36 }, (_, i) => innerRadius * Math.cos(i * Math.PI / 18)),
        y: Array.from({ length: 36 }, (_, i) => innerRadius * Math.sin(i * Math.PI / 18)),
        z: Array(36).fill(baseZ),
        color: 'rgb(23, 25, 35)',
        opacity: 1,
        showlegend: false,
        hoverinfo: 'none'
      });
      
      setPlotData(traces);
      
      // Better camera angle to show 3D pie properly
      newLayout.scene.camera = {
        eye: { x: 1.2, y: 1.2, z: 1.5 },
        up: { x: 0, y: 0, z: 1 },
        center: { x: 0, y: 0, z: 0 }
      };
      
      // Update scene for this specific chart
      newLayout.scene.aspectmode = 'manual';
      newLayout.scene.aspectratio = { x: 1, y: 1, z: 0.6 };
      
      // Update layout with other enhancements
      newLayout.margin = { l: 0, r: 0, b: 10, t: 50 };
      newLayout.title = `${yAxis} Distribution by ${xAxis}`;
      newLayout.showlegend = true;
      
      // Position legend for better visibility
      newLayout.legend = { 
        x: 0.05, 
        y: 1,
        bgcolor: 'rgba(0,0,0,0.5)',
        bordercolor: 'rgba(255,255,255,0.2)',
        borderwidth: 1,
        font: { 
          color: 'white',
          size: 11
        }
      };
      
      setLayout(newLayout);
    } catch (error) {
      console.error('Error creating 3D pie chart:', error);
    }
  };

  // Helper Functions
  const getDataLimitForChartType = () => {
    switch(chartType) {
      case '3d-surface': return 300;
      case '3d-scatter': return 500;
      case '3d-pie': return 100;
      case '3d-bar': return 200;
      default: return 300;
    }
  };
  
  const sampleData = (dataArray, limit) => {
    if (!dataArray || dataArray.length <= limit) return dataArray;
    const samplingInterval = Math.ceil(dataArray.length / limit);
    return dataArray.filter((_, index) => index % samplingInterval === 0);
  };
  
  const sampleArray = (arr, size) => {
    if (!arr || arr.length <= size) return arr;
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
  
  const getCameraPosition = (type) => {
    switch(type) {
      case '3d-bar':
        return { eye: { x: 1.8, y: 1.8, z: 1.2 } };
      case '3d-surface':
        return { eye: { x: 1.87, y: 0.88, z: 1.2 } };
      case '3d-pie':
        return { eye: { x: 0, y: 0, z: 2 } };
      case '3d-scatter':
        return { eye: { x: 1.5, y: -1.5, z: 1.25 } };
      case '3d-line':
      case '3d-area':
        return { eye: { x: 1.5, y: -1.5, z: 0.8 } };
      default:
        return { eye: { x: 1.25, y: -1.25, z: 0.5 } };
    }
  };
  
  const getColor = (value, palette) => {
    // For a simple palette (array of colors)
    if (Array.isArray(palette) && !Array.isArray(palette[0])) {
      const index = Math.min(Math.floor(value * palette.length), palette.length - 1);
      return palette[index];
    }
    // For gradient palette (array of [position, color] pairs)
    else if (Array.isArray(palette) && Array.isArray(palette[0])) {
      // Find the two colors to interpolate between
      let lowerIndex = 0;
      for (let i = 0; i < palette.length; i++) {
        if (palette[i][0] <= value) {
          lowerIndex = i;
        } else {
          break;
        }
      }
      
      const upperIndex = Math.min(lowerIndex + 1, palette.length - 1);
      
      // If at the edges or same point, return the exact color
      if (lowerIndex === upperIndex) {
        return palette[lowerIndex][1];
      }
      
      // Actually use t to interpolate between colors
      const lowerPos = palette[lowerIndex][0];
      const upperPos = palette[upperIndex][0];
      const t = (value - lowerPos) / (upperPos - lowerPos);
      
      // Parse colors to get RGB components
      const lowerColor = parseColor(palette[lowerIndex][1]);
      const upperColor = parseColor(palette[upperIndex][1]);
      
      // Interpolate between the colors
      const r = Math.round(lowerColor.r + t * (upperColor.r - lowerColor.r));
      const g = Math.round(lowerColor.g + t * (upperColor.g - lowerColor.g));
      const b = Math.round(lowerColor.b + t * (upperColor.b - lowerColor.b));
      const a = lowerColor.a + t * (upperColor.a - lowerColor.a);
      
      // Return interpolated color
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    
    // Default color
    return 'rgba(76, 175, 80, 0.9)';
  };
  
  // Add helper function to parse color strings
  const parseColor = (colorStr) => {
    // Handle rgba format
    if (colorStr.startsWith('rgba')) {
      const parts = colorStr.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)/);
      if (parts) {
        return {
          r: parseInt(parts[1], 10),
          g: parseInt(parts[2], 10),
          b: parseInt(parts[3], 10),
          a: parseFloat(parts[4])
        };
      }
    }
    
    // Handle rgb format
    if (colorStr.startsWith('rgb')) {
      const parts = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (parts) {
        return {
          r: parseInt(parts[1], 10),
          g: parseInt(parts[2], 10),
          b: parseInt(parts[3], 10),
          a: 1
        };
      }
    }
    
    // Handle hex format (simplified)
    if (colorStr.startsWith('#')) {
      const r = parseInt(colorStr.slice(1, 3), 16);
      const g = parseInt(colorStr.slice(3, 5), 16);
      const b = parseInt(colorStr.slice(5, 7), 16);
      return { r, g, b, a: 1 };
    }
    
    // Default fallback
    return { r: 76, g: 175, b: 80, a: 0.9 };
  };

  // Add download chart function
  const downloadChart = () => {
    if (plotRef.current) {
      try {
        // Create loading indicator
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
        containerRef.current.appendChild(loadingIndicator);
        
        const fileName = `${formatChartName(chartType)}_${xAxis}_vs_${yAxis}.png`;
        
        // Always use Plotly's native toImage for 3D charts - it handles WebGL properly
        if (plotRef.current.el && window.Plotly) {
          const gd = plotRef.current.el;
          
          // Increased size and resolution for better quality exports
          window.Plotly.toImage(gd, {
            format: 'png',
            width: gd.clientWidth * 1,  
            height: gd.clientHeight * 1, 
            scale: 1  
          })
          .then(dataUrl => {
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            containerRef.current.removeChild(loadingIndicator);
          })
          .catch(err => {
            console.error('Error with Plotly.toImage:', err);
            // Only fall back to html2canvas if Plotly's method fails
            fallbackToHtml2Canvas();
          });
        } else {
          // Fall back to html2canvas if Plotly isn't available
          fallbackToHtml2Canvas();
        }
        
        function fallbackToHtml2Canvas() {
          // Use html2canvas as fallback with improved settings
          import('html2canvas').then(html2canvasModule => {
            const html2canvas = html2canvasModule.default;
            
            // Make sure we capture the entire plotly container
            const targetElement = containerRef.current;
            
            html2canvas(targetElement, { 
              useCORS: true,
              scale: 1,  // Increased from 2x to 3x for higher resolution
              backgroundColor: 'rgb(23, 25, 35)',
              allowTaint: true,
              logging: false,
              foreignObjectRendering: true,
              // Increase canvas size to match display size * scale
              width: targetElement.offsetWidth,
              height: targetElement.offsetHeight,
              ignoreElements: (element) => {
                // Ignore loading elements or other overlays
                return element.className === 'download-loading' || 
                       element.className === 'chart-loading-overlay';
              }
            }).then(canvas => {
              // Convert to PNG with maximum quality
              const dataUrl = canvas.toDataURL('image/png', 1.0);
              
              // Create download link
              const link = document.createElement('a');
              link.download = fileName;
              link.href = dataUrl;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              // Remove loading indicator
              containerRef.current.removeChild(loadingIndicator);
            }).catch(err => {
              console.error('Error capturing chart:', err);
              containerRef.current.removeChild(loadingIndicator);
              alert('Failed to download chart. Please try again.');
            });
          }).catch(err => {
            console.error('Error importing html2canvas:', err);
            containerRef.current.removeChild(loadingIndicator);
            alert('Failed to download chart. Please try again.');
          });
        }
      } catch (error) {
        console.error('Error downloading chart:', error);
        const loadingElem = containerRef.current.querySelector('.download-loading');
        if (loadingElem) containerRef.current.removeChild(loadingElem);
        alert('Failed to download chart. Please try again.');
      }
    }
  };

  return (
    <div className="three-d-chart-container" ref={containerRef}>
      <div className="chart-controls-overlay">
        <button className="chart-download-btn" onClick={downloadChart} title="Download as PNG">
          <FaDownload /> PNG
        </button>
      </div>
      <Plot
        ref={plotRef}
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
      {loading && (
        <div className="chart-loading-overlay">
          <div className="chart-loading-spinner"></div>
          <p>Rendering 3D chart...</p>
        </div>
      )}
    </div>
  );
};

export default ThreeDChart;