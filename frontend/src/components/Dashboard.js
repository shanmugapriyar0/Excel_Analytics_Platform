import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, reset } from "../redux/authSlice";
import axios from "axios";
import {
  FaSignOutAlt,
  FaUser,
  FaChartBar,
  FaBell,
  FaCog,
  FaFileUpload,
  FaBars,
  FaChevronDown,
  FaUserCircle,
  FaKey,
  FaQuestion,
  FaFileExcel,
  FaFileCsv,
  FaChartPie,
  FaEye,
  FaClock,
  FaDownload,
  FaSearch,
  FaExclamationTriangle,
  FaSyncAlt,
  FaBrain,
  FaChartLine,
  FaDatabase,
  FaRegClock,
  FaStar,
  FaCheckCircle,
} from "react-icons/fa";
import FileUpload from "./FileUpload";
import AnalyzeData from "./AnalyzeData";
import CounterAnimation from "./CounterAnimation";
import excelLogo from "../assets/logo.png";
import {
  getMostActiveDay,
  getMostActivePeriod,
  generateActivityHeatmap,
  calculateDataQualityScore,
  getQualitySuggestion,
} from "../utils/insightsHelpers";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("dashboard");

  // New states for dashboard data
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalRows: 0,
    recentUploads: 0,
    recentViews: 0,
  });
  const [activityLog, setActivityLog] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [popularContent, setPopularContent] = useState({
    fileId: null,
    filename: null,
    accessCount: 0,
  });

  // Set initial sidebar state based on screen width
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return window.innerWidth >= 992; // Open by default only on larger screens
  });

  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [parsedData, setParsedData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [isAuthenticated, navigate]);

  // Fetch user files and stats
  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get user's Excel files
      const filesResponse = await axios.get(
        "http://localhost:5000/api/excel/files",
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      setFiles(filesResponse.data);

      // Calculate statistics
      const totalFiles = filesResponse.data.length;
      const totalRows = filesResponse.data.reduce(
        (acc, file) => acc + (file.metadata?.rowCount || 0),
        0
      );
      const recentUploads = filesResponse.data.filter(
        (file) =>
          new Date(file.uploadDate) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      // Generate mock recent views based on files (in a real app, you'd track this data)
      const recentViews = Math.min(
        Math.floor(totalFiles * 2.5 + Math.random() * 5),
        totalFiles * 10
      );

      setStats({
        totalFiles,
        totalRows,
        recentUploads,
        recentViews,
      });

      // Generate activity log based on user's files
      generateActivityLog(filesResponse.data);

      // Generate sample notifications
      generateSampleNotifications(totalFiles);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.response?.data?.message || "Failed to fetch user data");
    } finally {
      setIsLoading(false);
    }
  }, [user]); // Add user as dependency

