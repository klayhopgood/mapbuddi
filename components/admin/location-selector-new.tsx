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

interface LocationSelectorProps {
  selectedCountry?: string;
  selectedCities?: string[];
  onLocationChange: (country: string | undefined, cities: string[]) => void;
}

export function LocationSelector({ selectedCountry, selectedCities = [], onLocationChange }: LocationSelectorProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [countrySearch, setCountrySearch] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Load countries from REST Countries API
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flag,region');
        const data = await response.json();
        
        // Sort countries alphabetically
        const sortedCountries = data.sort((a: Country, b: Country) => 
          a.name.common.localeCompare(b.name.common)
        );
        
        setCountries(sortedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
        // Fallback to a basic list if API fails
        setCountries([
          { name: { common: "United States", official: "United States of America" }, cca2: "US", flag: "🇺🇸", region: "Americas" },
          { name: { common: "United Kingdom", official: "United Kingdom of Great Britain and Northern Ireland" }, cca2: "GB", flag: "🇬🇧", region: "Europe" },
          { name: { common: "Canada", official: "Canada" }, cca2: "CA", flag: "🇨🇦", region: "Americas" },
          { name: { common: "Australia", official: "Commonwealth of Australia" }, cca2: "AU", flag: "🇦🇺", region: "Oceania" },
          { name: { common: "Germany", official: "Federal Republic of Germany" }, cca2: "DE", flag: "🇩🇪", region: "Europe" },
          { name: { common: "France", official: "French Republic" }, cca2: "FR", flag: "🇫🇷", region: "Europe" },
          { name: { common: "Japan", official: "Japan" }, cca2: "JP", flag: "🇯🇵", region: "Asia" },
          { name: { common: "Brazil", official: "Federative Republic of Brazil" }, cca2: "BR", flag: "🇧🇷", region: "Americas" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadCountries();
  }, []);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    return countries.filter(country =>
      country.name.common.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.name.official.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countries, countrySearch]);

  const selectedCountryData = countries.find(c => c.cca2 === selectedCountry);

  const handleCountrySelect = (countryCode: string) => {
    onLocationChange(countryCode, []);
    setShowCountryPicker(false);
    setCountrySearch("");
  };

  const handleAddCity = () => {
    if (cityInput.trim() && !selectedCities.includes(cityInput.trim())) {
      const newCities = [...selectedCities, cityInput.trim()];
      onLocationChange(selectedCountry, newCities);
      setCityInput("");
    }
  };

  const handleRemoveCity = (cityToRemove: string) => {
    const newCities = selectedCities.filter(city => city !== cityToRemove);
    onLocationChange(selectedCountry, newCities);
  };

  const handleClearLocation = () => {
    onLocationChange(undefined, []);
    setCityInput("");
  };

  const handleCityInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCity();
    }
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
              disabled={loading}
            >
              {selectedCountryData ? (
                <span className="flex items-center gap-2">
                  <span>{selectedCountryData.flag}</span>
                  <span>{selectedCountryData.name.common}</span>
                </span>
              ) : (
                loading ? "Loading countries..." : "Select a country..."
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
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name.common}</span>
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

      {/* Cities Input */}
      {selectedCountry && (
        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Cities ({selectedCities.length} selected)
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Type a city name and press Enter"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyPress={handleCityInputKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleAddCity} 
              disabled={!cityInput.trim() || selectedCities.includes(cityInput.trim())}
              size="sm"
            >
              Add
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Add cities that are relevant to your WanderList. You can add any city name.
          </p>
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
            
            {selectedCities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedCities.map((city) => (
                  <Badge key={city} variant="secondary" className="text-xs">
                    {city}
                    <button
                      onClick={() => handleRemoveCity(city)}
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
