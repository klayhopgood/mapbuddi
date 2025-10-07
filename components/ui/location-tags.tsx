import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface LocationTagsProps {
  country?: string | null;
  cities?: string | null;
  variant?: "card" | "page";
  className?: string;
}

export function LocationTags({ country, cities, variant = "card", className = "" }: LocationTagsProps) {
  if (!country && !cities) return null;

  const citiesArray = cities ? JSON.parse(cities) : [];
  const isCard = variant === "card";

  if (isCard) {
    // Compact display for cards
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <MapPin size={12} className="text-gray-400" />
        <div className="flex items-center gap-1">
          {country && (
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              {country}
            </Badge>
          )}
          {citiesArray.length > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {citiesArray.length === 1 
                ? citiesArray[0]
                : `${citiesArray.length} cities`
              }
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Full display for pages
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <MapPin size={16} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Location</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {country && (
          <Badge variant="outline" className="flex items-center gap-1">
            <span className="text-lg">🌍</span>
            {country}
          </Badge>
        )}
        
        {citiesArray.map((city: string, index: number) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            <span className="text-lg">🏙️</span>
            {city}
          </Badge>
        ))}
      </div>
      
      {citiesArray.length > 3 && (
        <p className="text-xs text-gray-500">
          Showing {Math.min(3, citiesArray.length)} of {citiesArray.length} cities
        </p>
      )}
    </div>
  );
}
