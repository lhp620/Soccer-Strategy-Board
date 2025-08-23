# Google AdSense Setup Guide

## Overview
Your Soccer Strategy Board now has Google AdSense integration with ads placed in strategic locations:
- Left header ad (left side of the title)
- Right header ad (right side of the title)

## Setup Steps

### 1. Apply for Google AdSense
1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign up with your Google account
3. Add your website URL
4. Wait for approval (can take 1-14 days)

### 2. Get Your Publisher ID
1. Once approved, go to your AdSense dashboard
2. Find your Publisher ID (starts with `ca-pub-`)
3. Copy this ID

### 3. Create Ad Units
1. In AdSense dashboard, go to "Ads" → "By ad unit"
2. Create 2 ad units:
   - **Left Header Ad**: Display ad, responsive, name it "Left Header"
   - **Right Header Ad**: Display ad, responsive, name it "Right Header"
3. Copy each ad unit ID

### 4. Update Configuration
1. Open `src/adConfig.js`
2. Replace `XXXXXXXXXXXXXXXXX` with your Publisher ID
3. Replace each `XXXXXXXXXX` with your respective ad unit IDs:
   ```javascript
   export const AD_CONFIG = {
     publisherId: 'ca-pub-1234567890123456', // Your actual ID
     adUnits: {
       leftSidebar: '1234567890',    // Your left header ad unit ID
       rightSidebar: '1234567891'    // Your right header ad unit ID
     }
   };
   ```

### 5. Update HTML Template
1. Open `public/index.html`
2. Replace `ca-pub-XXXXXXXXXXXXXXXXX` with your actual Publisher ID in the script tag

### 6. Deploy and Test
1. Build your app: `npm run build`
2. Deploy to your hosting platform
3. Visit your live site to test ads (ads won't show on localhost)

## Ad Placement Strategy

### Current Placement
- **Left Header Ad**: High visibility, positioned left of the main title
- **Right Header Ad**: High visibility, positioned right of the main title

### Revenue Optimization Tips
1. **Monitor Performance**: Use AdSense reports to track which ads perform best
2. **A/B Test**: Try different ad sizes and placements
3. **User Experience**: Don't overwhelm users with too many ads
4. **Mobile Optimization**: Ads automatically hide on mobile sidebars for better UX

## Expected Revenue
Revenue depends on:
- **Traffic volume**: More visitors = more ad impressions
- **User engagement**: Longer sessions = more ad views
- **Geographic location**: Some regions have higher ad rates
- **Niche relevance**: Sports/coaching content typically has decent ad rates

## Troubleshooting

### Ads Not Showing
1. Check if your site is approved by AdSense
2. Verify Publisher ID and Ad Unit IDs are correct
3. Ensure site is live (not localhost)
4. Check browser console for errors
5. Wait 24-48 hours after setup for ads to appear

### Low Revenue
1. Increase website traffic through SEO and marketing
2. Improve user engagement with new features
3. Consider additional ad placements (but don't overdo it)
4. Optimize for mobile users

## Next Steps
1. Set up Google Analytics to track user behavior
2. Consider adding more premium features to increase user engagement
3. Explore other monetization methods (subscriptions, premium features)
4. Build an email list for marketing

## Support
- [AdSense Help Center](https://support.google.com/adsense/)
- [AdSense Community](https://support.google.com/adsense/community)