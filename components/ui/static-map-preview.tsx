"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";

interface POI {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  address?: string | null;
}

interface StaticMapPreviewProps {
  pois: POI[];
  listName: string;
  mapUrl?: string; // Pre-generated map URL from server
  className?: string;
}

export const StaticMapPreview = ({ pois, listName, mapUrl, className }: StaticMapPreviewProps) => {
  if (!pois || pois.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px] ${className}`}>
        <MapPin size={48} className="text-gray-400 mb-4" />
        <p className="text-gray-500 text-center">
          No locations available for map preview
        </p>
      </div>
    );
  }

  // Convert POI coordinates to numbers for the location list
  const coordinates = pois.map(poi => ({
    lat: parseFloat(poi.latitude),
    lng: parseFloat(poi.longitude),
    name: poi.name
  }));

  // If no mapUrl provided, show fallback
  if (!mapUrl) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px] ${className}`}>
        <MapPin size={48} className="text-gray-400 mb-4" />
        <p className="text-gray-500 text-center">
          Map preview unavailable
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative rounded-lg overflow-hidden border border-gray-200 max-w-md mx-auto">
        <Image
          src={mapUrl}
          alt={`Map preview of ${listName} locations`}
          width={400}
          height={300}
          className="w-full h-auto"
          unoptimized // Important for external API images
        />
        
        {/* Map overlay with location count */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            <span className="text-sm font-medium">
              {pois.length} location{pois.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Static map preview showing all locations in {listName}
      </p>
    </div>
  );
};
