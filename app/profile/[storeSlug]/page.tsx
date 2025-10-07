import { db } from "@/db/db";
import { stores, locationLists, listReviews } from "@/db/schema";
import { eq, count, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { LocationListCard } from "@/components/storefront/location-list-card";
import { LocationListAndStore } from "@/lib/collection-types";
import { ContentWrapper } from "@/components/content-wrapper";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, CheckCircle, Youtube, Instagram } from "lucide-react";
import Image from "next/image";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SellerProfilePageProps {
  params: {
    storeSlug: string;
  };
}

export default async function SellerProfilePage({ params }: SellerProfilePageProps) {
  // Get store details
  const store = await db
    .select()
    .from(stores)
    .where(eq(stores.slug, params.storeSlug))
    .then(res => res[0]);

  if (!store) {
    notFound();
  }

  // Parse JSON fields
  const nationalities = store.nationality ? JSON.parse(store.nationality) : [];
  const socialLinks = store.socialLinks ? JSON.parse(store.socialLinks) : {};
  const verifiedSocials = store.verifiedSocials ? JSON.parse(store.verifiedSocials) : [];

  // Get all active location lists from this store
  const rawData = await db
    .select({
      locationList: locationLists,
      store: {
        id: stores.id,
        name: stores.name,
        slug: stores.slug,
      },
    })
    .from(locationLists)
    .leftJoin(stores, eq(locationLists.storeId, stores.id))
    .where(eq(locationLists.storeId, store.id))
    .orderBy(locationLists.createdAt);

  // Transform coverImage from string to parsed object
  const storeAndLocationList = rawData.map(item => ({
    ...item,
    locationList: {
      ...item.locationList,
      coverImage: typeof item.locationList.coverImage === 'string' 
        ? JSON.parse(item.locationList.coverImage) 
        : item.locationList.coverImage || []
    }
  })) as LocationListAndStore[];

  // Get review counts for all lists
  const listIds = storeAndLocationList.map(item => item.locationList.id);
  const reviewCounts = listIds.length > 0 ? await db
    .select({
      listId: listReviews.listId,
      count: count(listReviews.id),
    })
    .from(listReviews)
    .where(inArray(listReviews.listId, listIds))
    .groupBy(listReviews.listId) : [];

  // Create a map for quick lookup
  const reviewCountMap = new Map<number, number>();
  reviewCounts.forEach(rc => {
    reviewCountMap.set(rc.listId, Number(rc.count));
  });

  // Calculate total locations across all lists
  const totalLocations = storeAndLocationList.reduce((sum, item) => 
    sum + (item.locationList.totalPois || 0), 0
  );

  return (
    <div>
      <ContentWrapper>
        {/* Store Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {store.profileImage ? (
                <Image
                  src={store.profileImage}
                  alt={`${store.name} profile`}
                  width={120}
                  height={120}
                  className="rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <User size={48} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Store Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-2">
                <Heading size="h1">
                  {store.name}
                </Heading>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin size={14} />
                  {storeAndLocationList.length} location list{storeAndLocationList.length !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin size={14} />
                  {totalLocations} total locations
                </Badge>
                
                {/* Verified Socials Badge */}
                {verifiedSocials.length > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                    <CheckCircle size={14} />
                    Verified Socials
                  </Badge>
                )}
                
                {/* Nationality Badges */}
                {nationalities.slice(0, 2).map((country: string) => (
                  <Badge key={country} variant="outline">
                    {country}
                  </Badge>
                ))}
                {nationalities.length > 2 && (
                  <Badge variant="outline">
                    +{nationalities.length - 2} more
                  </Badge>
                )}
              </div>

              {/* Personal Info */}
              {(store.firstName || store.lastName || store.age) && (
                <div className="mb-4">
                  <Text className="text-sm text-gray-600">
                    {store.firstName && store.lastName ? (
                      `${store.firstName} ${store.lastName}`
                    ) : (
                      store.firstName || store.lastName
                    )}
                    {store.age && (
                      <span className="ml-2">• Age {store.age}</span>
                    )}
                  </Text>
                </div>
              )}

              {store.description && (
                <Text className="text-lg text-gray-700 max-w-2xl mb-4">
                  {store.description}
                </Text>
              )}

              {/* Social Links */}
              {Object.keys(socialLinks).length > 0 && (
                <div className="flex gap-3">
                  {socialLinks.youtube && (
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Youtube size={16} />
                      <span className="text-sm">YouTube</span>
                      {verifiedSocials.includes('youtube') && (
                        <CheckCircle size={14} className="text-green-600" />
                      )}
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
                    >
                      <Instagram size={16} />
                      <span className="text-sm">Instagram</span>
                      {verifiedSocials.includes('instagram') && (
                        <CheckCircle size={14} className="text-green-600" />
                      )}
                    </a>
                  )}
                  {socialLinks.tiktok && (
                    <a
                      href={socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">T</span>
                      </div>
                      <span className="text-sm">TikTok</span>
                      {verifiedSocials.includes('tiktok') && (
                        <CheckCircle size={14} className="text-green-600" />
                      )}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location Lists Section */}
        <div>
          <Heading size="h2" className="mb-6">
            Location Lists by {store.name}
          </Heading>
          
          {storeAndLocationList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {storeAndLocationList.map((item) => (
                <LocationListCard
                  key={item.locationList.id}
                  storeAndLocationList={item}
                  reviewCount={reviewCountMap.get(item.locationList.id) || 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
              <Heading size="h3" className="mb-2">No location lists yet</Heading>
              <Text className="text-gray-600">
                {store.name} hasn&apos;t published any location lists yet.
              </Text>
            </div>
          )}
        </div>
      </ContentWrapper>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SellerProfilePageProps) {
  const store = await db
    .select()
    .from(stores)
    .where(eq(stores.slug, params.storeSlug))
    .then(res => res[0]);

  if (!store) {
    return {
      title: 'Store Not Found',
    };
  }

  return {
    title: `${store.name} - Location Lists Creator | MapBuddi`,
    description: store.description || `Discover curated location lists from ${store.name}. Find expertly crafted lists of places worth visiting.`,
  };
}
