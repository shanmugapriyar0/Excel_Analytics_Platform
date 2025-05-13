// IntroPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IntroAnimation from "./IntroAnimation";
import { FaChartPie, FaRobot, FaHistory, FaFileUpload, FaDatabase, FaDownload } from "react-icons/fa";
import Marquee from "react-fast-marquee";
import chartImage from "../Screenshot 2025-05-07 211552.png"; // Use existing login image
import excelLogo from "../assets/logo.png"; // Import Excel logo
import "../css/IntroPage.css";
import { gsap } from "gsap";

const IntroPage = () => {
  const [showAnimation, setShowAnimation] = useState(true);
  const [buttonsReady, setButtonsReady] = useState(false); // Added new state variable for button readiness
  const navigate = useNavigate();

  // Prevent scrolling during animation
  useEffect(() => {
    document.body.style.overflow = showAnimation ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showAnimation]);

  // Set background color on mount
  useEffect(() => {
    document.body.style.backgroundColor = 'var(--bg-green)';
    // Cleanup when component unmounts
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    // Small delay before showing buttons to prevent flickering
    setTimeout(() => setButtonsReady(true), 100);
  };

  // Enhanced button handlers with GSAP animations on .intro-form
  const handleLogin = () => {
    const tl = gsap.timeline({
      onComplete: () => navigate("/login")
    });
    tl.to(".intro-form", {
      opacity: 0,
      y: -20,
      duration: 0.5,
      ease: "power2.inOut"
    });
  };

  const handleRegister = () => {
    const tl = gsap.timeline({
      onComplete: () => navigate("/signup")
    });
    tl.to(".intro-form", {
      opacity: 0,
      y: -20,
      duration: 0.5,
      ease: "power2.inOut"
    });
  };
  
  return (
    <>
      {showAnimation && <IntroAnimation onComplete={handleAnimationComplete} />}
      <div className="intro-container" style={{ visibility: showAnimation ? "hidden" : "visible" }}>
        <div className="header-logo">
          <img src={excelLogo} alt="ExcelInsights Logo" />
        </div>
        <div className="intro-main">
          <div className="intro-left">
            <div className="chart-image">
              <img src={chartImage} alt="Data visualization" />
            </div>
            <h1>ExcelInsights - Data<br />Analysis & Chart</h1>
            <p>Upload Excel files for analysis and charts.</p>
          </div>
          
          <div className="intro-right">
            {/* Updated intro form with conditional opacity and changed texts */}
            <div className="intro-form" style={{ opacity: buttonsReady ? 1 : 0, transition: 'opacity 0.3s ease' }}>
              <h2>Excel Insights</h2>
              <p>Upload Excel files for analysis and charts.</p>
              <div className="intro-buttons">
                <button onClick={handleLogin} className="login-btn">Log In</button>
                <button onClick={handleRegister} className="register-btn">Register</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="features-section">
          <h3>Features</h3>
          <Marquee speed={40} gradient={false}>
            <div className="feature-item"><FaChartPie className="feature-icon" /><p>Generate 2D/3D charts</p></div>
            <div className="feature-item"><FaRobot className="feature-icon" /><p>AI-powered insights</p></div>
            <div className="feature-item"><FaHistory className="feature-icon" /><p>Upload history</p></div>
            <div className="feature-item"><FaFileUpload className="feature-icon" /><p>Upload Excel files</p></div>
            <div className="feature-item"><FaDatabase className="feature-icon" /><p>Data analysis</p></div>
            <div className="feature-item"><FaDownload className="feature-icon" /><p>Download reports</p></div>
          </Marquee>
        </div>
      </div>
    </>
  );
};

export default IntroPage;
