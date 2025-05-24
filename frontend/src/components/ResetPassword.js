import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPasswordConfirm, reset } from "../redux/authSlice";
import Notification from "./Notification";
import { gsap } from "gsap";
import ImageSlider from "./ImageSlider";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import axios from 'axios';

const ResetPassword = () => {
  const { id, token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const validateToken = async () => {
      setIsValidating(true);
      try {
        await axios.get(`http://localhost:5000/api/auth/validate-token/${id}/${token}`);
        setIsValidating(false);
      } catch (error) {
        console.error('Token validation error:', error);
        navigate('/expired-reset-link');
      }
    };

    validateToken();
  }, [id, token, navigate]);

  useEffect(() => {
    if (isError) {
      if (message && message.includes('same as your current password')) {
        setNotification({
          show: true,
          type: "error",
          message: "You cannot reuse your current password. Please choose a different password.",
        });
      } else {
        setNotification({
          show: true,
          type: "error",
          message: message || "Failed to reset password. Please try again.",
        });
      }
      setIsSubmitted(false);
    }

    if (isSuccess && isSubmitted) {
      setNotification({
        show: true,
        type: "success",
        message: "Password reset successful! Redirecting to login...",
      });
      
      setPassword("");
      setConfirmPassword("");
      setIsSubmitted(false);
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, navigate, dispatch, isSubmitted]);

  useEffect(() => {
    if (!isValidating) {
      const tl = gsap.timeline();

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
    }
  }, [isValidating]);

  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setNotification({
        show: true,
        type: "error",
        message: "Please fill in both password fields",
      });
      return;
    }

    if (password !== confirmPassword) {
      setNotification({
        show: true,
        type: "error",
        message: "Passwords do not match",
      });
      return;
    }

    if (password.length < 6) {
      setNotification({
        show: true,
        type: "error",
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    setIsSubmitted(true);
    dispatch(resetPasswordConfirm({ id, token, password }));
  };

  if (isValidating) {
    return (
      <div className="validation-loading">
        <div className="loading-spinner"></div>
        <p>Validating your reset link...</p>
      </div>
    );
  }

  return (
    <div className="login-main">
      <div className="login-left">
        <div className="login-left-flex">
          <ImageSlider />
        </div>
      </div>
      <div className="login-right">
        <div className="login-right-container">
          <div className="login-center">
            <h2 className="login-heading">Reset Password</h2>
            <p>Please enter your new password</p>
            <form onSubmit={handleResetPassword}>
              <div className="pass-input-div">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {password.length > 0 && (
                  <div onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                )}
              </div>

              <div className="pass-input-div">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPassword.length > 0 && (
                  <div onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                )}
              </div>

              <div className="login-center-buttons">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
              <p className="login-bottom-p">
                Remember your password?{" "}
                <Link to="/login" className="navigation-button">
                  Login
                </Link>
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

export default ResetPassword;
