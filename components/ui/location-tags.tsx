"use client";

import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

interface LocationTagsProps {
  country?: string | null;
  cities?: string | null;
  variant?: "card" | "page";
  className?: string;
}

export function LocationTags({ country, cities, variant = "card", className = "" }: LocationTagsProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!country && !cities) return null;

  const citiesArray = cities ? JSON.parse(cities) : [];
  const isCard = variant === "card";

  if (isCard) {
    // Compact display for cards with popover for multiple cities
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
            citiesArray.length === 1 ? (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {citiesArray[0]}
              </Badge>
            ) : (
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-1.5 py-0.5 cursor-pointer hover:bg-secondary/80 transition-colors"
                    title={`Cities: ${citiesArray.join(', ')}`}
                  >
                    {citiesArray.length} cities
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700 mb-2">Cities included:</p>
                    <div className="flex flex-wrap gap-1">
                      {citiesArray.map((city: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          🏙️ {city}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )
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
