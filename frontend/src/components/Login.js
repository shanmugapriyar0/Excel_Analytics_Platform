/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, reset } from "../redux/authSlice";
import Notification from "./Notification";
import { gsap } from "gsap";
import CustomCheckbox from "./CustomCheckbox";
import ImageSlider from "./ImageSlider"; // Import the new component

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux store
  const { user, isLoading, isError, isSuccess, message, isAuthenticated } =
    useSelector((state) => state.auth);

  // Effect to handle redirection and error messages
  useEffect(() => {
    if (isError) {
      setNotification({ show: true, type: "error", message: message });
    }
    if (isSuccess) {
      setNotification({
        show: true,
        type: "success",
        message: "Success! Redirecting...",
      });
      navigate("/dashboard");
    } else if (isAuthenticated) {
      navigate("/dashboard");
    }

    // Clean up function to reset state when component unmounts or dependencies change
    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, message, navigate, dispatch, isAuthenticated]);

  // Add gsap animation effect
  useEffect(() => {
    // Animation when component mounts
    const tl = gsap.timeline();

    // Animate the form entrance
    tl.fromTo(
      ".login-main",
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
      }
    );

    // Staggered animation for form elements
    tl.fromTo(
      [
        ".login-center h2",
        ".login-center p",
        "form input",
        ".login-center-buttons button",
      ],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" },
      "-=0.3"
    );
  }, []);

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

  // Add a function to handle forgot password link click
  const handleForgotPasswordClick = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="login-main">
      <div className="login-left">
        <div className="login-left-flex">
          {/* Replace the static image with the ImageSlider component */}
          <ImageSlider />
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
                />
                {password.length > 0 && (
                  <div onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                )}
              </div>

              <div className="login-center-options">
                <CustomCheckbox
                  label="Remember for 30 days"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <a 
                  onClick={handleForgotPasswordClick} 
                  className="forgot-pass-link navigation-button"
                >
                  Forgot password?
                </a>
              </div>
              <div className="login-center-buttons">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Logging In..." : "Log In"}
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
