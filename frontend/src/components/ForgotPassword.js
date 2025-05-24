import React, { useState, useEffect } from "react";
import ImageSlider from "./ImageSlider"; 
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, reset } from "../redux/authSlice";
import Notification from "./Notification";
import { gsap } from "gsap";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const dispatch = useDispatch();

  // Get state from Redux store
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // Effect to handle error messages and success notifications
  useEffect(() => {
    if (isError) {
      // Create more specific error messages based on the error type
      let errorMsg = message || "Failed to send reset link. Please try again.";
      
      // Specific error for email not found
      if (message && message.includes("No account")) {
        errorMsg = "No account with that email address exists. Please check your email or sign up first.";
      }
      
      setNotification({ 
        show: true, 
        type: "error", 
        message: errorMsg
      });
      setIsSubmitted(false);
    }
    
    if (isSuccess && isSubmitted) {
      let notificationMsg = "Password reset link sent!";
      let resetUrl = "";
      
      // Check if the response contains a resetUrl
      if (message && message.resetUrl) {
        resetUrl = message.resetUrl;
        notificationMsg += " Use the link below to reset your password:";
      }
      
      setNotification({
        show: true,
        type: "success",
        message: notificationMsg
      });
      
      // If there's a reset URL, display it clearly for the user to click
      if (resetUrl) {
        // Add a clickable reset link element after a delay
        setTimeout(() => {
          const linkContainer = document.createElement("div");
          linkContainer.className = "reset-link-container";
          linkContainer.style.marginTop = "20px";
          linkContainer.style.padding = "15px";
          linkContainer.style.backgroundColor = "#f0f9f0";
          linkContainer.style.border = "1px solid #2e7d32";
          linkContainer.style.borderRadius = "5px";
          
          const linkHeading = document.createElement("p");
          linkHeading.textContent = "Your password reset link:";
          linkHeading.style.marginBottom = "10px";
          linkHeading.style.fontWeight = "bold";
          
          const link = document.createElement("a");
          link.href = resetUrl;
          link.textContent = "Click here to reset your password";
          link.style.color = "#2e7d32";
          link.style.textDecoration = "underline";
          link.target = "_blank";
          
          linkContainer.appendChild(linkHeading);
          linkContainer.appendChild(link);
          
          // Find the form element and append the link container after it
          const form = document.querySelector(".login-center form");
          if (form) {
            form.parentNode.insertBefore(linkContainer, form.nextSibling);
          }
        }, 100);
        
        // Also log to console for convenience
        console.log('Password reset link:', resetUrl);
      }
      
      // Reset the form after success
      setEmail("");
      setIsSubmitted(false);
    }

    // Clean up function to reset state when component unmounts or dependencies change
    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, dispatch, isSubmitted]);

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

  const handleForgotPassword = (e) => {
    e.preventDefault();
    
    if (!email) {
      setNotification({
        show: true,
        type: "error",
        message: "Please enter your email address",
      });
      return;
    }
    
    // Add email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setNotification({
        show: true,
        type: "error",
        message: "Please enter a valid email address",
      });
      return;
    }
    
    // Set submitted state to true to track the specific submission
    setIsSubmitted(true);
    dispatch(resetPassword({ email }));
  };

  return (
    <div className="login-main">
      <div className="login-left">
        <div className="login-left-flex">
          <ImageSlider /> {/* Replace the static image with ImageSlider */}
        </div>
      </div>
      <div className="login-right">
        <div className="login-right-container">
          <div className="login-center">
            <h2 className="login-heading">Forgot Password</h2>
            <p>Please enter your email to reset password</p>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="login-center-buttons">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Reset Password"}
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

export default ForgotPassword;
