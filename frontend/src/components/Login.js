// frontend/src/components/Login.js

/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import Image from "../assets/login.png";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../redux/authSlice';
import Notification from './Notification'; // New import

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // New state for notifications
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux store
  const { user, isLoading, isError, isSuccess, message, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Effect to handle redirection and error messages
  useEffect(() => {
    if (isError) {
      setNotification({ show: true, type: 'error', message: message });
    }
    if (isSuccess) {
      setNotification({ show: true, type: 'success', message: 'Success! Redirecting...' });
      navigate('/dashboard');
    } else if(isAuthenticated) {
      navigate('/dashboard');
    }

    // Clean up function to reset state when component unmounts or dependencies change
    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, message, navigate, dispatch, isAuthenticated]);

  // Function to close notifications
  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login({ email, password })); // Dispatch the login action
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  return (
    <div className="login-main">
      <div className="login-left">
        <div className="login-left-flex">
          <img src={Image} alt="" />
        </div>
      </div>
      <div className="login-right">
        <div className="login-right-container">
          <div className="login-center">
            <h2 className="login-heading">Welcome back!</h2>
            <p>Please enter your details</p>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="pass-input-div">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {showPassword ? (
                  <FaEyeSlash onClick={() => setShowPassword(!showPassword)} />
                ) : (
                  <FaEye onClick={() => setShowPassword(!showPassword)} />
                )}
              </div>

              <div className="login-center-options">
                <div className="remember-div">
                  <input type="checkbox" id="remember-checkbox" />
                  <label htmlFor="remember-checkbox">Remember for 30 days</label>
                </div>
                <a href="/" className="forgot-pass-link">Forgot password?</a>
              </div>
              <div className="login-center-buttons">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Logging In...' : 'Log In'}
                </button>
              </div>
              <p className="login-bottom-p">
                Don't have an account?{" "}
                <a onClick={handleSignupClick} className="navigation-button">
                  Sign Up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
      {/* Add Notification component */}
      {notification.show && (
        <Notification 
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}
    </div>
  );
};

export default Login;