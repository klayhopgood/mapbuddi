import { LocationList, Store } from "@/db/schema";

export type LocationListAndStore = {
  locationList: Omit<LocationList, "coverImage"> & {
    coverImage: { id: string; url: string; alt: string }[];
  };
  store: Omit<Store, "description" | "industry">;
};

// Legacy type for compatibility - maps to location lists
export type ProductAndStore = {
  product: Omit<LocationList, "coverImage"> & {
    coverImage: { id: string; url: string; alt: string }[];
    images: { id: string; url: string; alt: string }[]; // Alias for compatibility
  };
  store: Omit<Store, "description" | "industry">;
};
