/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import Image from "../assets/login.png";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { signup, reset } from '../redux/authSlice';
import Notification from './Notification'; // New import
import { gsap } from "gsap";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // New state for notifications
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  // New states for focus tracking
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

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

    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, message, navigate, dispatch, isAuthenticated]);

  // Add gsap animation effect
  useEffect(() => {
    // Animation when component mounts
    const tl = gsap.timeline();

    // Animate the form entrance
    tl.fromTo(".login-main", { 
      opacity: 0, 
      y: 20 
    }, { 
      opacity: 1, 
      y: 0, 
      duration: 0.6,
      ease: "power3.out" 
    });

    // Staggered animation for form elements
    tl.fromTo(
      [".login-center h2", ".login-center p", "form input", ".login-center-buttons button"],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" },
      "-=0.3"
    );
  }, []);

  // Function to close notifications
  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    dispatch(signup({ username, email, password }));
  };

  const handleLoginClick = () => {
    navigate("/login");
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
            <h2 className="login-heading">Create Account</h2>
            <p>Please enter your details to sign up</p>
            <form onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {/* Updated Password Input */}
              <div className="pass-input-div">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                />
                {passwordFocused && (
                  <div onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                )}
              </div>
              {/* Updated Confirm Password Input */}
              <div className="pass-input-div two-fields">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  required
                />
                {confirmPasswordFocused && (
                  <div onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                )}
              </div>
              <div className="login-center-buttons">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
              <p className="login-bottom-p">
                Already have an account?{" "}
                <a onClick={handleLoginClick} className="navigation-button">
                  Login
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

export default Signup;