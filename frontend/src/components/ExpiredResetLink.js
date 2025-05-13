import React from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import { gsap } from "gsap";
import { useEffect } from "react";

const ExpiredResetLink = () => {
  const navigate = useNavigate();

  // Animation effect
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      ".expired-link-container",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
    
    tl.fromTo(
      [".expired-icon", "h2", "p", "button"],
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.4 }
    );
  }, []);

  const handleRequestNewLink = () => {
    navigate("/forgot-password");
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="reset-expired-page">
      <div className="expired-link-container">
        <div className="expired-icon">
          <FaExclamationTriangle />
        </div>
        <h2>Password Reset Link Invalid</h2>
        <p>
          The password reset link you clicked has expired or is no longer valid.
          This may be because:
        </p>
        <ul className="reset-link-reasons">
          <li>The link has expired (valid for only 3 minutes)</li>
          <li>You've requested a newer reset link that replaced this one</li>
          <li>You've already reset your password using another link</li>
        </ul>
        <p>Please request a new link to reset your password.</p>
        <div className="expired-actions">
          <button 
            className="new-link-button" 
            onClick={handleRequestNewLink}
          >
            Request New Link
          </button>
          <button 
            className="back-to-login" 
            onClick={handleBackToLogin}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpiredResetLink;