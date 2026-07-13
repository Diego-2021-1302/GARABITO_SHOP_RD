import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MarketingScripts: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Google Analytics 4 Page View
    if (window.gtag) {
      window.gtag('config', 'G-XXXXXXXXXX', {
        page_path: location.pathname + location.search,
      });
    }

    // Facebook Pixel Page View
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  return null; // Componente invisible
};

export default MarketingScripts;
