import { useState, useEffect } from 'react';

const CounterAnimation = ({ end, duration = 2000, isLoading = false }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Don't animate while loading
    if (isLoading) {
      setCount(0);
      return;
    }

    // Skip animation for zero values or non-numeric values
    if (!end || isNaN(end) || end === 0) {
      setCount(0);
      return;
    }

    let startTime;
    let animationFrame;
    const startValue = 0;
    const endValue = Number(end);

    // Animation function
    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smoother animation
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      // Calculate current value based on progress
      const currentValue = Math.floor(startValue + easedProgress * (endValue - startValue));
      setCount(currentValue);

      // Continue animation if not complete
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateCount);
      }
    };

    // Start animation
    animationFrame = requestAnimationFrame(animateCount);

    // Cleanup
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isLoading]);

  // Format number with commas for thousands
  return typeof count === 'number' ? 
    count.toLocaleString() : 
    count;
};

export default CounterAnimation;