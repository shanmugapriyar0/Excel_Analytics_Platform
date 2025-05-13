import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../redux/authSlice';
import {
  FaSignOutAlt, FaUser, FaChartBar, FaCalendarAlt, 
  FaTasks, FaBell, FaCog, FaFileUpload, FaBars
} from 'react-icons/fa';
import FileUpload from './FileUpload';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  const formatDate = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="app-logo">
            <div className="logo-icon">DM</div>
            {sidebarOpen && <span className="logo-text">DataMaster</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars />
          </button>
        </div>
        
        <div className="sidebar-menu">
          <ul>
            <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
              <FaChartBar className="menu-icon" />
              {sidebarOpen && <span>Dashboard</span>}
            </li>
            <li className={activeTab === 'upload' ? 'active' : ''} onClick={() => setActiveTab('upload')}>
              <FaFileUpload className="menu-icon" />
              {sidebarOpen && <span>File Upload</span>}
            </li>
            <li className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
              <FaTasks className="menu-icon" />
              {sidebarOpen && <span>Tasks</span>}
            </li>
            <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
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
                <div className="user-role">{user.role}</div>
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
              <span className="badge">2</span>
            </button>
            <div className="header-user">
              <div className="user-avatar">
                <FaUser />
              </div>
              <div className="user-name">{user.username}</div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard-overview">
              <section className="stats-section">
                <div className="section-header">
                  <h2>Dashboard Overview</h2>
                </div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon"><FaChartBar /></div>
                    <div className="stat-value">1,245</div>
                    <div className="stat-label">Total Views</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon"><FaUser /></div>
                    <div className="stat-value">84</div>
                    <div className="stat-label">Users</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon"><FaFileUpload /></div>
                    <div className="stat-value">32</div>
                    <div className="stat-label">Files</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon"><FaCalendarAlt /></div>
                    <div className="stat-value">12</div>
                    <div className="stat-label">Events</div>
                  </div>
                </div>
              </section>
              
              {/* Admin section */}
              {user.role === 'admin' && (
                <section className="admin-section">
                  <div className="section-header">
                    <h2>Admin Controls</h2>
                  </div>
                  <p className="section-desc">
                    Welcome to the admin section! Here you can manage users, view system statistics, and access admin-only features.
                  </p>
                  <div className="admin-grid">
                    <div className="admin-card">
                      <h3 className="admin-card-title">User Management</h3>
                      <p>Add, modify, or remove user accounts. Set permissions and roles.</p>
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
          {activeTab === 'upload' && <FileUpload />}
          
          {/* Placeholder for other tabs */}
          {activeTab !== 'dashboard' && activeTab !== 'upload' && (
            <div className="placeholder-content">
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Content</h2>
              <p>This feature is coming soon.</p>
            </div>
          )}
        </main>
        
        <footer className="dashboard-footer">
          <p>© {new Date().getFullYear()} DataMaster. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
