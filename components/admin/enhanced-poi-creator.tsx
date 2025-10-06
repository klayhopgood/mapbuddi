"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Loader } from "@googlemaps/js-api-loader";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "../ui/use-toast";
import { MapPin, Search, Plus, X, Star, Clock, Globe, Phone } from "lucide-react";
import { getPlaceDetails, PlaceDetails } from "@/lib/google-places";

export interface ListPOI {
  id?: number;
  categoryId?: number;
  name: string;
  description?: string;
  sellerNotes?: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  address?: string;
  rating?: number;
  website?: string;
  phoneNumber?: string;
  photos?: string[];
}

export interface ListCategory {
  id?: number;
  name: string;
  emoji: string;
  iconColor: string;
  displayOrder: number;
}

interface EnhancedPOICreatorProps {
  categories: ListCategory[];
  pois: ListPOI[];
  onPoisChange: (pois: ListPOI[]) => void;
}

export const EnhancedPOICreator = ({ categories, pois, onPoisChange }: EnhancedPOICreatorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedPOI, setSelectedPOI] = useState<ListPOI | null>(null);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize Google Maps
  const initMap = useCallback(async () => {
    try {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "",
        version: "weekly",
        libraries: ["places", "geometry"],
      });

      const google = await loader.load();
      
      if (!mapRef.current) return;

      // Initialize map
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco default
        zoom: 12,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Initialize autocomplete
      if (searchInputRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
          types: ["establishment"],
          fields: ["place_id", "name", "formatted_address", "geometry", "types", "rating", "photos"],
        });

        autocomplete.bindTo("bounds", map);
        autocompleteRef.current = autocomplete;

        // Handle place selection
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location) {
            map.setCenter(place.geometry.location);
            map.setZoom(15);
            handlePlaceSelection(place);
          }
        });
      }

      // Handle map clicks
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          handleMapClick(e.latLng);
        }
      });

      setIsMapLoaded(true);
      updateMapMarkers();
    } catch (error) {
      console.error("Error loading Google Maps:", error);
      toast({
        title: "Map Error",
        description: "Failed to load Google Maps. Please check your API key.",
        variant: "destructive",
      });
    }
  }, []);

  useEffect(() => {
    initMap();
  }, [initMap]);

  // Update markers when POIs change
  useEffect(() => {
    if (isMapLoaded) {
      updateMapMarkers();
    }
  }, [pois, isMapLoaded]);

  const updateMapMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each POI
    pois.forEach((poi, index) => {
      const category = categories[poi.categoryId || 0];
      const marker = new google.maps.Marker({
        position: { lat: poi.latitude, lng: poi.longitude },
        map: mapInstanceRef.current,
        title: poi.name,
        label: {
          text: category?.emoji || "📍",
          fontSize: "16px",
        },
      });

      marker.addListener("click", () => {
        setSelectedPOI(poi);
        loadPlaceDetails(poi.googlePlaceId);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if we have POIs
    if (pois.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      pois.forEach(poi => {
        bounds.extend({ lat: poi.latitude, lng: poi.longitude });
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [pois, categories]);

  const handlePlaceSelection = async (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location) return;

    const newPOI: ListPOI = {
      name: place.name || "Unknown Place",
      description: place.formatted_address || "",
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      googlePlaceId: place.place_id,
      address: place.formatted_address,
      rating: place.rating,
      categoryId: 0, // Default to first category
    };

    onPoisChange([...pois, newPOI]);
    setSelectedPOI(newPOI);
    
    if (place.place_id) {
      loadPlaceDetails(place.place_id);
    }

    toast({
      title: "POI Added",
      description: `${place.name} has been added to your list.`,
    });
  };

  const handleMapClick = (latLng: google.maps.LatLng) => {
    const newPOI: ListPOI = {
      name: "Custom Location",
      description: "",
      latitude: latLng.lat(),
      longitude: latLng.lng(),
      address: `${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`,
      categoryId: 0,
    };

    onPoisChange([...pois, newPOI]);
    setSelectedPOI(newPOI);
    
    toast({
      title: "Custom POI Added",
      description: "Click on the marker to edit details.",
    });
  };

  const loadPlaceDetails = async (placeId?: string) => {
    if (!placeId) return;
    
    setIsLoadingDetails(true);
    try {
      const details = await getPlaceDetails(placeId);
      setPlaceDetails(details);
    } catch (error) {
      console.error("Error loading place details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const updatePOI = (updates: Partial<ListPOI>) => {
    if (!selectedPOI) return;
    
    const updatedPois = pois.map(poi => 
      poi === selectedPOI ? { ...poi, ...updates } : poi
    );
    onPoisChange(updatedPois);
    setSelectedPOI({ ...selectedPOI, ...updates });
  };

  const removePOI = (poiToRemove: ListPOI) => {
    onPoisChange(pois.filter(poi => poi !== poiToRemove));
    if (selectedPOI === poiToRemove) {
      setSelectedPOI(null);
      setPlaceDetails(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search size={20} />
            Search & Add Places
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              ref={searchInputRef}
              placeholder="Search for restaurants, attractions, hotels..."
              className="flex-1"
            />
            <Button type="button" variant="outline">
              <MapPin size={16} />
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Search for places or click anywhere on the map to add a custom location
          </p>
        </CardContent>
      </Card>

      {/* Map and Details Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Map */}
        <Card>
          <CardHeader>
            <CardTitle>Map View ({pois.length} locations)</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef} 
              className="w-full h-96 rounded-lg border"
              style={{ minHeight: "400px" }}
            />
          </CardContent>
        </Card>

        {/* POI Details Panel */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedPOI ? "Edit Location" : "Select a location"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPOI ? (
              <div className="space-y-4">
                {/* Category Assignment */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={selectedPOI.categoryId === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => updatePOI({ categoryId: index })}
                      >
                        {category.emoji} {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-3">
                  <Input
                    placeholder="Location name"
                    value={selectedPOI.name}
                    onChange={(e) => updatePOI({ name: e.target.value })}
                  />
                  <Input
                    placeholder="Address or description"
                    value={selectedPOI.description || ""}
                    onChange={(e) => updatePOI({ description: e.target.value })}
                  />
                  <Textarea
                    placeholder="Your personal notes and recommendations..."
                    value={selectedPOI.sellerNotes || ""}
                    onChange={(e) => updatePOI({ sellerNotes: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Google Place Details */}
                {placeDetails && (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-medium text-sm">Google Place Details</h4>
                    
                    {placeDetails.rating && (
                      <div className="flex items-center gap-2 text-sm">
                        <Star size={16} className="text-yellow-500" />
                        <span>{placeDetails.rating}/5</span>
                      </div>
                    )}
                    
                    {placeDetails.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe size={16} />
                        <a 
                          href={placeDetails.website} 
                          target="_blank" 
                          className="text-blue-600 hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                    
                    {placeDetails.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={16} />
                        <span>{placeDetails.phoneNumber}</span>
                      </div>
                    )}

                    {placeDetails.photos && placeDetails.photos.length > 0 && (
                      <div>
                        <Image 
                          src={placeDetails.photos[0]} 
                          alt={placeDetails.name}
                          width={400}
                          height={128}
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removePOI(selectedPOI)}
                  >
                    <X size={16} className="mr-1" />
                    Remove
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPOI(null)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                <p>Click on a marker or search for a place to edit its details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* POI List Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Added Locations ({pois.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pois.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pois.map((poi, index) => {
                const category = categories[poi.categoryId || 0];
                return (
                  <div
                    key={index}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setSelectedPOI(poi);
                      loadPlaceDetails(poi.googlePlaceId);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">
                        {category?.emoji} {category?.name}
                      </Badge>
                      {poi.rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star size={12} className="text-yellow-500" />
                          {poi.rating}
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium text-sm">{poi.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{poi.address}</p>
                    {poi.sellerNotes && (
                      <p className="text-xs text-blue-600 mt-1 truncate">
                        &ldquo;{poi.sellerNotes}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Plus size={48} className="mx-auto mb-4 opacity-50" />
              <p>No locations added yet. Search for places or click on the map to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
