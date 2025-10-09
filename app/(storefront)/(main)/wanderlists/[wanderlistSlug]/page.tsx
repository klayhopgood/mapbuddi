import { ParagraphFormatter } from "@/components/paragraph-formatter";
import { ProductForm } from "@/components/storefront/product-form";
import { OwnerAwareCartForm } from "@/components/storefront/owner-aware-cart-form";
import { Heading } from "@/components/ui/heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db/db";
import { LocationList, locationLists, stores, listCategories, listPois, listReviews } from "@/db/schema";
import { formatPrice } from "@/lib/currency";
import { eq, and, count } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { routes } from "@/lib/routes";
import { addToCart } from "@/server-actions/add-to-cart";
import { MapPin, Star } from "lucide-react";
import { getReviewsForList } from "@/server-actions/reviews";
import { currentUser } from "@clerk/nextjs/server";
import { LocationTags } from "@/components/ui/location-tags";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { StaticMapPreview } from "@/components/ui/static-map-preview";
import { generateStaticMapUrl } from "@/lib/static-map-utils";
import { findWanderListBySlug } from "@/server-actions/wanderlist-lookup";

// Utility function to format email for display (first 3 chars + *** until @)
function formatEmailForDisplay(email: string): string {
  if (!email || email.length < 3) return 'Anonymous';
  
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return 'Anonymous';
  
  const firstThree = email.substring(0, 3);
  const domain = email.substring(atIndex);
  return `${firstThree}***${domain}`;
}

