"use client";
import { LocationListAndStore } from "@/lib/collection-types";
import { ProductSidebar } from "./product-sidebar";
import { LocationListCard } from "./location-list-card";
import { PropsWithChildren } from "react";
import { useSearchParams } from "next/navigation";
import { Heading } from "../ui/heading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SlidersHorizontal } from "lucide-react";
import { EmptyStateWrapper } from "../ui/empty-state-wrapper";
import { CartItem } from "@/lib/types";
import { ProductSearch } from "./product-search";

export const CollectionBody = (
  props: PropsWithChildren<{
    storeAndLocationList: LocationListAndStore[];
    activeSellers: {
      id: number;
      name: string | null;
      slug: string | null;
    }[];
    cartItems?: CartItem[];
    reviewCountMap?: Map<number, number>;
  }>
) => {
  const searchParams = useSearchParams();
  const seller = searchParams.get("seller");
  const selectedSellers = seller ? [...seller?.split("_")] : [];

  const Sidebar = (
    <ProductSidebar
      uniqueStoresList={props.activeSellers
        .map((item) => ({ name: item.name ?? "", slug: item.slug ?? "" }))
        .filter((item) => item.name !== "")}
      selectedSellers={selectedSellers}
    />
  );

  return (
    <div className="md:grid md:grid-cols-12 md:mt-0 lg:mt-12 mt-12 md:gap-12">
      <div className="hidden p-6 rounded-md border-border border lg:block md:col-span-3">
        {Sidebar}
      </div>
      <div className="lg:hidden">
        {/* Mobile Search and Filters Bar */}
        <div className="bg-white py-4 px-6 w-full fixed left-0 bottom-0 z-10 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <ProductSearch />
            </div>
            <AlertDialog>
              <AlertDialogTrigger className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-md bg-white">
                <p>Filters</p>
                <SlidersHorizontal size={18} />
              </AlertDialogTrigger>
              <AlertDialogContent className="max-h-[90vh] overflow-auto">
                {Sidebar}
                <AlertDialogFooter className="sticky bottom-0">
                  <AlertDialogAction>Close</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
      {props.storeAndLocationList.length > 0 ? (
        <div className="grid col-span-12 lg:col-span-9 grid-cols-12 gap-6 h-fit">
          {props.storeAndLocationList.map(
            (locationListItem, i) =>
              (selectedSellers.includes(locationListItem.store.slug ?? "") ||
                selectedSellers.length === 0) && (
                <div
                  className="sm:col-span-6 md:col-span-4 col-span-12"
                  key={i}
                >
                  <LocationListCard 
                    storeAndLocationList={locationListItem} 
                    cartItems={props.cartItems}
                    reviewCount={props.reviewCountMap?.get(locationListItem.locationList.id) || 0}
                  />
                </div>
              )
          )}
          <div className="col-span-12">{props.children}</div>
        </div>
      ) : (
        <EmptyStateWrapper height="h-[200px]">
          <Heading size="h4">No location lists match your filters</Heading>
          <p>Change your filters or try again later</p>
        </EmptyStateWrapper>
      )}
    </div>
  );
};
