
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../redux/authSlice';
import { 
  FaSignOutAlt, 
  FaUser, 
  FaChartBar, 
  FaCalendarAlt, 
  FaTasks, 
  FaBell,
  FaCog
} from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentTime, setCurrentTime] = useState(new Date());

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/');
    }
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => {
      clearInterval(timer);
    };
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
    dispatch(reset()); // Reset auth state
    navigate('/'); // Redirect to login after logout
  };

  // Format date for display
  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Example data for dashboard stats
  const stats = [
    { id: 1, icon: <FaChartBar />, value: '42', label: 'Projects' },
    { id: 2, icon: <FaCalendarAlt />, value: '8', label: 'Meetings Today' },
    { id: 3, icon: <FaTasks />, value: '16', label: 'Tasks Pending' },
    { id: 4, icon: <FaBell />, value: '5', label: 'Notifications' }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1 className="dashboard-welcome">Welcome to Your Dashboard</h1>
          {user && (
            <p className="dashboard-user">
              {formatDate(currentTime)} | Logged in as: <strong>{user.username}</strong>
              {user.role === 'admin' && (
                <span className="dashboard-badge">Admin</span>
              )}
            </p>
          )}
        </div>

        <div className="dashboard-content">
          <div className="dashboard-section">
            <h2 className="dashboard-section-title">Overview</h2>
            <div className="dashboard-stats">
              {stats.map(stat => (
                <div key={stat.id} className="stat-card">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-section">
            <h2 className="dashboard-section-title">Recent Activity</h2>
            <p className="dashboard-text">
              Your recent activity and progress will be displayed here. This section can
              include project updates, recent tasks, or other relevant information.
            </p>
            
            <div className="dashboard-section">
              <h3 className="dashboard-section-title">Quick Links</h3>
              <div className="quick-links-container">
                <button className="quick-link-button profile-button">
                  <FaUser /> Profile
                </button>
                <button className="quick-link-button tasks-button">
                  <FaTasks /> My Tasks
                </button>
                <button className="quick-link-button calendar-button">
                  <FaCalendarAlt /> Calendar
                </button>
                <button className="quick-link-button settings-button">
                  <FaCog /> Settings
                </button>
              </div>
            </div>

            {/* Admin-specific content area */}
            {user && user.role === 'admin' && (
              <div className="admin-section">
                <h4 className="admin-section-title">Admin Controls</h4>
                <p>Welcome to the admin section! Here you can manage users, view system statistics, and access admin-only features.</p>
                <div className="admin-grid">
                  <div className="admin-card">
                    <h5 className="admin-card-title">User Management</h5>
                    <p>Add, modify, or remove user accounts. Set permissions and roles.</p>
                  </div>
                  <div className="admin-card">
                    <h5 className="admin-card-title">System Status</h5>
                    <p>All systems operational. Last backup: 24 hours ago.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-footer">
          <p>&copy; {new Date().getFullYear()} Your Application Name. All rights reserved.</p>
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            <FaSignOutAlt className="logout-icon" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;