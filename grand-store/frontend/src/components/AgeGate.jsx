import React, { useState, useEffect } from 'react';
import './AgeGate.css';

export default function AgeGate() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDenied, setIsDenied] = useState(false);

  useEffect(() => {
    // Disable scrolling while the gate is open
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isVisible]);

  const handleYes = () => {
    setIsVisible(false);
  };

  const handleNo = () => {
    setIsDenied(true);
  };

  if (!isVisible) return null;

  return (
    <div className="age-gate-overlay">
      <div className="age-gate-modal">
        <div className="age-gate-content">
          <p className="age-gate-kicker">The Grand Store</p>
          <h2>Are you 18 years or older?</h2>
          {isDenied ? (
            <div className="age-gate-denied-message">
              <p>You cannot visit this site as you are under the legal smoking and drinking age.</p>
            </div>
          ) : (
            <>
              <p className="age-gate-desc">
                You must be of legal smoking/drinking age to enter this site. By clicking "Yes", you confirm that you are 18 years of age or older.
              </p>
              <div className="age-gate-actions">
                <button className="btn-yes" onClick={handleYes}>Yes, I am 18+</button>
                <button className="btn-no" onClick={handleNo}>No, I am under 18</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
