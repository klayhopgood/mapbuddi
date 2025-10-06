import Image from "next/image";
import { Text } from "../ui/text";
import { MapPin, Star } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/currency";
import { Button } from "../ui/button";
import { LocationListAndStore } from "@/app/(storefront)/(main)/page";
import { Badge } from "../ui/badge";

export const LocationListCard = (props: {
  storeAndLocationList: LocationListAndStore;
  hideButtonActions?: boolean;
}) => {
  const listPageLink = `/list/${props.storeAndLocationList.locationList.id}`;

  return (
    <div key={props.storeAndLocationList.locationList.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <Link href={listPageLink}>
        {props.storeAndLocationList.locationList.coverImage ? (
          <Image
            src={props.storeAndLocationList.locationList.coverImage}
            alt={props.storeAndLocationList.locationList.name}
            width={300}
            height={200}
            className="w-full h-48 object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
            <MapPin size={48} className="text-gray-400" />
          </div>
        )}
      </Link>
      
      <div className="mt-3">
        <Link href={listPageLink}>
          <Text className="font-semibold line-clamp-1 hover:text-blue-600">
            {props.storeAndLocationList.locationList.name}
          </Text>
        </Link>
        
        <div className="flex items-center justify-between mt-2">
          <Text className="font-bold text-lg">
            {formatPrice(
              Number(props.storeAndLocationList.locationList.price), 
              props.storeAndLocationList.locationList.currency || "USD"
            )}
          </Text>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {props.storeAndLocationList.locationList.totalPois || 0} places
            </Badge>
            
            {props.storeAndLocationList.locationList.avgRating && (
              <div className="flex items-center space-x-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                <Text className="text-sm">
                  {parseFloat(props.storeAndLocationList.locationList.avgRating).toFixed(1)}
                </Text>
              </div>
            )}
          </div>
        </div>

        {props.storeAndLocationList.locationList.description && (
          <Text className="text-sm text-gray-600 mt-2 line-clamp-2">
            {props.storeAndLocationList.locationList.description}
          </Text>
        )}

        <div className="mt-2">
          <Text className="text-xs text-gray-500">
            by {props.storeAndLocationList.store.name || "Unknown Seller"}
          </Text>
        </div>
      </div>

      {!props.hideButtonActions && (
        <div className="flex gap-2 items-center justify-between mt-4">
          <Link href={`/list/${props.storeAndLocationList.locationList.id}/preview`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Preview
            </Button>
          </Link>
          <Link href={listPageLink} className="flex-1">
            <Button size="sm" className="w-full">
              Buy Now
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