export default async function WanderListDetailsPage(props: {
  params: { wanderlistSlug: string };
}) {
  // Find the WanderList by slug
  const listFromDb = await findWanderListBySlug(props.params.wanderlistSlug);
  
  if (!listFromDb) {
    throw new Error("WanderList not found");
  }

  // Parse the coverImage and images
  const list = {
    ...listFromDb,
    coverImage: typeof listFromDb.coverImage === 'string' 
      ? JSON.parse(listFromDb.coverImage) 
      : listFromDb.coverImage || []
  };

  // Parse images from the new images field
  const listImages = list.images 
    ? JSON.parse(list.images) 
    : [];

  // Use new images field if available, otherwise fallback to coverImage for backward compatibility
  const displayImages = listImages.length > 0 
    ? listImages 
    : (list.coverImage.length > 0 ? list.coverImage.map((img: any) => img.url) : []);

  const store = await db
    .select({
      name: stores.name,
      description: stores.description,
      slug: stores.slug,
      userId: stores.userId,
      website: stores.website,
      socialLinks: stores.socialLinks,
      profileImage: stores.profileImage,
    })
    .from(stores)
    .where(eq(stores.id, Number(list.storeId)))
    .then((res) => res[0])
    .catch(() => {
      throw new Error("Store not found");
    });

  // Get categories and POIs for preview
  const categories = await db
    .select()
    .from(listCategories)
    .where(eq(listCategories.listId, list.id));

  // Get POI count for each category
  const categoryPoisCounts = await Promise.all(
    categories.map(async (category) => {
      const poiCountResult = await db
        .select({ count: count() })
        .from(listPois)
        .where(eq(listPois.categoryId, category.id));
      
      return {
        ...category,
        poiCount: poiCountResult[0]?.count || 0
      };
    })
  );

  const samplePois = await db
    .select()
    .from(listPois)
    .where(eq(listPois.categoryId, categories[0]?.id || 0))
    .limit(3);

  // Get all POIs for map preview
  const allPois = await db
    .select({
      id: listPois.id,
      name: listPois.name,
      latitude: listPois.latitude,
      longitude: listPois.longitude,
      address: listPois.address,
    })
    .from(listPois)
    .innerJoin(listCategories, eq(listPois.categoryId, listCategories.id))
    .where(eq(listCategories.listId, list.id));

  // Get review count for this list
  const reviewCountResult = await db
    .select({ count: count() })
    .from(listReviews)
    .where(eq(listReviews.listId, list.id));

  const reviewCount = reviewCountResult[0]?.count || 0;

  // Get reviews for the Reviews tab
  const reviews = await getReviewsForList(list.id);

  // Generate static map URL for POI preview
  const mapUrl = allPois.length > 0 
    ? generateStaticMapUrl(
        allPois.map(poi => ({
          lat: parseFloat(poi.latitude),
          lng: parseFloat(poi.longitude)
        })),
        process.env.GOOGLE_PLACES_API_KEY || ''
      )
    : '';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center md:items-start justify-start md:grid md:grid-cols-9 gap-8">
        <div className="col-span-4 w-full">
          <ImageCarousel
            images={displayImages}
            altText={list.name}
            aspectRatio="video"
            showCounter={displayImages.length > 1}
            showThumbnails={displayImages.length > 1}
          />
        </div>
        <div className="md:col-span-5 w-full">
          <Heading size="h2">{list.name}</Heading>
          <div className="flex items-center gap-2 text-sm mt-2">
            <Text>
            Created by{" "}
            <Link href={`/profile/${store.slug}`}>
              <span className="text-blue-600 hover:text-blue-800 hover:underline">
                {store.name}
              </span>
            </Link>
          </Text>
            {store.profileImage && (
              <div className="w-[30px] h-[30px] rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={store.profileImage}
                  alt={`${store.name} profile`}
                  width={30}
                  height={30}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 my-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Text className="text-sm text-muted-foreground">
                {list.totalPois} locations
              </Text>
            </div>
            {list.avgRating && reviewCount > 0 && (
              <div className="flex items-center gap-1">
                <Text className="text-sm text-muted-foreground">
                  ⭐️ {Number(list.avgRating).toFixed(1)} ({reviewCount})
                </Text>
              </div>
            )}
          </div>

          <Text className="text-xl my-4">
            {formatPrice(Number(list.price), list.currency || "USD")}
          </Text>
          
          {/* Location Tags */}
          <LocationTags
            country={list.country}
            cities={list.cities}
            variant="page"
            className="mb-4"
          />
          
          {/* Description moved from List Details tab */}
          {list.description && (
            <div className="mb-6">
              <ParagraphFormatter paragraphs={list.description} />
            </div>
          )}
          
          <OwnerAwareCartForm
            addToCartAction={addToCart}
            productName={list.name}
            productId={list.id}
            ownerId={store.userId}
          />
        </div>
      </div>
      
      <Tabs defaultValue="location">
        <div className="overflow-auto">
          <TabsList>
            <TabsTrigger value="location">Preview Location</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
            <TabsTrigger value="preview">Preview Categories</TabsTrigger>
            <TabsTrigger value="seller">About the Creator</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="preview" className="pt-2">
          <div className="space-y-4">
            {(() => {
              const categoriesWithPois = categoryPoisCounts.filter(category => category.poiCount > 0);
              return (
                <>
                  <Text className="text-muted-foreground">
                    This WanderList contains {categoriesWithPois.length} categories with {list.totalPois} total locations.
                  </Text>
            
            <div className="grid gap-3">
                    {categoriesWithPois.map((category) => (
                <div key={category.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <span className="text-2xl">{category.emoji}</span>
                        <div className="flex-1">
                    <Text className="font-medium">{category.name}</Text>
                    <Text className="text-sm text-muted-foreground">
                            {category.poiCount} location{category.poiCount !== 1 ? 's' : ''} in this category
                    </Text>
                  </div>
                        <Badge variant="secondary" className="ml-auto">
                          {category.poiCount}
                        </Badge>
                </div>
              ))}
            </div>
                </>
              );
            })()}

            {samplePois.length > 0 && (
              <div className="mt-6">
                <Text className="font-medium mb-3">Sample locations (purchase to see all):</Text>
                <div className="space-y-2">
                  {samplePois.map((poi) => (
                    <div key={poi.id} className="p-3 bg-secondary rounded-lg">
                      <Text className="font-medium">{poi.name}</Text>
                      <Text className="text-sm text-muted-foreground">
                        {poi.address}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="location" className="pt-2">
          <div className="space-y-4">
            <Text className="text-muted-foreground">
              Map preview showing all {allPois.length} location{allPois.length !== 1 ? 's' : ''} in this WanderList
            </Text>
            
            <StaticMapPreview 
              pois={allPois}
              listName={list.name}
              mapUrl={mapUrl}
            />
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="pt-2">
          <div className="space-y-4">
            {reviews.length > 0 ? (
              <>
                <Text className="text-muted-foreground">
                  {reviewCount} review{reviewCount !== 1 ? 's' : ''} with an average rating of {list.avgRating ? Number(list.avgRating).toFixed(1) : 'N/A'} stars
                </Text>
                
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Text className="font-medium">
                            {formatEmailForDisplay(review.userEmail || '')}
                          </Text>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <Text className="text-sm text-muted-foreground">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown date'}
                        </Text>
                      </div>
                      {review.review && (
                        <Text className="text-sm">{review.review}</Text>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                <Text className="text-muted-foreground">No reviews yet</Text>
                <Text className="text-sm text-muted-foreground">Be the first to review this WanderList!</Text>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="seller" className="pt-2">
          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {store.profileImage && (
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={store.profileImage}
                        alt={`${store.name} profile`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <Heading size="h3">{store.name}</Heading>
                    <Text className="text-muted-foreground mt-1">WanderList Creator</Text>
                  </div>
                </div>
                <Link 
                  href={`/profile/${store.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  View Store Page
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </Link>
              </div>
              
              {store.description && (
                <div className="mb-6">
                  <Text className="text-sm font-medium mb-2">About</Text>
                  <Text className="text-muted-foreground">{store.description}</Text>
                </div>
              )}

              {/* Social Links */}
              {(store.socialLinks || store.website) && (
                <div>
                  <Text className="text-sm font-medium mb-3">Connect with {store.name}</Text>
                  <div className="flex flex-wrap gap-3">
                    {store.website && (
                      <a
                        href={store.website.startsWith('http') ? store.website : `https://${store.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        Website
                      </a>
                    )}
                    
                    {store.socialLinks && (() => {
                      try {
                        const socialLinks = JSON.parse(store.socialLinks);
                        return (
                          <>
                            {socialLinks.instagram && (
                              <a
                                href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded-md text-sm transition-colors"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                                {socialLinks.instagram}
                              </a>
                            )}
                            
                            {socialLinks.tiktok && (
                              <a
                                href={`https://tiktok.com/@${socialLinks.tiktok.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-black hover:bg-gray-800 text-white rounded-md text-sm transition-colors"
                              >
                                <div className="w-4 h-4 bg-white text-black text-xs font-bold flex items-center justify-center rounded">T</div>
                                {socialLinks.tiktok}
                              </a>
                            )}
                            
                            {socialLinks.youtube && (
                              <a
                                href={`https://youtube.com/@${socialLinks.youtube.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm transition-colors"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                                {socialLinks.youtube}
                              </a>
                            )}
                          </>
                        );
                      } catch (e) {
                        return null;
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
