"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { LocationList, ListCategory as DbListCategory, ListPoi as DbListPoi } from "@/db/schema";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { HeadingAndSubheading } from "./heading-and-subheading";
import { Loader2, Plus, MapPin, Search, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getCurrencySelectOptions, formatPrice } from "@/lib/currency";
import { searchPlaces, PlaceSearchResult, getPlaceTypeEmoji } from "@/lib/google-places";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { LocationSelector } from "./location-selector-api";
import { EnhancedPOICreator } from "./enhanced-poi-creator";
import { SubscriptionPrompt } from "./subscription-prompt";
import { ListImageUploader } from "./list-image-uploader";

interface ListCategory {
  id?: number;
  name: string;
  emoji: string;
  iconColor: string;
  displayOrder: number;
}

interface ListPOI {
  id?: number;
  categoryId?: number;
  name: string;
  description?: string;
  sellerNotes?: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  address?: string;
}

const defaultValues = {
  name: "",
  description: "",
  price: "0",
  currency: "USD",
  country: null,
  cities: null,
  coverImage: null,
  images: null,
  isActive: true, // New lists should be active by default
};

const defaultCategories: ListCategory[] = [
  { name: "Restaurants", emoji: "🍽️", iconColor: "#FF6B6B", displayOrder: 1 },
  { name: "Attractions", emoji: "🎭", iconColor: "#4ECDC4", displayOrder: 2 },
  { name: "Views", emoji: "🌅", iconColor: "#45B7D1", displayOrder: 3 },
  { name: "Nightlife", emoji: "🍻", iconColor: "#96CEB4", displayOrder: 4 },
];

