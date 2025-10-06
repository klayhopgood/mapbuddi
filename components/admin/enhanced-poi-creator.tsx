"use client";

import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Search, Plus, X, Star } from "lucide-react";

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

interface SimplePOICreatorProps {
  categories: ListCategory[];
  pois: ListPOI[];
  onPoisChange: (pois: ListPOI[]) => void;
}

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  website?: string;
  formatted_phone_number?: string;
}

export const EnhancedPOICreator = ({ categories, pois, onPoisChange }: SimplePOICreatorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<ListPOI | null>(null);

  const searchPlaces = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch('/api/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addPOIFromSearch = (place: PlaceResult, categoryIndex: number) => {
    const newPOI: ListPOI = {
      name: place.name,
      description: place.formatted_address,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      googlePlaceId: place.place_id,
      address: place.formatted_address,
      rating: place.rating,
      website: place.website,
      phoneNumber: place.formatted_phone_number,
      categoryId: categoryIndex,
    };

    onPoisChange([...pois, newPOI]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const addManualPOI = () => {
    const newPOI: ListPOI = {
      name: "Custom Location",
      description: "",
      sellerNotes: "",
      latitude: 0,
      longitude: 0,
      address: "",
      categoryId: 0,
    };
    onPoisChange([...pois, newPOI]);
    setSelectedPOI(newPOI);
  };

  const removePOI = (index: number) => {
    const updatedPois = pois.filter((_, i) => i !== index);
    onPoisChange(updatedPois);
    if (selectedPOI === pois[index]) {
      setSelectedPOI(null);
    }
  };

  const updatePOI = (index: number, updates: Partial<ListPOI>) => {
    const updatedPois = [...pois];
    updatedPois[index] = { ...updatedPois[index], ...updates };
    onPoisChange(updatedPois);
    if (selectedPOI === pois[index]) {
      setSelectedPOI(updatedPois[index]);
    }
  };

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
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for restaurants, attractions, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchPlaces()}
              className="flex-1"
            />
            <Button onClick={searchPlaces} disabled={isSearching}>
              {isSearching ? "..." : "Search"}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Search Results:</h4>
              {searchResults.map((place, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{place.name}</div>
                      <div className="text-sm text-gray-500">{place.formatted_address}</div>
                      {place.rating && (
                        <div className="flex items-center gap-1 text-sm mt-1">
                          <Star size={12} className="text-yellow-500" />
                          {place.rating}/5
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 ml-4">
                      {categories.map((category, categoryIndex) => (
                        <Button
                          key={categoryIndex}
                          size="sm"
                          variant="outline"
                          onClick={() => addPOIFromSearch(place, categoryIndex)}
                        >
                          Add to {category.emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current POIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Added Places ({pois.length})</span>
            <Button onClick={addManualPOI} variant="outline" size="sm">
              <Plus size={16} className="mr-1" />
              Add Custom
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pois.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>No places added yet. Search above to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pois.map((poi, index) => {
                const category = categories[poi.categoryId || 0];
                const isSelected = selectedPOI === poi;
                
                return (
                  <div key={index} className={`p-4 border rounded-lg ${isSelected ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPOI(isSelected ? null : poi)}
                        >
                          {isSelected ? "Close" : "Edit"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removePOI(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="font-medium">{poi.name}</div>
                      <div className="text-sm text-gray-500">{poi.address}</div>
                    </div>

                    {/* Edit Form */}
                    {isSelected && (
                      <div className="space-y-3 mt-4 pt-4 border-t">
                        <div>
                          <label className="block text-sm font-medium mb-1">Category</label>
                          <div className="flex flex-wrap gap-2">
                            {categories.map((cat, catIndex) => (
                              <Button
                                key={catIndex}
                                size="sm"
                                variant={poi.categoryId === catIndex ? "default" : "outline"}
                                onClick={() => updatePOI(index, { categoryId: catIndex })}
                              >
                                {cat.emoji} {cat.name}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Name</label>
                          <Input
                            value={poi.name}
                            onChange={(e) => updatePOI(index, { name: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Address/Description</label>
                          <Input
                            value={poi.address || ""}
                            onChange={(e) => updatePOI(index, { address: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Your Notes & Recommendations</label>
                          <Textarea
                            placeholder="Tell buyers why this place is special..."
                            value={poi.sellerNotes || ""}
                            onChange={(e) => updatePOI(index, { sellerNotes: e.target.value })}
                            rows={3}
                          />
                        </div>

                        {poi.googlePlaceId && (
                          <div className="text-xs text-gray-500">
                            Google Place ID: {poi.googlePlaceId}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};