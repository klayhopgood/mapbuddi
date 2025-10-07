"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, MapPin } from "lucide-react";
import { getCountries, getStatesByCountry, getCitiesByCountry, getCitiesByState } from "@/server-actions/locations";
import { Button } from "@/components/ui/button";

interface Country {
  id: number;
  name: string;
  code: string;
  region: string | null;
}

interface State {
  id: number;
  name: string;
  code: string | null;
  countryCode: string;
  countryName: string;
}

interface City {
  id: number;
  name: string;
  countryCode: string;
  countryName: string;
  stateCode: string | null;
  stateName: string | null;
  population: number | null;
}

interface LocationSelectorProps {
  selectedCountry?: string;
  selectedCities?: string[];
  onLocationChange: (country: string | undefined, cities: string[]) => void;
}

export function LocationSelector({ selectedCountry, selectedCities = [], onLocationChange }: LocationSelectorProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState({
    countries: true,
    states: false,
    cities: false,
  });

  const [selectedState, setSelectedState] = useState<string>("");

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      setLoading(prev => ({ ...prev, countries: true }));
      const countriesData = await getCountries();
      setCountries(countriesData);
      setLoading(prev => ({ ...prev, countries: false }));
    };
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const loadStates = async () => {
        setLoading(prev => ({ ...prev, states: true }));
        const statesData = await getStatesByCountry(selectedCountry);
        setStates(statesData);
        setLoading(prev => ({ ...prev, states: false }));
        
        // Also load cities for the country (in case no state is selected)
        setLoading(prev => ({ ...prev, cities: true }));
        const citiesData = await getCitiesByCountry(selectedCountry);
        setCities(citiesData);
        setLoading(prev => ({ ...prev, cities: false }));
      };
      loadStates();
    } else {
      setStates([]);
      setCities([]);
      setSelectedState("");
    }
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const loadCities = async () => {
        setLoading(prev => ({ ...prev, cities: true }));
        const citiesData = await getCitiesByState(selectedCountry, selectedState);
        setCities(citiesData);
        setLoading(prev => ({ ...prev, cities: false }));
      };
      loadCities();
    }
  }, [selectedCountry, selectedState]);

  const handleCountryChange = (countryCode: string) => {
    setSelectedState("");
    onLocationChange(countryCode, []);
  };

  const handleCityToggle = (cityName: string) => {
    const newCities = selectedCities.includes(cityName)
      ? selectedCities.filter(city => city !== cityName)
      : [...selectedCities, cityName];
    
    onLocationChange(selectedCountry, newCities);
  };

  const handleClearLocation = () => {
    setSelectedState("");
    onLocationChange(undefined, []);
  };

  const selectedCountryData = countries.find(c => c.code === selectedCountry);
  const selectedStateData = states.find(s => s.code === selectedState);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={16} className="text-gray-500" />
        <label className="text-sm font-medium">Location Tags</label>
      </div>
      
      {/* Country Selection */}
      <div>
        <label className="text-xs text-gray-600 mb-1 block">Country *</label>
        <Select value={selectedCountry || ""} onValueChange={handleCountryChange}>
          <SelectTrigger>
            <SelectValue placeholder={loading.countries ? "Loading countries..." : "Select a country"} />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* State Selection (if available) */}
      {selectedCountry && states.length > 0 && (
        <div>
          <label className="text-xs text-gray-600 mb-1 block">State/Province (optional)</label>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger>
              <SelectValue placeholder={loading.states ? "Loading states..." : "Select a state/province"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All {selectedCountryData?.name}</SelectItem>
              {states.map((state) => (
                <SelectItem key={state.code} value={state.code || ""}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Cities Selection */}
      {selectedCountry && cities.length > 0 && (
        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Cities ({selectedCities.length} selected)
          </label>
          <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
            {loading.cities ? (
              <p className="text-sm text-gray-500">Loading cities...</p>
            ) : (
              <div className="space-y-1">
                {cities.map((city) => (
                  <div key={city.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`city-${city.id}`}
                      checked={selectedCities.includes(city.name)}
                      onChange={() => handleCityToggle(city.name)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`city-${city.id}`} className="text-sm flex-1 cursor-pointer">
                      {city.name}
                      {city.stateName && (
                        <span className="text-gray-500 ml-1">({city.stateName})</span>
                      )}
                      {city.population && (
                        <span className="text-xs text-gray-400 ml-2">
                          {city.population.toLocaleString()}
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Location Summary */}
      {selectedCountry && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Selected Location</h4>
            <Button variant="ghost" size="sm" onClick={handleClearLocation}>
              <X size={14} />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Badge variant="outline">
              {selectedCountryData?.name}
            </Badge>
            
            {selectedStateData && (
              <Badge variant="outline">
                {selectedStateData.name}
              </Badge>
            )}
            
            {selectedCities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedCities.map((city) => (
                  <Badge key={city} variant="secondary" className="text-xs">
                    {city}
                    <button
                      onClick={() => handleCityToggle(city)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X size={10} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
