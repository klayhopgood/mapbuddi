"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ExternalLink } from "lucide-react";
import { getListPois } from "@/server-actions/list-pois";
import { Button } from "@/components/ui/button";

interface Poi {
  id: number;
  name: string;
  address: string | null;
  description: string | null;
  notes: string | null;
  categoryId: number;
  latitude: string | null; // Changed from number to string (decimal from DB)
  longitude: string | null; // Changed from number to string (decimal from DB)
  createdAt: Date | null;
  categoryName: string;
  categoryEmoji: string;
}

interface ViewPoisSectionProps {
  listId: number;
}

export function ViewPoisSection({ listId }: ViewPoisSectionProps) {
  const [pois, setPois] = useState<Poi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPois = async () => {
      try {
        setLoading(true);
        const poisData = await getListPois(listId);
        setPois(poisData);
      } catch (error) {
        console.error("Failed to fetch POIs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPois();
  }, [listId]);

  const openInMaps = (poi: Poi) => {
    if (poi.latitude && poi.longitude) {
      const lat = parseFloat(poi.latitude);
      const lng = parseFloat(poi.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, '_blank');
        return;
      }
    }
    
    if (poi.address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(poi.address)}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-100 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (pois.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No POIs found for this list</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {pois.map((poi) => (
        <Card key={poi.id} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{poi.categoryEmoji}</span>
                  <h4 className="font-medium">{poi.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {poi.categoryName}
                  </Badge>
                </div>
                
                {poi.address && (
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {poi.address}
                  </p>
                )}
                
                {poi.description && (
                  <p className="text-sm mb-2">{poi.description}</p>
                )}
                
                {poi.notes && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mt-2">
                    <p className="text-sm font-medium text-yellow-800">Notes:</p>
                    <p className="text-sm text-yellow-700">{poi.notes}</p>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => openInMaps(poi)}
                className="ml-3 shrink-0"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Maps
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
