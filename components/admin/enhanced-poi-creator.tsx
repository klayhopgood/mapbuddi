"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Search, MapPin, Plus, X, Star, Check } from "lucide-react";

export interface ListPOI {
  id?: number;
  categoryId?: number;
  name: string;
  description?: string;
  sellerNotes?: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string; // Just the ID for reference, not storing Google's data
  address?: string;
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

interface SearchResult {
  placeId: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating?: number; // For display only, not stored
  types: string[];
}

export const EnhancedPOICreator = ({ categories, pois, onPoisChange }: EnhancedPOICreatorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<ListPOI | null>(null);
  const [pendingPOI, setPendingPOI] = useState<ListPOI | null>(null); // For confirmation before adding
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize Google Map
  useEffect(() => {
    const updateMapMarkers = () => {
      if (!mapInstanceRef.current || !(window as any).google) return;

      // Clear existing markers
      markersRef.current.forEach((marker: any) => marker.setMap(null));
      markersRef.current = [];

      // Add markers for confirmed POIs
      pois.forEach((poi) => {
        const category = categories[poi.categoryId || 0];
        const marker = new (window as any).google.maps.Marker({
          position: { lat: poi.latitude, lng: poi.longitude },
          map: mapInstanceRef.current,
          title: poi.name,
          label: {
            text: category?.emoji || "📍",
            fontSize: "16px",
          },
        });

        marker.addListener('click', () => {
          setSelectedPOI(poi);
          setPendingPOI(null); // Clear any pending POI
        });

        markersRef.current.push(marker);
      });

      // Add marker for pending POI (different color)
      if (pendingPOI) {
        const pendingMarker = new (window as any).google.maps.Marker({
          position: { lat: pendingPOI.latitude, lng: pendingPOI.longitude },
          map: mapInstanceRef.current,
          title: "New Location (click to confirm)",
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ff4444" stroke="#ffffff" stroke-width="2"/>
                <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new (window as any).google.maps.Size(24, 24),
          },
        });

        pendingMarker.addListener('click', () => {
          setSelectedPOI(pendingPOI);
        });

        markersRef.current.push(pendingMarker);
      }

      // Fit bounds if we have POIs
      if (pois.length > 0 || pendingPOI) {
        const bounds = new (window as any).google.maps.LatLngBounds();
        pois.forEach(poi => {
          bounds.extend({ lat: poi.latitude, lng: poi.longitude });
        });
        if (pendingPOI) {
          bounds.extend({ lat: pendingPOI.latitude, lng: pendingPOI.longitude });
        }
        mapInstanceRef.current.fitBounds(bounds);
      }
    };

    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        // Load Google Maps script if not already loaded
        if (!(window as any).google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`;
          script.async = true;
          script.defer = true;
          
          script.onload = () => {
            createMap();
          };
          
          document.head.appendChild(script);
        } else {
          createMap();
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    const createMap = () => {
      if (!mapRef.current || !(window as any).google) return;

      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco default
        zoom: 12,
      });

      mapInstanceRef.current = map;

      // Handle map clicks to create pending POI
      map.addListener('click', (e: any) => {
        if (e.latLng) {
          const newPendingPOI: ListPOI = {
            name: "New Location",
            description: "",
            latitude: e.latLng.lat(),
            longitude: e.latLng.lng(),
            address: `${e.latLng.lat().toFixed(6)}, ${e.latLng.lng().toFixed(6)}`,
            categoryId: 0,
          };
          setPendingPOI(newPendingPOI);
          setSelectedPOI(newPendingPOI);
        }
      });

      setIsMapLoaded(true);
      updateMapMarkers();
    };

    initMap();
  }, [categories, pois, pendingPOI]);

  // Update map markers when POIs change (optimized to prevent reloads)
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !(window as any).google) return;

    // Clear existing markers
    markersRef.current.forEach((marker: any) => marker.setMap(null));
    markersRef.current = [];

    // Add markers for confirmed POIs
    pois.forEach((poi) => {
      const category = categories[poi.categoryId || 0];
      const marker = new (window as any).google.maps.Marker({
        position: { lat: poi.latitude, lng: poi.longitude },
        map: mapInstanceRef.current,
        title: poi.name,
        label: {
          text: category?.emoji || "📍",
          fontSize: "16px",
        },
      });

      marker.addListener('click', () => {
        setSelectedPOI(poi);
        setPendingPOI(null);
      });

      markersRef.current.push(marker);
    });

    // Add pending marker if exists
    if (pendingPOI) {
      const pendingMarker = new (window as any).google.maps.Marker({
        position: { lat: pendingPOI.latitude, lng: pendingPOI.longitude },
        map: mapInstanceRef.current,
        title: "New Location (click to confirm)",
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ff4444" stroke="#ffffff" stroke-width="2"/>
              <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new (window as any).google.maps.Size(24, 24),
        },
      });

      pendingMarker.addListener('click', () => {
        setSelectedPOI(pendingPOI);
      });

      markersRef.current.push(pendingMarker);
    }
  }, [pois.length, categories.length, isMapLoaded, pendingPOI?.latitude, pendingPOI?.longitude]); // Optimized dependencies

  // Search for places
  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch('/api/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Search results:', data); // Debug log
        setSearchResults(data.results || []);
        setShowResults(true);
      } else {
        console.error('Search failed:', response.statusText);
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Clear previous timeout
    if ((window as any).searchTimeout) {
      clearTimeout((window as any).searchTimeout);
    }
    
    // Set new timeout for search
    (window as any).searchTimeout = setTimeout(() => {
      if (value.length > 2) {
        searchPlaces(value);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300); // 300ms debounce
  };

  // Handle search input key press
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      if (searchQuery.length > 2) {
        searchPlaces(searchQuery);
      }
    }
  };

  // Add POI from search result as pending
  const addPOIFromSearch = (result: SearchResult) => {
    const newPendingPOI: ListPOI = {
      name: result.name,
      description: result.address,
      latitude: result.location.lat,
      longitude: result.location.lng,
      googlePlaceId: result.placeId, // Just store the ID, not Google's data
      address: result.address,
      categoryId: 0,
    };

    setPendingPOI(newPendingPOI);
    setSelectedPOI(newPendingPOI);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);

    // Center map on new POI
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: result.location.lat, lng: result.location.lng });
      mapInstanceRef.current.setZoom(15);
    }
  };

  // Confirm pending POI (add to actual list)
  const confirmPendingPOI = () => {
    if (!pendingPOI) return;
    
    onPoisChange([...pois, pendingPOI]);
    setPendingPOI(null);
    setSelectedPOI(null);
  };

  // Cancel pending POI
  const cancelPendingPOI = () => {
    setPendingPOI(null);
    setSelectedPOI(null);
  };

  // Update POI (works for both pending and confirmed POIs)
  const updatePOI = (updates: Partial<ListPOI>) => {
    if (!selectedPOI) return;
    
    const updatedPOI = { ...selectedPOI, ...updates };
    
    if (pendingPOI && selectedPOI === pendingPOI) {
      // Update pending POI
      setPendingPOI(updatedPOI);
      setSelectedPOI(updatedPOI);
    } else {
      // Update confirmed POI
      const updatedPois = pois.map(poi => 
        poi === selectedPOI ? updatedPOI : poi
      );
      onPoisChange(updatedPois);
      setSelectedPOI(updatedPOI);
    }
  };

  // Remove confirmed POI
  const removePOI = (poiToRemove: ListPOI) => {
    onPoisChange(pois.filter(poi => poi !== poiToRemove));
    if (selectedPOI === poiToRemove) {
      setSelectedPOI(null);
    }
  };

  const isPendingPOI = selectedPOI && pendingPOI && selectedPOI === pendingPOI;

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search size={20} />
            Search Places
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Input
              ref={searchInputRef}
              placeholder="Type to search for places (e.g., 'Gimlet', 'restaurants in NYC')..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="w-full"
            />
            
            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => addPOIFromSearch(result)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{result.name}</div>
                            <div className="text-xs text-gray-500">{result.address}</div>
                            {result.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star size={12} className="text-yellow-500" />
                                <span className="text-xs">{result.rating}</span>
                              </div>
                            )}
                          </div>
                          <Button size="sm" variant="outline">
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">No places found for &ldquo;{searchQuery}&rdquo;</div>
                )}
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            Search for places above, or click anywhere on the map below to drop a pin
          </p>
        </CardContent>
      </Card>

      {/* Map and POI Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin size={20} />
              Map ({pois.length} confirmed, {pendingPOI ? '1 pending' : '0 pending'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef} 
              className="w-full h-96 rounded-lg border bg-gray-100"
              style={{ minHeight: "400px" }}
            />
            <p className="text-xs text-gray-500 mt-2">
              Click anywhere on the map to add a location. Red markers are pending confirmation.
            </p>
          </CardContent>
        </Card>

        {/* POI Details Panel */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedPOI ? (isPendingPOI ? "Confirm New Location" : "Edit Location") : "Select a location"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPOI ? (
              <div className="space-y-4">
                {isPendingPOI && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <MapPin size={16} />
                      <span className="font-medium">Pending Location</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Review the details below and click &ldquo;Confirm & Add&rdquo; to add this location to your list.
                    </p>
                  </div>
                )}

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

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    placeholder="Location name"
                    value={selectedPOI.name}
                    onChange={(e) => updatePOI({ name: e.target.value })}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <Input
                    placeholder="Address or description"  
                    value={selectedPOI.address || ""}
                    onChange={(e) => updatePOI({ address: e.target.value })}
                  />
                </div>

                {/* Seller Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Your Notes</label>
                  <Textarea
                    placeholder="Add your personal notes and recommendations (e.g., 'we had the pasta and it was great!')"
                    value={selectedPOI.sellerNotes || ""}
                    onChange={(e) => updatePOI({ sellerNotes: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Google Place Info */}
                {selectedPOI.googlePlaceId && (
                  <div className="text-xs text-gray-500 border-t pt-2">
                    <div>Google Place ID: {selectedPOI.googlePlaceId}</div>
                    <div className="text-xs text-blue-600">Google details (photos, ratings) will be fetched dynamically when buyers view this list</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  {isPendingPOI ? (
                    <>
                      <Button
                        type="button"
                        onClick={confirmPendingPOI}
                        className="flex-1"
                      >
                        <Check size={16} className="mr-1" />
                        Confirm & Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelPendingPOI}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                <p>Search for a place above, click on the map to drop a pin, or click on an existing marker to edit</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Added POIs List */}
      <Card>
        <CardHeader>
          <CardTitle>Added Locations ({pois.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pois.length > 0 ? (
            <div className="space-y-3">
              {pois.map((poi, index) => {
                const category = categories[poi.categoryId || 0];
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setSelectedPOI(poi);
                      setPendingPOI(null);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {category?.emoji} {category?.name}
                      </Badge>
                      <div>
                        <div className="font-medium text-sm">{poi.name}</div>
                        <div className="text-xs text-gray-500">{poi.address}</div>
                        {poi.sellerNotes && (
                          <div className="text-xs text-blue-600 mt-1">&ldquo;{poi.sellerNotes}&rdquo;</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePOI(poi);
                        }}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Plus size={48} className="mx-auto mb-4 opacity-50" />
              <p>No locations added yet. Use the search bar or click on the map to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};