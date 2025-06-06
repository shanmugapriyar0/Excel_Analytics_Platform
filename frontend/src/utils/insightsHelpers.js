// Create this new utility file with helper functions for insights

// Determine the day when user is most active
export const getMostActiveDay = (activities) => {
  if (!activities || activities.length === 0) return "weekdays";
  
  const dayCounts = activities.reduce((counts, activity) => {
    const day = new Date(activity.date).toLocaleDateString('en-US', { weekday: 'long' });
    counts[day] = (counts[day] || 0) + 1;
    return counts;
  }, {});
  
  return Object.entries(dayCounts)
    .sort((a, b) => b[1] - a[1])[0][0];
};

// Determine the time period when user is most active
export const getMostActivePeriod = (activities) => {
  if (!activities || activities.length === 0) return "afternoon";
  
  const periodCounts = activities.reduce((counts, activity) => {
    const hour = new Date(activity.date).getHours();
    let period = "morning";
    
    if (hour >= 12 && hour < 17) period = "afternoon";
    else if (hour >= 17) period = "evening";
    
    counts[period] = (counts[period] || 0) + 1;
    return counts;
  }, {});
  
  return Object.entries(periodCounts)
    .sort((a, b) => b[1] - a[1])[0][0];
};

// Generate visual activity heatmap elements
export const generateActivityHeatmap = (activities) => {
  if (!activities || activities.length === 0) return null;
  
  // Group activities by day
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }
  
  // Count activities per day
  const activityCounts = activities.reduce((counts, activity) => {
    const day = new Date(activity.date).toISOString().split('T')[0];
    counts[day] = (counts[day] || 0) + 1;
    return counts;
  }, {});
  
  // Generate heatmap elements
  return (
    <div className="heatmap-container">
      {last7Days.map(day => {
        const count = activityCounts[day] || 0;
        const intensity = Math.min(Math.ceil((count / 5) * 4), 4);
        return (
          <div key={day} className={`heatmap-day intensity-${intensity}`} title={`${count} activities on ${new Date(day).toLocaleDateString()}`} />
        );
      })}
    </div>
  );
};

// Find most accessed file
export const getMostAccessedFile = (files, activities) => {
  if (!files || files.length === 0 || !activities || activities.length === 0) {
    return "No files yet";
  }
  
  // Count file accesses
  const fileAccesses = activities.reduce((counts, activity) => {
    if (activity.fileId) {
      counts[activity.fileId] = (counts[activity.fileId] || 0) + 1;
    }
    return counts;
  }, {});
  
  // Find the most accessed file
  let mostAccessedFileId = Object.entries(fileAccesses)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
    
  if (!mostAccessedFileId) return "None yet";
  
  const mostAccessedFile = files.find(file => file._id === mostAccessedFileId);
  return mostAccessedFile ? mostAccessedFile.filename : "Unknown file";
};

// Handler for viewing popular file
export const handleViewPopularFile = (files, activities) => {
  const fileAccesses = activities.reduce((counts, activity) => {
    if (activity.fileId) {
      counts[activity.fileId] = (counts[activity.fileId] || 0) + 1;
    }
    return counts;
  }, {});
  
  let mostAccessedFileId = Object.entries(fileAccesses)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
    
  if (mostAccessedFileId) {
    // Navigate to file view or trigger file selection
    // Implementation depends on your app's navigation structure
    const file = files.find(f => f._id === mostAccessedFileId);
    if (file) {
      // Example: setSelectedFile(file) and/or setActiveTab('analyze')
    }
  }
};

// Calculate a simple data quality score
export const calculateDataQualityScore = (files) => {
  if (!files || files.length === 0) return 75; // Default score
  
  // This is a simulated score - in a real app you'd analyze actual data
  // like missing values, data types consistency, etc.
  let score = 75; // Base score
  
  // Add points for variety of file types
  const hasExcel = files.some(f => f.filename.toLowerCase().endsWith('.xlsx'));
  const hasCsv = files.some(f => f.filename.toLowerCase().endsWith('.csv'));
  if (hasExcel && hasCsv) score += 5;
  
  // Add points for larger datasets
  const avgRows = files.reduce((sum, file) => 
    sum + (file.metadata?.rowCount || 0), 0) / files.length;
  if (avgRows > 1000) score += 10;
  if (avgRows > 5000) score += 5;
  
  // Deduct points for potential issues (simulated)
  const recentFiles = files.filter(f => {
    const uploadDate = new Date(f.uploadDate || f.createdAt);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return uploadDate > oneMonthAgo;
  });
  
  if (recentFiles.length < files.length * 0.3) score -= 5; // Deduct if most files are old
  
  return Math.min(Math.max(score, 45), 98); // Cap between 45% and 98%
};

// Get quality suggestion based on score
export const getQualitySuggestion = (score) => {
  if (score >= 90) return "Excellent data quality. Keep up the good work!";
  if (score >= 80) return "Good quality. Consider regular data validation checks.";
  if (score >= 70) return "Decent quality. Look for missing values in your datasets.";
  if (score >= 60) return "Fair quality. Check for inconsistent data formats.";
  return "Consider cleaning your datasets for improved analysis.";
};