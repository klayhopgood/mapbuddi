import { CollectionBody } from "@/components/storefront/collection-body";
import { CollectionHeaderWrapper } from "@/components/storefront/collection-header-wrapper";
import { CollectionPagePagination } from "@/components/storefront/collection-page-pagination";
import { db } from "@/db/db";
import { locationLists, stores, listReviews } from "@/db/schema";
import { LocationListAndStore } from "@/lib/collection-types";
import { eq, inArray, count, and, or, gte, lte, ilike, sql } from "drizzle-orm";
import { getCart } from "@/server-actions/get-cart-details";
import { cookies } from "next/headers";

const LISTS_PER_PAGE = 12;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LocationListsPage(context: {
  params: { slug: string };
  searchParams: { 
    page: string; 
    seller: string; 
    country: string;
    city: string;
    rating: string;
    search: string;
    priceMin: string;
    priceMax: string;
  };
}) {
  // Get cart data
  const cookieStore = cookies();
  const cartId = cookieStore.get("cartId")?.value;
  const { cartItems } = cartId ? await getCart(Number(cartId)) : { cartItems: [] };

  // Parse search parameters
  const page = !isNaN(Number(context.searchParams.page)) ? Number(context.searchParams.page) : 1;
  const selectedSellers = context.searchParams.seller ? context.searchParams.seller.split("_") : [];
  const selectedCountries = context.searchParams.country ? context.searchParams.country.split("_") : [];
  const selectedCities = context.searchParams.city ? context.searchParams.city.split("_") : [];
  const ratingFilter = context.searchParams.rating ? Number(context.searchParams.rating) : null;
  const searchTerm = context.searchParams.search?.trim() || null;
  const priceMin = context.searchParams.priceMin ? Number(context.searchParams.priceMin) : null;
  const priceMax = context.searchParams.priceMax ? Number(context.searchParams.priceMax) : null;

  // Build WHERE conditions
  const whereConditions = [];
  
  // Base condition - only active lists
  whereConditions.push(eq(locationLists.isActive, true));

  // Seller filter
  if (selectedSellers.length > 0) {
    whereConditions.push(inArray(stores.slug, selectedSellers));
  }

  // Country filter
  if (selectedCountries.length > 0) {
    whereConditions.push(inArray(locationLists.country, selectedCountries));
  }

  // City filter (cities are stored as JSON array, so we need to use JSON operators)
  if (selectedCities.length > 0) {
    const cityConditions = selectedCities.map(city => 
      sql`JSON_CONTAINS(${locationLists.cities}, ${JSON.stringify(city)})`
    );
    whereConditions.push(or(...cityConditions));
  }

  // Rating filter
  if (ratingFilter) {
    if (ratingFilter === 5) {
      whereConditions.push(gte(locationLists.avgRating, "5.0"));
    } else {
      whereConditions.push(gte(locationLists.avgRating, ratingFilter.toString()));
    }
  }

  // Price filter
  if (priceMin !== null) {
    whereConditions.push(gte(locationLists.price, priceMin.toString()));
  }
  if (priceMax !== null) {
    whereConditions.push(lte(locationLists.price, priceMax.toString()));
  }

  // Search filter (name, description, store name)
  if (searchTerm) {
    const searchConditions = [
      ilike(locationLists.name, `%${searchTerm}%`),
      ilike(locationLists.description, `%${searchTerm}%`),
      ilike(stores.name, `%${searchTerm}%`)
    ];
    whereConditions.push(or(...searchConditions));
  }

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
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .limit(LISTS_PER_PAGE)
    .offset((page - 1) * LISTS_PER_PAGE);

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
  const reviewCounts = await db
    .select({
      listId: listReviews.listId,
      count: count(listReviews.id),
    })
    .from(listReviews)
    .where(inArray(listReviews.listId, listIds))
    .groupBy(listReviews.listId);

  // Create a map for quick lookup
  const reviewCountMap = new Map<number, number>();
  reviewCounts.forEach(rc => {
    reviewCountMap.set(rc.listId, Number(rc.count));
  });

  // Get unique countries and cities for filter options
  const allListsForFilters = await db
    .select({
      country: locationLists.country,
      cities: locationLists.cities,
    })
    .from(locationLists)
    .where(eq(locationLists.isActive, true));

  const uniqueCountries = [...new Set(
    allListsForFilters
      .map(item => item.country)
      .filter((country): country is string => country !== null && country !== undefined && country.trim() !== "")
  )].sort();

  const uniqueCities = [...new Set(
    allListsForFilters
      .flatMap(item => {
        try {
          return item.cities ? JSON.parse(item.cities) : [];
        } catch {
          return [];
        }
      })
      .filter((city): city is string => typeof city === 'string' && city.trim() !== "")
  )].sort();

  return (
    <div>
      <CollectionHeaderWrapper heading="Location Lists">
        <p>
          Discover curated location lists from local experts and fellow travelers. 
          Each list contains handpicked points of interest with detailed notes and 
          categories to help you explore new places like a local.
        </p>
        <p>
          From hidden restaurants and scenic viewpoints to historic landmarks and 
          shopping districts, our location lists make it easy to discover the best 
          spots wherever you go. Purchase a list and sync it directly to your Google Maps 
          for seamless navigation.
        </p>
        <p>
          Browse by seller to find lists from specific creators, or explore all 
          available location lists to find your next adventure.
        </p>
      </CollectionHeaderWrapper>
      <CollectionBody
        storeAndLocationList={storeAndLocationList}
        activeSellers={await getActiveSellers()}
        cartItems={cartItems}
        reviewCountMap={reviewCountMap}
        uniqueCountries={uniqueCountries}
        uniqueCities={uniqueCities}
      >
        <CollectionPagePagination
          productsPerPage={LISTS_PER_PAGE}
          sellerParams={context.searchParams.seller as string}
        />
      </CollectionBody>
    </div>
  );
}

const getActiveSellers = async () => {
  return await db
    .select({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
    })
    .from(stores);
};
