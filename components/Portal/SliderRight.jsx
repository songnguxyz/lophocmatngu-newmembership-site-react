// src/components/Portal/SliderRight.jsx
import React, { useState, useEffect } from 'react';
import styles from './SliderRight.module.css';

const SliderRight = () => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.pageYOffset;
      // Điều kiện để kích hoạt sticky
      if (scrollPosition > 200) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`${styles.sliderRight} ${isSticky ? styles.sticky : ''}`}>
      {/* Nội dung slider phải */}
      <h3>Slider phải</h3>
    </div>
  );
};

export default SliderRight;