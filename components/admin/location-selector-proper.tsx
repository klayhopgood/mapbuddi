"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCountries, getStatesByCountry, getCitiesByState, getCitiesByCountry } from "@/server-actions/locations";

interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  flag: string;
  region: string;
}

interface DbCountry {
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
  const [restCountries, setRestCountries] = useState<Country[]>([]);
  const [dbCountries, setDbCountries] = useState<DbCountry[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState({
    countries: true,
    states: false,
    cities: false,
  });

  const [countrySearch, setCountrySearch] = useState("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Load REST Countries for comprehensive list with flags
  useEffect(() => {
    const loadRestCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flag,region');
        const data = await response.json();
        const sortedCountries = data.sort((a: Country, b: Country) => 
          a.name.common.localeCompare(b.name.common)
        );
        setRestCountries(sortedCountries);
      } catch (error) {
        console.error("Error fetching REST countries:", error);
      }
    };
    
    loadRestCountries();
  }, []);

  // Load database countries for state/city relationships
  useEffect(() => {
    const loadDbCountries = async () => {
      setLoading(prev => ({ ...prev, countries: true }));
      const countriesData = await getCountries();
      setDbCountries(countriesData);
      setLoading(prev => ({ ...prev, countries: false }));
    };
    loadDbCountries();
  }, []);

  // Combine REST countries with database countries, preferring REST for display
  const combinedCountries = useMemo(() => {
    const combined = restCountries.map(restCountry => {
      const dbCountry = dbCountries.find(db => db.code === restCountry.cca2);
      return {
        ...restCountry,
        hasStatesData: !!dbCountry // Whether we have state/city data for this country
      };
    });
    return combined.sort((a, b) => a.name.common.localeCompare(b.name.common));
  }, [restCountries, dbCountries]);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return combinedCountries;
    return combinedCountries.filter(country =>
      country.name.common.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.name.official.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [combinedCountries, countrySearch]);

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

  const selectedCountryData = combinedCountries.find(c => c.cca2 === selectedCountry);
  const selectedStateData = states.find(s => s.code === selectedState);

  const handleCountrySelect = (countryCode: string) => {
    setSelectedState("");
    onLocationChange(countryCode, []);
    setShowCountryPicker(false);
    setCountrySearch("");
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={16} className="text-gray-500" />
        <label className="text-sm font-medium">Location Tags</label>
      </div>
      
      {/* Country Selection */}
      <div>
        <label className="text-xs text-gray-600 mb-1 block">Country *</label>
        <Popover open={showCountryPicker} onOpenChange={setShowCountryPicker}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={showCountryPicker}
              className="w-full justify-between"
              disabled={loading.countries}
            >
              {selectedCountryData ? (
                <span className="flex items-center gap-2">
                  <span>{selectedCountryData.flag}</span>
                  <span>{selectedCountryData.name.common}</span>
                  {!selectedCountryData.hasStatesData && (
                    <span className="text-xs text-amber-600">(Limited data)</span>
                  )}
                </span>
              ) : (
                loading.countries ? "Loading countries..." : "Select a country..."
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Search countries..." 
                value={countrySearch}
                onValueChange={setCountrySearch}
              />
              <CommandList>
                <CommandEmpty>No countries found.</CommandEmpty>
                <CommandGroup>
                  {filteredCountries.slice(0, 50).map((country) => (
                    <CommandItem
                      key={country.cca2}
                      value={country.name.common}
                      onSelect={() => handleCountrySelect(country.cca2)}
                    >
                      <span className="flex items-center gap-2 w-full">
                        <span>{country.flag}</span>
                        <span className="flex-1">{country.name.common}</span>
                        <span className="text-xs text-gray-500">({country.region})</span>
                        {country.hasStatesData && (
                          <span className="text-xs text-green-600">✓ Full data</span>
                        )}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
              <SelectItem value="">All {selectedCountryData?.name.common}</SelectItem>
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

      {/* Fallback message if no cities available */}
      {selectedCountry && !loading.cities && cities.length === 0 && (
        <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
          No cities available in our database for {selectedCountryData?.name.common}. 
          We&apos;re working on expanding our location data coverage.
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
            <Badge variant="outline" className="flex items-center gap-1 w-fit">
              <span>{selectedCountryData?.flag}</span>
              <span>{selectedCountryData?.name.common}</span>
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
