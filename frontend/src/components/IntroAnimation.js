import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import excelLogo from "../assets/logo.png";

const IntroAnimation = ({ onComplete }) => {
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const circleRef = useRef(null);
  const animationContainerRef = useRef(null);
  const [elementsReady, setElementsReady] = useState(false);

  // First useEffect - check if elements exist and set ready state
  useEffect(() => {
    if (
      overlayRef.current && 
      logoRef.current && 
      textRef.current && 
      circleRef.current && 
      animationContainerRef.current
    ) {
      setElementsReady(true);
    }
  }, []); // This runs once after initial render

  // Second useEffect - only run animations when elements are confirmed ready
  useEffect(() => {
    // Only proceed if elements are ready
    if (!elementsReady) return;

    const tl = gsap.timeline();
    
    // Initial setup
    gsap.set(textRef.current, { y: 50, opacity: 0 });
    gsap.set(circleRef.current, { 
      scale: 0,
      opacity: 1,
      display: "none" 
    });
    
    // First animation sequence (slide)
    tl.fromTo(overlayRef.current, 
      { width: "100%" }, 
      { width: "0%", duration: 1.3, ease: "power4.inOut", delay: 0.5 }
    )
    .fromTo(logoRef.current, 
      { scale: 0, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 1, ease: "back.out(1.7)" }, 
      "-=0.8"
    )
    .to(textRef.current, 
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 
      "-=0.4"
    )
    // Second animation (circular reveal with direct transition)
    .set(circleRef.current, { display: "block" })
    .to(circleRef.current, { 
      scale: 100, 
      duration: 0.6, 
      ease: "power2.inOut",
    })
    // Fade out entire animation container
    .to(animationContainerRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: onComplete
    });
  }, [elementsReady, onComplete]);

  return (
    <div ref={animationContainerRef} className="intro-animation">
      <div ref={overlayRef} className="intro-overlay"></div>
      <div className="intro-content">
        <div ref={logoRef} className="intro-logo">
          <img src={excelLogo} alt="ExcelInsights Logo" />
        </div>
        <h1 ref={textRef}>ExcelInsights</h1>
      </div>
      <div ref={circleRef} className="intro-circle"></div>
    </div>
  );
};

export default IntroAnimation;
