import React, { useState, useRef, useEffect } from 'react';
import './OTPInput.css';

const OTPInput = ({ length = 6, onComplete, error }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== "" && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Check if complete
    const currentOtp = [...otp];
    currentOtp[index] = element.value;
    if (currentOtp.every(v => v !== "")) {
      onComplete(currentOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").slice(0, length).split("");
    if (data.length === 0) return;

    const newOtp = [...otp];
    data.forEach((char, idx) => {
      if (!isNaN(char)) {
        newOtp[idx] = char;
      }
    });
    setOtp(newOtp);

    // Focus last character or next empty
    const lastIdx = Math.min(data.length, length - 1);
    inputRefs.current[lastIdx].focus();

    if (newOtp.every(v => v !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  return (
    <div className="otp-wrapper">
      <div className="otp-input-container">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            ref={(el) => (inputRefs.current[index] = el)}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={`otp-digit-input ${error ? 'otp-error' : ''}`}
          />
        ))}
      </div>
      {error && <p className="otp-error-msg">{error}</p>}
    </div>
  );
};

export default OTPInput;
