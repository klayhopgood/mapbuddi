// Google Places API utilities for MapBuddi location lists

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  types: string[];
  rating?: number;
  photos?: string[];
}

export interface PlaceDetails extends PlaceSearchResult {
  description?: string;
  website?: string;
  phoneNumber?: string;
  openingHours?: string[];
}

// Client-side Google Places API calls (requires NEXT_PUBLIC_GOOGLE_PLACES_API_KEY)
export async function searchPlaces(query: string, location?: { lat: number; lng: number }): Promise<PlaceSearchResult[]> {
  try {
    const response = await fetch('/api/places/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        location,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to search places');
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    const response = await fetch(`/api/places/details/${placeId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get place details');
    }

    const data = await response.json();
    return data.result || null;
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
}

// For manual POI entry
export interface ManualPOI {
  name: string;
  description?: string;
  sellerNotes?: string;
  location: {
    lat: number;
    lng: number;
  };
  address?: string;
}

// Validate coordinates
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// Format address for display
export function formatAddress(address: string): string {
  return address.split(',').slice(0, 3).join(', ');
}

// Get place type emoji (basic mapping)
export function getPlaceTypeEmoji(types: string[]): string {
  const typeEmojiMap: { [key: string]: string } = {
    restaurant: '🍽️',
    food: '🍽️',
    tourist_attraction: '🎭',
    museum: '🏛️',
    park: '🌳',
    bar: '🍻',
    night_club: '🍻',
    shopping_mall: '🛍️',
    store: '🛍️',
    lodging: '🏨',
    hospital: '🏥',
    bank: '🏦',
    gas_station: '⛽',
    church: '⛪',
    school: '🏫',
    university: '🎓',
    gym: '💪',
    beauty_salon: '💄',
    car_repair: '🔧',
    library: '📚',
    movie_theater: '🎬',
    pharmacy: '💊',
    post_office: '📮',
    police: '👮',
    subway_station: '🚇',
    taxi_stand: '🚕',
    travel_agency: '✈️',
    veterinary_care: '🐕',
    zoo: '🦁',
  };

  for (const type of types) {
    if (typeEmojiMap[type]) {
      return typeEmojiMap[type];
    }
  }

  return '📍'; // Default pin emoji
}
