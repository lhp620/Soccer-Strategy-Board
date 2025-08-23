import React, { useEffect } from 'react';

const AdSense = ({ 
  adClient, 
  adSlot, 
  adFormat = 'auto',
  fullWidthResponsive = false, // Disable responsive for fixed sizes
  style = {},
  className = ''
}) => {
  useEffect(() => {
    try {
      // Push the ad to AdSense
      if (window.adsbygoogle && window.adsbygoogle.push) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // Enforce fixed dimensions if provided
  const containerStyle = {
    ...style,
    ...(style.width && { 
      width: style.width, 
      minWidth: style.width, 
      maxWidth: style.width 
    }),
    ...(style.height && { 
      height: style.height, 
      minHeight: style.height, 
      maxHeight: style.height 
    })
  };

  const adStyle = {
    display: 'block',
    ...containerStyle
  };

  return (
    <div className={`adsense-container ${className}`} style={containerStyle}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  );
};

export default AdSense;