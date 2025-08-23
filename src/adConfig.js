// AdSense Configuration
// Replace these with your actual AdSense publisher ID and ad unit IDs

export const AD_CONFIG = {
  // Your AdSense Publisher ID (replace XXXXXXXXXXXXXXXXX with your actual ID)
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXXX',
  
  // Ad Unit IDs (replace XXXXXXXXXX with your actual ad unit IDs)
  adUnits: {
    leftSidebar: 'XXXXXXXXXX',   // Left header ad
    rightSidebar: 'XXXXXXXXXX'   // Right header ad
  },
  
  // Ad formats and sizes
  formats: {
    banner: {
      format: 'horizontal',
      style: { width: '100%', height: '90px' }
    },
    sidebar: {
      format: 'vertical', 
      style: { width: '100%', height: '250px' }
    },
    mobile: {
      format: 'horizontal',
      style: { width: '100%', height: '50px' }
    }
  }
};

// Helper function to get responsive ad size
export const getAdSize = (adType, isMobile = false) => {
  if (isMobile && adType.includes('banner')) {
    return AD_CONFIG.formats.mobile;
  }
  
  switch (adType) {
    case 'banner':
      return AD_CONFIG.formats.banner;
    case 'sidebar':
      return AD_CONFIG.formats.sidebar;
    default:
      return AD_CONFIG.formats.banner;
  }
};