import { CollectionBody } from "@/components/storefront/collection-body";
import { CollectionHeaderWrapper } from "@/components/storefront/collection-header-wrapper";
import { CollectionPagePagination } from "@/components/storefront/collection-page-pagination";
import { db } from "@/db/db";
import { locationLists, stores } from "@/db/schema";
import { LocationListAndStore } from "@/lib/collection-types";
import { eq, inArray } from "drizzle-orm";
import { getCart } from "@/server-actions/get-cart-details";
import { cookies } from "next/headers";

const LISTS_PER_PAGE = 12;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LocationListsPage(context: {
  params: { slug: string };
  searchParams: { page: string; seller: string };
}) {
  // Get cart data
  const cookieStore = cookies();
  const cartId = cookieStore.get("cartId")?.value;
  const { cartItems } = cartId ? await getCart(Number(cartId)) : { cartItems: [] };

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
    .where(() => {
      if (
        context.searchParams.seller === undefined ||
        context.searchParams.seller === ""
      )
        return eq(locationLists.isActive, true);
      return inArray(stores.slug, context.searchParams.seller.split("_"));
    })
    .leftJoin(stores, eq(locationLists.storeId, stores.id))
    .limit(LISTS_PER_PAGE)
    .offset(
      !isNaN(Number(context.searchParams.page))
        ? (Number(context.searchParams.page) - 1) * LISTS_PER_PAGE
        : 0
    );

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
