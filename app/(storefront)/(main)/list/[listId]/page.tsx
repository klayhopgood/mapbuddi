import { ParagraphFormatter } from "@/components/paragraph-formatter";
import { ProductForm } from "@/components/storefront/product-form";
import { Heading } from "@/components/ui/heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db/db";
import { LocationList, locationLists, stores, listCategories, listPois, listReviews } from "@/db/schema";
import { formatPrice } from "@/lib/currency";
import { eq, and, count } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { ProductImage } from "@/components/product-image";
import { addToCart } from "@/server-actions/add-to-cart";
import { MapPin, Star } from "lucide-react";
import { getReviewsForList } from "@/server-actions/reviews";
import { currentUser } from "@clerk/nextjs/server";

// Utility function to format email for display (first 3 chars + *** until @)
function formatEmailForDisplay(email: string): string {
  if (!email || email.length < 3) return 'Anonymous';
  
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return 'Anonymous';
  
  const firstThree = email.substring(0, 3);
  const domain = email.substring(atIndex);
  return `${firstThree}***${domain}`;
}

export default async function StorefrontListDetails(props: {
  params: { listId: string };
}) {
  const listFromDb = await db
    .select()
    .from(locationLists)
    .where(
      and(
        eq(locationLists.id, Number(props.params.listId)),
        eq(locationLists.isActive, true)
      )
    )
    .then((res) => {
      if (res.length === 0) throw new Error("List not found");
      return res[0];
    })
    .catch(() => {
      throw new Error("List not found");
    });

  // Parse the coverImage
  const list = {
    ...listFromDb,
    coverImage: typeof listFromDb.coverImage === 'string' 
      ? JSON.parse(listFromDb.coverImage) 
      : listFromDb.coverImage || []
  };

  const store = await db
    .select({
      name: stores.name,
      description: stores.description,
      slug: stores.slug,
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

  const samplePois = await db
    .select()
    .from(listPois)
    .where(eq(listPois.categoryId, categories[0]?.id || 0))
    .limit(3);

  // Get review count for this list
  const reviewCountResult = await db
    .select({ count: count() })
    .from(listReviews)
    .where(eq(listReviews.listId, list.id));

  const reviewCount = reviewCountResult[0]?.count || 0;

  // Get reviews for the Reviews tab
  const reviews = await getReviewsForList(list.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center md:items-start justify-start md:grid md:grid-cols-9 gap-8">
        <div className="col-span-4 w-full">
          <ProductImage
            src={list.coverImage[0]?.url}
            alt={list.coverImage[0]?.alt || `${list.name} cover`}
            height="h-96"
            width="w-full"
          />
          {list.coverImage.length > 1 && (
            <>
              <div className="flex items-center justify-start gap-2 mt-2 overflow-auto flex-nowrap">
                {list.coverImage.slice(1).map((image: any) => (
                  <div key={image.id} className="relative h-24 w-24">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover h-24 w-24 rounded-md"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="md:col-span-5 w-full">
          <Heading size="h2">{list.name}</Heading>
          <Text className="text-sm mt-2">
            Created by{" "}
            <Link href={`/?seller=${store.slug}`}>
              <span className="text-muted-foreground hover:underline">
                {store.name}
              </span>
            </Link>
          </Text>
          
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
          
          <ProductForm
            addToCartAction={addToCart}
            productName={list.name}
            productId={list.id}
          />
        </div>
      </div>
      
      <Tabs defaultValue="list">
        <div className="overflow-auto">
          <TabsList>
            <TabsTrigger value="list">List Details</TabsTrigger>
            <TabsTrigger value="preview">Preview Categories</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
            <TabsTrigger value="seller">About the Creator</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="list" className="pt-2">
          <ParagraphFormatter paragraphs={list.description || ""} />
        </TabsContent>
        <TabsContent value="preview" className="pt-2">
          <div className="space-y-4">
            <Text className="text-muted-foreground">
              This location list contains {categories.length} categories with {list.totalPois} total locations.
            </Text>
            
            <div className="grid gap-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <span className="text-2xl">{category.emoji}</span>
                  <div>
                    <Text className="font-medium">{category.name}</Text>
                    <Text className="text-sm text-muted-foreground">
                      Category in this location list
                    </Text>
                  </div>
                </div>
              ))}
            </div>

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
                <Text className="text-sm text-muted-foreground">Be the first to review this location list!</Text>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="seller" className="pt-2">
          {store.description}
        </TabsContent>
      </Tabs>
    </div>
  );
}
