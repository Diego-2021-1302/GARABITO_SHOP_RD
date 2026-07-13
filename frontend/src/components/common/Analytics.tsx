import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Reemplazar con ID real
const FB_PIXEL_ID = 'XXXXXXXXXXXXXXX'; // Reemplazar con ID real

const Analytics: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Google Analytics PageView
    if (typeof window.gtag === 'function') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }

    // Meta Pixel PageView
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  return null; // Este componente no renderiza nada visual
};

export default Analytics;
