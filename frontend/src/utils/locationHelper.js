// src/utils/locationHelper.js
// Safely extract a display string from any location format

export const getLocation = (location) => {
  if (!location) return 'Remote';
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    // MongoDB GeoJSON or custom object: { coordinates, city, state, country }
    return location.city || location.state || location.country || 'India';
  }
  return 'Remote';
};