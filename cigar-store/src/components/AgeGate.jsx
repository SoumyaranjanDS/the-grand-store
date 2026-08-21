import React, { useState, useEffect } from 'react';
import './AgeGate.css';

export default function AgeGate() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if verified this session
    const hasVerified = sessionStorage.getItem('age_verified');
    if (!hasVerified) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    // Disable scrolling while the gate is open
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isVisible]);

  const handleYes = () => {
    sessionStorage.setItem('age_verified', 'true');
    setIsVisible(false);
  };

  const handleNo = () => {
    window.location.href = 'https://google.com';
  };

  if (!isVisible) return null;

  return (
    <div className="age-gate-overlay">
      <div className="age-gate-modal">
        <div className="age-gate-content">
          <p className="age-gate-kicker">Cigar Connoisseur Club</p>
          <h2>Are you 18 years or older?</h2>
          <p className="age-gate-desc">
            You must be of legal smoking age to enter this site. By clicking "Yes", you confirm that you are 18 years of age or older.
          </p>
          <div className="age-gate-actions">
            <button className="btn-yes" onClick={handleYes}>Yes, I am 18+</button>
            <button className="btn-no" onClick={handleNo}>No, I am under 18</button>
          </div>
        </div>
      </div>
    </div>
  );
}