export const LocationListEditorElements = (props: {
  displayType?: "page" | "modal";
  listStatus: "new-list" | "existing-list";
  initialValues?: LocationList;
  initialCategories?: DbListCategory[];
  initialPois?: DbListPoi[];
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formValues, setFormValues] = useState<Omit<LocationList, "id" | "storeId" | "totalPois" | "avgRating" | "createdAt" | "updatedAt" | "deletedAt">>(
    props.initialValues ?? defaultValues
  );

  // Location state
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(
    props.initialValues?.country || undefined
  );
  const [selectedCities, setSelectedCities] = useState<string[]>(
    props.initialValues?.cities ? JSON.parse(props.initialValues.cities) : []
  );

  // Images state
  const [listImages, setListImages] = useState<string[]>(
    props.initialValues?.images ? JSON.parse(props.initialValues.images) : []
  );

  const [categories, setCategories] = useState<ListCategory[]>(
    props.initialCategories?.map(cat => ({
      id: cat.id || Math.random(),
      name: cat.name,
      emoji: cat.emoji,
      iconColor: cat.iconColor || "#4ECDC4",
      displayOrder: cat.displayOrder || 0
    })) ?? defaultCategories
  );
  const [pois, setPois] = useState<ListPOI[]>(
    props.initialPois?.map(poi => ({
      id: poi.id,
      categoryId: poi.categoryId,
      name: poi.name,
      description: poi.description || "",
      sellerNotes: poi.sellerNotes || "",
      latitude: parseFloat(poi.latitude),
      longitude: parseFloat(poi.longitude),
      googlePlaceId: poi.googlePlaceId || undefined,
      address: poi.address || ""
    })) ?? []
  );
  const [activeTab, setActiveTab] = useState("basic");
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);

  // Handle location changes
  const handleLocationChange = useCallback((country: string | undefined, cities: string[]) => {
    setSelectedCountry(country);
    setSelectedCities(cities);
    setFormValues(prev => ({
      ...prev,
      country: country || null,
      cities: cities.length > 0 ? JSON.stringify(cities) : null,
    }));
  }, []);

  const dismissModal = useCallback(() => {
    if (props.displayType === "modal") {
      router.back();
    } else {
      router.push("/account/selling/lists");
    }
  }, [router, props.displayType]);

  const onKeyDown = useCallback(
    (e: any) => {
      if (e.key === "Escape") dismissModal();
    },
    [dismissModal]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  const addCategory = () => {
    const newCategory: ListCategory = {
      name: "New Category",
      emoji: "📍",
      iconColor: "#999999",
      displayOrder: categories.length + 1,
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (index: number, updates: Partial<ListCategory>) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = { ...updatedCategories[index], ...updates };
    setCategories(updatedCategories);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
    // Remove POIs in this category
    setPois(pois.filter(poi => poi.categoryId !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

         try {
           // Frontend validation
           console.log("Frontend validation:", {
             name: formValues.name,
             description: formValues.description,
             price: formValues.price,
             imagesCount: listImages.length,
             categoriesCount: categories.length,
             poisCount: pois.length
           });

           if (!formValues.name || !formValues.name.trim()) {
             toast({
               title: "Error",
               description: "List name is required",
               variant: "destructive",
             });
             setIsLoading(false);
             return;
           }

           if (!formValues.description || !formValues.description.trim()) {
             toast({
               title: "Error",
               description: "List description is required",
               variant: "destructive",
             });
             setIsLoading(false);
             return;
           }

           if (!formValues.price || formValues.price === "0" || parseFloat(formValues.price) < 5) {
             toast({
               title: "Error", 
               description: "List price must be at least $5.00",
               variant: "destructive",
             });
             setIsLoading(false);
             return;
           }

           if (listImages.length < 3) {
             toast({
               title: "Error",
               description: "At least 3 images from your trip are required to publish a list",
               variant: "destructive",
             });
             setIsLoading(false);
             return;
           }

           if (categories.length === 0) {
             toast({
               title: "Error",
               description: "At least one category is required. Please add a category first.",
               variant: "destructive",
             });
             setIsLoading(false);
             return;
           }

           if (pois.length < 5) {
             toast({
               title: "Error",
               description: "At least 5 locations (POIs) are required to publish a list",
               variant: "destructive",
             });
             setIsLoading(false);
             return;
           }

      const listData = {
        ...formValues,
        currency: "USD", // Always store in USD
        totalPois: pois.length,
        country: selectedCountry,
        cities: JSON.stringify(selectedCities),
        images: JSON.stringify(listImages),
      };

      const method = props.listStatus === "existing-list" ? "PUT" : "POST";
      const url = props.listStatus === "existing-list" 
        ? `/api/location-lists/${props.initialValues?.id}` 
        : "/api/location-lists";

      console.log("Submitting list data:", {
        listData,
        categoriesCount: categories.length,
        poisCount: pois.length,
        method,
        url
      });

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          list: listData,
          categories,
          pois,
        }),
      });

      const data = await response.json();

      console.log("=== LIST SAVE RESPONSE ===");
      console.log("Response data:", data);
      console.log("Error:", data.error);
      console.log("List ID:", data.listId);

      if (data.error) {
        toast({
          title: "Error",
          description: data.message || "Failed to save WanderList",
          variant: "destructive",
        });
      } else {
        // Check if subscription is required (list was saved as draft)
        if (data.subscriptionRequired) {
          setShowSubscriptionPrompt(true);
        } else {
          toast({
            title: "Success",
            description: props.listStatus === "existing-list" 
              ? "WanderList updated successfully!" 
              : "WanderList created successfully!",
          });
          
          // Don't redirect - keep user on the edit page
          // User can navigate away manually if they want to
        }
      }
    } catch (error) {
      console.error("Frontend error during list submission:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <HeadingAndSubheading
        heading={props.listStatus === "new-list" ? "Create WanderList" : "Edit WanderList"}
        subheading={props.listStatus === "new-list" 
          ? "Create a curated WanderList for your customers" 
          : "Update your WanderList details and POIs"
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="pois">Add Places</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Set up the basic details for your WanderList</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    WanderList Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Best of Lisbon"
                    value={formValues.name}
                    onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Describe what makes this WanderList special..."
                    value={formValues.description || ""}
                    onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Price (USD) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="5"
                      placeholder="9.99"
                      value={formValues.price}
                      onChange={(e) => setFormValues({ ...formValues, price: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum $5.00. All prices are stored in USD. Buyers will see prices in their preferred currency.</p>
                  </div>
                </div>

                {/* Location Selector */}
                <LocationSelector
                  selectedCountry={selectedCountry}
                  selectedCities={selectedCities}
                  onLocationChange={handleLocationChange}
                />

                {/* List Images */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    List Images from Your Trip <span className="text-red-500">*</span>
                  </label>
                  <ListImageUploader
                    currentImages={listImages}
                    onImagesUpdate={setListImages}
                    maxImages={30}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload at least 3 images from your trip to showcase your WanderList. Maximum 30 images, 10MB each. These will be displayed on WanderList cards and the WanderList detail page.
                  </p>
                  {listImages.length < 3 && (
                    <p className="text-xs text-red-500 mt-1">
                      {3 - listImages.length} more image{3 - listImages.length !== 1 ? 's' : ''} required to publish
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formValues.isActive || false}
                    onChange={(e) => setFormValues({ ...formValues, isActive: e.target.checked })}
                  />
                  <label htmlFor="isActive" className="text-sm">
                    Publish WanderList (make it available for purchase)
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Organize your locations into categories with emojis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Input
                        placeholder="Category name"
                        value={category.name}
                        onChange={(e) => updateCategory(index, { name: e.target.value })}
                        className="flex-1"
                      />
                      <Input
                        placeholder="🍽️"
                        value={category.emoji}
                        onChange={(e) => updateCategory(index, { emoji: e.target.value })}
                        className="w-20 text-center"
                      />
                      <Input
                        type="color"
                        value={category.iconColor}
                        onChange={(e) => updateCategory(index, { iconColor: e.target.value })}
                        className="w-16"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCategory(index)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addCategory}>
                    <Plus size={16} className="mr-2" />
                    Add Category
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pois" className="space-y-4">
            <EnhancedPOICreator
              categories={categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                emoji: cat.emoji,
                iconColor: cat.iconColor,
                displayOrder: cat.displayOrder,
              }))}
              pois={pois.map(poi => ({
                id: poi.id,
                categoryId: poi.categoryId,
                name: poi.name,
                description: poi.description,
                sellerNotes: poi.sellerNotes,
                latitude: poi.latitude,
                longitude: poi.longitude,
                googlePlaceId: poi.googlePlaceId,
                address: poi.address,
              }))}
              onPoisChange={(newPois) => {
                setPois(newPois.map(poi => ({
                  id: poi.id,
                  categoryId: poi.categoryId,
                  name: poi.name,
                  description: poi.description,
                  sellerNotes: poi.sellerNotes,
                  latitude: poi.latitude,
                  longitude: poi.longitude,
                  googlePlaceId: poi.googlePlaceId,
                  address: poi.address,
                })));
              }}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={dismissModal}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {props.listStatus === "new-list" ? "Create WanderList" : "Update WanderList"}
          </Button>
        </div>
      </form>

      {/* Subscription Prompt */}
      <SubscriptionPrompt
        isOpen={showSubscriptionPrompt}
        onClose={() => {
          setShowSubscriptionPrompt(false);
          // Navigate to lists after closing prompt
          setTimeout(() => {
            router.push("/account/selling/lists");
            router.refresh();
          }, 100);
        }}
        listName={formValues.name}
      />
    </div>
  );
};
