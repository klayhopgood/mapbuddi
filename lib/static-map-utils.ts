interface POICoordinate {
  lat: number;
  lng: number;
}

export function generateStaticMapUrl(pois: POICoordinate[], apiKey: string): string {
  if (!pois || pois.length === 0) {
    return '';
  }

  // Calculate bounds to fit all POIs
  const lats = pois.map(coord => coord.lat);
  const lngs = pois.map(coord => coord.lng);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  // Calculate center point
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  
  // Calculate zoom level based on bounds
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);
  
  let zoom = 15; // Default zoom
  if (maxDiff > 0.1) zoom = 10;
  else if (maxDiff > 0.05) zoom = 12;
  else if (maxDiff > 0.01) zoom = 14;
  else if (maxDiff > 0.005) zoom = 15;
  else zoom = 16;

  // Build markers parameter for Google Static Maps API
  const markers = pois.map((coord, index) => 
    `markers=color:red%7Clabel:${index + 1}%7C${coord.lat},${coord.lng}`
  ).join('&');

  // Google Static Maps API URL
  return `https://maps.googleapis.com/maps/api/staticmap?` +
    `center=${centerLat},${centerLng}` +
    `&zoom=${zoom}` +
    `&size=400x300` +
    `&maptype=roadmap` +
    `&${markers}` +
    `&key=${apiKey}`;
}
