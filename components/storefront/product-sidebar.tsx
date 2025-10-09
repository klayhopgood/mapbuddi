"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Heading } from "../ui/heading";
import React, { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { anchorTags } from "@/lib/routes";
import { useCurrency } from "@/hooks/use-currency";

export const ProductSidebar = (props: {
  uniqueStoresList: { name: string; slug: string }[];
  selectedSellers: string[];
  uniqueCountries: string[];
  uniqueCities: string[];
}) => {
  const [isSellerListExpanded, setIsSellerListExpanded] = useState(false);
  const [isCountryListExpanded, setIsCountryListExpanded] = useState(false);
  const [isCityListExpanded, setIsCityListExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  
  const searchParams = useSearchParams();
  const seller = searchParams.get("seller");
  const country = searchParams.get("country");
  const city = searchParams.get("city");
  const rating = searchParams.get("rating");
  const search = searchParams.get("search");
  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");
  
  const pathname = usePathname();
  const router = useRouter();
  const { formatDisplayPrice } = useCurrency();

  // Initialize local state from URL params
  React.useEffect(() => {
    if (search) setSearchTerm(search);
    if (priceMin) setMinPrice(priceMin);
    if (priceMax) setMaxPrice(priceMax);
  }, [search, priceMin, priceMax]);

  const selectedCountries = country ? country.split("_") : [];
  const selectedCities = city ? city.split("_") : [];

  const updateURL = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    params.set("page", "1"); // Reset to first page when filtering
    
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}#${anchorTags.collectionHeader}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ search: searchTerm || null });
  };

  const handlePriceFilter = () => {
    updateURL({ 
      priceMin: minPrice || null, 
      priceMax: maxPrice || null 
    });
  };

  const hasActiveFilters = seller || country || city || rating || search || priceMin || priceMax;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 w-full">
        <Heading size="h3">Filters</Heading>
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="link"
            className="text-muted-foreground"
            onClick={() => {
              router.push(`${pathname}`);
              setSearchTerm("");
              setMinPrice("");
              setMaxPrice("");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Search Filter */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Search size={16} />
          <Heading size="h4">Search</Heading>
        </div>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            placeholder="Search WanderLists, stores, descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm">Go</Button>
        </form>
        {search && (
          <p className="text-xs text-muted-foreground mt-1">
            Searching for: &quot;{search}&quot;
          </p>
        )}
      </div>

      {/* Price Filter */}
      <div className="mt-4">
        <Heading size="h4">Price Range (USD)</Heading>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Min USD"
            type="number"
            min="0"
            step="0.01"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Max USD"
            type="number"
            min="0"
            step="0.01"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="flex-1"
          />
        </div>
        <Button
          onClick={handlePriceFilter}
          size="sm"
          variant="secondary"
          className="w-full mt-2"
        >
          Apply Price Filter
        </Button>
        {(priceMin || priceMax) && (
          <p className="text-xs text-muted-foreground mt-1">
            Price: ${priceMin || "0"}+ to ${priceMax || "∞"} USD
          </p>
        )}
      </div>

      {/* Star Rating Filter */}
      <div className="mt-4">
        <Heading size="h4">Star Rating</Heading>
        <div className="space-y-2 mt-2">
          {[
            { label: "5 stars only", value: "5" },
            { label: "4+ stars", value: "4" },
            { label: "3+ stars", value: "3" },
            { label: "2+ stars", value: "2" },
            { label: "1+ stars", value: "1" },
          ].map((ratingOption) => (
            <div key={ratingOption.value} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${ratingOption.value}`}
                checked={rating === ratingOption.value}
                onCheckedChange={(checked) => {
                  updateURL({ rating: checked ? ratingOption.value : null });
                }}
              />
              <label
                htmlFor={`rating-${ratingOption.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {ratingOption.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Country Filter */}
      {props.uniqueCountries.length > 0 && (
        <div className="mt-4">
          <Heading size="h4">Country</Heading>
          {props.uniqueCountries.slice(0, 5).map((countryName, i) => (
            <FilterCheckbox
              key={i}
              label={countryName}
              id={countryName}
              selectedItems={selectedCountries}
              filterType="country"
              updateURL={updateURL}
            />
          ))}
          {isCountryListExpanded &&
            props.uniqueCountries
              .slice(5)
              .map((countryName, i) => (
                <FilterCheckbox
                  key={i}
                  label={countryName}
                  id={countryName}
                  selectedItems={selectedCountries}
                  filterType="country"
                  updateURL={updateURL}
                />
              ))}
          {props.uniqueCountries.length > 5 && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-2"
              onClick={() => setIsCountryListExpanded((prev) => !prev)}
            >
              {isCountryListExpanded ? (
                <div className="flex items-center justify-center gap-2">
                  Collapse countries <ChevronUp size={18} className="mt-[2px]" />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Show more countries <ChevronDown size={18} className="mt-[2px]" />
                </div>
              )}
            </Button>
          )}
        </div>
      )}

      {/* City Filter */}
      {props.uniqueCities.length > 0 && (
        <div className="mt-4">
          <Heading size="h4">City</Heading>
          {props.uniqueCities.slice(0, 5).map((cityName, i) => (
            <FilterCheckbox
              key={i}
              label={cityName}
              id={cityName}
              selectedItems={selectedCities}
              filterType="city"
              updateURL={updateURL}
            />
          ))}
          {isCityListExpanded &&
            props.uniqueCities
              .slice(5)
              .map((cityName, i) => (
                <FilterCheckbox
                  key={i}
                  label={cityName}
                  id={cityName}
                  selectedItems={selectedCities}
                  filterType="city"
                  updateURL={updateURL}
                />
              ))}
          {props.uniqueCities.length > 5 && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-2"
              onClick={() => setIsCityListExpanded((prev) => !prev)}
            >
              {isCityListExpanded ? (
                <div className="flex items-center justify-center gap-2">
                  Collapse cities <ChevronUp size={18} className="mt-[2px]" />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Show more cities <ChevronDown size={18} className="mt-[2px]" />
                </div>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Sellers Filter */}
      <div className="mt-4">
        <Heading size="h4">Sellers</Heading>
        {props.uniqueStoresList.slice(0, 5).map((store, i) => (
          <SellerFilterCheckbox
            key={i}
            label={store.name}
            id={store.slug}
            selectedSellers={props.selectedSellers}
          />
        ))}
        {isSellerListExpanded &&
          props.uniqueStoresList
            .slice(5)
            .map((store, i) => (
              <SellerFilterCheckbox
                key={i}
                label={store.name}
                id={store.slug}
                selectedSellers={props.selectedSellers}
              />
            ))}
        {props.uniqueStoresList.length > 5 && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-2"
            onClick={() => setIsSellerListExpanded((prev) => !prev)}
          >
            {isSellerListExpanded ? (
              <div className="flex items-center justify-center gap-2">
                Collapse sellers <ChevronUp size={18} className="mt-[2px]" />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                Show more sellers <ChevronDown size={18} className="mt-[2px]" />
              </div>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

const FilterGroup = (props: { heading: string }) => {
  return (
    <div className="mt-4">
      <Heading size="h4">{props.heading}</Heading>
    </div>
  );
};

const FilterCheckbox = (props: {
  label: string;
  id: string;
  selectedItems: string[];
  filterType: string;
  updateURL: (params: Record<string, string | null>) => void;
}) => {
  return (
    <div className="flex items-center space-x-2 my-2 py-1">
      <Checkbox
        id={props.id}
        checked={props.selectedItems.includes(props.id)}
        onCheckedChange={(checked) => {
          const currentParam = props.selectedItems.join("_");
          
          if (checked) {
            const newValue = currentParam ? `${currentParam}_${props.id}` : props.id;
            props.updateURL({ [props.filterType]: newValue });
          } else {
            const filteredItems = props.selectedItems.filter((item) => item !== props.id);
            props.updateURL({ 
              [props.filterType]: filteredItems.length ? filteredItems.join("_") : null 
            });
          }
        }}
      />
      <label
        htmlFor={props.id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {props.label}
      </label>
    </div>
  );
};

const SellerFilterCheckbox = (props: {
  label: string;
  id: string;
  selectedSellers: string[];
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const seller = searchParams.get("seller");
  const pathname = usePathname();

  return (
    <div className="flex items-center space-x-2 my-2 py-1">
      <Checkbox
        id={props.id}
        checked={props.selectedSellers.includes(props.id)}
        onCheckedChange={(checked) => {
          if (checked) {
            router.push(
              `${pathname}?page=1&seller=${
                seller ? `${seller}_${props.id}` : props.id
              }#${anchorTags.collectionHeader}`
            );
          } else {
            const filteredSellers = seller
              ?.split("_")
              .filter((seller) => seller !== props.id);
            router.push(
              `${pathname}?page=1${
                filteredSellers?.length
                  ? `&seller=${filteredSellers.join("_")}`
                  : ""
              }#${anchorTags.collectionHeader}`
            );
          }
        }}
      />
      <label
        htmlFor={props.id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {props.label}
      </label>
    </div>
  );
};

ProductSidebar.Group = FilterGroup;
ProductSidebar.Checkbox = SellerFilterCheckbox;
