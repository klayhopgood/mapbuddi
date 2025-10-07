"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  flag: string;
  region: string;
}

interface State {
  name: string;
  iso2: string;
}

interface City {
  name: string;
  latitude: number;
  longitude: number;
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

  const [countrySearch, setCountrySearch] = useState("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [citySearch, setCitySearch] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Load countries from REST Countries API
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(prev => ({ ...prev, countries: true }));
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flag,region');
        const data = await response.json();
        
        const sortedCountries = data.sort((a: Country, b: Country) => 
          a.name.common.localeCompare(b.name.common)
        );
        
        setCountries(sortedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
        // Fallback to essential countries if API fails
        setCountries([
          { name: { common: "United States", official: "United States of America" }, cca2: "US", flag: "🇺🇸", region: "Americas" },
          { name: { common: "United Kingdom", official: "United Kingdom" }, cca2: "GB", flag: "🇬🇧", region: "Europe" },
          { name: { common: "Canada", official: "Canada" }, cca2: "CA", flag: "🇨🇦", region: "Americas" },
          { name: { common: "Australia", official: "Australia" }, cca2: "AU", flag: "🇦🇺", region: "Oceania" },
          { name: { common: "Germany", official: "Germany" }, cca2: "DE", flag: "🇩🇪", region: "Europe" },
          { name: { common: "France", official: "France" }, cca2: "FR", flag: "🇫🇷", region: "Europe" },
          { name: { common: "Japan", official: "Japan" }, cca2: "JP", flag: "🇯🇵", region: "Asia" },
          { name: { common: "Brazil", official: "Brazil" }, cca2: "BR", flag: "🇧🇷", region: "Americas" },
        ]);
      } finally {
        setLoading(prev => ({ ...prev, countries: false }));
      }
    };
    
    loadCountries();
  }, []);

  // Load states when country changes using CountryStateCity API
  useEffect(() => {
    if (selectedCountry) {
      const loadStates = async () => {
        try {
          setLoading(prev => ({ ...prev, states: true }));
          
          // Use CountryStateCity API for states
          const response = await fetch(`https://api.countrystatecity.in/v1/countries/${selectedCountry}/states`, {
            headers: {
              'X-CSCAPI-KEY': 'YOUR_API_KEY' // This is a free API, users would need to get their own key
            }
          });
          
          if (response.ok) {
            const statesData = await response.json();
            setStates(statesData || []);
          } else {
            setStates([]);
          }
        } catch (error) {
          console.error("Error fetching states:", error);
          setStates([]);
        } finally {
          setLoading(prev => ({ ...prev, states: false }));
        }
      };
      
      loadStates();
      setSelectedState("");
      setCities([]);
    } else {
      setStates([]);
      setCities([]);
      setSelectedState("");
    }
  }, [selectedCountry]);

  // Load cities when state changes or search cities
  useEffect(() => {
    if (selectedCountry && (selectedState || citySearch)) {
      const loadCities = async () => {
        try {
          setLoading(prev => ({ ...prev, cities: true }));
          
          let citiesData = [];
          
          if (selectedState) {
            // Load cities for specific state
            const response = await fetch(`https://api.countrystatecity.in/v1/countries/${selectedCountry}/states/${selectedState}/cities`, {
              headers: {
                'X-CSCAPI-KEY': 'YOUR_API_KEY'
              }
            });
            
            if (response.ok) {
              citiesData = await response.json();
            }
          } else if (citySearch && citySearch.length > 2) {
            // Search cities globally using OpenDataSoft API (free, no key required)
            const response = await fetch(`https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&q=${encodeURIComponent(citySearch)}&facet=country_code&refine.country_code=${selectedCountry}&rows=50`);
            
            if (response.ok) {
              const data = await response.json();
              citiesData = data.records?.map((record: any) => ({
                name: record.fields.name,
                latitude: record.fields.coordinates?.[0] || 0,
                longitude: record.fields.coordinates?.[1] || 0,
              })) || [];
            }
          }
          
          setCities(citiesData);
        } catch (error) {
          console.error("Error fetching cities:", error);
          setCities([]);
        } finally {
          setLoading(prev => ({ ...prev, cities: false }));
        }
      };
      
      const timeoutId = setTimeout(loadCities, 300); // Debounce search
      return () => clearTimeout(timeoutId);
    } else {
      setCities([]);
    }
  }, [selectedCountry, selectedState, citySearch]);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    return countries.filter(country =>
      country.name.common.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.name.official.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countries, countrySearch]);

  const selectedCountryData = countries.find(c => c.cca2 === selectedCountry);
  const selectedStateData = states.find(s => s.iso2 === selectedState);

  const handleCountrySelect = (countryCode: string) => {
    setSelectedState("");
    setCitySearch("");
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
    setCitySearch("");
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
      {selectedCountry && (
        <div>
          <label className="text-xs text-gray-600 mb-1 block">State/Province (optional)</label>
          {loading.states ? (
            <div className="text-sm text-gray-500">Loading states...</div>
          ) : states.length > 0 ? (
            <select 
              value={selectedState} 
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">All {selectedCountryData?.name.common}</option>
              {states.map((state) => (
                <option key={state.iso2} value={state.iso2}>
                  {state.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-gray-500">No states/provinces available</div>
          )}
        </div>
      )}

      {/* City Search */}
      {selectedCountry && (
        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Search Cities ({selectedCities.length} selected)
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Type to search cities..."
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              className="flex-1"
            />
            <div className="flex items-center text-xs text-gray-500">
              <Search size={14} />
            </div>
          </div>
          
          {loading.cities && (
            <div className="text-sm text-gray-500">Searching cities...</div>
          )}
          
          {cities.length > 0 && (
            <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
              <div className="space-y-1">
                {cities.map((city, index) => (
                  <div key={`${city.name}-${index}`} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`city-${index}`}
                      checked={selectedCities.includes(city.name)}
                      onChange={() => handleCityToggle(city.name)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`city-${index}`} className="text-sm flex-1 cursor-pointer">
                      {city.name}
                      {selectedStateData && (
                        <span className="text-gray-500 ml-1">({selectedStateData.name})</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {citySearch && citySearch.length > 2 && !loading.cities && cities.length === 0 && (
            <div className="text-sm text-gray-500">No cities found for &ldquo;{citySearch}&rdquo;</div>
          )}
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

      {/* API Info */}
      <div className="text-xs text-gray-400 bg-gray-50 rounded p-2">
        Location data powered by REST Countries API and OpenDataSoft GeoNames
      </div>
    </div>
  );
}