// Update your fetchPopularContent function
const fetchPopularContent = useCallback(async () => {
  try {
    const token = user?.token || user?.accessToken || localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/users/popular-file', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // API returns _id as the filename
    if (response.data && response.data._id) {
      setPopularContent({
        fileId: response.data.fileId,
        filename: response.data._id, // This contains the filename
        accessCount: response.data.count
      });
    } else if (response.data && response.data.filename) {
      // For backward compatibility with any API changes
      setPopularContent({
        fileId: response.data.fileId,
        filename: response.data.filename,
        accessCount: response.data.accessCount
      });
    }
  } catch (error) {
    console.error('Error fetching popular content:', error);
  }
}, [user]);

  // Call this in your useEffect along with other data fetching
  useEffect(() => {
    if (user && isAuthenticated) {
      const loadData = async () => {
        await fetchUserData();
        await fetchPopularContent();
      };

      loadData();
    }
  }, [user, isAuthenticated, fetchUserData, fetchPopularContent]); // Now properly memoized

  // Generate activity log from files
  const generateActivityLog = (filesData) => {
    const activities = [];

    // Add file upload activities
    filesData.slice(0, 10).forEach((file) => {
      activities.push({
        id: `upload-${file._id}`,
        type: "upload",
        title: `Uploaded ${file.filename}`,
        description: `File with ${file.metadata?.rowCount || 0} rows and ${
          file.metadata?.headers?.length || 0
        } columns`,
        date: new Date(file.uploadDate || file.createdAt),
        icon: file.filename.toLowerCase().endsWith(".csv") ? (
          <FaFileCsv />
        ) : (
          <FaFileExcel />
        ),
      });
    });

    // Add some analysis activities if applicable
    if (filesData.length > 0) {
      const randomFiles = [...filesData]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(3, filesData.length));

      randomFiles.forEach((file, index) => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 5)); // Random date within past 5 days

        activities.push({
          id: `analysis-${index}`,
          type: "analysis",
          title: `Analyzed ${file.filename}`,
          description: "Performed data analysis and visualization",
          date: date,
          icon: <FaChartPie />,
        });
      });
    }

    // Add AI insight activities
    if (filesData.length > 0) {
      const randomFiles = [...filesData]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(2, filesData.length));

      randomFiles.forEach((file, index) => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 3)); // Random date within past 3 days

        activities.push({
          id: `insight-${index}`,
          type: "insight",
          title: `Generated AI insights for ${file.filename}`,
          description: "Explored data patterns using AI analysis",
          date: date,
          icon: <FaBrain />,
        });
      });
    }

    // Add view activities
    if (filesData.length > 0) {
      const randomFiles = [...filesData]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(4, filesData.length));

      randomFiles.forEach((file, index) => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 7)); // Random date within past 7 days

        activities.push({
          id: `view-${index}`,
          type: "view",
          title: `Viewed ${file.filename}`,
          description: "Reviewed file data and structure",
          date: date,
          icon: <FaEye />,
        });
      });
    }

    // Sort by date (newest first) and limit to 10
    activities.sort((a, b) => b.date - a.date);
    setActivityLog(activities.slice(0, 10));
  };

  // Generate sample notifications
  const generateSampleNotifications = (fileCount) => {
    const notifs = [];

    // Only add notifications if there are files
    if (fileCount > 0) {
      notifs.push({
        id: "notif-1",
        title: "Analysis completed",
        message: "Your recent data analysis is ready to view",
        time: "10 min ago",
        read: false,
        type: "success",
      });

      notifs.push({
        id: "notif-2",
        title: "AI Insights available",
        message: "New AI-powered insights for your recent upload",
        time: "1 hour ago",
        read: false,
        type: "info",
      });
    }

    // Add system notifications
    notifs.push({
      id: "notif-3",
      title: "Platform update",
      message: "New features available in the latest update",
      time: "1 day ago",
      read: true,
      type: "system",
    });

    setNotifications(notifs);
  };

  // Log out handler
  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/login");
  };

  // Navigate to forgot password
  const navigateToForgotPassword = () => {
    navigate("/forgot-password");
  };

  // Format date helper
  const formatDate = (date) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Time ago formatter
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";

    return Math.floor(seconds) + " seconds ago";
  };

  // Format file size
  // eslint-disable-next-line no-unused-vars
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Filter files by search term
  const filteredFiles = searchTerm
    ? files.filter((file) =>
        file.filename.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : files;

  // Add resize listener to handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      // Auto-collapse sidebar on small screens when resizing
      if (window.innerWidth < 992) {
        setSidebarOpen(false);
      }
    };

    // Set up event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle outside clicks for dropdown
  useEffect(() => {
    if (dropdownOpen) {
      const handleClickOutside = (e) => {
        if (!e.target.closest(".header-user")) {
          setDropdownOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [dropdownOpen]);

  // Download a file
  const handleDownload = async (fileId) => {
    try {
      const response = await axios({
        url: `http://localhost:5000/api/excel/download/${fileId}`,
        method: "GET",
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Get the filename from the file object
      const file = files.find((f) => f.fileId === fileId);
      link.setAttribute("download", file ? file.filename : "excel-file.xlsx");

      // Append link to body and trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      setError("Failed to download file. Please try again later.");
    }
  };

  // Handle error refresh
  const handleRefresh = () => {
    window.location.reload();
  };

  // Add this function to handle clicking "View File"
  const handleViewFile = (fileId) => {
    // First set the active tab to analyze
    setActiveTab('analyze');
    
    // Then store the selected file ID in localStorage
    // so the analyze tab can load it
    if (fileId) {
      localStorage.setItem('selectedFileId', fileId);
    }
  };

  return (
    <div
      className={`dashboard-layout ${!sidebarOpen ? "" : "sidebar-expanded"}`}
    >
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${!sidebarOpen ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          {sidebarOpen ? (
            <div className="app-logo">
              <div className="logo-icon">
                <img src={excelLogo} alt="ExcelInsights Logo" />
              </div>
              <span className="logo-text">ExcelInsights</span>
            </div>
          ) : (
            <div className="app-logo-collapsed">
              <FaBars
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="sidebar-hamburger"
              />
            </div>
          )}
          {sidebarOpen && (
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars />
            </button>
          )}
        </div>

        <div className="sidebar-menu">
          <ul>
            <li
              className={activeTab === "dashboard" ? "active" : ""}
              onClick={() => setActiveTab("dashboard")}
            >
              <FaChartBar className="menu-icon" />
              {sidebarOpen && <span>Dashboard</span>}
            </li>
            <li
              className={activeTab === "upload" ? "active" : ""}
              onClick={() => setActiveTab("upload")}
            >
              <FaFileUpload className="menu-icon" />
              {sidebarOpen && <span>Upload Files</span>}
            </li>
            <li
              className={activeTab === "analyze" ? "active" : ""}
              onClick={() => setActiveTab("analyze")}
            >
              <FaChartPie className="menu-icon" />
              {sidebarOpen && <span>Analyze Data</span>}
            </li>
            <li
              className={activeTab === "settings" ? "active" : ""}
              onClick={() => setActiveTab("settings")}
            >
              <FaCog className="menu-icon" />
              {sidebarOpen && <span>Settings</span>}
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <FaUser />
            </div>
            {sidebarOpen && (
              <div className="user-details">
                <div className="user-name">{user.username}</div>
                <div className="user-role">{user.role || "User"}</div>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p className="date-display">{formatDate(currentTime)}</p>
          </div>
          <div className="header-actions">
            <button className="action-button notification">
              <FaBell />
              <span className="badge">
                {notifications.filter((n) => !n.read).length}
              </span>
            </button>
            <div
              className={`header-user ${dropdownOpen ? "dropdown-active" : ""}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onMouseEnter={() =>
                window.innerWidth >= 992 && setDropdownOpen(true)
              }
              onMouseLeave={() =>
                window.innerWidth >= 992 && setDropdownOpen(false)
              }
            >
              <div className="user-avatar">
                <FaUser />
                <div className="user-status"></div>
              </div>
              <div className="user-name">{user.username}</div>
              <FaChevronDown className="chevron-icon" />

              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-dropdown-name">{user.username}</div>
                  <div className="user-dropdown-role">
                    {user.role || "User"}
                  </div>
                </div>
                <div className="user-dropdown-items">
                  <div className="user-dropdown-item">
                    <FaUserCircle className="user-dropdown-icon" />
                    <span>My Profile</span>
                  </div>
                  <div className="user-dropdown-item">
                    <FaCog className="user-dropdown-icon" />
                    <span>Settings</span>
                  </div>
                  <div
                    className="user-dropdown-item"
                    onClick={navigateToForgotPassword}
                  >
                    <FaKey className="user-dropdown-icon" />
                    <span>Change Password</span>
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <div className="user-dropdown-item">
                    <FaQuestion className="user-dropdown-icon" />
                    <span>Help & Support</span>
                  </div>
                  <div className="user-dropdown-item" onClick={handleLogout}>
                    <FaSignOutAlt className="user-dropdown-icon" />
                    <span>Logout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {/* Dashboard Overview */}
          {activeTab === "dashboard" && (
            <div className="dashboard-overview">
              {/* Error message if API fetch failed */}
              {error && (
                <div className="error-message">
                  <div className="error-content">
                    <FaExclamationTriangle />
                    <span>{error}</span>
                  </div>
                  <button className="retry-button" onClick={handleRefresh}>
                    <FaSyncAlt /> Retry
                  </button>
                </div>
              )}

              {/* Statistics Cards */}
              <section className="stats-section">
                <div className="section-header">
                  <h2>Dashboard Overview</h2>
                  <h4>
                    {isLoading
                      ? "Loading stats..."
                      : `Welcome back, ${user.username}!`}
                  </h4>
                </div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaFileExcel />
                    </div>
                    <div className="stat-value">
                      {isLoading ? (
                        "..."
                      ) : (
                        <CounterAnimation end={stats.totalFiles} />
                      )}
                    </div>
                    <div className="stat-label">Total Files</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaChartBar />
                    </div>
                    <div className="stat-value">
                      {isLoading ? (
                        "..."
                      ) : (
                        <CounterAnimation end={stats.totalRows} />
                      )}
                    </div>
                    <div className="stat-label">Total Rows</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaFileUpload />
                    </div>
                    <div className="stat-value">
                      {isLoading ? (
                        "..."
                      ) : (
                        <CounterAnimation end={stats.recentUploads} />
                      )}
                    </div>
                    <div className="stat-label">Recent Uploads</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FaEye />
                    </div>
                    <div className="stat-value">
                      {isLoading ? (
                        "..."
                      ) : (
                        <CounterAnimation end={stats.recentViews} />
                      )}
                    </div>
                    <div className="stat-label">Recent Views</div>
                  </div>
                </div>
              </section>

              {/* Recent Files with Search */}
              <section className="recent-files-section">
                <div className="section-header with-action">
                  <h2>Recent Files</h2>
                  <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>

                <div className="files-grid">
                  {isLoading ? (
                    <div className="loading-message">
                      <FaSyncAlt className="spinning-icon" />
                      <p>Loading your files...</p>
                    </div>
                  ) : filteredFiles.length > 0 ? (
                    filteredFiles.slice(0, 6).map((file) => (
                      <div className="file-card" key={file._id}>
                        <div className="file-card-header">
                          <div className="file-icon">
                            {file.filename.toLowerCase().endsWith(".csv") ? (
                              <FaFileCsv className="csv-icon" />
                            ) : (
                              <FaFileExcel className="excel-icon" />
                            )}
                          </div>
                          <div className="file-info">
                            <h3 className="file-name">{file.filename}</h3>
                            <p className="file-meta">
                              {file.metadata?.rowCount || 0} rows •{" "}
                              {file.metadata?.headers?.length || 0} columns
                            </p>
                          </div>
                        </div>
                        <div className="file-card-footer">
                          <div className="file-date">
                            <FaClock />
                            <span>
                              {timeAgo(file.uploadDate || file.createdAt)}
                            </span>
                          </div>
                          <div className="file-actions">
                            <button
                              className="file-action-btn"
                              onClick={() => setActiveTab("analyze")}
                            >
                              <FaChartPie />
                            </button>
                            <button
                              className="file-action-btn"
                              onClick={() => handleDownload(file.fileId)}
                            >
                              <FaDownload />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-files-message">
                      <FaFileExcel className="empty-icon" />
                      <h3>No files found</h3>
                      {files.length > 0 ? (
                        <p>No files match your search. Try a different term.</p>
                      ) : (
                        <p>Upload your first Excel file to get started!</p>
                      )}
                      <button
                        className="upload-now-btn"
                        onClick={() => setActiveTab("upload")}
                      >
                        <FaFileUpload /> Upload Now
                      </button>
                    </div>
                  )}
                </div>

                {filteredFiles.length > 0 && (
                  <div className="view-all-container">
                    <button
                      className="view-all-btn"
                      onClick={() => setActiveTab("analyze")}
                    >
                      View All Files
                    </button>
                  </div>
                )}
              </section>

              {/* Two-column layout for Activity and Insights */}
              <div className="dashboard-columns">
                {/* Activity Log */}
                <section className="activity-section dashboard-section-base">
                  <h2 className="section-title">Recent Activity</h2>

                  {isLoading ? (
                    <div className="loading-activity">
                      Loading activities...
                    </div>
                  ) : activityLog.length > 0 ? (
                    <div className="activity-list">
                      {activityLog.map((activity) => (
                        <div className="activity-item" key={activity.id}>
                          <div className={`activity-icon ${activity.type}`}>
                            {activity.icon}
                          </div>
                          <div className="activity-content">
                            <h3 className="activity-title">{activity.title}</h3>
                            <p className="activity-desc">
                              {activity.description}
                            </p>
                            <span className="activity-time">
                              {timeAgo(activity.date)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-activity">
                      <p>No recent activity to display</p>
                    </div>
                  )}
                </section>

                {/* Quick Insights */}
                <section className="insights-section dashboard-section-base">
                  <h2 className="section-title">Quick Insights</h2>

                  {isLoading ? (
                    <div className="loading-insights">Loading insights...</div>
                  ) : files.length > 0 ? (
                    <div className="insights-content">
                      {/* Data Growth Insight - Enhanced with trend */}
                      <div className="insight-card">
                        <FaChartLine className="insight-icon" />
                        <div className="insight-text">
                          <h3>Data Growth</h3>
                          <p>
                            Your data collection has grown by{" "}
                            {Math.floor(
                              (stats.recentUploads /
                                Math.max(1, stats.totalFiles)) *
                                100
                            )}
                            % recently.
                            {stats.recentUploads > 5 &&
                              " You're uploading files at a higher rate than 75% of users."}
                          </p>
                          <div className="insight-metric">
                            <span className="metric-value">
                              {stats.totalFiles}
                            </span>
                            <span className="metric-label">total files</span>
                          </div>
                        </div>
                      </div>

                      {/* File Distribution - Enhanced with visualization */}
                      <div className="insight-card">
                        <FaChartPie className="insight-icon" />
                        <div className="insight-text">
                          <h3>File Distribution</h3>
                          <p>
                            {
                              files.filter((f) =>
                                f.filename.toLowerCase().endsWith(".xlsx")
                              ).length
                            }{" "}
                            Excel files,{" "}
                            {
                              files.filter((f) =>
                                f.filename.toLowerCase().endsWith(".csv")
                              ).length
                            }{" "}
                            CSV files
                          </p>
                          <div className="distribution-visual">
                            <div
                              className="excel-bar"
                              style={{
                                width: `${
                                  (files.filter((f) =>
                                    f.filename.toLowerCase().endsWith(".xlsx")
                                  ).length /
                                    Math.max(1, files.length)) *
                                  100
                                }%`,
                              }}
                            />
                            <div
                              className="csv-bar"
                              style={{
                                width: `${
                                  (files.filter((f) =>
                                    f.filename.toLowerCase().endsWith(".csv")
                                  ).length /
                                    Math.max(1, files.length)) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* NEW: Data Volume Analysis */}
                      <div className="insight-card">
                        <FaDatabase className="insight-icon" />
                        <div className="insight-text">
                          <h3>Data Volume</h3>
                          <p>
                            Your datasets contain approximately{" "}
                            {stats.totalRows.toLocaleString()} data points
                            {stats.totalRows > 10000
                              ? ", making this a substantial dataset collection."
                              : "."}
                          </p>
                          <div className="insight-metric">
                            <span className="metric-value">
                              {Math.round(
                                stats.totalRows / Math.max(1, stats.totalFiles)
                              ).toLocaleString()}
                            </span>
                            <span className="metric-label">
                              avg rows per file
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* NEW: Activity Patterns */}
                      {activityLog && activityLog.length > 0 && (
                        <div className="insight-card">
                          <FaRegClock className="insight-icon" />
                          <div className="insight-text">
                            <h3>Activity Patterns</h3>
                            <p>
                              Most of your activity happens on{" "}
                              {getMostActiveDay(activityLog)}. You tend to
                              analyze data most frequently in the{" "}
                              {getMostActivePeriod(activityLog)}.
                            </p>
                            <div className="activity-heatmap">
                              {generateActivityHeatmap(activityLog)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* NEW: Most Accessed File */}
                      <div className="insight-card">
                        <FaStar className="insight-icon" />
                        <div className="insight-text">
                          <h3>Popular Content</h3>
                          {popularContent && popularContent.filename ? (
                            <>
                              <p>
                                Your most frequently accessed file is{" "}
                                <strong>{popularContent.filename}</strong>
                              </p>
                              <button
                                className="insight-action-btn"
                                onClick={() =>
                                  handleViewFile(popularContent.fileId)
                                }
                              >
                                <FaEye /> View File
                              </button>
                            </>
                          ) : (
                            <p>
                              Your most frequently accessed file is{" "}
                              <strong>None yet</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* NEW: Data Quality Score */}
                      <div className="insight-card">
                        <FaCheckCircle className="insight-icon" />
                        <div className="insight-text">
                          <h3>Data Quality</h3>
                          <p>
                            Overall data quality score:{" "}
                            <strong>{calculateDataQualityScore(files)}%</strong>
                          </p>
                          <div className="quality-meter">
                            <div
                              className="quality-fill"
                              style={{
                                width: `${calculateDataQualityScore(files)}%`,
                              }}
                            />
                          </div>
                          <p className="quality-suggestion">
                            {getQualitySuggestion(
                              calculateDataQualityScore(files)
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-insights">
                      <p>Upload files to get AI-powered insights</p>
                      <button
                        className="upload-now-btn"
                        onClick={() => setActiveTab("upload")}
                      >
                        <FaFileUpload /> Upload Files
                      </button>
                    </div>
                  )}
                </section>
              </div>

              {/* Admin section - only show for admin users */}
              {user.role === "admin" && (
                <section className="admin-section">
                  <div className="section-header">
                    <h2>Admin Controls</h2>
                  </div>
                  <p className="section-desc">
                    Welcome to the admin section! Here you can manage users,
                    view system statistics, and access admin-only features.
                  </p>
                  <div className="admin-grid">
                    <div className="admin-card">
                      <h3 className="admin-card-title">User Management</h3>
                      <p>
                        Add, modify, or remove user accounts. Set permissions
                        and roles.
                      </p>
                    </div>
                    <div className="admin-card">
                      <h3 className="admin-card-title">System Status</h3>
                      <p>All systems operational. Last backup: 24 hours ago.</p>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* File Upload Tab Content */}
          {activeTab === "upload" && (
            <FileUpload
              files={uploadFiles}
              setFiles={setUploadFiles}
              uploadStatus={uploadStatus}
              setUploadStatus={setUploadStatus}
              uploadProgress={uploadProgress}
              setUploadProgress={setUploadProgress}
              parsedData={parsedData}
              setParsedData={setParsedData}
              uploading={isUploading}
              setUploading={setIsUploading}
              onSwitchTab={setActiveTab}
            />
          )}

          {/* Analyze Data Tab Content */}
          {activeTab === "analyze" && <AnalyzeData />}

          {/* Placeholder for other tabs */}
          {activeTab !== "dashboard" &&
            activeTab !== "upload" &&
            activeTab !== "analyze" &&
            activeTab !== "insights" && (
              <div className="placeholder-content">
                <h2>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                  Content
                </h2>
                <p>This feature is coming soon.</p>
              </div>
            )}
        </main>

        <footer className="dashboard-footer">
          <p className="copyright-text">
            © {new Date().getFullYear()} ExcelInsights. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
