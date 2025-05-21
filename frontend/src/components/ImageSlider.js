import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image1 from '../assets/login.png';
import Image2 from '../assets/ExcelReports.png';
import Image3 from '../assets/Aiinsights.png';
import Image4 from '../assets/Threecharts.png';
import Image5 from '../assets/Security.png';

const ImageSlider = () => {
  // You can add more images from your assets folder
  const images = [
    { src: Image1, alt: "Excel analytics dashboard" },
    { src: Image2, alt: "Data visualization" },
    { src: Image3, alt: "Chart analytics" },
    { src: Image4, alt: "Excel insights" },
    { src: Image5, alt: "Security" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 6000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="image-slider">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />
      </AnimatePresence>
      
      {/* Slide indicators */}
      <div className="slider-indicators">
        {images.map((_, index) => (
          <span 
            key={index} 
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;