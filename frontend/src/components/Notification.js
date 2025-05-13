// Create this file at: frontend/src/components/Notification.js
import React, { useEffect, useState } from 'react';
import '../css/index.css'; // Import your CSS file for styling

const Notification = ({ type, message, onClose }) => {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClosing(true);
      setTimeout(() => {
        onClose();
      }, 300); // wait for slideOut animation to complete
    }, 4000); // auto close after 4 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type} ${closing ? 'closing' : ''}`}>
      <div className="notification-content">
        <span>{message}</span>
        <button className="notification-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default Notification;