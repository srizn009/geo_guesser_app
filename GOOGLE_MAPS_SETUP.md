# Google Maps Integration Guide

## Adding Google Maps API Key

### Step 1: Get your API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Go to **Credentials** and create an API key
5. Restrict the API key to your domain (recommended for production)

### Step 2: Add API Key to Environment
Add this to your `.env` file:

```
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Step 3: Install Required Package

```bash
npm install @googlemaps/js-api-loader
```

### Step 4: Update the Play Component

The play page currently uses a static Nepal map as a placeholder. Once you add the API key, you can integrate Google Maps:

```typescript
import { Loader } from '@googlemaps/js-api-loader';

// In your component
useEffect(() => {
  const loader = new Loader({
    apiKey: 'YOUR_API_KEY',
    version: 'weekly',
  });

  loader.load().then(async () => {
    const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;
    
    const map = new Map(mapRef.current!, {
      center: { lat: 28.3949, lng: 84.1240 }, // Nepal center
      zoom: 7,
      disableDefaultUI: true,
    });

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      // Handle map click
    });
  });
}, []);
```

## Current Implementation

The `/play` route currently uses:
- Static Nepal map image as background
- Click coordinates converted to lat/lng
- Visual markers for guesses
- Distance calculation using Haversine formula
- Score calculation based on accuracy

## Features Working Now

✅ Two-column layout (map | image)  
✅ Random location selection from database  
✅ Click-to-guess functionality  
✅ Distance calculation  
✅ Score calculation (max 1000 points)  
✅ Visual feedback with markers  
✅ Results display after submission  
✅ Difficulty badges  
✅ Responsive design  

## Next Steps

1. Add Google Maps API key to `.env`
2. Install `@googlemaps/js-api-loader`
3. Replace static map with interactive Google Map
4. Implement game session management
5. Save scores to database
6. Create multi-round gameplay (10 locations per game)
