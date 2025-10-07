import { InfoCard } from "@/components/admin/info-card";
import { Box, MapPin } from "lucide-react";
import { HeadingAndSubheading } from "@/components/admin/heading-and-subheading";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { orders, stores, locationLists, userMapsIntegration, purchasedListSync } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MapsConnectionStatus } from "@/components/maps/maps-connection-status";
import { PurchasedListsManager } from "@/components/maps/purchased-lists-manager";

async function getUserListsData(userId: string, userEmail: string) {
  try {
    // Get user's orders
    const userOrders = await db
      .select({
        orderId: orders.id,
        items: orders.items,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.email, userEmail));

    // Get unique purchased lists (deduplicated)
    const purchasedListsMap = new Map();
    
    for (const order of userOrders) {
      if (order.items) {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        for (const item of items) {
          if (!purchasedListsMap.has(item.id)) {
            const listDetails = await db
              .select({
                id: locationLists.id,
                name: locationLists.name,
                description: locationLists.description,
                totalPois: locationLists.totalPois,
                sellerName: stores.name,
              })
              .from(locationLists)
              .leftJoin(stores, eq(locationLists.storeId, stores.id))
              .where(eq(locationLists.id, item.id));

            if (listDetails.length > 0) {
              purchasedListsMap.set(item.id, {
                ...listDetails[0],
                orderId: order.orderId,
                purchaseDate: order.createdAt,
                price: item.price,
              });
            }
          }
        }
      }
    }

    const purchasedLists = Array.from(purchasedListsMap.values());

    // Get maps integration status
    const mapsIntegration = await db
      .select()
      .from(userMapsIntegration)
      .where(eq(userMapsIntegration.userId, userId));

    // Get sync status for purchased lists
    const syncStatuses = await db
      .select()
      .from(purchasedListSync)
      .where(eq(purchasedListSync.userId, userId));

    return {
      purchasedLists,
      mapsIntegration: mapsIntegration[0] || null,
      syncStatuses,
    };
  } catch (error) {
    console.error("=== LISTS DATA ERROR ===", error);
    return {
      purchasedLists: [],
      mapsIntegration: null,
      syncStatuses: [],
    };
  }
}

export default async function YourListsPage() {
  const user = await currentUser();
  
  if (!user) {
    return (
      <InfoCard
        heading="Authentication Required"
        subheading="Please sign in to view your lists."
        icon={<Box size={30} />}
      />
    );
  }

  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail) {
    return (
      <InfoCard
        heading="Email Required"
        subheading="Unable to find your email address."
        icon={<Box size={30} />}
      />
    );
  }

  const { purchasedLists, mapsIntegration, syncStatuses } = await getUserListsData(
    user.id, 
    userEmail
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <HeadingAndSubheading
          heading="Your Lists"
          subheading="Manage your purchased location lists and sync them to your maps"
        />
      </div>

      {/* Maps Connection Status */}
      <MapsConnectionStatus 
        userId={user.id}
        mapsIntegration={mapsIntegration}
      />

      {/* Purchased Lists */}
      {purchasedLists.length > 0 ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Your Location Lists</h2>
            <p className="text-muted-foreground">
              Toggle sync for each list to add them to your connected maps apps
            </p>
          </div>
          
          <PurchasedListsManager
            userId={user.id}
            purchasedLists={purchasedLists}
            syncStatuses={syncStatuses}
            mapsIntegration={mapsIntegration}
          />
        </div>
      ) : (
        <InfoCard
          heading="No Location Lists"
          subheading="You haven't purchased any location lists yet. Browse our marketplace to discover curated POI collections."
          icon={<MapPin size={30} />}
        />
      )}
    </div>
  );
}
