import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';

const client = new Client({});

export async function GET(request: NextRequest, { params }: { params: { placeId: string } }) {
  try {
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      );
    }

    const response = await client.placeDetails({
      params: {
        place_id: params.placeId,
        key: process.env.GOOGLE_PLACES_API_KEY,
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'geometry',
          'types',
          'rating',
          'photos',
          'website',
          'formatted_phone_number',
          'opening_hours',
          'editorial_summary'
        ],
      },
    });

    const place = response.data.result;

    const result = {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: {
        lat: place.geometry?.location.lat || 0,
        lng: place.geometry?.location.lng || 0,
      },
      types: place.types || [],
      rating: place.rating,
      description: place.editorial_summary?.overview,
      website: place.website,
      phoneNumber: place.formatted_phone_number,
      openingHours: place.opening_hours?.weekday_text,
      photos: place.photos?.slice(0, 3).map(photo => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
      ),
    };

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Places details error:', error);
    return NextResponse.json(
      { error: 'Failed to get place details' },
      { status: 500 }
    );
  }
}
